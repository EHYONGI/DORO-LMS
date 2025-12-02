// src/app/teacher/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TopTab = 'manage' | 'notice' | 'community' | 'attendance';

interface Course {
  id: number;
  name: string;
  teacher: string;
  code: string;
}

interface NoticeRow {
  id: number;
  week: number;
  title: string;
  writer: string;
  date: string;
}

interface CommunityRow {
  id: number;
  title: string;
  writer: string;
  date: string;
}

interface AttendanceRow {
  week: number;
  title: string;
  dateRange: string;
  status: 'yet' | 'open' | 'closed';
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

const dummyNoticeRows: NoticeRow[] = [
  {
    id: 1,
    week: 1,
    title: '[1차] 시작 안내 및 OT 공지',
    writer: '관리자',
    date: '2023.03.01',
  },
  {
    id: 2,
    week: 2,
    title: '[과제] 1주차 과제 공지 안내',
    writer: '관리자',
    date: '2023.03.08',
  },
  {
    id: 3,
    week: 3,
    title: '[공지] 교육 일정 변경 안내',
    writer: '관리자',
    date: '2023.03.15',
  },
];

const dummyCommunityRows: CommunityRow[] = [
  { id: 1, title: '커뮤니티 제목 1', writer: '익명', date: '2023.03.10' },
  { id: 2, title: '커뮤니티 제목 2', writer: '익명', date: '2023.03.12' },
  { id: 3, title: '커뮤니티 제목 3', writer: '익명', date: '2023.03.20' },
];

const dummyAttendanceRows: AttendanceRow[] = [
  { week: 1, title: '1주차 출석', dateRange: '2023.03.01 ~ 2023.03.07', status: 'closed' },
  { week: 2, title: '2주차 출석', dateRange: '2023.03.08 ~ 2023.03.14', status: 'open' },
  { week: 3, title: '3주차 출석', dateRange: '2023.03.15 ~ 2023.03.21', status: 'yet' },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 🔐 강사 가드용 상태
  const [authChecked, setAuthChecked] = useState(false);
  const [authorized, setAuthorized] = useState(false);

  // 탭 상태 (URL ?tab=... 과 연동)
  const tabParam = searchParams.get('tab') as TopTab | null;
  const [topTab, setTopTab] = useState<TopTab>(tabParam || 'manage');

  // 선택된 과목
  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);

  // 🔐 강사 전용 가드
  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');

      if (!userStr) {
        router.replace('/login');
        setAuthChecked(true);
        setAuthorized(false);
        return;
      }

      const user = JSON.parse(userStr);
      const r = user.role as number | string | null | undefined;

      const isTeacher =
        r === 2 ||
        r === '2' ||
        r === 'TEACHER' ||
        r === 'teacher' ||
        r === 'INSTRUCTOR';

      if (!isTeacher) {
        router.replace('/student/dashboard');
        setAuthChecked(true);
        setAuthorized(false);
        return;
      }

