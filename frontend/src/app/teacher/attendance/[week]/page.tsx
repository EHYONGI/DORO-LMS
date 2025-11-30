// src/app/teacher/attendance/[week]/page.tsx
'use client';

import { useMemo, useState } from 'react';

interface StudentRow {
  id: number;
  name: string;
  studentId: string;
  phone: string;
  status: 'present' | 'late' | 'absent' | 'none';
}

const dummyStudents: StudentRow[] = [
  { id: 1, name: '홍길동', studentId: 'xxxxxxx123', phone: '010-1111-2222', status: 'present' },
  { id: 2, name: '김학생', studentId: 'xxxxxxx456', phone: '010-3333-4444', status: 'late' },
  { id: 3, name: '이수강', studentId: 'xxxxxxx789', phone: '010-5555-6666', status: 'absent' },
  { id: 4, name: '박로봇', studentId: 'xxxxxxx012', phone: '010-7777-8888', status: 'none' },
];

function getStatusLabel(status: StudentRow['status']) {
  if (status === 'present') return '출석';
  if (status === 'late') return '지각';
  if (status === 'absent') return '결석';
  return '-';
}

export default function AttendanceDetailPage({
  params,
}: {
  params: { week: string };
}) {
  const weekNumber = params.week;
  const [rows, setRows] = useState<StudentRow[]>(dummyStudents);

  const summary = useMemo(() => {
    const present = rows.filter((r) => r.status === 'present').length;
    const late = rows.filter((r) => r.status === 'late').length;
    const absent = rows.filter((r) => r.status === 'absent').length;
    const total = rows.length;
    return { present, late, absent, total };
  }, [rows]);

  const updateStatus = (id: number, status: StudentRow['status']) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row)),
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상단 제목 + 요약 */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-xl font-bold mb-1">
            {weekNumber}주차 출결 현황
          </h1>
          <p className="text-xs text-gray-500">
            강의명 : 20XX.X분기 AI 로봇 교육 • 시간 : 10:00 ~ 14:00
          </p>
        </div>
        <div className="text-xs text-gray-600 space-x-3">
          <span>
            출석 <strong className="text-green-600">{summary.present}</strong>명
          </span>
          <span>
            지각 <strong className="text-yellow-600">{summary.late}</strong>명
          </span>
          <span>
            결석 <strong className="text-red-600">{summary.absent}</strong>명
          </span>
          <span>
            전체 <strong>{summary.total}</strong>명
          </span>
        </div>
      </div>

      {/* 메인 박스 */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="border-b border-gray-200 px-4 py-2 text-xs text-gray-500 flex justify-between">
          <span>※ 출결 상태를 클릭하여 변경할 수 있습니다.</span>
          <span>주차 : {weekNumber}주차</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-600">
                <th className="py-2 px-4 w-16 text-center">번호</th>
                <th className="py-2 px-4 w-32 text-center">이름</th>
                <th className="py-2 px-4 w-40 text-center">아이디</th>
                <th className="py-2 px-4 w-40 text-center">연락처</th>
                <th className="py-2 px-4 w-32 text-center">출결상태</th>
                <th className="py-2 px-4 w-64 text-center">출결 처리</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr
                  key={row.id}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-2 px-4 text-center">{idx + 1}</td>
                  <td className="py-2 px-4 text-center">{row.name}</td>
                  <td className="py-2 px-4 text-center">{row.studentId}</td>
                  <td className="py-2 px-4 text-center">{row.phone}</td>
                  <td className="py-2 px-4 text-center">
                    {getStatusLabel(row.status)}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="inline-flex gap-1">
                      <button
                        type="button"
                        onClick={() => updateStatus(row.id, 'present')}
                        className={`px-2 py-1 text-xs rounded border ${
                          row.status === 'present'
                            ? 'bg-green-500 text-white border-green-500'
                            : 'border-gray-300 text-gray-700 hover:bg-green-50'
                        }`}
                      >
                        출석
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(row.id, 'late')}
                        className={`px-2 py-1 text-xs rounded border ${
                          row.status === 'late'
                            ? 'bg-yellow-400 text-white border-yellow-400'
                            : 'border-gray-300 text-gray-700 hover:bg-yellow-50'
                        }`}
                      >
                        지각
                      </button>
                      <button
                        type="button"
                        onClick={() => updateStatus(row.id, 'absent')}
                        className={`px-2 py-1 text-xs rounded border ${
                          row.status === 'absent'
                            ? 'bg-red-500 text-white border-red-500'
                            : 'border-gray-300 text-gray-700 hover:bg-red-50'
                        }`}
                      >
                        결석
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
