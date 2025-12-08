// app/manager/dashboard/notices/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    author_name: string;
}

export default function ManagerNoticeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const noticeId = params.id;

    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // [수정] 시스템 공지 상세 조회 API
                const res = await fetch(`http://127.0.0.1:8000/api/notice/notices/${noticeId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setNotice(data);
                } else {
                    alert("공지사항을 찾을 수 없습니다.");
                    router.back();
                }
            } catch (err) {
                console.error(err);
                alert("오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [noticeId, router]);

    // 공지 삭제 핸들러
    const handleDelete = async () => {
        if (!confirm("정말 이 공지사항을 삭제하시겠습니까?")) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/notice/system/${noticeId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("삭제되었습니다.");
                router.push('/manager/dashboard'); // 대시보드로 이동
            } else {
                // 에러 메시지 확인
                const errorData = await res.json().catch(() => ({}));
                alert(errorData.detail || "삭제 실패: 권한이 없거나 오류가 발생했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="text-gray-500">로딩 중...</div></div>;
    if (!notice) return null;

    return (
        <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8">
                {/* 헤더 */}
                <div className="border-b-2 border-gray-800 pb-4 mb-6">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded">
                            전체 공지
                        </span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3">
                        {notice.title}
                    </h1>
                    <div className="flex justify-between text-sm text-gray-500">
                        <span className="font-medium">작성자: {notice.author_name || '관리자'}</span>
                        <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* 본문 */}
                <div className="min-h-[300px] text-gray-700 whitespace-pre-wrap leading-relaxed mb-8">
                    {notice.content}
                </div>

                {/* 하단 버튼 */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-center">
                    <button
                        onClick={() => router.push('/manager/dashboard')}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium text-sm transition"
                    >
                        목록으로
                    </button>

                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 font-medium text-sm transition border border-red-200"
                    >
                        삭제하기
                    </button>
                </div>
            </div>
        </div>
    );
}