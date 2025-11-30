// src/app/teacher/assignment/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function TeacherAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 선택된 과목 / 과제는 나중에 실제 데이터랑 연결하면 됨 (지금은 더미)
  const courseId = searchParams.get('course') ?? '1';

  const handleEdit = () => {
    router.push(`/teacher/assignment/write?course=${courseId}&assignmentId=1`);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상단 탭 (강의관리 / 공지 확인 / 출결 확인) - 디자인용 더미 탭 */}
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
        {/* 제목줄 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">과제 제목</h2>
          <button
            type="button"
            onClick={handleEdit}
            className="px-4 py-1.5 text-xs bg-gray-100 border border-gray-300 rounded hover:bg-gray-200"
          >
            수정하기
          </button>
        </div>

        {/* 마감일 / 제출방법 / 파일업로드 구역 */}
        <div className="border border-gray-200 text-xs text-gray-700 mb-6">
          <div className="flex border-b border-gray-200">
            <div className="w-32 bg-gray-50 px-3 py-2 border-r border-gray-200">
              마감일자
            </div>
            <div className="flex-1 px-3 py-2">
              20XX년 XX월 XX일 오후 11:59까지
            </div>
          </div>
          <div className="flex border-b border-gray-200">
            <div className="w-32 bg-gray-50 px-3 py-2 border-r border-gray-200">
              배점
            </div>
            <div className="flex-1 px-3 py-2">
              XX 점
            </div>
          </div>
          <div className="flex items-center">
            <div className="w-32 bg-gray-50 px-3 py-2 border-r border-gray-200">
              제출 방법
            </div>
            <div className="flex-1 px-3 py-2 flex items-center justify-between">
              <span>파일 업로드</span>
              <button
                type="button"
                className="px-3 py-1 text-xs border border-gray-300 bg-white rounded hover:bg-gray-50"
              >
                파일 보기
              </button>
            </div>
          </div>
        </div>

        {/* 과제 내용 박스 (넓은 흰 박스) */}
        <div className="border border-gray-200 bg-white h-[360px] flex items-center justify-center text-sm text-gray-400">
          과제 내용 설명
        </div>
      </div>
    </div>
  );
}
