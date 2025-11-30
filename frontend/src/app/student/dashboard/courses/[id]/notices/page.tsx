// app/dashboard/courses/[id]/notices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    author_name: string;
}

export default function CourseNoticesPage() {
    const params = useParams();
    const courseId = params.id;
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/lecture/${courseId}/notices/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setNotices(await res.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [courseId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        // flex 레이아웃 제거하고 심플한 컨테이너로 변경
        <div className="min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">공지사항</h2>

            {loading ? (
                <p className="text-center text-gray-500 py-10">로딩 중...</p>
            ) : (
                <div className="border-t-2 border-gray-800">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                            <tr>
                                <th className="py-3 font-medium w-16 text-center">번호</th>
                                <th className="py-3 font-medium text-center">제목</th>
                                <th className="py-3 font-medium w-24 text-center">작성자</th>
                                <th className="py-3 font-medium w-28 text-center">작성일</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {notices.length > 0 ? notices.map((notice, index) => (
                                <tr key={notice.id} className="hover:bg-gray-50 transition">
                                    <td className="py-4 text-center text-gray-500">
                                        {notices.length - index}
                                    </td>
                                    <td className="py-4 pl-4">
                                        <Link
                                            href={`/dashboard/courses/${courseId}/notices/${notice.id}`}
                                            className="text-gray-800 hover:text-sky-600 font-medium block"
                                        >
                                            {notice.title}
                                        </Link>
                                    </td>
                                    <td className="py-4 text-center text-gray-600">
                                        {notice.author_name || '관리자'}
                                    </td>
                                    <td className="py-4 text-center text-gray-400 text-xs">
                                        {formatDate(notice.created_at)}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="py-10 text-center text-gray-400">
                                        등록된 공지사항이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}