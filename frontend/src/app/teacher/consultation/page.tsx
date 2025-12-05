// app/teacher/consultation/page.tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// 상담 요청(강사용) 타입
interface ConsultationRequest {
  id: number;
  student_name: string;
  consultation_type: 'CAREER' | 'CODING' | 'OTHER' | string;
  method: 'OFFLINE' | 'ONLINE' | string;
  topic: string;
  content: string;
  requested_at: string;    // 신청 날짜
  scheduled_at: string | null; // 승인된 상담 일시
  status: 'PENDING' | 'APPROVED' | 'COMPLETED' | 'CANCELED' | string;
}

type ActiveTab = 'request' | 'calendar';

const API_BASE = 'http://127.0.0.1:8000'; // 필요하면 수정해서 사용

export default function TeacherConsultationPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<ActiveTab>('request');

  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // 필터
  const [filters, setFilters] = useState({
    student: '',
    type: '',
    status: '',
    method: '',
    dateOrder: '', // '' | 'ASC' | 'DESC'
  });

  // 달력 상태
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d;
  });

  // 로그인 체크 + 데이터 불러오기
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    const fetchRequests = async () => {
      setLoading(true);
      try {
        // 강사용 상담 요청 리스트 엔드포인트 (API 명세에 맞게 수정해서 사용)
        const res = await fetch(`${API_BASE}/api/consult/teacher/requests/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('failed to fetch');
        }

        const data = await res.json();
        setRequests(data);
      } catch (e) {
        console.error(e);
        alert('상담 요청 목록을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  // 상태 텍스트
  const getStatusText = (s: string) => {
    const map: Record<string, string> = {
      PENDING: '신청대기',
      APPROVED: '승인됨',
      COMPLETED: '완료',
      CANCELED: '취소됨',
    };
    return map[s] ?? s;
  };

  // 유형 텍스트
  const getTypeText = (t: string) => {
    const map: Record<string, string> = {
      CAREER: '진로상담',
      CODING: '코딩질문',
      OTHER: '기타',
    };
    return map[t] ?? t;
  };

  // 필터 적용된 리스트
  const filteredRequests = useMemo(() => {
    let list = [...requests];

    if (filters.student) {
      list = list.filter((r) =>
        r.student_name.toLowerCase().includes(filters.student.toLowerCase())
      );
    }
    if (filters.type) {
      list = list.filter((r) => r.consultation_type === filters.type);
    }
    if (filters.status) {
      list = list.filter((r) => r.status === filters.status);
    }
    if (filters.method) {
      list = list.filter((r) => r.method === filters.method);
    }
    if (filters.dateOrder === 'ASC') {
      list.sort(
        (a, b) =>
          new Date(a.requested_at).getTime() -
          new Date(b.requested_at).getTime()
      );
    } else if (filters.dateOrder === 'DESC') {
      list.sort(
        (a, b) =>
          new Date(b.requested_at).getTime() -
          new Date(a.requested_at).getTime()
      );
    }

    return list;
  }, [requests, filters]);

  // 상태 변경 (승인 / 거절 등)
  const handleStatusChange = async (
    id: number,
    nextStatus: 'APPROVED' | 'CANCELED' | 'COMPLETED'
  ) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    if (!confirm(`해당 상담을 ${getStatusText(nextStatus)} 상태로 변경할까요?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/consult/teacher/requests/${id}/`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        throw new Error('failed to update status');
      }

      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r))
      );
      alert('상태가 변경되었습니다.');
    } catch (e) {
      console.error(e);
      alert('상태 변경에 실패했습니다.');
    }
  };

  // ========= 캘린더 관련 계산 =========
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth(); // 0~11

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0=일
  const lastDate = new Date(year, month + 1, 0).getDate();

  const calendarCells = useMemo(() => {
    const cells: (number | null)[] = [];
    // 앞쪽 비어있는 칸
    for (let i = 0; i < firstDayOfWeek; i += 1) cells.push(null);
    // 날짜
    for (let d = 1; d <= lastDate; d += 1) cells.push(d);
    return cells;
  }, [firstDayOfWeek, lastDate]);

  // 해당 날짜의 일정(승인/완료된 상담만 표시)
  const getEventsForDate = (day: number) => {
    const thisDay = new Date(year, month, day);
    return requests.filter((r) => {
      if (!r.scheduled_at) return false;
      const d = new Date(r.scheduled_at);
      return (
        d.getFullYear() === thisDay.getFullYear() &&
        d.getMonth() === thisDay.getMonth() &&
        d.getDate() === thisDay.getDate() &&
        (r.status === 'APPROVED' || r.status === 'COMPLETED')
      );
    });
  };

  const changeMonth = (diff: number) => {
    setCurrentMonth((prev) => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + diff);
      d.setDate(1);
      return d;
    });
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 상단 탭 - 학생용 코드 레이아웃 맞춤 */}
      <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
        <button
          onClick={() => setActiveTab('request')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              activeTab === 'request'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          상담요청 관리
        </button>
        <button
          onClick={() => setActiveTab('calendar')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              activeTab === 'calendar'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          일정관리
        </button>
      </div>

      {/* 탭 1 : 상담요청 관리 */}
      {activeTab === 'request' && (
        <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">
          {/* 필터 바 - 학생명 / 유형 / 상태 / 날짜 */}
          <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 items-center">
            {/* 학생명 검색 (input) */}
            <input
              type="text"
              value={filters.student}
              onChange={(e) =>
                setFilters((f) => ({ ...f, student: e.target.value }))
              }
              placeholder="학생명"
              className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
            />

            {/* 상담유형 */}
            <select
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value }))
              }
              className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
            >
              <option value="">상담유형 전체</option>
              <option value="CAREER">진로상담</option>
              <option value="CODING">코딩질문</option>
              <option value="OTHER">기타</option>
            </select>

            {/* 상태 */}
            <select
              value={filters.status}
              onChange={(e) =>
                setFilters((f) => ({ ...f, status: e.target.value }))
              }
              className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
            >
              <option value="">상태 전체</option>
              <option value="PENDING">신청대기</option>
              <option value="APPROVED">승인됨</option>
              <option value="COMPLETED">완료</option>
              <option value="CANCELED">취소됨</option>
            </select>

            {/* 상담형태 */}
            <select
              value={filters.method}
              onChange={(e) =>
                setFilters((f) => ({ ...f, method: e.target.value }))
              }
              className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
            >
              <option value="">상담형태 전체</option>
              <option value="OFFLINE">대면상담</option>
              <option value="ONLINE">비대면상담</option>
            </select>

            {/* 날짜 정렬 */}
            <select
              value={filters.dateOrder}
              onChange={(e) =>
                setFilters((f) => ({ ...f, dateOrder: e.target.value }))
              }
              className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
            >
              <option value="">날짜정렬 없음</option>
              <option value="ASC">신청일 ↑</option>
              <option value="DESC">신청일 ↓</option>
            </select>

            <button
              onClick={() =>
                setFilters({
                  student: '',
                  type: '',
                  status: '',
                  method: '',
                  dateOrder: '',
                })
              }
              className="text-xs px-3 py-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              필터 초기화
            </button>
          </div>

          {/* 리스트 테이블 */}
          {loading ? (
            <p className="text-center py-10 text-gray-500">로딩 중...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr className="text-gray-600">
                    <th className="py-3 px-4 font-medium text-center w-16">
                      번호
                    </th>
                    <th className="py-3 px-4 font-medium">학생명</th>
                    <th className="py-3 px-4 font-medium">상담유형</th>
                    <th className="py-3 px-4 font-medium">상담형태</th>
                    <th className="py-3 px-4 font-medium">상담 내용</th>
                    <th className="py-3 px-4 font-medium">
                      상담일(상담예정일)
                    </th>
                    <th className="py-3 px-4 font-medium">상태</th>
                    <th className="py-3 px-4 font-medium">관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center py-10 text-gray-400"
                      >
                        상담 요청이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((r, idx) => (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-center">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-4">{r.student_name}</td>
                        <td className="py-3 px-4">
                          {getTypeText(r.consultation_type)}
                        </td>
                        <td className="py-3 px-4">
                          {r.method === 'OFFLINE' ? '대면상담' : '비대면상담'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={() =>
                              router.push(
                                `/teacher/consultation/${r.id}`
                              )
                            }
                            className="px-3 py-1 text-xs bg-white border border-sky-500 text-sky-600 rounded hover:bg-sky-50"
                          >
                            자세히 보기
                          </button>
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {r.scheduled_at
                            ? new Date(
                                r.scheduled_at
                              ).toLocaleString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              r.status === 'PENDING'
                                ? 'bg-yellow-100 text-yellow-700'
                                : r.status === 'APPROVED'
                                ? 'bg-blue-100 text-blue-700'
                                : r.status === 'COMPLETED'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {getStatusText(r.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {/* 관리 드롭다운 - 승인/거절/완료 */}
                          <select
                            defaultValue=""
                            onChange={(e) => {
                              const value = e.target.value as
                                | 'APPROVED'
                                | 'CANCELED'
                                | 'COMPLETED'
                                | '';
                              if (!value) return;
                              handleStatusChange(r.id, value);
                              e.target.value = '';
                            }}
                            className="border border-gray-300 rounded px-2 py-1 text-xs"
                          >
                            <option value="">관리</option>
                            {r.status !== 'APPROVED' && (
                              <option value="APPROVED">승인</option>
                            )}
                            {r.status !== 'CANCELED' && (
                              <option value="CANCELED">거절</option>
                            )}
                            {r.status === 'APPROVED' && (
                              <option value="COMPLETED">상담완료</option>
                            )}
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 탭 2 : 일정관리 (달력) */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">
          {/* 달력 상단 : 월 변경 */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => changeMonth(-1)}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => changeMonth(1)}
                className="px-3 py-1 border rounded hover:bg-gray-50"
              >
                ▶
              </button>
              <span className="ml-4 font-bold text-gray-800">
                {year}년 {month + 1}월
              </span>
            </div>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center text-xs font-bold text-gray-600 border-b mb-2">
            <div className="py-2">일</div>
            <div className="py-2">월</div>
            <div className="py-2">화</div>
            <div className="py-2">수</div>
            <div className="py-2">목</div>
            <div className="py-2">금</div>
            <div className="py-2">토</div>
          </div>

          {/* 날짜 셀 */}
          <div className="grid grid-cols-7 gap-px bg-gray-200 text-xs">
            {calendarCells.map((day, idx) => {
              if (day === null) {
                return (
                  <div
                    key={idx}
                    className="bg-white h-24 border border-gray-100"
                  />
                );
              }

              const events = getEventsForDate(day);

              return (
                <div
                  key={idx}
                  className="bg-white h-24 border border-gray-100 p-1 flex flex-col"
                >
                  <div className="text-right text-[11px] text-gray-700 mb-1">
                    {day}
                  </div>

                  <div className="flex-1 overflow-hidden space-y-1">
                    {events.map((e, i) => (
                      <div
                        key={i}
                        className="text-[10px] leading-tight bg-sky-100 text-sky-800 rounded px-1 py-0.5 cursor-pointer hover:bg-sky-200"
                        onClick={() =>
                          router.push(`/teacher/consultation/${e.id}`)
                        }
                      >
                        {new Date(e.scheduled_at || '').toLocaleTimeString(
                          [],
                          { hour: '2-digit', minute: '2-digit' }
                        )}{' '}
                        · {e.student_name}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}