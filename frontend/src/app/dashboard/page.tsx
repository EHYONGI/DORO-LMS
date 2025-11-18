// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lecture {
    id: number;
    name: string;
    instructor_name: string;
}
interface EnrollmentData {
    lecture: Lecture;
    joined_at: string;
}
interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    category?: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentData[]>([]);
    const [recentNotices, setRecentNotices] = useState<Notice[]>([]); // 최근 공지 5개
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. 내 강의 목록
                const courseRes = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses/', { headers });
                if (courseRes.ok) setEnrolledCourses(await courseRes.json());

                // 2. 공지사항 (최신 5개만)
                const noticeRes = await fetch('http://127.0.0.1:8000/api/dashboard/notices/', { headers });
                if (noticeRes.ok) {
                    const data = await noticeRes.json();
                    setRecentNotices(data.slice(0, 5));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2">대시보드</h1>

            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">

                {/* [좌측] 수강 과목 리스트 */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="space-y-4">
                        {enrolledCourses.length > 0 ? enrolledCourses.map((item) => (
                            <div
                                key={item.lecture.id}
                                onClick={() => router.push(`/dashboard/courses/${item.lecture.id}/management`)}
                                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-sky-300 cursor-pointer transition flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 group-hover:text-sky-600 group-hover:bg-sky-50 transition">
                                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800 group-hover:text-sky-600">{item.lecture.name}</h3>
                                        <p className="text-sm text-gray-500">{item.lecture.instructor_name || '교수 미정'}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-20 text-gray-400 border rounded-xl bg-white">수강 중인 강의가 없습니다.</div>
                        )}
                    </div>
                </div>

                {/* [우측] 중요 공지 섹션 */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="mb-4 border-b pb-2 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-sky-600">📌 최근 공지</h2>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-1 space-y-3">
                        {recentNotices.length > 0 ? recentNotices.map((notice) => (
                            <div key={notice.id} className="p-3 rounded hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span className="font-bold text-sky-600">{notice.category}</span>
                                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-sm font-bold text-gray-900 line-clamp-1">{notice.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-10 text-sm">공지사항이 없습니다.</p>
                        )}
                    </div>

                    {/* 요청하신 '전체 공지 보기' 버튼 */}
                    <div className="mt-auto pt-4 border-t text-right">
                        <button
                            onClick={() => router.push('/dashboard/notices')}
                            className="text-sm text-gray-500 font-bold hover:text-sky-600 hover:underline flex items-center justify-end gap-1 ml-auto"
                        >
                            전체 공지 보기
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}