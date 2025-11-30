// app/dashboard/courses/[id]/community/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

// 타입 정의
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
    lecture?: number;
    comments?: Comment[]; // 상세 조회 시 포함됨
}

export default function CourseCommunityPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    // 상태 관리
    const [activeTab, setActiveTab] = useState<'all' | 'course'>('all'); // 좌측 메뉴 탭
    const [viewMode, setViewMode] = useState<'list' | 'detail'>('list'); // 리스트 vs 상세

    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState('');

    // 1. 게시글 목록 가져오기
    const fetchThreads = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            // 탭에 따라 URL 변경 (전체 vs 과목별)
            let url = 'http://127.0.0.1:8000/api/community/';
            if (activeTab === 'course') {
                url += `?lecture_id=${courseId}`;
            }

            const res = await fetch(url, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setThreads(await res.json());
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 2. 게시글 상세 가져오기 (댓글 포함)
    const fetchThreadDetail = async (threadId: number) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/${threadId}/`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (res.ok) {
                setSelectedThread(await res.json());
                setViewMode('detail'); // 화면 전환
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 3. 댓글 작성
    const handleCommentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!token || !selectedThread) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/community/${selectedThread.id}/comments/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content: newComment }),
            });
            if (res.ok) {
                setNewComment('');
                fetchThreadDetail(selectedThread.id); // 댓글 목록 갱신
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 초기 로드 및 탭 변경 시 목록 갱신
    useEffect(() => {
        fetchThreads();
        setViewMode('list'); // 탭 바꾸면 리스트로 복귀

        const userData = localStorage.getItem('user');
        if (userData) setUser(JSON.parse(userData).username);
    }, [activeTab, courseId]);

    // 날짜 포맷
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white">

            {/* === 좌측 사이드바 (강의관리 탭과 디자인 통일) === */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-200 font-bold text-gray-700">
                    대시보드
                </div>
                <nav className="flex-grow p-3 space-y-1">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2
                            ${activeTab === 'all' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'all' ? 'bg-sky-600' : 'bg-gray-400'}`}></span>
                        전체 게시판
                    </button>
                    <button
                        onClick={() => setActiveTab('course')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2
                            ${activeTab === 'course' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'course' ? 'bg-sky-600' : 'bg-gray-400'}`}></span>
                        과목 게시판
                    </button>
                </nav>
            </div>

            {/* === 우측 메인 콘텐츠 === */}
            <div className="flex-1 p-8 overflow-y-auto">

                {/* [VIEW 1] 게시글 리스트 */}
                {viewMode === 'list' && (
                    <>
                        <div className="flex justify-between items-end mb-6 border-b-2 border-gray-800 pb-2">
                            <h2 className="text-xl font-bold text-gray-800">
                                {activeTab === 'all' ? '전체 게시판' : '과목 게시판'}
                            </h2>
                            {/* 글쓰기 버튼 - 실제 구현은 별도 페이지 연결 또는 모달 */}
                            <Link
                                href={`/dashboard/community/write?lecture_id=${courseId}`}
                                className="bg-sky-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-700 transition"
                            >
                                글 작성
                            </Link>
                        </div>

                        {loading ? (
                            <p className="text-center text-gray-500 py-10">로딩 중...</p>
                        ) : (
                            <table className="w-full text-sm text-left">
                                <thead className="text-gray-500 border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="py-3 pl-4 font-medium">제목</th>
                                        <th className="py-3 text-center font-medium w-32">작성자</th>
                                        <th className="py-3 text-center font-medium w-32">작성일</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {threads.length > 0 ? threads.map((thread) => (
                                        <tr
                                            key={thread.id}
                                            onClick={() => fetchThreadDetail(thread.id)}
                                            className="hover:bg-sky-50 transition cursor-pointer group"
                                        >
                                            <td className="py-4 pl-4 pr-4">
                                                <span className="font-medium text-gray-800 group-hover:text-sky-600">
                                                    {thread.title}
                                                </span>
                                            </td>
                                            <td className="py-4 text-center text-gray-600">{thread.student_name}</td>
                                            <td className="py-4 text-center text-gray-400 text-xs">
                                                {new Date(thread.created_at).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={3} className="py-10 text-center text-gray-400">게시글이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </>
                )}

                {/* [VIEW 2] 게시글 상세 (댓글 포함) */}
                {viewMode === 'detail' && selectedThread && (
                    <div>
                        {/* 상단 네비게이션 (목록으로 돌아가기) */}
                        <div className="mb-6">
                            <button
                                onClick={() => setViewMode('list')}
                                className="text-sm text-gray-500 hover:text-sky-600 flex items-center gap-1"
                            >
                                ← 목록으로 돌아가기
                            </button>
                        </div>

                        {/* 본문 영역 */}
                        <div className="border-b border-gray-200 pb-6 mb-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-3">{selectedThread.title}</h1>
                            <div className="flex justify-between text-sm text-gray-500 bg-gray-50 px-3 py-2 rounded">
                                <span>작성자: <strong>{selectedThread.student_name}</strong></span>
                                <span>{formatDate(selectedThread.created_at)}</span>
                            </div>
                            <div className="mt-6 text-gray-800 leading-relaxed whitespace-pre-wrap min-h-[100px]">
                                {selectedThread.content}
                            </div>
                        </div>

                        {/* 댓글 영역 */}
                        <div className="bg-gray-50 rounded-xl p-6">
                            <h3 className="font-bold text-gray-800 mb-4">
                                댓글 <span className="text-sky-600">{selectedThread.comments?.length || 0}</span>
                            </h3>

                            {/* 댓글 리스트 */}
                            <div className="space-y-4 mb-6">
                                {(selectedThread.comments || []).map((comment) => (
                                    <div key={comment.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span className="font-bold text-gray-700">{comment.student_name}</span>
                                            <span>{formatDate(comment.created_at)}</span>
                                        </div>
                                        <p className="text-sm text-gray-800">{comment.content}</p>
                                    </div>
                                ))}
                            </div>

                            {/* 댓글 입력폼 */}
                            <form onSubmit={handleCommentSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder={`${user}님, 댓글을 입력하세요...`}
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-sky-500"
                                />
                                <button type="submit" className="bg-sky-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sky-700">
                                    등록
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}