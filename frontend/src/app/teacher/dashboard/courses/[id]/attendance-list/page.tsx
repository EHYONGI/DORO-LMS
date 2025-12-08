'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function TeacherAttendanceListPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [weeks, setWeeks] = useState<number[]>([]);
    const [weekDates, setWeekDates] = useState<Record<number, string>>({});
    const [loading, setLoading] = useState(true);

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

                for (const { week, res } of responses) {
                    if (res.ok) {
                        const data = await res.json();
                        if (data.length > 0) {
                            existingWeeks.push(week);
                            
                            // 첫 번째 학생의 출결 날짜 저장
                            if (data[0].attendance_date) {
                                dates[week] = new Date(data[0].attendance_date).toLocaleDateString('ko-KR');
                            }
                        }
                    }
                }

                setWeeks(existingWeeks);
                setWeekDates(dates);

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
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">출결 현황</h2>

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
                                        출결 입력
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