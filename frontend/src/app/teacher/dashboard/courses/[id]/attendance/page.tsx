'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

interface Student {
    id: number;
    name: string;
    student_id: string;
}

type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

interface AttendanceRecord {
    student_id: number;
    status: AttendanceStatus;
}

interface AttendanceRecords {
    [key: number]: AttendanceStatus;
}

export default function AttendanceInputPage() {
    const params = useParams();
    const router = useRouter();
    const searchParams = useSearchParams();

    const courseId = params.id as string;
    const week = searchParams.get('week') || '1';

    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecords>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                setError(null);

                const studentsRes = await fetch(
                    `http://127.0.0.1:8000/api/lectures/${courseId}/students/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (!studentsRes.ok) {
                    if (studentsRes.status === 401) {
                        localStorage.removeItem('access_token');
                        router.push('/login');
                        return;
                    } else if (studentsRes.status === 403) {
                        setError('권한이 없습니다.');
                        return;
                    } else if (studentsRes.status === 404) {
                        setError('강의를 찾을 수 없습니다.');
                        return;
                    }
                    throw new Error('수강생 목록을 불러올 수 없습니다.');
                }

                const studentsData: Student[] = await studentsRes.json();
                setStudents(studentsData);

                const initialRecords: AttendanceRecords = {};
                studentsData.forEach((student) => {
                    initialRecords[student.id] = 'PRESENT';
                });

                const attendanceRes = await fetch(
                    `http://127.0.0.1:8000/api/lectures/${courseId}/attendance/week/${week}/`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                if (attendanceRes.ok) {
                    const attendanceData: AttendanceRecord[] = await attendanceRes.json();
                    attendanceData.forEach((record) => {
                        initialRecords[record.student_id] = record.status;
                    });
                }

                setAttendanceRecords(initialRecords);

            } catch (err) {
                console.error('데이터 로딩 에러:', err);
                setError('데이터를 불러오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, week, router]);

    const handleStatusChange = (
        studentId: number,
        status: AttendanceStatus
    ) => {
        setAttendanceRecords((prev: AttendanceRecords) => ({
            ...prev,
            [studentId]: status,
        }));
    };

    const handleSave = async () => {
        if (!confirm('출결을 저장하시겠습니까?')) {
            return;
        }

        setSaving(true);
        const token = localStorage.getItem('access_token');

        try {
            const attendanceList: AttendanceRecord[] = Object.entries(
                attendanceRecords
            ).map(([studentId, status]) => ({
                student_id: Number(studentId),
                status: status as AttendanceStatus,
            }));

            const res = await fetch(
                `http://127.0.0.1:8000/api/lectures/${courseId}/attendance/week/${week}/`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ attendances: attendanceList }),
                }
            );

            if (res.ok) {
                alert('출결이 저장되었습니다.');
                router.push(
                    `/teacher/dashboard/courses/${courseId}/management`
                );
            } else {
                const errorData = await res.json().catch(() => null);
                console.error('출결 저장 에러:', errorData);
                
                if (res.status === 401) {
                    alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
                    localStorage.removeItem('access_token');
                    router.push('/login');
                } else if (res.status === 403) {
                    alert('권한이 없습니다.');
                } else {
                    alert(errorData?.error || '출결 저장에 실패했습니다.');
                }
            }
        } catch (err) {
            console.error('저장 에러:', err);
            alert('서버와 연결할 수 없습니다.');
        } finally {
            setSaving(false);
        }
    };

    const getButtonStyle = (
        currentStatus: AttendanceStatus | undefined,
        buttonStatus: AttendanceStatus
    ): string => {
        const isSelected = currentStatus === buttonStatus;

        if (buttonStatus === 'PRESENT') {
            return isSelected
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-blue-600 border-blue-300 hover:bg-blue-50';
        } else if (buttonStatus === 'LATE') {
            return isSelected
                ? 'bg-orange-500 text-white border-orange-500'
                : 'bg-white text-orange-500 border-orange-300 hover:bg-orange-50';
        } else {
            return isSelected
                ? 'bg-red-600 text-white border-red-600'
                : 'bg-white text-red-600 border-red-300 hover:bg-red-50';
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-7xl mx-auto py-8 px-4">
                <button
                    onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/management`)}
                    className="text-sm text-gray-500 hover:text-sky-600 mb-4 flex items-center gap-1"
                >
                    ← 목록으로 돌아가기
                </button>
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <p className="text-red-600 font-medium">{error}</p>
                </div>
            </div>
        );
    }

    const presentCount = Object.values(attendanceRecords).filter(s => s === 'PRESENT').length;
    const lateCount = Object.values(attendanceRecords).filter(s => s === 'LATE').length;
    const absentCount = Object.values(attendanceRecords).filter(s => s === 'ABSENT').length;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <button
                onClick={() =>
                    router.push(
                        `/teacher/dashboard/courses/${courseId}/management`
                    )
                }
                className="text-sm text-gray-500 hover:text-sky-600 mb-4 flex items-center gap-1"
            >
                ← 목록으로 돌아가기
            </button>

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {week} 주차 출결 입력
                </h1>
                <p className="text-sm text-gray-500">
                    출결 상태를 선택하고 저장 버튼을 눌러주세요.
                </p>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-32">
                                이름
                            </th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-40">
                                학번
                            </th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700">
                                출결 선택
                            </th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-32">
                                현재 상태
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {students.length > 0 ? (
                            students.map((student) => (
                                <tr
                                    key={student.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="py-4 px-4 text-center text-gray-800 font-medium">
                                        {student.name}
                                    </td>
                                    <td className="py-4 px-4 text-center text-gray-600">
                                        {student.student_id || '-'}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        'PRESENT'
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded text-xs font-bold border transition ${getButtonStyle(
                                                    attendanceRecords[
                                                        student.id
                                                    ],
                                                    'PRESENT'
                                                )}`}
                                            >
                                                출석
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        'LATE'
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded text-xs font-bold border transition ${getButtonStyle(
                                                    attendanceRecords[
                                                        student.id
                                                    ],
                                                    'LATE'
                                                )}`}
                                            >
                                                지각
                                            </button>
                                            <button
                                                onClick={() =>
                                                    handleStatusChange(
                                                        student.id,
                                                        'ABSENT'
                                                    )
                                                }
                                                className={`px-3 py-1.5 rounded text-xs font-bold border transition ${getButtonStyle(
                                                    attendanceRecords[
                                                        student.id
                                                    ],
                                                    'ABSENT'
                                                )}`}
                                            >
                                                결석
                                            </button>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4 text-center font-bold">
                                        {attendanceRecords[student.id] ===
                                            'PRESENT' && (
                                            <span className="text-blue-600">
                                                출석
                                            </span>
                                        )}
                                        {attendanceRecords[student.id] ===
                                            'LATE' && (
                                            <span className="text-orange-500">
                                                지각
                                            </span>
                                        )}
                                        {attendanceRecords[student.id] ===
                                            'ABSENT' && (
                                            <span className="text-red-600">
                                                결석
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="py-10 text-center text-gray-400"
                                >
                                    수강생이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {students.length > 0 && (
                <div className="mt-4 flex justify-end gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">총 인원:</span>
                        <span className="font-bold text-gray-900">{students.length}명</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">출석:</span>
                        <span className="font-bold text-blue-600">{presentCount}명</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">지각:</span>
                        <span className="font-bold text-orange-500">{lateCount}명</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-gray-600">결석:</span>
                        <span className="font-bold text-red-600">{absentCount}명</span>
                    </div>
                </div>
            )}

            <div className="mt-6 flex justify-center">
                <button
                    onClick={handleSave}
                    disabled={saving || students.length === 0}
                    className="bg-sky-600 text-white px-8 py-3 rounded-lg text-base font-bold hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    {saving ? '저장 중...' : '저장하기'}
                </button>
            </div>
        </div>
    );
}