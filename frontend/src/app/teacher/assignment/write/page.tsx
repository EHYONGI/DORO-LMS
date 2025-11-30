// src/app/teacher/assignment/write/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function TeacherAssignmentWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get('course') ?? '1';
  const editingId = searchParams.get('assignmentId');

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [score, setScore] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // TODO: 나중에 실제 API 연동 (POST / PUT)
    alert(
      `${editingId ? '과제 수정' : '과제 등록'} (더미)\n\n` +
        `과목 ID: ${courseId}\n제목: ${title}\n마감: ${deadline}\n배점: ${score}\n` +
        `파일: ${file ? file.name : '없음'}\n내용 길이: ${content.length}자`
    );

    router.push(`/teacher/assignment?course=${courseId}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상단 탭 (강의관리 / 공지 확인 / 출결 확인) */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
        <button
          className="px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r bg-sky-600 text-white border-sky-600"
        >
          강의관리
        </button>
        <button
          className="px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r border-gray-300 bg-white text-gray-500"
          onClick={() => router.push('/teacher/dashboard?tab=notice')}
        >
          공지 확인
        </button>
        <button
          className="px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r border-gray-300 bg-white text-gray-500"
          onClick={() => router.push('/teacher/dashboard?tab=attendance')}
        >
          출결 확인
        </button>
      </div>

      {/* 메인 박스 */}
      <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-6 min-h-[520px]">
        <h2 className="text-base font-bold text-gray-800 mb-4">
          {editingId ? '과제 수정' : '과제 등록'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          {/* 제목 입력 + 업로드 버튼 */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              placeholder="제목 입력"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
            />
            <button
              type="submit"
              className="px-4 py-2 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
            >
              업로드
            </button>
          </div>

          {/* 마감일 / 배점 줄 */}
          <div className="border border-gray-200 text-xs text-gray-700">
            <div className="flex border-b border-gray-200">
              <div className="w-32 bg-gray-50 px-3 py-2 border-r border-gray-200">
                마감일자
              </div>
              <div className="flex-1 px-3 py-2">
                <input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-sky-600"
                />
              </div>
            </div>
            <div className="flex">
              <div className="w-32 bg-gray-50 px-3 py-2 border-r border-gray-200">
                배점
              </div>
              <div className="flex-1 px-3 py-2">
                <input
                  type="number"
                  min={0}
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-24 border border-gray-300 px-2 py-1 text-xs focus:outline-none focus:border-sky-600"
                />{' '}
                점
              </div>
            </div>
          </div>

          {/* 파일 첨부 박스 */}
          <div className="border border-gray-300 px-3 py-3 text-xs bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-gray-600">파일 첨부</span>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="px-3 py-1 border border-gray-300 bg-white rounded">
                  내 PC
                </span>
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    setFile(f);
                  }}
                />
              </label>
            </div>
            {file && (
              <p className="mt-2 text-gray-600">
                선택된 파일: <span className="font-medium">{file.name}</span>
              </p>
            )}
          </div>

          {/* 과제 내용 입력 박스 */}
          <div className="border border-gray-200">
            <textarea
              placeholder="과제 내용 입력"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-72 px-3 py-2 text-sm resize-none focus:outline-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
}
