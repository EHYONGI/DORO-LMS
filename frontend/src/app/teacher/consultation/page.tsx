'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Consultation {
    id: number;
    student: number;
    student_name: string;
    instructor_name: string;
    consultation_type: string;
    topic: string;
    content: string;
    preferred_date: string | null;
    scheduled_at: string | null;
    status: string;
    method: string;
    created_at: string;
}

const formatDateTime = (value: string | null | undefined) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
};

const formatConsultDate = (item: Consultation) => {
    if (item.scheduled_at) {
        return formatDateTime(item.scheduled_at);
    }
    if (item.preferred_date) {
        const d = new Date(item.preferred_date);
        if (!Number.isNaN(d.getTime())) {
            return d.toLocaleDateString();
        }
        return item.preferred_date;
    }
    return '-';
};

const extractDateOnly = (value: string | null | undefined) => {
    if (!value) return null;
    return value.split('T')[0];
};

export default function TeacherConsultationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [loading, setLoading] = useState(true);

    // 필터 상태
    const [filters, setFilters] = useState({
        student: '',
        type: '',
        status: '',
        method: ''
    });

    // 상담 목록 불러오기
    useEffect(() => {
        fetchConsultations();
    }, [filters]);

    const fetchConsultations = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        const params = new URLSearchParams();
        if (filters.student) params.append('student', filters.student);
        if (filters.type) params.append('type', filters.type);
        if (filters.status) params.append('status', filters.status);
        if (filters.method) params.append('method', filters.method);

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/consultations/instructor/list/?${params}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );
            if (res.ok) {
                const data = await res.json();
                setConsultations(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 상태 변경 핸들러 (지금은 status만 변경)
    const handleStatusChange = async (id: number, newStatus: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/consultations/${id}/status/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ status: newStatus }),
                }
            );

            if (res.ok) {
                alert('상태가 변경되었습니다.');
                fetchConsultations();
            } else {
                alert('상태 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 상담 삭제
    const handleDelete = async (id: number) => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/consultations/${id}/`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            if (res.ok) {
                alert('삭제되었습니다.');
                fetchConsultations();
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 상태 표시 스타일
    const getStatusBadge = (status: string) => {
        const styles = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'APPROVED': 'bg-blue-100 text-blue-800',
            'COMPLETED': 'bg-green-100 text-green-800',
            'CANCELED': 'bg-gray-100 text-gray-800'
        };
        const labels = {
            'PENDING': '신청완료',
            'APPROVED': '상담예정',
            'COMPLETED': '상담완료',
            'CANCELED': '취소됨'
        };
        return (
            <span className={`px-2 py-1 rounded text-xs font-bold ${styles[status as keyof typeof styles]}`}>
                {labels[status as keyof typeof labels]}
            </span>
        );
    };

    const getTypeLabel = (type: string) => {
        const labels = { 'CAREER': '진로상담', 'CODING': '코딩질문', 'OTHER': '기타' };
        return labels[type as keyof typeof labels] || type;
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">상담페이지</h1>

            {/* 탭 메뉴 */}
            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'list' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    상담요청 관리
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'calendar' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    일정 관리
                </button>
            </div>

            {activeTab === 'list' ? (
                /* === 상담요청 관리 탭 === */
                <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">
                    {/* 필터 영역 */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 items-center">
                        <select
                            value={filters.student}
                            onChange={(e) => setFilters({ ...filters, student: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">학생명</option>
                        </select>

                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">신청유형</option>
                            <option value="CAREER">진로상담</option>
                            <option value="CODING">코딩질문</option>
                            <option value="OTHER">기타</option>
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">상태</option>
                            <option value="PENDING">신청완료</option>
                            <option value="APPROVED">상담예정</option>
                            <option value="COMPLETED">상담완료</option>
                            <option value="CANCELED">취소됨</option>
                        </select>

                        <select
                            value={filters.method}
                            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">분배</option>
                            <option value="OFFLINE">대면</option>
                            <option value="ONLINE">비대면</option>
                        </select>

                        <button
                            onClick={() => setFilters({ student: '', type: '', status: '', method: '' })}
                            className="ml-auto bg-sky-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-600 shadow-sm"
                        >
                            + 신청완료
                        </button>
                    </div>

                    {/* 테이블 */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr className="text-gray-600">
                                    <th className="py-3 px-4 font-medium text-center">번호</th>
                                    <th className="py-3 px-4 font-medium text-center">학생명</th>
                                    <th className="py-3 px-4 font-medium text-center">신청유형</th>
                                    <th className="py-3 px-4 font-medium text-center">신청일시</th>
                                    <th className="py-3 px-4 font-medium text-center">상담 내용</th>
                                    <th className="py-3 px-4 font-medium text-center">상담일시(신청일정/예정일)</th>
                                    <th className="py-3 px-4 font-medium text-center">상태</th>
                                    <th className="py-3 px-4 font-medium text-center">관리</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {consultations.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="text-center py-10 text-gray-400">
                                            신청된 상담이 없습니다.
                                        </td>
                                    </tr>
                                ) : (
                                    consultations.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-center text-gray-800">{index + 1}</td>
                                            <td className="py-3 px-4 text-center text-gray-800">{item.student_name}</td>
                                            <td className="py-3 px-4 text-center text-gray-600">
                                                {getTypeLabel(item.consultation_type)}
                                            </td>
                                            <td className="py-3 px-4 text-center text-xs text-gray-600">
                                                {formatDateTime(item.created_at)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <button
                                                    onClick={() => router.push(`/teacher/consultation/${item.id}`)}
                                                    className="text-sky-600 hover:underline font-bold"
                                                >
                                                    {item.topic || '상담 내용'}
                                                </button>
                                            </td>
                                            <td className="py-3 px-4 text-center text-xs text-gray-600">
                                                {formatConsultDate(item)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(item.status)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <div className="flex gap-1 justify-center">
                                                    {item.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleStatusChange(item.id, 'APPROVED')}
                                                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                                                        >
                                                            승인
                                                        </button>
                                                    )}
                                                    {item.status === 'APPROVED' && (
                                                        <button
                                                            onClick={() => handleStatusChange(item.id, 'COMPLETED')}
                                                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                                                        >
                                                            완료
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
                                                    >
                                                        삭제
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                /* === 일정 관리 탭 (달력) === */
                <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">
                    <CalendarView consultations={consultations} />
                </div>
            )}
        </div>
    );
}

// 달력 컴포넌트
function CalendarView({ consultations }: { consultations: Consultation[] }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);

    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const weeks: {
        date: Date;
        consultations: Consultation[];
    }[][] = [];
    const currentWeekDate = new Date(startDate);

    for (let week = 0; week < 6; week++) {
        const days: {
            date: Date;
            consultations: Consultation[];
        }[] = [];
        for (let day = 0; day < 7; day++) {
            const date = new Date(currentWeekDate);
            const dateStr = date.toISOString().split('T')[0];

            const dayConsultations = consultations.filter((c) => {
                const scheduledDate = extractDateOnly(c.scheduled_at);
                const preferredDate = extractDateOnly(c.preferred_date);
                const key = scheduledDate || preferredDate;
                return key === dateStr;
            });

            days.push({
                date: date,
                consultations: dayConsultations,
            });

            currentWeekDate.setDate(currentWeekDate.getDate() + 1);
        }
        weeks.push(days);
    }

    return (
        <div>
            {/* 달력 헤더 */}
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => setCurrentDate(new Date(year, month - 1))}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                    ◀
                </button>
                <h2 className="text-lg font-bold">
                    {year}년 {month + 1}월
                </h2>
                <button
                    onClick={() => setCurrentDate(new Date(year, month + 1))}
                    className="px-3 py-1 border rounded hover:bg-gray-50"
                >
                    ▶
                </button>
            </div>

            {/* 요일 헤더 */}
            <div className="grid grid-cols-7 gap-2 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, i) => (
                    <div key={i} className="text-center font-bold text-gray-600 py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* 달력 본체 */}
            <div className="grid grid-cols-7 gap-2">
                {weeks.map((week, weekIdx) =>
                    week.map((day, dayIdx) => {
                        const isCurrentMonth = day.date.getMonth() === month;
                        const isToday = day.date.toDateString() === new Date().toDateString();

                        return (
                            <div
                                key={`${weekIdx}-${dayIdx}`}
                                className={`border rounded p-2 min-h-[100px] ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                                    } ${isToday ? 'border-sky-600 border-2' : ''}`}
                            >
                                <div className="text-sm font-bold mb-1">
                                    {day.date.getDate()}
                                </div>
                                <div className="space-y-1">
                                    {day.consultations.map((c) => (
                                        <div
                                            key={c.id}
                                            className="text-xs p-1 bg-sky-100 rounded cursor-pointer hover:bg-sky-200"
                                            onClick={() =>
                                                (window.location.href = `/teacher/consultation/${c.id}`)
                                            }
                                        >
                                            {c.student_name} - {c.topic?.substring(0, 10)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
