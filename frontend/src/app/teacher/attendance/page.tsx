// src/app/teacher/attendance/page.tsx
'use client';

import Link from 'next/link';

interface WeekInfo {
  week: number;
  title: string;
  dateRange: string;
}

const dummyWeeks: WeekInfo[] = [
  {
    week: 1,
    title: '1주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
  },
  {
    week: 2,
    title: '2주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
  },
  {
    week: 3,
    title: '3주차 : 202X.XX.XX(월) 10:00 ~ 14:00',
    dateRange: '202X.XX.XX ~ 202X.XX.XX',
  },
];

export default function AttendanceWeekListPage() {
  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <h1 className="text-xl font-bold mb-4">출결 현황</h1>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-gray-600">
              <th className="py-2 px-4 w-16 text-center">주차</th>
              <th className="py-2 px-4">강의명</th>
              <th className="py-2 px-4 w-48 text-center">출결 기간</th>
              <th className="py-2 px-4 w-32 text-center">상세보기</th>
            </tr>
          </thead>
          <tbody>
            {dummyWeeks.map((w) => (
              <tr
                key={w.week}
                className="border-b border-gray-100 hover:bg-gray-50"
              >
                <td className="py-2 px-4 text-center">{w.week}주차</td>
                <td className="py-2 px-4">{w.title}</td>
                <td className="py-2 px-4 text-center">{w.dateRange}</td>
                <td className="py-2 px-4 text-center">
                  <Link
                    href={`/teacher/attendance/${w.week}`}
                    className="text-xs underline text-sky-600 hover:text-sky-700"
                  >
                    출결 상세
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="py-4 text-center text-xs text-gray-400">1 / 1</div>
      </div>
    </div>
  );
}
