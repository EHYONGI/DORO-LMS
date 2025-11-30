// app/dashboard/courses/[id]/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';

export default function CourseLayout({ children }: { children: React.ReactNode }) {
    const params = useParams();
    const pathname = usePathname();
    const courseId = params.id;

    // 탭 정의 (현재 URL과 비교하여 활성화 스타일 적용)
    const tabs = [
        { name: '강의관리', path: `/dashboard/courses/${courseId}/management` },
        { name: '공지 확인', path: `/dashboard/courses/${courseId}/notices` },
        { name: '학생 커뮤니티', path: `/dashboard/courses/${courseId}/community` },
        { name: '출결 확인', path: `/dashboard/courses/${courseId}/attendance` },
    ];

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* 탭 네비게이션 (파란색 버튼 스타일) */}
            <div className="flex space-x-2 mb-6 border-b border-gray-300 pb-1">
                {tabs.map((tab) => {
                    const isActive = pathname.startsWith(tab.path);
                    return (
                        <Link
                            key={tab.name}
                            href={tab.path}
                            className={`px-6 py-2 rounded-t-lg font-bold text-sm transition-colors border-t border-l border-r border-gray-300
                                ${isActive
                                    ? 'bg-sky-600 text-white border-sky-600'
                                    : 'bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                                }`}
                        >
                            {tab.name}
                        </Link>
                    );
                })}
            </div>

            {/* 실제 탭 별 콘텐츠가 표시되는 영역 */}
            <div className="bg-white rounded-b-lg min-h-[500px]">
                {children}
            </div>
        </div>
    );
}