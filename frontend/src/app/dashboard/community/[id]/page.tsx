'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// 데이터 타입 정의
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
    comments: Comment[]; // 댓글 리스트 포함
}

export default function CommunityDetailPage() {
    const params = useParams();
    const router = useRouter();
    const threadId = params.id;

    const [thread, setThread] = useState<Thread | null>(null);
    const [newComment, setNewComment] = useState(''); // 댓글 입력값
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<string>('');

    // 데이터 불러오기
    const fetchThread = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/${threadId}/`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setThread(await res.json());
            } else {
                alert("게시글을 불러올 수 없습니다.");
                router.back();
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // 유저 정보 가져오기 (댓글창에 이름 표시용)
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData).username);
        }
        fetchThread();
    }, [threadId]);

    // 댓글 작성 핸들러
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        if (!token) {
            alert("로그인이 필요합니다.");
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
                setNewComment(''); // 입력창 비우기
                fetchThread(); // 게시글(댓글 포함) 다시 불러오기
            } else {
                alert("댓글 작성 실패");
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
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white">
            {/* 좌측 사이드바 */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-white p-6 shrink-0 flex flex-col">
                <span className="font-bold text-gray-800 text-lg mb-6">대시보드</span>
                <nav className="space-y-4 text-sm font-medium text-gray-600">
                    <Link href="/dashboard/community" className="block text-sky-600 font-bold">• 전체 게시판</Link>
                    <Link href="#" className="block hover:text-gray-900">• 과목별 게시판</Link>
                </nav>
            </div>

            {/* 우측 메인 콘텐츠 */}
            <div className="flex-1 p-10">
                {/* 제목 & 수정 버튼 */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">{thread.title}</h1>
                    <button className="bg-gray-200 text-gray-600 text-xs px-3 py-1.5 rounded hover:bg-gray-300 transition">
                        수정하기
                    </button>
                </div>

                {/* 작성자 및 날짜 정보 바 */}
                <div className="flex justify-between text-xs text-gray-500 border-y border-gray-200 py-3 mb-8 bg-gray-50 px-2">
                    <span><strong>작성자:</strong> {thread.student_name || '익명'}</span>
                    <span><strong>작성일시:</strong> {formatDate(thread.created_at)}</span>
                </div>

                {/* 본문 내용 */}
                <div className="min-h-[200px] text-gray-800 text-sm leading-7 whitespace-pre-wrap mb-10">
                    {thread.content}
                </div>

                {/* 좋아요 / 댓글 아이콘 */}
                <div className="flex items-center gap-4 text-xs text-gray-500 mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center gap-1 cursor-pointer hover:text-sky-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
                        <span>0</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" /></svg>
                        <span>{thread.comments?.length || 0}</span>
                    </div>
                </div>

                {/* 댓글 입력창 (이미지 스타일) */}
                <form onSubmit={handleCommentSubmit} className="mb-10 bg-gray-100 p-4 rounded-xl flex items-center gap-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-gray-800 shrink-0">
                        <div className="w-5 h-5 bg-gray-800 rounded-full text-white flex items-center justify-center text-[10px]">✓</div>
                        {user || '익명'}
                    </div>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 입력하세요"
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm placeholder-gray-400 text-gray-800"
                    />
                    <button type="submit" className="hidden">제출</button> {/* 엔터키 제출용 */}
                </form>

                {/* 댓글 리스트 */}
                <div className="space-y-6">
                    {(thread.comments || []).map((comment) => (
                        <div key={comment.id} className="border-b border-gray-100 pb-4 last:border-0">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-sm font-bold text-gray-800">{comment.student_name}</span>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    <span>👍 0</span>
                                    <span>💬 0</span>
                                </div>
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