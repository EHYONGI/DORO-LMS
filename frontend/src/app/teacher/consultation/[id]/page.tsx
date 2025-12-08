// app/teacher/consultation/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Consultation {
    id: number;
    student: number;
    student_name: string;
    instructor: number;
    instructor_name: string;
    consultation_type: string;
    topic: string;
    content: string;
    scheduled_at: string | null;
    status: string;
    method: string;
    created_at: string;
}

export default function TeacherConsultationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const consultationId = params.id;

    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [loading, setLoading] = useState(true);

    // 🔹 날짜 포맷 공통 함수
    const formatDateTime = (value: string | null | undefined) => {
        if (!value) return '-';

        const d = new Date(value);
        if (Number.isNaN(d.getTime())) {
            return value;
        }
        return d.toLocaleString();
    };

    // 데이터 불러오기
    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/consultations/${consultationId}/`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                if (res.ok) {
                    const data = await res.json();
                    setConsultation(data);
                } else {
                    alert('상담 내역을 찾을 수 없습니다.');
                    router.back();
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [consultationId, router]);

    // 상태 변경 핸들러
    const handleStatusChange = async (newStatus: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/consultations/${consultationId}/status/`,
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
                alert('상태가 변경되었습니다.');
                window.location.reload();
            } else {
                alert('상태 변경에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 삭제 핸들러
    const handleDelete = async () => {
        if (!confirm('정말 삭제하시겠습니까?')) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/consultations/${consultationId}/`,
                {
                    method: 'DELETE',
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (res.ok) {
                alert('삭제되었습니다.');
                router.push('/teacher/consultation');
            }
        } catch (err) {
            console.error(err);
        }
    };

    // 타입/형태 한글 변환
    const getTypeLabel = (type: string) => {
        const labels = {
            CAREER: '진로상담',
            CODING: '코딩질문',
            OTHER: '기타',
        };
        return labels[type as keyof typeof labels] || type;
    };

    const getMethodLabel = (method: string) => {
        return method === 'OFFLINE' ? '대면상담' : '비대면상담';
    };

    const getStatusLabel = (status: string) => {
        const labels = {
            PENDING: '신청완료',
            APPROVED: '상담예정',
            COMPLETED: '상담완료',
            CANCELED: '취소됨',
        };
        return labels[status as keyof typeof labels] || status;
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;
    if (!consultation) return null;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-800 pb-4">
                상담 상세 내용 (강사용)
            </h1>

            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                <div className="space-y-6 text-sm">
                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">상담 제목</div>
                        <div className="col-span-3 font-medium text-lg">
                            {consultation.topic}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">신청 학생</div>
                        <div className="col-span-3">
                            {consultation.student_name}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">신청 일시</div>
                        <div className="col-span-3 font-en">
                            {formatDateTime(consultation.created_at)}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">희망 상담 일시</div>
                        <div className="col-span-3 font-en">
                            {formatDateTime(consultation.scheduled_at)}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">상담 유형/형태</div>
                        <div className="col-span-3">
                            {getTypeLabel(consultation.consultation_type)} /{' '}
                            {getMethodLabel(consultation.method)}
                        </div>
                    </div>

                    <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                        <div className="font-bold text-gray-600">현재 상태</div>
                        <div className="col-span-3">
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">
                                {getStatusLabel(consultation.status)}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-start min-h-[100px]">
                        <div className="font-bold text-gray-600 pt-1">
                            상담 신청 내용
                        </div>
                        <div className="col-span-3 text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded">
                            {consultation.content}
                        </div>
                    </div>

                    {/* 강사용 버튼들 */}
                    <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                        <button
                            onClick={() => router.push('/teacher/consultation')}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                        >
                            목록으로
                        </button>

                        <div className="flex gap-2">
                            {consultation.status === 'PENDING' && (
                                <>
                                    <button
                                        onClick={() =>
                                            handleStatusChange('APPROVED')
                                        }
                                        className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-bold"
                                    >
                                        승인하기
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleStatusChange('CANCELED')
                                        }
                                        className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 font-bold"
                                    >
                                        거절하기
                                    </button>
                                </>
                            )}

                            {consultation.status === 'APPROVED' && (
                                <button
                                    onClick={() =>
                                        handleStatusChange('COMPLETED')
                                    }
                                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-bold"
                                >
                                    상담 완료
                                </button>
                            )}

                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                            >
                                삭제
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
