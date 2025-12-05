// src/app/student/attendance/page.tsx
'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

type AttendanceStatus = '출석' | '지각' | '결석' | '기타' | '';

interface AttendanceRecord {
  id: number;
  date: string;
  course?: string;
  course_name?: string;
  status: AttendanceStatus | string;
  memo?: string;
}

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [filtered, setFiltered] = useState<AttendanceRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<AttendanceStatus | ''>('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 출결 데이터 불러오기
  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      setError('');

      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('access')
            : null;

        const res = await fetch(`${API_BASE_URL}/api/attendance`, {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!res.ok) {
          throw new Error('출결 정보를 불러오지 못했습니다.');
        }

        const data = await res.json();

        // 백엔드 응답을 배열로 가정, 필요하면 여기에서 가공
        const list: AttendanceRecord[] = Array.isArray(data) ? data : data.results ?? [];
        setRecords(list);
        setFiltered(list);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? '알 수 없는 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // 필터링 로직
  useEffect(() => {
    let next = [...records];

    if (statusFilter) {
      next = next.filter((r) => r.status === statusFilter);
    }

    if (keyword.trim()) {
      const kw = keyword.trim().toLowerCase();
      next = next.filter((r) => {
        const courseName = (r.course_name || r.course || '').toLowerCase();
        return courseName.includes(kw);
      });
    }

    setFiltered(next);
  }, [statusFilter, keyword, records]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">출결 현황</h1>

      {/* 필터 영역 */}
      <section className="rounded-lg bg-white p-4 shadow-sm flex flex-wrap gap-4 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">상태</span>
          <select
            className="rounded border px-2 py-1"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AttendanceStatus | '')}
          >
            <option value="">전체</option>
            <option value="출석">출석</option>
            <option value="지각">지각</option>
            <option value="결석">결석</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-500">과목 검색</span>
          <input
            className="w-52 rounded border px-2 py-1"
            placeholder="과목명으로 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </section>

      {/* 내용 영역 */}
      <section className="rounded-lg bg-white p-4 shadow-sm">
        {loading && (
          <p className="py-4 text-center text-sm text-gray-500">
            출결 정보를 불러오는 중입니다...
          </p>
        )}

        {error && !loading && (
          <p className="py-4 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && filtered.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            조회된 출결 기록이 없습니다.
          </p>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left">날짜</th>
                  <th className="px-2 py-2 text-left">과목명</th>
                  <th className="px-2 py-2 text-left">상태</th>
                  <th className="px-2 py-2 text-left">비고</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b last:border-0">
                    <td className="px-2 py-2">
                      {r.date}
                    </td>
                    <td className="px-2 py-2">
                      {r.course_name || r.course || '-'}
                    </td>
                    <td className="px-2 py-2">{r.status}</td>
                    <td className="px-2 py-2 text-xs text-gray-500">
                      {r.memo || ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
