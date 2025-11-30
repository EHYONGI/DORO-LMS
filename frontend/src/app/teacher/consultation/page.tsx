'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type ActiveTab = 'request' | 'calendar';

interface CounselingRequest {
    id: number;
    student_name: string;
    counseling_type: string;
    summary: string;
    datetime: string; // ISO string
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'DONE';
}

interface CounselingEvent {
    id: number;
    title: string;
    datetime: string; // ISO
}

const statusLabel = (s: CounselingRequest['status']) => {
    switch (s) {
        case 'PENDING':
            return '신청대기';
        case 'APPROVED':
            return '승인';
        case 'REJECTED':
            return '거절';
        case 'DONE':
            return '완료';
        default:
            return s;
    }
};

export default function TeacherCounselingPage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<ActiveTab>('request');

    const [requests, setRequests] = useState<CounselingRequest[]>([]);
    const [events, setEvents] = useState<CounselingEvent[]>([]);

    // 검색 필터
    const [filterStudent, setFilterStudent] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const [loading, setLoading] = useState(false);

    // 캘린더용 날짜
    const [currentDate, setCurrentDate] = useState(() => new Date());

    // 로그인 체크 + 기본 데이터 로드
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            try {
                // ❗ 실제 API 경로에 맞게 수정해서 사용하면 됨
                const tokenHeader = {
                    Authorization: `Bearer ${token}`,
                };

                // 상담 요청 목록
                const reqRes = await fetch(
                    'http://127.0.0.1:8000/api/counseling/requests/',
                    { headers: tokenHeader }
                );
                if (reqRes.ok) {
                    const data: CounselingRequest[] = await reqRes.json();
                    setRequests(data);
                }

                // 상담 일정(캘린더)
                const eventRes = await fetch(
                    'http://127.0.0.1:8000/api/counseling/events/',
                    { headers: tokenHeader }
                );
                if (eventRes.ok) {
                    const data: CounselingEvent[] = await eventRes.json();
                    setEvents(data);
                }
            } catch (e) {
                console.error('상담 데이터 로딩 오류:', e);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // 필터 적용된 상담요청
    const filteredRequests = useMemo(() => {
        return requests.filter((r) => {
            const matchStudent = filterStudent
                ? r.student_name.includes(filterStudent)
                : true;
            const matchType = filterType ? r.counseling_type === filterType : true;
            const matchStatus = filterStatus ? r.status === filterStatus : true;
            const matchDate = filterDate
                ? r.datetime.slice(0, 10) === filterDate
                : true;
            return matchStudent && matchType && matchStatus && matchDate;
        });
    }, [requests, filterStudent, filterType, filterStatus, filterDate]);

    // 상담 요청 상태 변경 (승인 / 거절 / 완료)
    const updateRequestStatus = async (
        id: number,
        newStatus: CounselingRequest['status']
    ) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/counseling/requests/${id}/`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (res.ok) {
                setRequests((prev) =>
                    prev.map((r) =>
                        r.id === id ? { ...r, status: newStatus } : r
                    )
                );
                alert('상태가 변경되었습니다.');
            } else {
                alert('상태 변경에 실패했습니다.');
            }
        } catch (e) {
            console.error('상태 변경 오류:', e);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 상담내용 자세히 보기 (모달 대신 alert로 간단히)
    const showDetail = (req: CounselingRequest) => {
        alert(
            `학생: ${req.student_name}\n유형: ${req.counseling_type}\n\n상담 내용:\n${req.summary}`
        );
    };

    // 상담일정 추가 버튼 (일단 페이지 이동 or alert)
    const handleAddSchedule = () => {
        // 예: 상담 일정 생성 페이지가 있으면 push
        // router.push('/teacher/counseling/new');
        alert('상담일정 추가 기능은 나중에 연결하세요 🙌');
    };

    // 캘린더 유틸
    const firstDayOfMonth = useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    }, [currentDate]);

    const lastDayOfMonth = useMemo(() => {
        return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    }, [currentDate]);

    const weeks = useMemo(() => {
        const weeksArray: { date: Date | null }[][] = [];
        let current = new Date(
            firstDayOfMonth.getFullYear(),
            firstDayOfMonth.getMonth(),
            1 - firstDayOfMonth.getDay()
        ); // 주 시작(일요일 기준)

        while (true) {
            const week: { date: Date | null }[] = [];
            for (let i = 0; i < 7; i++) {
                const inMonth =
                    current >= firstDayOfMonth && current <= lastDayOfMonth;
                week.push({ date: inMonth ? new Date(current) : null });
                current.setDate(current.getDate() + 1);
            }
            weeksArray.push(week);
            if (current > lastDayOfMonth && current.getDay() === 0) break;
        }
        return weeksArray;
    }, [firstDayOfMonth, lastDayOfMonth]);

    const eventsByDate = useMemo(() => {
        const map: Record<string, CounselingEvent[]> = {};
        for (const ev of events) {
            const d = ev.datetime.slice(0, 10); // YYYY-MM-DD
            if (!map[d]) map[d] = [];
            map[d].push(ev);
        }
        return map;
    }, [events]);

    const moveMonth = (offset: number) => {
        setCurrentDate(
            (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
        );
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <p className="text-center text-gray-500">불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* 상단 탭 */}
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
                    일정 관리
                </button>
            </div>

            {activeTab === 'request' && (
                <section className="border border-gray-300 rounded-md bg-white">
                    {/* 필터 영역 + 상단 버튼 */}
                    <div className="border-b border-gray-200 px-4 py-3 flex flex-wrap gap-3 items-center justify-between bg-gray-50">
                        <div className="flex flex-wrap gap-3 items-center text-sm">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">학생명</span>
                                <input
                                    type="text"
                                    value={filterStudent}
                                    onChange={(e) => setFilterStudent(e.target.value)}
                                    className="border border-gray-300 rounded px-2 py-1 w-32"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">상담유형</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1"
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                >
                                    <option value="">전체</option>
                                    <option value="진로">진로상담</option>
                                    <option value="학업">학업상담</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">상태</span>
                                <select
                                    className="border border-gray-300 rounded px-2 py-1"
                                    value={filterStatus}
                                    onChange={(e) =>
                                        setFilterStatus(
                                            e.target.value as CounselingRequest['status'] | ''
                                        )
                                    }
                                >
                                    <option value="">전체</option>
                                    <option value="PENDING">신청대기</option>
                                    <option value="APPROVED">승인</option>
                                    <option value="DONE">완료</option>
                                    <option value="REJECTED">거절</option>
                                </select>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-gray-600">날짜</span>
                                <input
                                    type="date"
                                    className="border border-gray-300 rounded px-2 py-1"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                            </div>
                            <button
                                type="button"
                                className="px-4 py-1.5 bg-sky-600 text-white rounded text-sm hover:bg-sky-700"
                            >
                                검색
                            </button>
                        </div>
                        <button
                            onClick={handleAddSchedule}
                            className="px-4 py-1.5 bg-sky-600 text-white rounded text-sm hover:bg-sky-700"
                        >
                            + 상담일정
                        </button>
                    </div>

                    {/* 상담 요청 테이블 */}
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-sm text-center">
                            <thead className="bg-sky-50">
                                <tr>
                                    <th className="px-3 py-2 border">번호</th>
                                    <th className="px-3 py-2 border">학생명</th>
                                    <th className="px-3 py-2 border">상담유형</th>
                                    <th className="px-3 py-2 border">상담 내용</th>
                                    <th className="px-3 py-2 border">상담일시</th>
                                    <th className="px-3 py-2 border">상태</th>
                                    <th className="px-3 py-2 border">관리</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((req, idx) => (
                                        <tr key={req.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 border">{idx + 1}</td>
                                            <td className="px-3 py-2 border">
                                                {req.student_name}
                                            </td>
                                            <td className="px-3 py-2 border">
                                                {req.counseling_type}
                                            </td>
                                            <td className="px-3 py-2 border">
                                                <button
                                                    className="px-3 py-1 bg-white border border-sky-600 text-sky-700 rounded text-xs hover:bg-sky-50"
                                                    onClick={() => showDetail(req)}
                                                >
                                                    자세히 보기
                                                </button>
                                            </td>
                                            <td className="px-3 py-2 border">
                                                {new Date(
                                                    req.datetime
                                                ).toLocaleString('ko-KR', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </td>
                                            <td className="px-3 py-2 border">
                                                {statusLabel(req.status)}
                                            </td>
                                            <td className="px-3 py-2 border space-x-1">
                                                {req.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            className="px-3 py-1 bg-sky-600 text-white rounded text-xs hover:bg-sky-700"
                                                            onClick={() =>
                                                                updateRequestStatus(
                                                                    req.id,
                                                                    'APPROVED'
                                                                )
                                                            }
                                                        >
                                                            승인
                                                        </button>
                                                        <button
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            onClick={() =>
                                                                updateRequestStatus(
                                                                    req.id,
                                                                    'REJECTED'
                                                                )
                                                            }
                                                        >
                                                            거절
                                                        </button>
                                                    </>
                                                )}
                                                {req.status === 'APPROVED' && (
                                                    <button
                                                        className="px-3 py-1 bg-emerald-500 text-white rounded text-xs hover:bg-emerald-600"
                                                        onClick={() =>
                                                            updateRequestStatus(
                                                                req.id,
                                                                'DONE'
                                                            )
                                                        }
                                                    >
                                                        완료처리
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="px-3 py-10 text-gray-400"
                                        >
                                            상담요청이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </section>
            )}

            {activeTab === 'calendar' && (
                <section className="border border-gray-300 rounded-md bg-white p-4">
                    {/* 상단 월 이동 */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <button
                                className="px-2 py-1 border rounded hover:bg-gray-50 text-sm"
                                onClick={() => moveMonth(-1)}
                            >
                                &lt;
                            </button>
                            <div className="font-bold text-base">
                                {currentDate.getFullYear()}년{' '}
                                {currentDate.getMonth() + 1}월
                            </div>
                            <button
                                className="px-2 py-1 border rounded hover:bg-gray-50 text-sm"
                                onClick={() => moveMonth(1)}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>

                    {/* 요일 헤더 */}
                    <div className="grid grid-cols-7 text-center text-xs font-bold border-b border-gray-200 pb-2 mb-2">
                        <div className="text-red-500">일</div>
                        <div>월</div>
                        <div>화</div>
                        <div>수</div>
                        <div>목</div>
                        <div>금</div>
                        <div className="text-blue-500">토</div>
                    </div>

                    {/* 달력 그리드 */}
                    <div className="grid grid-cols-7 gap-px bg-gray-200">
                        {weeks.map((week, wi) =>
                            week.map((col, di) => {
                                const d = col.date;
                                const key = `${wi}-${di}`;
                                const dateStr =
                                    d &&
                                    d.toISOString().slice(0, 10); /* YYYY-MM-DD */
                                const dayEvents =
                                    (dateStr && eventsByDate[dateStr]) || [];
                                const inThisMonth =
                                    d &&
                                    d.getMonth() === currentDate.getMonth();

                                return (
                                    <div
                                        key={key}
                                        className={`min-h-[90px] bg-white p-1 border border-gray-200 flex flex-col text-xs ${
                                            !inThisMonth ? 'bg-gray-50 text-gray-400' : ''
                                        }`}
                                    >
                                        <div className="flex justify-end mb-1">
                                            {d && (
                                                <span className="text-[11px]">
                                                    {d.getDate()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {dayEvents.map((ev) => (
                                                <div
                                                    key={ev.id}
                                                    className="border border-sky-400 bg-sky-50 rounded px-1 py-0.5 text-[10px] text-left truncate"
                                                >
                                                    {ev.title}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </section>
            )}
        </div>
    );
}
