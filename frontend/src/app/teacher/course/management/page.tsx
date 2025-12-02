// src/app/teacher/course-management/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Course {
  id: number;
  name: string;
  teacher: string;
  code: string;
}

const dummyCourses: Course[] = [
  { id: 1, name: '웹 프로그래밍 A반', teacher: '홍길동', code: 'WEB101-01' },
  { id: 2, name: '파이썬 프로그래밍', teacher: '이몽룡', code: 'PYT201-02' },
  { id: 3, name: '데이터 구조', teacher: '성춘향', code: 'CS301-01' },
];

const dummyImportantNotice =
  '[필독] 1주차 수업 안내\n' +
  '- 강의계획서를 반드시 확인해주세요.\n' +
  '- 수업 일정 및 교재 변경 사항을 확인하시기 바랍니다.\n' +
  '- 자세한 내용은 공지사항 게시판을 참고해주세요.';

export default function TeacherCourseManagementPage() {
  const router = useRouter();

  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);

  const selectedCourse =
    dummyCourses.find((c) => c.id === selectedCourseId) ?? dummyCourses[0];

  const goToCourseDetail = (id: number) => {
    // 원하는 경로로 이동 가능
    router.push(`/teacher/course-management/${id}`);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* 페이지 타이틀 */}
        <h1 className="text-2xl font-bold mb-6 text-gray-900">강의 관리</h1>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm min-h-[520px] flex">

          {/* 왼쪽: 강의 리스트 */}
          <div className="w-1/2 border-r border-gray-200 p-6">
            <h3 className="text-base font-bold mb-4">내 강좌</h3>

            <div className="space-y-3">
              {dummyCourses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => goToCourseDetail(course.id)}
                  className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 shadow-sm
                  ${selectedCourseId === course.id
                    ? 'border-sky-500 bg-sky-50'
                    : 'border-gray-200 bg-white hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-semibold text-sm">{course.name}</p>
                      <p className="text-xs text-gray-500">
                        {course.teacher} • {course.code}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">···</span>
                </button>
              ))}
            </div>
          </div>

          {/* 오른쪽: 중요 공지 */}
          <div className="w-1/2 p-6">
            <h3 className="text-base font-bold mb-3">중요 공지</h3>
            <div className="border rounded-lg p-4 bg-gray-50 text-sm whitespace-pre-line">
              {dummyImportantNotice}
            </div>
            <div className="mt-2 text-right text-xs text-gray-400 cursor-pointer hover:underline">
              더보기 &gt;
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
