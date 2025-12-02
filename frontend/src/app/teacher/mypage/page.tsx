// src/app/teacher/mypage/page.tsx
'use client';

import { useEffect, useState } from 'react';

type TopTab = 'profile' | 'manage';

const dummyImportantNotice =
  '[필독] 1주차 수업 안내\n' +
  '- 강의계획서를 반드시 확인해주세요.\n' +
  '- 수업 일정 및 교재 변경 사항을 확인하시기 바랍니다.\n' +
  '- 자세한 내용은 공지사항 게시판을 참고해주세요.';

interface UserInfo {
  username: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

interface Course {
  id: number;
  name: string;
  code: string;
  teacher: string;
}

const dummyCourses: Course[] = [
  { id: 1, name: '웹 프로그래밍 A반', code: 'WEB101', teacher: '홍길동' },
  { id: 2, name: '파이썬 프로그래밍', code: 'PYT201', teacher: '이몽룡' },
  { id: 3, name: '데이터 구조', code: 'CS301', teacher: '성춘향' },
];

export default function TeacherMyPage() {
  const [topTab, setTopTab] = useState<TopTab>('profile');
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    const u = localStorage.getItem('user');
    if (!u) return;
    try {
      setUser(JSON.parse(u));
    } catch {
      // ignore
    }
  }, []);

  const fullName =
    (user?.last_name || '') + (user?.first_name || '') || user?.username || '';

  const selectedCourse =
    dummyCourses.find((c) => c.id === selectedCourseId) ?? dummyCourses[0];

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 px-6 py-8">
      {/* 중앙 흰색 카드 (수강신청 / 대시보드와 톤 맞춤) */}
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 제목 + 설명 */}
        <div className="px-8 pt-6 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-sky-800">마이페이지</h1>
          <p className="text-sm text-gray-500 mt-1">
            강사 정보를 확인하고 프로필 및 수업 정보를 관리할 수 있습니다.
          </p>
        </div>

        {/* 상단 탭 (수강신청 / 상담 / 대시보드와 동일 스타일) */}
        <div className="px-8 pt-4 border-b border-gray-200">
          <div className="flex gap-2 mb-1">
            <button
              onClick={() => setTopTab('profile')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg border-t border-l border-r
              ${
                topTab === 'profile'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              프로필 관리
            </button>

            <button
              onClick={() => setTopTab('manage')}
              className={`px-6 py-2 text-sm font-bold rounded-t-lg border-t border-l border-r
              ${
                topTab === 'manage'
                  ? 'bg-sky-600 text-white border-sky-600'
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
              }`}
            >
              강의 관리
            </button>
          </div>
        </div>

        {/* 탭 내용 */}
        <div className="px-8 py-6">
          {/* ▶ 프로필 관리 */}
          {topTab === 'profile' && (
            <div className="grid grid-cols-3 gap-8">
              {/* 왼쪽 프로필 박스 */}
              <div className="col-span-1 border rounded-lg p-6 text-center bg-gray-50">
                <div className="w-24 h-24 rounded-full bg-gray-300 mx-auto mb-4" />
                <p className="font-semibold text-gray-800">
                  {fullName || '-'}
                </p>
                <p className="text-sm text-gray-500">전공분야</p>

                <button className="mt-4 w-full bg-sky-600 text-white text-sm py-2 rounded-lg hover:bg-sky-700">
                  프로필 수정
                </button>

                <div className="text-left text-sm mt-6 space-y-3">
                  <div>
                    <p className="font-medium text-gray-600">강의 수</p>
                    <input
                      value={`${dummyCourses.length} 개`}
                      className="w-full mt-1 p-2 border rounded bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">상태</p>
                    <input
                      value="활동 중"
                      className="w-full mt-1 p-2 border rounded bg-gray-100"
                      readOnly
                    />
                  </div>
                  <div>
                    <p className="font-medium text-gray-600">메모</p>
                    <textarea
                      placeholder="자기소개 / 한 줄 메모"
                      className="w-full mt-1 p-2 border rounded h-20"
                    />
                  </div>
                </div>
              </div>

              {/* 오른쪽 정보 테이블 */}
              <div className="col-span-2">
                <h2 className="text-lg font-bold mb-4">내 정보</h2>

                <table className="w-full text-sm border-t border-gray-200">
                  <tbody>
                    <tr className="border-b">
                      <th className="w-32 bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                        이름
                      </th>
                      <td className="px-4 py-3">{fullName || '-'}</td>
                    </tr>
                    <tr className="border-b">
                      <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                        이메일
                      </th>
                      <td className="px-4 py-3">{user?.email || '-'}</td>
                    </tr>
                    <tr className="border-b">
                      <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                        전화번호
                      </th>
                      <td className="px-4 py-3">{user?.phone || '-'}</td>
                    </tr>
                    <tr>
                      <th className="bg-gray-50 px-4 py-3 text-left font-medium text-gray-600">
                        담당업무
                      </th>
                      <td className="px-4 py-3">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ▶ 강의 관리 */}
          {topTab === 'manage' && (
            <div className="grid grid-cols-2 gap-8">
              {/* 왼쪽: 내 강좌 리스트 */}
              <div>
                <h2 className="text-lg font-bold mb-4">내 강좌</h2>

                <div className="space-y-3">
                  {dummyCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 shadow-sm
                        ${
                          selectedCourseId === course.id
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
              <div>
                <h2 className="text-lg font-bold mb-4">중요 공지</h2>

                <div className="border rounded-lg p-4 bg-gray-50 text-sm whitespace-pre-line">
                  {dummyImportantNotice}
                </div>

                <p className="mt-2 text-right text-xs text-gray-400 cursor-pointer hover:underline">
                  더보기 &gt;
                </p>

                {/* 선택된 과목 정보 한 줄 정도 붙여줘도 UX 좋음 */}
                <div className="mt-6 text-sm text-gray-600">
                  <p className="font-semibold mb-1">선택한 과목</p>
                  <div className="border rounded-lg px-3 py-2 bg-white">
                    <p className="font-medium text-sm">{selectedCourse.name}</p>
                    <p className="text-xs text-gray-500">
                      {selectedCourse.teacher} • {selectedCourse.code}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
