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

export default function TeacherNoticeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const noticeId = params.noticeId;
    const courseId = params.id;

    const [notice, setNotice] = useState<Notice | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotice = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/lecture/notices/${noticeId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setNotice(await res.json());
                } else {
                    alert("공지사항을 찾을 수 없습니다.");
                    router.back();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotice();
    }, [noticeId, router]);

    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;
        
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lecture/notices/${noticeId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert('삭제되었습니다.');
                router.push(`/teacher/dashboard/courses/${courseId}/notices`);
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('삭제 중 오류가 발생했습니다.');
        }
    };

    if (loading) return <div className="p-10 text-center">로딩 중...</div>;
    if (!notice) return null;

    return (
        <div className="min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white p-8">
            <div className="border-b-2 border-gray-800 pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{notice.title}</h2>
                <div className="flex justify-between text-sm text-gray-500">
                    <span>작성자: {notice.author_name || '관리자'}</span>
                    <span>{new Date(notice.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="min-h-[300px] text-gray-700 whitespace-pre-wrap leading-relaxed">
                {notice.body}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
                <button
                    onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/notices`)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium text-sm transition"
                >
                    목록으로
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/notices/${noticeId}/edit`)}
                        className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 font-medium text-sm transition"
                    >
                        수정
                    </button>
                    <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-medium text-sm transition"
                    >
                        삭제
                    </button>
                </div>
            </div>
        </div>
    );
}
