'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 데이터 타입 정의
interface Instructor {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
}

interface Consultation {
    id: number;
    instructor_name: string;
    consultation_type: string;
    topic: string;
    scheduled_at: string;
    status: string;
    method: string;
    content: string;
}

export default function ConsultationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'list' | 'request'>('list');

    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    const [loading, setLoading] = useState(true);

    // [복구됨] 필터 상태 관리
    const [filters, setFilters] = useState({
        type: '',       // 상담유형
        method: '',     // 상담형태
        instructor: '', // 담당강사
        status: ''      // 상태
    });

    // 신청 폼 상태
    const [formData, setFormData] = useState({
        instructor: '',
        method: 'OFFLINE',
        date: '',
        time: '09:00',
        type: 'CAREER',
        topic: '',
        content: ''
    });

    // 1. 강사 목록 가져오기 (초기 1회)
    useEffect(() => {
        const fetchInstructors = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }
            try {
                const res = await fetch('http://127.0.0.1:8000/api/consultations/instructors/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setInstructors(await res.json());
            } catch (err) {
                console.error(err);
            }
        };
        fetchInstructors();
    }, [router]);

    // 2. 상담 목록 조회 (필터 변경 시마다 실행)
    const fetchConsultations = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        setLoading(true);
        try {
            // 쿼리 파라미터 생성
            const params = new URLSearchParams();
            if (filters.type) params.append('type', filters.type);
            if (filters.method) params.append('method', filters.method);
            if (filters.instructor) params.append('instructor', filters.instructor);
            if (filters.status) params.append('status', filters.status);

            const res = await fetch(`http://127.0.0.1:8000/api/consultations/?${params.toString()}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setConsultations(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // activeTab이 'list'이거나 filters가 바뀔 때마다 목록 새로고침
    useEffect(() => {
        if (activeTab === 'list') {
            fetchConsultations();
        }
    }, [activeTab, filters]);

    // 상담 취소 핸들러
    const handleCancel = async (id: number) => {
        if (!confirm("정말 상담을 취소하시겠습니까?")) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/consultations/${id}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: 'CANCELED' }),
            });

            if (res.ok) {
                alert("상담이 취소되었습니다.");
                fetchConsultations(); // 목록 갱신
            } else {
                alert("취소 처리에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 상담 신청 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            const scheduled_at = `${formData.date}T${formData.time}:00`;
            const res = await fetch('http://127.0.0.1:8000/api/consultations/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    instructor: formData.instructor,
                    method: formData.method,
                    consultation_type: formData.type,
                    topic: formData.topic,
                    content: formData.content,
                    scheduled_at: scheduled_at
                }),
            });

            if (res.ok) {
                alert("상담 신청이 완료되었습니다.");
                setActiveTab('list');
                // 폼 및 필터 초기화
                setFormData({ ...formData, topic: '', content: '', date: '' });
                setFilters({ type: '', method: '', instructor: '', status: '' });
            } else {
                alert("신청 정보를 확인해주세요.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 헬퍼 함수들
    const getStatusText = (status: string) => {
        const map: { [key: string]: string } = { 'PENDING': '신청완료', 'APPROVED': '상담예정', 'COMPLETED': '상담완료', 'CANCELED': '취소됨' };
        return map[status] || status;
    };
    const getTypeText = (type: string) => {
        const map: { [key: string]: string } = { 'CAREER': '진로상담', 'CODING': '코딩질문', 'OTHER': '기타' };
        return map[type] || type;
    };

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

            {/* 탭 버튼 */}
            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button
                    onClick={() => setActiveTab('list')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'list' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    나의 상담내역
                </button>
                <button
                    onClick={() => setActiveTab('request')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'request' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    상담신청
                </button>
            </div>

            {/* [탭 1] 나의 상담 내역 (리스트 & 필터) */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">

                    {/* [복구됨] 필터바 영역 */}
                    <div className="flex flex-wrap gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200 items-center">

                        <select
                            value={filters.type}
                            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">상담유형 전체</option>
                            <option value="CAREER">진로상담</option>
                            <option value="CODING">코딩질문</option>
                            <option value="OTHER">기타</option>
                        </select>

                        <select
                            value={filters.method}
                            onChange={(e) => setFilters({ ...filters, method: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">상담형태 전체</option>
                            <option value="OFFLINE">대면상담</option>
                            <option value="ONLINE">비대면상담</option>
                        </select>

                        <select
                            value={filters.instructor}
                            onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">상담강사 전체</option>
                            {instructors.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.last_name}{inst.first_name} ({inst.username})
                                </option>
                            ))}
                        </select>

                        <select
                            value={filters.status}
                            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                            className="border border-gray-300 p-2 rounded text-sm text-gray-700 focus:border-sky-500 outline-none"
                        >
                            <option value="">상태 전체</option>
                            <option value="PENDING">신청완료</option>
                            <option value="APPROVED">상담예정</option>
                            <option value="COMPLETED">상담완료</option>
                            <option value="CANCELED">취소됨</option>
                        </select>

                        <button onClick={() => setActiveTab('request')} className="ml-auto bg-sky-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-600 shadow-sm">
                            + 상담신청
                        </button>
                    </div>

                    {/* 리스트 테이블 */}
                    {loading ? (
                        <p className="text-center py-20 text-gray-500">로딩 중...</p>
                    ) : (
                        <div className="border-t-2 border-gray-600">
                            <table className="w-full text-sm border-collapse">
                                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-300">
                                    <tr>
                                        <th className="py-3 border-r border-gray-200 w-16">번호</th>
                                        <th className="py-3 border-r border-gray-200 w-24">상담유형</th>
                                        <th className="py-3 border-r border-gray-200 w-24">상담형태</th>
                                        <th className="py-3 border-r border-gray-200 w-24">담당강사</th>
                                        <th className="py-3 border-r border-gray-200">상담 제목</th>
                                        <th className="py-3 border-r border-gray-200 w-24">상담 내용</th>
                                        <th className="py-3 border-r border-gray-200 w-48">상담일(예정일)</th>
                                        <th className="py-3 border-r border-gray-200 w-24">상태</th>
                                        <th className="py-3 border-r border-gray-200 w-16">비고</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-700">
                                    {consultations.length > 0 ? consultations.map((item, index) => (
                                        <tr key={item.id} className="hover:bg-gray-50 border-b border-gray-200">
                                            <td className="py-3 text-center border-r border-gray-100">{consultations.length - index}</td>
                                            <td className="py-3 text-center border-r border-gray-100">{getTypeText(item.consultation_type)}</td>
                                            <td className="py-3 text-center border-r border-gray-100">{item.method === 'OFFLINE' ? '대면' : '비대면'}</td>
                                            <td className="py-3 text-center border-r border-gray-100">{item.instructor_name}</td>
                                            <td className="py-3 text-center border-r border-gray-100 font-medium text-gray-900 truncate max-w-[150px]">
                                                {item.topic}
                                            </td>

                                            {/* 자세히 보기 버튼 */}
                                            <td className="py-3 text-center border-r border-gray-100">
                                                <button
                                                    onClick={() => router.push(`/consultation/${item.id}`)}
                                                    className="bg-sky-600 text-white text-xs px-3 py-1.5 rounded shadow-sm hover:bg-sky-700 transition"
                                                >
                                                    자세히
                                                </button>
                                            </td>

                                            <td className="py-3 text-center border-r border-gray-100 font-en text-xs">
                                                {new Date(item.scheduled_at).toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                            </td>
                                            <td className="py-3 text-center border-r border-gray-100">
                                                <span className={`text-xs font-bold 
                                                    ${item.status === 'PENDING' ? 'text-gray-500' : ''}
                                                    ${item.status === 'APPROVED' ? 'text-blue-600' : ''}
                                                    ${item.status === 'CANCELED' ? 'text-red-600' : ''}
                                                    ${item.status === 'COMPLETED' ? 'text-green-600' : ''}
                                                `}>
                                                    {getStatusText(item.status)}
                                                </span>
                                            </td>
                                            {/* 취소 버튼 */}
                                            <td className="py-3 text-center text-xs">
                                                {item.status === 'PENDING' && (
                                                    <button
                                                        onClick={() => handleCancel(item.id)}
                                                        className="text-red-500 border border-red-200 bg-red-50 px-2 py-1 rounded hover:bg-red-100 transition"
                                                    >
                                                        취소
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={9} className="py-16 text-center text-gray-400 border-b border-gray-200">
                                                조건에 맞는 상담 내역이 없습니다.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* [탭 2] 상담 신청 폼 (기존 유지 - 강사 이름 순서 수정 포함됨) */}
            {activeTab === 'request' && (
                <div className="bg-white rounded-b-lg border border-gray-200 p-8 shadow-sm min-h-[500px]">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
                        {/* ... (폼 내용은 이전과 동일, 강사 이름 순서는 {inst.last_name}{inst.first_name} 으로 되어 있음) ... */}

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1"><span className="text-red-500 mr-1">*</span>상담강사 선택</label>
                            <div className="col-span-3">
                                <select required value={formData.instructor} onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} className="w-full border border-gray-300 p-2 rounded focus:border-sky-500 outline-none">
                                    <option value="">상담강사를 선택하세요</option>
                                    {instructors.map(inst => (
                                        <option key={inst.id} value={inst.id}>{inst.last_name}{inst.first_name} ({inst.username})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* ... (나머지 폼 필드들: 상담형태, 희망일, 유형, 내용 등) ... */}

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1"><span className="text-red-500 mr-1">*</span>상담형태</label>
                            <div className="col-span-3 flex gap-6">
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="method" value="OFFLINE" checked={formData.method === 'OFFLINE'} onChange={(e) => setFormData({ ...formData, method: e.target.value })} /> 대면상담</label>
                                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" name="method" value="ONLINE" checked={formData.method === 'ONLINE'} onChange={(e) => setFormData({ ...formData, method: e.target.value })} /> 비대면상담</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1"><span className="text-red-500 mr-1">*</span>상담희망일</label>
                            <div className="col-span-3 flex gap-4 items-center">
                                <input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="border border-gray-300 p-2 rounded w-40" />
                                <select value={formData.time} onChange={(e) => setFormData({ ...formData, time: e.target.value })} className="border border-gray-300 p-2 rounded w-32">
                                    <option value="09:00">오전 9:00</option>
                                    <option value="10:00">오전 10:00</option>
                                    <option value="13:00">오후 1:00</option>
                                    <option value="14:00">오후 2:00</option>
                                    <option value="15:00">오후 3:00</option>
                                    <option value="16:00">오후 4:00</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1"><span className="text-red-500 mr-1">*</span>상담유형</label>
                            <div className="col-span-3">
                                <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="w-full border border-gray-300 p-2 rounded">
                                    <option value="CAREER">진로상담</option>
                                    <option value="CODING">코딩질문</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1 pt-2"><span className="text-red-500 mr-1">*</span>상담신청내용</label>
                            <div className="col-span-3 space-y-2">
                                <input type="text" placeholder="상담 제목을 입력하세요" required value={formData.topic} onChange={(e) => setFormData({ ...formData, topic: e.target.value })} className="w-full border border-gray-300 p-2 rounded" />
                                <textarea required placeholder="상담 내용을 구체적으로 작성해주세요." value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full border border-gray-300 p-2 rounded h-32 resize-none"></textarea>
                            </div>
                        </div>

                        <div className="flex justify-center gap-4 pt-6">
                            <button type="button" onClick={() => setActiveTab('list')} className="bg-gray-500 text-white px-10 py-3 rounded font-bold hover:bg-gray-600 transition">취소하기</button>
                            <button type="submit" className="bg-sky-600 text-white px-10 py-3 rounded font-bold hover:bg-sky-700 transition">신청하기</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}