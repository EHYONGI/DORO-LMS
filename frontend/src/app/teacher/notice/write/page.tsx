// src/app/teacher/notice/write/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type NoticeCategory = 'all' | 'study' | 'material' | 'event';

const categoryTabs: { key: NoticeCategory; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'study', label: '수강/학습' },
  { key: 'material', label: '교재/자료실' },
  { key: 'event', label: '이벤트/안내' },
];

export default function TeacherNoticeWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('noticeId');

  const [activeTab, setActiveTab] = useState<NoticeCategory>('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: 나중에 실제 API 연동 (POST/PUT)으로 교체
    alert(
      `${editingId ? '공지 수정' : '공지 등록'} 완료 (더미)\n\n` +
        `분류: ${activeTab}\n제목: ${title}\n파일: ${
          file ? file.name : '없음'
        }\n내용 길이: ${content.length}자`
    );

    router.push('/teacher/notice');
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상담 페이지 스타일의 카테고리 탭 */}
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

      {/* 아래 흰 박스 (상담 신청 폼이랑 느낌 맞춤) */}
      <div className="bg-white rounded-b-lg border border-gray-200 p-8 shadow-sm min-h-[400px]">
        {/* 제목 */}
        <h1 className="text-xl font-bold text-[#3574b8] mb-6">
          공지 {editingId ? '수정' : '등록'}
        </h1>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
          {/* 제목 입력 + 업로드 버튼 */}
          <div className="grid grid-cols-4 items-center gap-3 border-b border-gray-100 pb-4">
            <label className="font-bold text-gray-700 col-span-1">
              <span className="text-red-500 mr-1">*</span>제목
            </label>
            <div className="col-span-3 flex gap-2">
              <input
                type="text"
                placeholder="공지 제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 border border-gray-300 px-3 py-2 text-sm rounded focus:outline-none focus:border-sky-500"
                required
              />
              <button
                type="submit"
                className="px-4 py-2 text-sm bg-[#e0e0e0] border border-gray-300 rounded hover:bg-[#d5d5d5]"
              >
                업로드
              </button>
            </div>
          </div>

          {/* 파일 첨부 */}
          <div className="grid grid-cols-4 items-center gap-3 border-b border-gray-100 pb-4">
            <label className="font-bold text-gray-700 col-span-1">
              첨부 파일
            </label>
            <div className="col-span-3">
              <div className="border border-gray-300 px-3 py-3 text-sm bg-[#fafafa] rounded">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-gray-500">파일 불러오기</span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      setFile(f);
                    }}
                  />
                  <span className="px-3 py-1 border border-gray-300 text-xs bg-white rounded">
                    내 PC
                  </span>
                </label>
                {file && (
                  <p className="mt-2 text-xs text-gray-600">
                    선택된 파일: {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* 공지 내용 입력 */}
          <div className="grid grid-cols-4 items-start gap-3">
            <label className="font-bold text-gray-700 col-span-1 pt-2">
              <span className="text-red-500 mr-1">*</span>공지 내용
            </label>
            <div className="col-span-3">
              <textarea
                placeholder="공지 내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-64 border border-gray-300 px-3 py-2 text-sm rounded resize-none focus:outline-none focus:border-sky-500"
                required
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
