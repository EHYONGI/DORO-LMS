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

interface Attendance {
    id: number;
    week: number;
    attendance_date: string;
    status: string; // 'PRESENT', 'LATE', 'ABSENT'
}

export default function CourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    // 현재 선택된 사이드바 메뉴
    const [activeMenu, setActiveMenu] = useState<'tasks' | 'attendance'>('tasks');

    // 데이터 상태
    const [tasks, setTasks] = useState<Assignment[]>([]);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(false);

    // 과제 데이터 가져오기
    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/lectures/courses/${courseId}/assignments/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (res.ok) {
                    const courseTasks = await res.json();
                    setTasks(courseTasks);
                    if (courseTasks.length > 0) setSelectedTask(courseTasks[0]);
                    else setSelectedTask(null);
                } else if (res.status === 401) {
                    localStorage.removeItem('access_token');
                    router.push('/login');
                }
            } catch (err) {
                console.error('과제 로딩 에러:', err);
            }
        };

        if (activeMenu === 'tasks') {
            fetchTasks();
        }
    }, [courseId, activeMenu, router]);

    // 출결 데이터 가져오기
    useEffect(() => {
        const fetchAttendances = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            setLoading(true);
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/lectures/courses/${courseId}/attendance/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setAttendances(data);
                } else if (res.status === 401) {
                    localStorage.removeItem('access_token');
                    router.push('/login');
                }
            } catch (err) {
                console.error('출결 로딩 에러:', err);
            } finally {
                setLoading(false);
            }
        };

        if (activeMenu === 'attendance') {
            fetchAttendances();
        }
    }, [courseId, activeMenu, router]);

    // 출결 통계 계산 함수
    const getAttendanceStats = () => {
        const total = attendances.length;
        const present = attendances.filter(a => a.status === 'PRESENT').length;
        const late = attendances.filter(a => a.status === 'LATE').length;
        const absent = attendances.filter(a => a.status === 'ABSENT').length;
        return { total, present, late, absent };
    };
    const stats = getAttendanceStats();

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white">

            {/* === 좌측 사이드바 === */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-200 font-bold text-gray-700">
                    대시보드
                </div>
                <nav className="flex-grow p-3 space-y-1">
                    <button
                        onClick={() => setActiveMenu('tasks')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2
                            ${activeMenu === 'tasks' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
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
                        출결 현황
                    </button>
                </nav>
            </div>

            {/* === 우측 메인 콘텐츠 === */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* [화면 1] 과제 화면 */}
                {activeMenu === 'tasks' && (
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">과제</h2>
                        <div className="flex flex-1 gap-6">
                            {/* 과제 목록 */}
                            <div className="w-1/3 border-r pr-4 space-y-2 overflow-y-auto max-h-[500px]">
                                {tasks.length > 0 ? tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                        className={`p-3 rounded border cursor-pointer transition text-sm
                                            ${selectedTask?.id === task.id ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {task.title}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-gray-400">
                                        과제가 없습니다.
                                    </div>
                                )}
                            </div>
                            {/* 과제 상세 */}
                            <div className="flex-1">
                                {selectedTask ? (
                                    <>
                                        <h3 className="text-xl font-bold mb-2">{selectedTask.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            마감일: {new Date(selectedTask.deadline).toLocaleDateString('ko-KR')}
                                        </p>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[150px] whitespace-pre-wrap">
                                            {selectedTask.content}
                                        </div>
                                        <div className="mt-4">
                                            <textarea 
                                                className="w-full border border-gray-300 p-3 rounded-lg h-32 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" 
                                                placeholder="과제 제출 내용 작성..."
                                            />
                                            <div className="mt-2 text-right">
                                                <button className="bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-700">
                                                    제출하기
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 text-center mt-20">
                                        {tasks.length > 0 ? '과제를 선택하세요.' : '등록된 과제가 없습니다.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* [화면 2] 출결 현황 화면 */}
                {activeMenu === 'attendance' && (
                    <div className="h-full">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="text-gray-500">로딩 중...</div>
                            </div>
                        ) : (
                            <>
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
                                                <th className="py-3 border-r border-gray-200">출결일</th>
                                                <th className="py-3">출결여부</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {attendances.length > 0 ? attendances.map((att) => (
                                                <tr key={att.id} className="hover:bg-gray-50">
                                                    <td className="py-4 font-medium text-gray-800 border-r border-gray-100">
                                                        {att.week} 주차
                                                    </td>
                                                    <td className="py-4 text-gray-600 border-r border-gray-100">
                                                        {new Date(att.attendance_date).toLocaleDateString('ko-KR')}
                                                    </td>
                                                    <td className="py-4 font-bold">
                                                        {att.status === 'PRESENT' && <span className="text-blue-600">출석</span>}
                                                        {att.status === 'LATE' && <span className="text-orange-500">지각</span>}
                                                        {att.status === 'ABSENT' && <span className="text-red-600">결석</span>}
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
                            </>
                        )}
                    </div>
                )}

            </div>
        </div>
    );
}