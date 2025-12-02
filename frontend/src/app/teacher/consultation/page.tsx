// app/teacher/counseling/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://127.0.0.1:8000';

type CounselTab = 'request' | 'schedule' | 'history';

interface UserProfile {
  fullName: string;
  major: string;
}

interface CounselRequest {
  id: number;
  student_name: string;
  counsel_type: string;
  summary: string;
  datetime: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DONE';
}

interface CounselSchedule {
  id: number;
  title: string;
  datetime: string;
  student_name: string;
}

interface CounselHistory {
  id: number;
  student_name: string;
  counsel_type: string;
  datetime: string;
  result: string;
}

export default function TeacherCounselingPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<CounselTab>('request');

  const [requests, setRequests] = useState<CounselRequest[]>([]);
  const [schedules, setSchedules] = useState<CounselSchedule[]>([]);
  const [historyList, setHistoryList] = useState<CounselHistory[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 강사 권한 / 프로필 세팅
  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const access = localStorage.getItem('access_token');

    if (!userRaw || !access) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      const r = user.role;

      const isTeacher =
        r === 2 ||
        r === '2' ||
        r === 'TEACHER' ||
        r === 'teacher' ||
        r === 'INSTRUCTOR';

      if (!isTeacher) {
        alert('강사 전용 페이지입니다.');
        router.push('/student/dashboard');
        return;
      }

      const fullName =
        `${user.last_name || ''}${user.first_name || ''}`.trim() || user.username;
      const major = user.interests || '';

      setProfile({ fullName, major });
    } catch {
      router.push('/login');
    }
  }, [router]);

  // 상담 관련 데이터 (지금은 더미)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchCounselData = async () => {
      setLoading(true);
      setError(null);

      try {
        // TODO: 실제 API 붙일 때 여기 사용
        // const res = await fetch(`${API_BASE_URL}/api/teacher/counseling/overview/`, {
        //   headers: { Authorization: `Bearer ${token}` },
        // });

        // if (!res.ok) {
        //   setError('상담 정보를 불러오지 못했습니다.');
        //   return;
        // }

        // const data = await res.json();
        // setRequests(data.requests || []);
        // setSchedules(data.schedules || []);
        // setHistoryList(data.history || []);

        const dummyRequests: CounselRequest[] = [
          {
            id: 1,
            student_name: '홍길동',
            counsel_type: '진로 상담',
            summary: '진학 관련 상담을 희망합니다.',
            datetime: '2025-03-01 14:00',
            status: 'PENDING',
          },
          {
            id: 2,
            student_name: '이몽룡',
            counsel_type: '학습 상담',
            summary: '성적 향상 방법에 대해 상담 요청',
            datetime: '2025-03-02 10:30',
            status: 'APPROVED',
          },
          {
            id: 3,
            student_name: '성춘향',
            counsel_type: '기타',
            summary: '개인 사유로 상담 요청',
            datetime: '2025-02-27 16:00',
            status: 'DONE',
          },
        ];

        const dummySchedules: CounselSchedule[] = [
          {
            id: 1,
            title: '진로 상담 - 홍길동',
            datetime: '2025-03-01 14:00',
            student_name: '홍길동',
          },
          {
            id: 2,
            title: '학습 상담 - 이몽룡',
            datetime: '2025-03-02 10:30',
            student_name: '이몽룡',
          },
        ];

        const dummyHistory: CounselHistory[] = [
          {
            id: 1,
            student_name: '성춘향',
            counsel_type: '학습 상담',
            datetime: '2025-02-01 15:00',
            result: '학습 계획 수립 완료',
          },
          {
            id: 2,
            student_name: '임꺽정',
            counsel_type: '생활 지도',
            datetime: '2025-01-20 11:00',
            result: '지속 관찰 필요',
          },
        ];

        setRequests(dummyRequests);
        setSchedules(dummySchedules);
        setHistoryList(dummyHistory);
      } catch {
        setError('상담 정보를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCounselData();
  }, []);

  const getStatusLabel = (status: CounselRequest['status']) => {
    switch (status) {
      case 'PENDING':
        return '신청대기';
      case 'APPROVED':
        return '승인';
      case 'REJECTED':
        return '거절';
      case 'DONE':
        return '완료';
      default:
        return status;
    }
  };

  const handleApprove = (id: number) => {
    alert(`상담 ID ${id} 승인 기능은 추후 구현 예정입니다.`);
  };

  const handleReject = (id: number) => {
    alert(`상담 ID ${id} 거절 기능은 추후 구현 예정입니다.`);
  };

  const handleDone = (id: number) => {
    alert(`상담 ID ${id} 완료 처리 기능은 추후 구현 예정입니다.`);
  };

  const handleViewDetail = (id: number) => {
    alert(`상담 ID ${id} 상세보기 기능은 추후 구현 예정입니다.`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto">
        {/* 가운데 큰 흰 카드만 남김 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 상단 제목 영역 */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-sky-800">상담 관리</h1>
            <p className="mt-1 text-sm text-gray-500">
              학생 상담 신청을 확인하고 상담 일정 및 진행 내역을 관리할 수 있습니다.
            </p>
          </div>

          {/* 서브 탭 */}
          <div className="px-8 pt-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'request'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('request')}
              >
                상담 신청
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'schedule'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('schedule')}
              >
                상담 일정
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'history'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('history')}
              >
                상담 내역
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="px-8 py-6">
            {loading && (
              <div className="py-8 text-center text-sm text-gray-500">
                상담 정보를 불러오는 중입니다...
              </div>
            )}
            {!loading && error && (
              <div className="py-8 text-center text-sm text-red-500">
                {error}
              </div>
            )}

            {!loading && !error && (
              <>
                {/* 상담 신청 탭 */}
                {activeTab === 'request' && (
                  <section>
                    <h3 className="text-sm font-semibold text-sky-700 mb-3">
                      상담 신청 목록
                    </h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 border">번호</th>
                            <th className="px-3 py-2 border">학생명</th>
                            <th className="px-3 py-2 border">상담유형</th>
                            <th className="px-3 py-2 border">요약</th>
                            <th className="px-3 py-2 border">희망일시</th>
                            <th className="px-3 py-2 border">상태</th>
                            <th className="px-3 py-2 border">처리</th>
                          </tr>
                        </thead>
                        <tbody>
                          {requests.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-3 py-6 text-gray-500">
                                상담 신청이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            requests.map((req, idx) => (
                              <tr
                                key={req.id}
                                className="hover:bg-gray-50 cursor-pointer"
                                onClick={() => handleViewDetail(req.id)}
                              >
                                <td className="px-3 py-2 border">{idx + 1}</td>
                                <td className="px-3 py-2 border">
                                  {req.student_name}
                                </td>
                                <td className="px-3 py-2 border">
                                  {req.counsel_type}
                                </td>
                                <td className="px-3 py-2 border text-left">
                                  {req.summary}
                                </td>
                                <td className="px-3 py-2 border">
                                  {req.datetime}
                                </td>
                                <td className="px-3 py-2 border">
                                  {getStatusLabel(req.status)}
                                </td>
                                <td
                                  className="px-3 py-2 border"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <div className="flex gap-1 justify-center">
                                    {req.status === 'PENDING' && (
                                      <>
                                        <button
                                          type="button"
                                          className="px-3 py-1 text-xs rounded bg-sky-600 text-white hover:bg-sky-700"
                                          onClick={() => handleApprove(req.id)}
                                        >
                                          승인
                                        </button>
                                        <button
                                          type="button"
                                          className="px-3 py-1 text-xs rounded bg-white border border-gray-400 text-gray-600 hover:bg-gray-50"
                                          onClick={() => handleReject(req.id)}
                                        >
                                          거절
                                        </button>
                                      </>
                                    )}
                                    {(req.status === 'APPROVED' ||
                                      req.status === 'PENDING') && (
                                      <button
                                        type="button"
                                        className="px-3 py-1 text-xs rounded bg-white border border-sky-600 text-sky-700 hover:bg-sky-50"
                                        onClick={() => handleDone(req.id)}
                                      >
                                        완료 처리
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* 상담 일정 탭 */}
                {activeTab === 'schedule' && (
                  <section>
                    <h3 className="text-sm font-semibold text-sky-700 mb-3">
                      예정된 상담 일정
                    </h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 border">번호</th>
                            <th className="px-3 py-2 border">제목</th>
                            <th className="px-3 py-2 border">학생명</th>
                            <th className="px-3 py-2 border">일시</th>
                          </tr>
                        </thead>
                        <tbody>
                          {schedules.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="px-3 py-6 text-gray-500">
                                예정된 상담 일정이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            schedules.map((s, idx) => (
                              <tr key={s.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border">{idx + 1}</td>
                                <td className="px-3 py-2 border text-left">
                                  {s.title}
                                </td>
                                <td className="px-3 py-2 border">
                                  {s.student_name}
                                </td>
                                <td className="px-3 py-2 border">
                                  {s.datetime}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}

                {/* 상담 내역 탭 */}
                {activeTab === 'history' && (
                  <section>
                    <h3 className="text-sm font-semibold text-sky-700 mb-3">
                      상담 진행 내역
                    </h3>
                    <div className="border border-gray-300 rounded-md overflow-hidden">
                      <table className="w-full text-center text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 border">번호</th>
                            <th className="px-3 py-2 border">학생명</th>
                            <th className="px-3 py-2 border">상담유형</th>
                            <th className="px-3 py-2 border">일시</th>
                            <th className="px-3 py-2 border">결과</th>
                          </tr>
                        </thead>
                        <tbody>
                          {historyList.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-3 py-6 text-gray-500">
                                상담 내역이 없습니다.
                              </td>
                            </tr>
                          ) : (
                            historyList.map((h, idx) => (
                              <tr key={h.id} className="hover:bg-gray-50">
                                <td className="px-3 py-2 border">{idx + 1}</td>
                                <td className="px-3 py-2 border">
                                  {h.student_name}
                                </td>
                                <td className="px-3 py-2 border">
                                  {h.counsel_type}
                                </td>
                                <td className="px-3 py-2 border">
                                  {h.datetime}
                                </td>
                                <td className="px-3 py-2 border text-left">
                                  {h.result}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
