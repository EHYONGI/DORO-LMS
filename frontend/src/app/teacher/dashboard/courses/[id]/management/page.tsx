// app/teacher/dashboard/courses/[id]/management/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// === 데이터 타입 정의 ===
interface Assignment {
    id: number;
    title: string;
    content: string;
    deadline: string;
}

interface MySubmission {
    id: number;
    content: string;
    file: string | null;
    submitted_at: string;
    grade: number | null;
    feedback: string | null;
}

// 출결 관련 타입
interface Student {
    id: number;
    name: string;
    student_id: string;
}

type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT';

interface AttendanceRecords {
    [studentId: number]: AttendanceStatus;
}

export default function TeacherCourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [activeMenu, setActiveMenu] = useState<'assignments' | 'attendance'>('assignments');

    // 과제 관련 상태
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

    // 과제 제출 관련 상태 (강사 페이지에서는 불필요할 수 있으나 기존 코드 유지 시 사용)
    // (여기서는 강사 페이지이므로 과제 관리 기능만 있으면 됩니다. 제출 로직은 생략 가능하나 기존 구조 유지)

    useEffect(() => {
        const fetchAssignments = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/assignments/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setAssignments(data);
                    if (data.length > 0) setSelectedAssignment(data[0]);
                    else setSelectedAssignment(null);
                }
            } catch (err) {
                console.error(err);
            }
        };

        if (activeMenu === 'assignments') {
            fetchAssignments();
        }
    }, [courseId, activeMenu]);

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white">

            {/* 좌측 사이드바 */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-200 font-bold text-gray-700">
                    대시보드
                </div>
                <nav className="flex-grow p-3 space-y-1">
                    <button
                        onClick={() => setActiveMenu('assignments')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2
                            ${activeMenu === 'assignments' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        과제
                    </button>
                    <button
                        onClick={() => setActiveMenu('attendance')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2
                            ${activeMenu === 'attendance' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                        출결 확인
                    </button>
                </nav>
            </div>

            {/* 우측 메인 콘텐츠 */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* 화면 1: 과제 관리 */}
                {activeMenu === 'assignments' && (
                    <div className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900">과제 관리</h2>
                            <button
                                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/assignments/create`)}
                                className="bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-700"
                            >
                                + 과제 등록
                            </button>
                        </div>

                        <div className="flex flex-1 gap-6">
                            {/* 과제 목록 */}
                            <div className="w-1/3 border-r pr-4 space-y-2 overflow-y-auto max-h-[500px]">
                                {assignments.length > 0 ? assignments.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => setSelectedAssignment(task)}
                                        className={`p-3 rounded border cursor-pointer transition text-sm
                                            ${selectedAssignment?.id === task.id ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {task.title}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-gray-400">등록된 과제가 없습니다.</div>
                                )}
                            </div>

                            {/* 과제 상세 */}
                            <div className="flex-1">
                                {selectedAssignment ? (
                                    <>
                                        <h3 className="text-xl font-bold mb-2">{selectedAssignment.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">마감일: {new Date(selectedAssignment.deadline).toLocaleDateString()}</p>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[150px] whitespace-pre-wrap border border-gray-100">
                                            {selectedAssignment.content}
                                        </div>
                                        <div className="mt-4 flex gap-2">
                                            <button
                                                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/assignments/${selectedAssignment.id}/submissions`)}
                                                className="bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-700"
                                            >
                                                제출 현황 보기
                                            </button>
                                            <button
                                                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/assignments/${selectedAssignment.id}/edit`)}
                                                className="bg-gray-100 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-200"
                                            >
                                                수정
                                            </button>
                                        </div>
                                    </>
                                ) : <div className="text-gray-400 text-center mt-20">좌측에서 과제를 선택하세요.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 화면 2: 출결 확인 및 입력 */}
                {activeMenu === 'attendance' && (
                    <AttendanceManagement courseId={courseId as string} />
                )}

            </div>
        </div>
    );
}

// [수정] 출결 관리 컴포넌트 (주차 선택 + 학생 목록 + 저장 기능)
function AttendanceManagement({ courseId }: { courseId: string }) {
    const router = useRouter();
    const [selectedWeek, setSelectedWeek] = useState(1);
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecords>({});

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // 1. 학생 목록 및 해당 주차 출결 데이터 불러오기
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // (1) 수강생 목록 가져오기 (이름순 정렬됨)
                const studentsRes = await fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/students/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!studentsRes.ok) throw new Error('수강생 목록 조회 실패');
                const studentsData: Student[] = await studentsRes.json();
                setStudents(studentsData);

                // (2) 해당 주차 출결 데이터 가져오기
                const attendanceRes = await fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/attendance/week/${selectedWeek}/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // 초기 출결 상태 설정 (기본값: PRESENT)
                const newRecords: AttendanceRecords = {};
                studentsData.forEach(s => newRecords[s.id] = 'PRESENT');

                if (attendanceRes.ok) {
                    const attendanceData = await attendanceRes.json();
                    attendanceData.forEach((record: any) => {
                        newRecords[record.student_id] = record.status;
                    });
                }
                setAttendanceRecords(newRecords);

            } catch (err) {
                console.error(err);
                alert("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [courseId, selectedWeek, router]);

    // 출결 상태 변경 핸들러
    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceRecords(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    // 저장 핸들러
    const handleSave = async () => {
        if (!confirm(`${selectedWeek}주차 출결을 저장하시겠습니까?`)) return;

        setSaving(true);
        const token = localStorage.getItem('access_token');

        const payload = Object.entries(attendanceRecords).map(([studentId, status]) => ({
            student_id: Number(studentId),
            status
        }));

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/attendance/week/${selectedWeek}/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ attendances: payload })
            });

            if (res.ok) {
                alert('저장되었습니다.');
            } else {
                alert('저장에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('오류가 발생했습니다.');
        } finally {
            setSaving(false);
        }
    };

    if (loading && students.length === 0) return <div className="text-center py-20 text-gray-500">로딩 중...</div>;

    return (
        <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900">출결 관리</h2>

                {/* 주차 선택기 */}
                <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-700">주차 선택:</span>
                    <select
                        value={selectedWeek}
                        onChange={(e) => setSelectedWeek(Number(e.target.value))}
                        className="border border-gray-300 rounded-md p-1.5 text-sm focus:border-sky-500 outline-none"
                    >
                        {Array.from({ length: 15 }, (_, i) => i + 1).map(w => (
                            <option key={w} value={w}>{w}주차</option>
                        ))}
                    </select>
                </div>
            </div>

            {students.length === 0 ? (
                <div className="text-center py-20 text-gray-400 bg-gray-50 rounded-lg">수강생이 없습니다.</div>
            ) : (
                <div className="flex-1 overflow-hidden flex flex-col">
                    {/* 출결 테이블 */}
                    <div className="border border-gray-200 rounded-lg overflow-hidden flex-1 overflow-y-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 sticky top-0">
                                <tr>
                                    <th className="py-3 px-4 w-16 text-center">번호</th>
                                    <th className="py-3 px-4 w-32 text-center">이름</th>
                                    <th className="py-3 px-4 w-32 text-center">학번(ID)</th>
                                    <th className="py-3 px-4 text-center">출결 상태</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 bg-white">
                                {students.map((student, index) => (
                                    <tr key={student.id} className="hover:bg-gray-50">
                                        <td className="py-3 px-4 text-center text-gray-500">{index + 1}</td>
                                        <td className="py-3 px-4 text-center font-medium text-gray-900">{student.name}</td>
                                        <td className="py-3 px-4 text-center text-gray-500">{student.student_id}</td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex justify-center gap-2">
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition border ${attendanceRecords[student.id] === 'PRESENT'
                                                            ? 'bg-blue-600 text-white border-blue-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                                        }`}
                                                >
                                                    출석
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'LATE')}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition border ${attendanceRecords[student.id] === 'LATE'
                                                            ? 'bg-orange-500 text-white border-orange-500'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-orange-400 hover:text-orange-500'
                                                        }`}
                                                >
                                                    지각
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition border ${attendanceRecords[student.id] === 'ABSENT'
                                                            ? 'bg-red-600 text-white border-red-600'
                                                            : 'bg-white text-gray-500 border-gray-200 hover:border-red-400 hover:text-red-600'
                                                        }`}
                                                >
                                                    결석
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* 하단 저장 버튼 */}
                    <div className="mt-6 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="bg-sky-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-700 shadow-sm transition disabled:opacity-50"
                        >
                            {saving ? '저장 중...' : '출결 내용 저장'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}