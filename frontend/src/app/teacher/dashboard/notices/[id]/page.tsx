'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notice {
    id: number;
    title: string;
    body: string;
    created_at: string;
    lecture: number;
    lecture_name?: string;
}

export default function TeacherNoticesPage() {
    const router = useRouter();
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 강사가 작성한 모든 공지사항 조회
                const res = await fetch('http://127.0.0.1:8000/api/teacher/notices/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setNotices(data);
                } else if (res.status === 401) {
                    localStorage.removeItem('access_token');
                    router.push('/login');
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotices();
    }, [router]);

    const handleNoticeClick = (noticeId: number, lectureId: number) => {
        router.push(`/teacher/dashboard/courses/${lectureId}/notices/${noticeId}`);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">내가 작성한 공지사항</h1>
            </div>

            {notices.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    작성한 공지사항이 없습니다.
                </div>
            ) : (
                <div className="space-y-3">
                    {notices.map((notice) => (
                        <div
                            key={notice.id}
                            onClick={() => handleNoticeClick(notice.id, notice.lecture)}
                            className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-sky-300 transition cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-sky-100 text-sky-700 px-2 py-1 rounded text-xs font-medium">
                                            {notice.lecture_name || '강의'}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        {notice.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {notice.body}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <svg 
                                    className="w-5 h-5 text-gray-400 flex-shrink-0 ml-4" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}   