      setAuthorized(true);
      setAuthChecked(true);
    } catch (e) {
      localStorage.clear();
      router.replace('/login');
      setAuthChecked(true);
      setAuthorized(false);
    }
  }, [router]);

  // 탭 URL 동기화
  useEffect(() => {
    if (tabParam && tabParam !== topTab) {
      setTopTab(tabParam);
    }
  }, [tabParam, topTab]);

  const selectedCourse =
    dummyCourses.find((c) => c.id === selectedCourseId) ?? dummyCourses[0];

  const handleChangeTab = (tab: TopTab) => {
    setTopTab(tab);
    router.push(`/teacher/dashboard?tab=${tab}`);
  };

  const getAttendanceStatusText = (status: AttendanceRow['status']) => {
    if (status === 'yet') return '출결 미진행';
    if (status === 'open') return '출결 진행 중';
    return '출결 완료';
  };

  const getAttendanceStatusClass = (status: AttendanceRow['status']) => {
    if (status === 'yet') return 'bg-gray-100 text-gray-500';
    if (status === 'open') return 'bg-green-100 text-green-700';
    return 'bg-blue-100 text-blue-700';
  };

  // 여기부터는 훅 다 실행된 이후에 조건부 렌더링이라 안전함
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-500">대시보드를 불러오는 중입니다...</p>
      </div>
    );
  }

  if (!authorized) {
    // 이미 router.replace 로 리다이렉트 중
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

        {/* 상단 탭 */}
        <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
          <button
            onClick={() => handleChangeTab('manage')}
            className={`px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r transition
            ${topTab === 'manage'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            강의관리
          </button>

          <button
            onClick={() => handleChangeTab('notice')}
            className={`px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r transition
            ${topTab === 'notice'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            공지 확인
          </button>

          <button
            onClick={() => handleChangeTab('community')}
            className={`px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r transition
            ${topTab === 'community'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            학생 커뮤니티
          </button>

          <button
            onClick={() => handleChangeTab('attendance')}
            className={`px-6 py-2 rounded-t-lg font-bold text-sm border-t border-l border-r transition
            ${topTab === 'attendance'
              ? 'bg-sky-600 text-white border-sky-600'
              : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
            }`}
          >
            출결 확인
          </button>
        </div>

        {/* 메인 컨테이너 */}
        <div className="bg-white rounded-b-lg border border-gray-200 shadow-sm min-h-[520px] flex">

          {/* 사이드바 */}
          <aside className="w-52 border-r border-gray-200 p-5 text-sm">
            <h2 className="text-lg font-bold mb-4">대시보드</h2>

            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-1">과목 선택</p>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-sky-500"
              >
                {dummyCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <p className="text-xs text-gray-500 mb-1 mt-6">메뉴</p>
            <ul className="space-y-1 text-sm">
              <li>
                <button className="pl-2 hover:underline" onClick={() => handleChangeTab('manage')}>
                  • 강의 관리
                </button>
              </li>
              <li>
                <button className="pl-2 hover:underline" onClick={() => handleChangeTab('notice')}>
                  • 공지사항
                </button>
              </li>
              <li>
                <button className="pl-2 hover:underline" onClick={() => handleChangeTab('community')}>
                  • 학생 커뮤니티
                </button>
              </li>
              <li>
                <button
                  className="pl-2 hover:underline"
                  onClick={() => router.push(`/teacher/assignment?course=${selectedCourseId}`)}
                >
                  • 과제
                </button>
              </li>
              <li>
                <button className="pl-2 hover:underline" onClick={() => handleChangeTab('attendance')}>
                  • 출결 현황
                </button>
              </li>
            </ul>
          </aside>

          {/* 우측 메인 */}
          <main className="flex-1 p-6">

            {/* ▷ 강의관리 */}
            {topTab === 'manage' && (
              <div className="h-full flex gap-6">

                <div className="w-1/2 border-r border-gray-200 pr-4">
                  <h3 className="text-base font-bold mb-3">내 강좌</h3>

                  <div className="space-y-3">
                    {dummyCourses.map((course) => (
                      <button
                        key={course.id}
                        onClick={() => setSelectedCourseId(course.id)}
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

                <div className="w-1/2 pl-2">
                  <h3 className="text-base font-bold mb-3">중요 공지</h3>
                  <div className="border rounded-lg p-4 bg-gray-50 text-sm whitespace-pre-line">
                    {dummyImportantNotice}
                  </div>
                  <div className="mt-2 text-right text-xs text-gray-400">더보기 &gt;</div>
                </div>
              </div>
            )}

            {/* ▷ 공지 확인 */}
            {topTab === 'notice' && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold mb-1">과목별 공지</h3>
                    <p className="text-xs text-gray-500">선택한 과목 : {selectedCourse.name}</p>
                  </div>
                  <button
                    onClick={() => router.push('/teacher/notice/write')}
                    className="px-3 py-1 text-xs border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    공지 작성
                  </button>
                </div>

                <div className="border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600">
                        <th className="py-2 px-4 w-16 text-center">번호</th>
                        <th className="py-2 px-4">제목</th>
                        <th className="py-2 px-4 w-24 text-center">작성자</th>
                        <th className="py-2 px-4 w-28 text-center">작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyNoticeRows.map((row) => (
                        <tr key={row.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 text-center">{row.id}</td>
                          <td className="py-2 px-4">{row.title}</td>
                          <td className="py-2 px-4 text-center">{row.writer}</td>
                          <td className="py-2 px-4 text-center">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="py-4 text-center text-xs text-gray-400">1 / 1</div>
                </div>
              </div>
            )}

            {/* ▷ 학생 커뮤니티 */}
            {topTab === 'community' && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold mb-1">학생 커뮤니티</h3>
                    <p className="text-xs text-gray-500">선택한 과목 : {selectedCourse.name}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/teacher/community/write?course=${selectedCourseId}`)}
                    className="px-3 py-1 text-xs border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    글 작성
                  </button>
                </div>

                <div className="border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600">
                        <th className="py-2 px-4 w-16 text-center">번호</th>
                        <th className="py-2 px-4">제목</th>
                        <th className="py-2 px-4 w-24 text-center">작성자</th>
                        <th className="py-2 px-4 w-28 text-center">작성일</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyCommunityRows.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() =>
                            router.push(`/teacher/community/detail/${row.id}?course=${selectedCourseId}`)
                          }
                        >
                          <td className="py-2 px-4 text-center">{row.id}</td>
                          <td className="py-2 px-4">{row.title}</td>
                          <td className="py-2 px-4 text-center">{row.writer}</td>
                          <td className="py-2 px-4 text-center">{row.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="py-4 text-center text-xs text-gray-400">1 / 1</div>
                </div>
              </div>
            )}

            {/* ▷ 출결 확인 */}
            {topTab === 'attendance' && (
              <div className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold mb-1">출결 현황</h3>
                    <p className="text-xs text-gray-500">선택한 과목 : {selectedCourse.name}</p>
                  </div>
                  <button
                    onClick={() => router.push(`/teacher/attendance?course=${selectedCourseId}`)}
                    className="px-3 py-1 text-xs border rounded bg-gray-50 hover:bg-gray-100"
                  >
                    출결 관리 바로가기
                  </button>
                </div>

                <div className="border-t">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b">
                      <tr className="text-gray-600">
                        <th className="py-2 px-4 w-16 text-center">주차</th>
                        <th className="py-2 px-4">제목</th>
                        <th className="py-2 px-4 w-40 text-center">출결 기간</th>
                        <th className="py-2 px-4 w-28 text-center">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dummyAttendanceRows.map((row) => (
                        <tr key={row.week} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-4 text-center">{row.week}주차</td>
                          <td className="py-2 px-4">{row.title}</td>
                          <td className="py-2 px-4 text-center">{row.dateRange}</td>
                          <td className="py-2 px-4 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getAttendanceStatusClass(
                                row.status,
                              )}`}
                            >
                              {getAttendanceStatusText(row.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="py-4 text-center text-xs text-gray-400">1 / 1</div>
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
