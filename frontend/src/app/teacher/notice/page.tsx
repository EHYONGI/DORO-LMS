// src/app/teacher/notice/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type NoticeCategory = 'all' | 'study' | 'material' | 'event';

interface Notice {
  id: number;
  title: string;
  content: string;
  category: NoticeCategory;
  createdAt: string;
}

const dummyNotices: Notice[] = [
  {
    id: 1,
    title: '공지 1',
    content:
      '공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다...',
    category: 'all',
    createdAt: '0000년 00월 00일 오전 00:00',
  },
  {
    id: 2,
    title: '공지 2',
    content:
      '공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다...',
    category: 'study',
    createdAt: '0000년 00월 00일 오전 00:00',
  },
  {
    id: 3,
    title: '공지 3',
    content:
      '공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다...',
    category: 'material',
    createdAt: '0000년 00월 00일 오전 00:00',
  },
  {
    id: 4,
    title: '공지 4',
    content:
      '공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다 공지 본문 내용입니다...',
    category: 'event',
    createdAt: '0000년 00월 00일 오전 00:00',
  },
];

const categoryTabs: { key: NoticeCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'study', label: '수강/학습' },
  { key: 'material', label: '교재/자료실' },
  { key: 'event', label: '이벤트/안내' },
];

export default function TeacherNoticePage() {
  const [activeTab, setActiveTab] = useState<NoticeCategory>('all');
  const router = useRouter();

  const filtered =
    activeTab === 'all'
      ? dummyNotices
      : dummyNotices.filter((n) => n.category === activeTab);

  const handleEdit = (id: number) => {
    router.push(`/teacher/notice/write?noticeId=${id}`);
  };

  const handleCreate = () => {
    router.push('/teacher/notice/write');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* ▶ 상담 페이지 스타일 탭 (카테고리) */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
        {categoryTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
              ${
                activeTab === tab.key
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 공지 리스트 박스 */}
      <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[400px]">
        {/* 상단 제목 + 등록 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-[#3574b8]">공지사항</h1>
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-[#5B9BD5] text-white rounded shadow hover:bg-[#4a87c2]"
          >
            공지 등록
          </button>
        </div>

        {/* 공지 리스트 */}
        <div className="border-t border-gray-200 mt-2">
          {filtered.map((notice) => (
            <div
              key={notice.id}
              className="flex items-start justify-between py-4 border-b border-gray-200"
            >
              <div className="pr-4">
                <h2 className="text-base font-semibold mb-1">
                  {notice.title}
                </h2>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {notice.content}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 text-right min-w-[140px]">
                <button
                  type="button"
                  onClick={() => handleEdit(notice.id)}
                  className="text-xs text-[#3574b8] border border-[#3574b8] px-3 py-1 rounded hover:bg-[#3574b8] hover:text-white"
                >
                  수정하기
                </button>
                <span className="text-[11px] text-gray-400">
                  {notice.createdAt}
                </span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="py-10 text-center text-sm text-gray-500">
              해당 분류에 공지가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
