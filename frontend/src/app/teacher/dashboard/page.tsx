// src/app/teacher/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type TopTab = 'manage' | 'notice' | 'attendance';

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

interface AttendanceRow {
  week: number;
  title: string;
  dateRange: string;
  status: 'yet' | 'open' | 'closed';
}

const dummyCourses: Course[] = [
  { id: 1, name: '과목 A', teacher: '강사 A', code: 'A-01' },
  { id: 2, name: '과목 B', teacher: '강사 B', code: 'B-01' },
  { id: 3, name: '과목 C', teacher: '강사 C', code: 'C-01' },
  { id: 4, name: '과목 D', teacher: '강사 D', code: 'D-01' },
];

const dummyImportantNotice =
  '[중요 공지] 18차 정규과정 일정 안내\n' +
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

const dummyAttendanceRows: AttendanceRow[] = [
  {
    week: 1,
    title: '1주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
    status: 'closed',
  },
  {
    week: 2,
    title: '2주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
    status: 'open',
  },
  {
    week: 3,
    title: '3주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
    status: 'yet',
  },
];

export default function TeacherDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL의 ?tab= 값에서 초기 탭 읽기
  const tabParam = searchParams.get('tab') as TopTab | null;
  const [topTab, setTopTab] = useState<TopTab>(tabParam || 'manage');

  useEffect(() => {
    // 주소창에서 tab이 바뀔 때 state도 동기화
    if (tabParam && tabParam !== topTab) {
      setTopTab(tabParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  const [selectedCourseId, setSelectedCourseId] = useState<number>(1);

  const selectedCourse =
    dummyCourses.find((c) => c.id === selectedCourseId) ?? dummyCourses[0];

  // 탭 클릭 시: state + URL 같이 변경
  const handleChangeTab = (tab: TopTab) => {
    setTopTab(tab);
    router.push(`/teacher/dashboard?tab=${tab}`);
  };

  // 출결 상태 버튼 텍스트
  const getAttendanceStatusText = (status: AttendanceRow['status']) => {
    if (status === 'yet') return '출결 미진행';
    if (status === 'open') return '출결 진행 중';
    return '출결 완료';
  };

  const getAttendanceStatusColor = (status: AttendanceRow['status']) => {
    if (status === 'yet') return 'text-gray-500';
    if (status === 'open') return 'text-blue-600';
    return 'text-green-600';
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상단 탭 (강의관리 / 공지 확인 / 출결 확인) */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
        <button
          onClick={() => handleChangeTab('manage')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              topTab === 'manage'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          강의관리
        </button>
        <button
          onClick={() => handleChangeTab('notice')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              topTab === 'notice'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          공지 확인
        </button>
        <button
          onClick={() => handleChangeTab('attendance')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              topTab === 'attendance'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          출결 확인
        </button>
      </div>

      {/* 공통 박스 */}
      <div className="bg-white rounded-b-lg border border-gray-200 shadow-sm min-h-[520px] flex">
        {/* 왼쪽 사이드바 */}
        <aside className="w-52 border-r border-gray-200 p-5 text-sm">
          <h2 className="text-lg font-bold mb-4">대시보드</h2>

          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">과목 선택</p>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(Number(e.target.value))}
              className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:border-sky-500 outline-none"
            >
              {dummyCourses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6">
            <p className="text-xs text-gray-500 mb-1">메뉴</p>
            <ul className="space-y-1 text-sm">
              <li>
                <button
                  type="button"
                  className="pl-2 hover:underline"
                  onClick={() =>
                    router.push(
                      `/teacher/assignment?course=${selectedCourseId}`,
                    )
                  }
                >
                  • 과제
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className="pl-2 hover:underline"
                  onClick={() => handleChangeTab('attendance')}
                >
                  • 출결 현황
                </button>
              </li>
            </ul>
          </div>
        </aside>

        {/* 오른쪽 메인 영역 */}
        <main className="flex-1 p-6">
          {/* ▶ 강의관리 (대시보드 메인) */}
          {topTab === 'manage' && (
            <div className="h-full flex gap-6">
              {/* 과목 카드 리스트 */}
              <div className="w-1/2 border-r border-gray-200 pr-4">
                <h3 className="text-base font-bold mb-3">내 강좌</h3>
                <div className="space-y-3">
                  {dummyCourses.map((course) => (
                    <button
                      key={course.id}
                      onClick={() => setSelectedCourseId(course.id)}
                      className={`w-full flex items-center justify-between border rounded-lg px-4 py-3 text-left shadow-sm
                        ${
                          selectedCourseId === course.id
                            ? 'border-sky-500 bg-sky-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200" />
                        <div>
                          <p className="font-semibold text-sm">
                            {course.name}
                          </p>
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

              {/* 중요 공지 */}
              <div className="w-1/2 pl-2">
                <h3 className="text-base font-bold mb-3">중요 공지</h3>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 text-sm leading-relaxed whitespace-pre-line">
                  {dummyImportantNotice}
                </div>
                <div className="mt-2 text-right text-xs text-gray-400">
                  더보기 &gt;
                </div>
              </div>
            </div>
          )}

          {/* ▶ 공지 확인 */}
          {topTab === 'notice' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1">과목별 공지</h3>
                  <p className="text-xs text-gray-500">
                    선택한 과목 : {selectedCourse.name}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/teacher/notice/write')}
                  className="px-3 py-1 text-xs border border-gray-300 rounded bg-gray-50 hover:bg-gray-100"
                >
                  공지 작성
                </button>
              </div>

              <div className="border-t border-gray-200">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-gray-600">
                      <th className="py-2 px-4 w-16 text-center">번호</th>
                      <th className="py-2 px-4">제목</th>
                      <th className="py-2 px-4 w-24 text-center">작성자</th>
                      <th className="py-2 px-4 w-28 text-center">작성일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyNoticeRows.map((row) => (
                      <tr
                        key={row.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-4 text-center">{row.id}</td>
                        <td className="py-2 px-4">
                          <span className="text-gray-800">{row.title}</span>
                        </td>
                        <td className="py-2 px-4 text-center">
                          {row.writer}
                        </td>
                        <td className="py-2 px-4 text-center">{row.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="py-4 text-center text-xs text-gray-400">
                  1 / 1
                </div>
              </div>
            </div>
          )}

          {/* ▶ 출결 확인 */}
          {topTab === 'attendance' && (
            <div className="h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-base font-bold mb-1">출결 현황</h3>
                  <p className="text-xs text-gray-500">
                    과목 : {selectedCourse.name}
                  </p>
                </div>
                <p className="text-xs text-gray-500">
                  출결 현황 : <span className="font-semibold">0명 / 0명</span>
                </p>
              </div>

              <div className="border-t border-gray-200">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr className="text-gray-600">
                      <th className="py-2 px-4 w-16 text-center">주차</th>
                      <th className="py-2 px-4">강의명</th>
                      <th className="py-2 px-4 w-48 text-center">출결 기간</th>
                      <th className="py-2 px-4 w-32 text-center">출결 상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dummyAttendanceRows.map((row) => (
                      <tr
                        key={row.week}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-2 px-4 text-center">
                          {row.week}주차
                        </td>
                        <td className="py-2 px-4">{row.title}</td>
                        <td className="py-2 px-4 text-center">
                          {row.dateRange}
                        </td>
                        <td className="py-2 px-4 text-center">
                          <button
                            className={`text-xs underline ${getAttendanceStatusColor(
                              row.status,
                            )}`}
                            onClick={() =>
                              router.push(
                                `/teacher/attendance/${row.week}?course=${selectedCourseId}`,
                              )
                            }
                          >
                            {getAttendanceStatusText(row.status)}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
