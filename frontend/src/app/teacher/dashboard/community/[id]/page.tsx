'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Comment {
    id: number;
    content: string;
    created_at: string;
    student_name: string;
}

interface Thread {
    id: number;
    title: string;
    content: string;
    created_at: string;
    student_name: string;
    comments: Comment[];
}

export default function TeacherCommunityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const threadId = params.id;

    const [thread, setThread] = useState<Thread | null>(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchThread = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/${threadId}/`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setThread(await res.json());
            } else {
                alert('게시글을 불러올 수 없습니다.');
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchThread();
    }, [threadId]);

    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        if (!token) {
            alert('로그인이 필요합니다.');
            return;
        }
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/${threadId}/comments/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });

            if (res.ok) {
                setNewComment('');
                fetchThread();
            } else {
                alert('댓글 작성 실패');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;
    if (!thread) return null;

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white max-w-7xl mx-auto my-8">
            {/* 좌측 사이드바 */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 p-6 shrink-0">
                <span className="font-bold text-gray-700 text-lg">대시보드</span>
            </div>

            {/* 우측 메인 */}
            <div className="flex-1 p-10">
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/teacher/dashboard/community')}
                        className="text-sm text-gray-500 hover:text-sky-600"
                    >
                        ← 목록으로
                    </button>
                </div>

                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
                </div>

                <div className="flex justify-between text-xs text-gray-500 border-y border-gray-200 py-3 mb-8 bg-gray-50 px-2">
                    <span><strong>작성자:</strong> {thread.student_name || '익명'}</span>
                    <span><strong>작성일시:</strong> {formatDate(thread.created_at)}</span>
                </div>

                <div className="min-h-[200px] text-gray-800 text-sm leading-7 whitespace-pre-wrap mb-10">
                    {thread.content}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        <span>{thread.comments?.length || 0}</span>
                    </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="mb-10 bg-gray-100 p-4 rounded-xl flex items-center gap-4">
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-bold text-sm transition"
                    >
                        댓글 작성
                    </button>
                </form>

                <div className="space-y-6">
                    {(thread.comments || []).map((comment) => (
                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-gray-800">{comment.student_name}</span>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">{comment.content}</p>
                            <span className="text-xs text-gray-400">{formatDate(comment.created_at)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}