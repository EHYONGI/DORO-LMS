'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Assignment {
    id: number;
    title: string;
    content: string;
    deadline: string;
}

export default function TeacherCourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [activeMenu, setActiveMenu] = useState<'assignments' | 'attendance'>('assignments');
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchAssignments = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await fetch(`http://127.0.0.1:8000/api/lecture/${courseId}/assignments/`, {
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
                                {assignments.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => setSelectedAssignment(task)}
                                        className={`p-3 rounded border cursor-pointer transition text-sm
                                            ${selectedAssignment?.id === task.id ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>

                            {/* 과제 상세 */}
                            <div className="flex-1">
                                {selectedAssignment ? (
                                    <>
                                        <h3 className="text-xl font-bold mb-2">{selectedAssignment.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">마감일: {new Date(selectedAssignment.deadline).toLocaleDateString()}</p>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[150px] whitespace-pre-wrap">
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
                                ) : <div className="text-gray-400 text-center mt-20">선택된 과제가 없습니다.</div>}
                            </div>
                        </div>
                    </div>
                )}

                {/* 화면 2: 출결 확인 */}
                {activeMenu === 'attendance' && (
                    <AttendanceManagement courseId={courseId as string} />
                )}

            </div>
        </div>
    );
}

// 출결 관리 컴포넌트
function AttendanceManagement({ courseId }: { courseId: string }) {
    const router = useRouter();
    const [weeks, setWeeks] = useState<number[]>([]);
    const [weekDates, setWeekDates] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        present: 0,
        absent: 0,
        late: 0,
    });

    useEffect(() => {
        const fetchAttendanceData = async () => {
            const token = localStorage.getItem('access_token');
            
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 1~15주차까지 체크
                const weekPromises = [];
                for (let week = 1; week <= 15; week++) {
                    weekPromises.push(
                        fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/attendance/week/${week}/`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).then(res => ({ week, res }))
                    );
                }

                const responses = await Promise.all(weekPromises);
                const existingWeeks: number[] = [];
                const dates: Record<number, string> = {};
                
                let totalPresent = 0;
                let totalLate = 0;
                let totalAbsent = 0;

                for (const { week, res } of responses) {
                    if (res.ok) {
                        const data = await res.json();
                        if (data.length > 0) {
                            existingWeeks.push(week);
                            
                            // 첫 번째 학생의 출결 날짜 저장
                            if (data[0].attendance_date) {
                                dates[week] = new Date(data[0].attendance_date).toLocaleDateString('ko-KR');
                            }

                            // 통계 계산
                            data.forEach((record: any) => {
                                if (record.status === 'PRESENT') totalPresent++;
                                else if (record.status === 'LATE') totalLate++;
                                else if (record.status === 'ABSENT') totalAbsent++;
                            });
                        }
                    }
                }

                setWeeks(existingWeeks);
                setWeekDates(dates);
                setStats({
                    total: existingWeeks.length,
                    present: totalPresent,
                    late: totalLate,
                    absent: totalAbsent,
                });

            } catch (err) {
                console.error('출결 데이터 로딩 에러:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [courseId, router]);

    if (loading) {
        return (
            <div className="h-full flex justify-center items-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="h-full">
            {/* 상단 요약 바 */}
            <div className="flex items-center justify-between mb-6 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div className="flex gap-4 font-medium text-gray-700">
                    <span>총 주차 <strong className="text-gray-900">{stats.total}</strong></span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <span>출석 <strong className="text-blue-600">{stats.present}</strong></span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <span>결석 <strong className="text-red-600">{stats.absent}</strong></span>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <span>지각 <strong className="text-orange-500">{stats.late}</strong></span>
                </div>
                <div className="flex gap-2 text-xs">
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>출석
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>지각
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-red-500"></span>결석
                    </div>
                </div>
            </div>

            {/* 출결 테이블 */}
            <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                        <tr>
                            <th className="py-3 border-r border-gray-200">주차</th>
                            <th className="py-3 border-r border-gray-200">날짜</th>
                            <th className="py-3">관리</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {weeks.length > 0 ? weeks.map((week) => (
                            <tr key={week} className="hover:bg-gray-50">
                                <td className="py-4 font-medium text-gray-800 border-r border-gray-100">
                                    {week} 주차
                                </td>
                                <td className="py-4 text-gray-600 border-r border-gray-100">
                                    {weekDates[week] || '-'}
                                </td>
                                <td className="py-4">
                                    <button
                                        onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/attendance?week=${week}`)}
                                        className="bg-sky-600 text-white px-4 py-1.5 rounded text-xs font-bold hover:bg-sky-700"
                                    >
                                        출결 보기
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={3} className="py-10 text-gray-400">
                                    출결 기록이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}