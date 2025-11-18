// app/dashboard/courses/[id]/community/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CourseCommunityPage() {
    const [threads, setThreads] = useState<any[]>([]);

    useEffect(() => {
        // API 호출 (전체 커뮤니티 글 중 이 강의 관련된 것만 필터링해야 함)
        const fetchThreads = async () => {
            const res = await fetch('http://127.0.0.1:8000/api/community/');
            if (res.ok) setThreads(await res.json());
        };
        fetchThreads();
    }, []);

    return (
        <div className="p-6">
            <div className="flex justify-between items-end mb-4 border-b-2 border-gray-800 pb-2">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">커뮤니티</h2>
                    <p className="text-sm text-gray-500 mt-1">과목별 게시판</p>
                </div>
                <Link href="/dashboard/community/write">
                    <button className="bg-sky-600 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-sky-700">
                        글 작성함
                    </button>
                </Link>
            </div>

            <table className="w-full text-sm text-left">
                <thead className="text-gray-500 border-b border-gray-200">
                    <tr>
                        <th className="py-3 font-medium w-2/3">제목</th>
                        <th className="py-3 font-medium text-center">작성자</th>
                        <th className="py-3 font-medium text-center">작성일</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {threads.map((thread) => (
                        <tr key={thread.id} className="hover:bg-gray-50 transition">
                            <td className="py-4 pr-4">
                                <div className="flex items-center gap-2">
                                    <span className="bg-gray-800 text-white text-[10px] px-1.5 py-0.5 rounded-full">잡담</span>
                                    <Link href={`/dashboard/community/${thread.id}`} className="font-medium text-gray-800 hover:text-sky-600">
                                        {thread.title}
                                    </Link>
                                </div>
                            </td>
                            <td className="py-4 text-center text-gray-600">{thread.student_name}</td>
                            <td className="py-4 text-center text-gray-400 text-xs">
                                {new Date(thread.created_at).toLocaleDateString()}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}