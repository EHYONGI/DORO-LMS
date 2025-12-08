'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Notice {
    id: number;
    title: string;
    body: string;
    created_at: string;
    author_name: string;
}

export default function TeacherNoticesPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/teacher/lectures/${courseId}/notices/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );
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
        <div className="min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white p-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">공지사항</h2>
                <button
                    onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/notices/write`)}
                    className="bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-700"
                >
                    + 글 작성
                </button>
            </div>

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
                                <th className="py-3 font-medium w-24 text-center">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {notices.length > 0 ? notices.map((notice, index) => (
                                <tr key={notice.id} className="hover:bg-gray-50 transition">
                                    <td className="py-4 text-center text-gray-500">
                                        {notices.length - index}
                                    </td>
                                    <td className="py-4 pl-4">
                                        <button
                                            onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/notices/${notice.id}`)}
                                            className="text-gray-800 hover:text-sky-600 font-medium text-left"
                                        >
                                            {notice.title}
                                        </button>
                                    </td>
                                    <td className="py-4 text-center text-gray-600">
                                        {notice.author_name || '관리자'}
                                    </td>
                                    <td className="py-4 text-center text-gray-400 text-xs">
                                        {formatDate(notice.created_at)}
                                    </td>
                                    <td className="py-4 text-center">
                                        <button
                                            onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/notices/${notice.id}/edit`)}
                                            className="text-sky-600 text-xs hover:underline mr-2"
                                        >
                                            수정
                                        </button>
                                        <button
                                            onClick={async () => {
                                                if (!confirm('정말 삭제하시겠습니까?')) return;
                                                const token = localStorage.getItem('access_token');
                                                const res = await fetch(`http://127.0.0.1:8000/api/lecture/notices/${notice.id}/`, {
                                                    method: 'DELETE',
                                                    headers: { 'Authorization': `Bearer ${token}` }
                                                });
                                                if (res.ok) {
                                                    alert('삭제되었습니다.');
                                                    window.location.reload();
                                                }
                                            }}
                                            className="text-red-600 text-xs hover:underline"
                                        >
                                            삭제
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-gray-400">
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