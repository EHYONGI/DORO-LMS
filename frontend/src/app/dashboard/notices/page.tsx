// app/dashboard/notices/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    author_name: string;
    type: 'system' | 'lecture'; // 공지 타입 구분
    category?: string; // '전체 공지' 또는 강의명
    lecture?: number;  // 강의 ID (강의 공지일 경우)
}

export default function AllNoticesPage() {
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
                const res = await fetch('http://127.0.0.1:8000/api/dashboard/notices/', {
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
    }, [router]);

    // 상세 페이지 이동 핸들러
    const handleNoticeClick = (notice: Notice) => {
        if (notice.type === 'lecture' && notice.lecture) {
            // 강의 공지 -> 해당 강의의 공지 상세 페이지로 이동
            router.push(`/dashboard/courses/${notice.lecture}/notices/${notice.id}`);
        } else {
            // 시스템 공지 -> 시스템 공지 상세 페이지로 이동
            router.push(`/dashboard/notices/${notice.id}`);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`;
    };

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white max-w-7xl mx-auto my-8">
            {/* 좌측 사이드바 (디자인 통일용) */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 p-6 shrink-0">
                <span className="font-bold text-gray-700 text-lg">대시보드</span>
            </div>

            {/* 우측 메인 */}
            <div className="flex-1 p-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6">전체 공지사항</h2>

                {loading ? (
                    <p className="text-center text-gray-500 py-10">로딩 중...</p>
                ) : (
                    <div className="border-t-2 border-gray-800">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700">
                                <tr>
                                    <th className="py-3 font-medium w-16 text-center">번호</th>
                                    <th className="py-3 font-medium w-24 text-center">구분</th>
                                    <th className="py-3 font-medium text-center">제목</th>
                                    <th className="py-3 font-medium w-24 text-center">작성자</th>
                                    <th className="py-3 font-medium w-28 text-center">작성일</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {notices.length > 0 ? notices.map((notice, index) => (
                                    <tr key={`${notice.type}-${notice.id}`} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => handleNoticeClick(notice)}>
                                        <td className="py-4 text-center text-gray-500">
                                            {notices.length - index}
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className={`text-xs font-bold px-2 py-1 rounded ${notice.type === 'system' ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'
                                                }`}>
                                                {notice.category === '전체 공지' ? '전체' : '강의'}
                                            </span>
                                        </td>
                                        <td className="py-4 pl-4 text-left font-medium text-gray-800 hover:text-sky-600">
                                            {notice.title}
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
                                        <td colSpan={5} className="py-10 text-center text-gray-400">
                                            등록된 공지사항이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="mt-6 text-right">
                    <button onClick={() => router.back()} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm">뒤로가기</button>
                </div>
            </div>
        </div>
    );
}