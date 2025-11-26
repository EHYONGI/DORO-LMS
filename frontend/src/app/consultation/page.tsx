// app/consultation/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Instructor {
    id: number;
    username: string;
    last_name: string;
    first_name: string;
}

interface Consultation {
    id: number;
    instructor_name: string;
    method: string;
    type: string;
    topic: string;
    preferred_date: string;
    status: string;
    created_at: string;
}

export default function ConsultationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'list' | 'request'>('list');
    
    // 상담 신청 폼 데이터
    const [formData, setFormData] = useState({
        instructor: '',
        method: '',
        date: '',
        type: '',
        topic: '',
        content: ''
    });

    // 상담 내역 리스트
    const [consultations, setConsultations] = useState<Consultation[]>([]);
    const [instructors, setInstructors] = useState<Instructor[]>([]);
    
    // 필터
    const [filters, setFilters] = useState({
        type: '',
        method: '',
        instructor: '',
        status: ''
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        // 1. 강사 목록 가져오기
        const fetchInstructors = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/user/instructors/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setInstructors(await res.json());
            } catch (err) {
                console.error(err);
            }
        };

        // 2. 상담 내역 가져오기
        const fetchConsultations = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://127.0.0.1:8000/api/consult/list', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setConsultations(await res.json());
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInstructors();
        if (activeTab === 'list') fetchConsultations();
    }, [router, activeTab]);

    // 필터링된 상담 내역
    const filteredConsultations = consultations.filter(item => {
        if (filters.type && item.type !== filters.type) return false;
        if (filters.method && item.method !== filters.method) return false;
        if (filters.status && item.status !== filters.status) return false;
        if (filters.instructor && !item.instructor_name.includes(filters.instructor)) return false;
        return true;
    });

    // 상담 신청 제출 핸들러
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/consult/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                alert("상담 신청이 완료되었습니다!");
                setActiveTab('list');
                setFormData({ instructor: '', method: '', date: '', type: '', topic: '', content: '' });
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
        const map: { [key: string]: string } = { 
            'PENDING': '신청완료', 
            'APPROVED': '상담예정', 
            'COMPLETED': '상담완료', 
            'CANCELED': '취소됨' 
        };
        return map[status] || status;
    };

    const getTypeText = (type: string) => {
        const map: { [key: string]: string } = { 
            'CAREER': '진로상담', 
            'CODING': '코딩질문', 
            'OTHER': '기타' 
        };
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

            {/* [탭 1] 나의 상담 내역 */}
            {activeTab === 'list' && (
                <div className="bg-white rounded-b-lg border border-gray-200 p-6 shadow-sm min-h-[500px]">

                    {/* 필터바 영역 */}
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

                        <button 
                            onClick={() => setActiveTab('request')} 
                            className="ml-auto bg-sky-500 text-white px-4 py-2 rounded text-sm font-bold hover:bg-sky-600 shadow-sm"
                        >
                            + 상담신청
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
                                        <th className="py-3 px-4 font-medium">상담강사</th>
                                        <th className="py-3 px-4 font-medium">상담형태</th>
                                        <th className="py-3 px-4 font-medium">상담유형</th>
                                        <th className="py-3 px-4 font-medium">상담주제</th>
                                        <th className="py-3 px-4 font-medium">희망일</th>
                                        <th className="py-3 px-4 font-medium">상태</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredConsultations.length > 0 ? filteredConsultations.map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="py-3 px-4 text-gray-800">{item.instructor_name}</td>
                                            <td className="py-3 px-4 text-gray-600">{item.method === 'OFFLINE' ? '대면' : '비대면'}</td>
                                            <td className="py-3 px-4 text-gray-600">{getTypeText(item.type)}</td>
                                            <td className="py-3 px-4 text-gray-800 font-medium">{item.topic}</td>
                                            <td className="py-3 px-4 text-gray-600">{new Date(item.preferred_date).toLocaleDateString()}</td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    item.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                    item.status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
                                                    item.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                                                    'bg-gray-100 text-gray-700'
                                                }`}>
                                                    {getStatusText(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-gray-400">상담 내역이 없습니다.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* [탭 2] 상담 신청 폼 */}
            {activeTab === 'request' && (
                <div className="bg-white rounded-b-lg border border-gray-200 p-8 shadow-sm min-h-[500px]">
                    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1">
                                <span className="text-red-500 mr-1">*</span>상담강사 선택
                            </label>
                            <div className="col-span-3">
                                <select 
                                    required 
                                    value={formData.instructor} 
                                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })} 
                                    className="w-full border border-gray-300 p-2 rounded focus:border-sky-500 outline-none"
                                >
                                    <option value="">상담강사를 선택하세요</option>
                                    {instructors.map(inst => (
                                        <option key={inst.id} value={inst.id}>
                                            {inst.last_name}{inst.first_name} ({inst.username})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1">
                                <span className="text-red-500 mr-1">*</span>상담형태
                            </label>
                            <div className="col-span-3 flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="method" 
                                        value="OFFLINE" 
                                        checked={formData.method === 'OFFLINE'} 
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })} 
                                        required 
                                    />
                                    <span className="text-sm text-gray-700">대면상담</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="method" 
                                        value="ONLINE" 
                                        checked={formData.method === 'ONLINE'} 
                                        onChange={(e) => setFormData({ ...formData, method: e.target.value })} 
                                        required 
                                    />
                                    <span className="text-sm text-gray-700">비대면상담</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1">
                                <span className="text-red-500 mr-1">*</span>희망 상담 일자
                            </label>
                            <div className="col-span-3">
                                <input 
                                    type="date" 
                                    required 
                                    value={formData.date} 
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} 
                                    className="border border-gray-300 p-2 rounded focus:border-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1">
                                <span className="text-red-500 mr-1">*</span>상담 유형
                            </label>
                            <div className="col-span-3">
                                <select 
                                    required 
                                    value={formData.type} 
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value })} 
                                    className="w-full border border-gray-300 p-2 rounded focus:border-sky-500 outline-none"
                                >
                                    <option value="">상담 유형을 선택하세요</option>
                                    <option value="CAREER">진로상담</option>
                                    <option value="CODING">코딩질문</option>
                                    <option value="OTHER">기타</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-center border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1">
                                <span className="text-red-500 mr-1">*</span>상담 주제
                            </label>
                            <div className="col-span-3">
                                <input 
                                    type="text" 
                                    required 
                                    value={formData.topic} 
                                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })} 
                                    placeholder="상담 주제를 입력하세요" 
                                    className="w-full border border-gray-300 p-2 rounded focus:border-sky-500 outline-none"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-4 items-start border-b border-gray-100 pb-4">
                            <label className="font-bold text-gray-700 col-span-1 pt-2">
                                <span className="text-red-500 mr-1">*</span>상담 내용
                            </label>
                            <div className="col-span-3">
                                <textarea 
                                    required 
                                    value={formData.content} 
                                    onChange={(e) => setFormData({ ...formData, content: e.target.value })} 
                                    rows={5} 
                                    placeholder="상담 내용을 입력하세요" 
                                    className="w-full border border-gray-300 p-2 rounded focus:border-sky-500 outline-none resize-none"
                                />
                            </div>
                        </div>

                        <div className="flex justify-center gap-3 pt-4">
                            <button 
                                type="button" 
                                onClick={() => setActiveTab('list')} 
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-medium hover:bg-gray-300 transition"
                            >
                                취소
                            </button>
                            <button 
                                type="submit" 
                                className="px-6 py-2 bg-sky-600 text-white rounded font-bold hover:bg-sky-700 transition shadow-sm"
                            >
                                신청하기
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}