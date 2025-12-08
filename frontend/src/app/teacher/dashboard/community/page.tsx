'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Thread {
    id: number;
    title: string;
    content: string;
    created_at: string;
    student_name: string;
}

export default function TeacherCommunityPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [threads, setThreads] = useState<Thread[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchThreads = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/community/?lecture_id=${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (res.ok) {
                    const data = await res.json();
                    setThreads(data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchThreads();
    }, [courseId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
    }

    return (
        <div className="p-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">학생 커뮤니티</h2>

            {/* 게시글 테이블 */}
            <div className="border-t-2 border-gray-800">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-20">번호</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700">제목</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-32">작성자</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-40">작성일</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {threads.length > 0 ? threads.map((thread, index) => (
                            <tr 
                                key={thread.id}
                                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/community/${thread.id}`)}
                                className="hover:bg-gray-50 cursor-pointer transition"
                            >
                                <td className="py-4 px-4 text-center text-gray-600">
                                    {threads.length - index}
                                </td>
                                <td className="py-4 px-4 text-left">
                                    <span className="text-gray-800 font-medium hover:text-sky-600">
                                        {thread.title}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center text-gray-600">
                                    {thread.student_name}
                                </td>
                                <td className="py-4 px-4 text-center text-gray-400 text-xs">
                                    {formatDate(thread.created_at)}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-400">
                                    등록된 게시글이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* 페이지네이션 */}
            {threads.length > 0 && (
                <div className="mt-6 text-center text-sm text-gray-500">
                    1 / 1
                </div>
            )}
        </div>
    );
}