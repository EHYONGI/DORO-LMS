// app/consultation/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// 타입 정의 (기존과 동일)
interface Consultation {
    id: number;
    instructor: number;
    instructor_name: string;
    consultation_type: string;
    topic: string;
    content: string;
    scheduled_at: string;
    status: string;
    method: string;
}

export default function ConsultationDetailPage() {
    const params = useParams();
    const router = useRouter();
    const consultationId = params.id;

    const [consultation, setConsultation] = useState<Consultation | null>(null);
    const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
    const [loading, setLoading] = useState(true);

    // 수정용 폼 데이터
    const [formData, setFormData] = useState({
        topic: '',
        content: '',
        date: '',
        time: '',
        method: '',
        type: ''
    });

    // 데이터 불러오기
    useEffect(() => {
        const fetchDetail = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/consultations/${consultationId}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setConsultation(data);

                    // 날짜/시간 분리해서 폼 초기값 설정
                    const dateObj = new Date(data.scheduled_at);
                    const dateStr = dateObj.toISOString().split('T')[0];
                    // 시간 포맷 맞추기 (HH:00)
                    const timeStr = `${String(dateObj.getHours()).padStart(2, '0')}:00`;

                    setFormData({
                        topic: data.topic,
                        content: data.content,
                        date: dateStr,
                        time: timeStr, // 백엔드 저장된 시간과 select 옵션이 맞아야 함 (단순화 위해 시간 부분만 추출 필요할 수 있음)
                        method: data.method,
                        type: data.consultation_type
                    });
                } else {
                    alert("상담 내역을 찾을 수 없습니다.");
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

    // 수정 저장 핸들러
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');

        try {
            const scheduled_at = `${formData.date}T${formData.time}:00`; // 초 단위 추가
            const res = await fetch(`http://127.0.0.1:8000/api/consultations/${consultationId}/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    topic: formData.topic,
                    content: formData.content,
                    scheduled_at: scheduled_at,
                    method: formData.method,
                    consultation_type: formData.type
                }),
            });

            if (res.ok) {
                alert("수정되었습니다.");
                setIsEditing(false);
                window.location.reload(); // 데이터 갱신을 위해 새로고침
            } else {
                alert("수정에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;
    if (!consultation) return null;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-800 pb-4">
                상담 상세 내용
            </h1>

            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                {isEditing ? (
                    /* === 수정 모드 (폼) === */
                    <form onSubmit={handleUpdate} className="space-y-6">
                        <div className="grid grid-cols-4 items-center pb-4 border-b border-gray-100">
                            <label className="font-bold text-gray-700">상담 제목</label>
                            <input
                                type="text"
                                value={formData.topic}
                                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                className="col-span-3 border p-2 rounded w-full"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center pb-4 border-b border-gray-100">
                            <label className="font-bold text-gray-700">상담 유형</label>
                            <select
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                className="col-span-3 border p-2 rounded w-full"
                            >
                                <option value="CAREER">진로상담</option>
                                <option value="CODING">코딩질문</option>
                                <option value="OTHER">기타</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-4 items-center pb-4 border-b border-gray-100">
                            <label className="font-bold text-gray-700">상담 일시</label>
                            <div className="col-span-3 flex gap-2">
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="border p-2 rounded"
                                />
                                <select
                                    value={formData.time} // "09:00" 형식
                                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                    className="border p-2 rounded"
                                >
                                    <option value="09:00">09:00</option>
                                    <option value="10:00">10:00</option>
                                    <option value="13:00">13:00</option>
                                    <option value="14:00">14:00</option>
                                    <option value="15:00">15:00</option>
                                    <option value="16:00">16:00</option>
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center pb-4 border-b border-gray-100">
                            <label className="font-bold text-gray-700">상담 형태</label>
                            <div className="col-span-3 flex gap-4">
                                <label><input type="radio" name="method" value="OFFLINE" checked={formData.method === 'OFFLINE'} onChange={(e) => setFormData({ ...formData, method: e.target.value })} /> 대면</label>
                                <label><input type="radio" name="method" value="ONLINE" checked={formData.method === 'ONLINE'} onChange={(e) => setFormData({ ...formData, method: e.target.value })} /> 비대면</label>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start pb-4">
                            <label className="font-bold text-gray-700 pt-2">상담 내용</label>
                            <textarea
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                className="col-span-3 border p-2 rounded w-full h-40 resize-none"
                            />
                        </div>

                        <div className="flex justify-end gap-2 border-t pt-6">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded hover:bg-gray-50">취소</button>
                            <button type="submit" className="px-6 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 font-bold">저장하기</button>
                        </div>
                    </form>
                ) : (
                    /* === 조회 모드 (기본) === */
                    <div className="space-y-6 text-sm">
                        <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-600">상담 제목</div>
                            <div className="col-span-3 font-medium text-lg">{consultation.topic}</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-600">담당 강사</div>
                            <div className="col-span-3">{consultation.instructor_name}</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-600">상담 일시</div>
                            <div className="col-span-3 font-en">{new Date(consultation.scheduled_at).toLocaleString()}</div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-600">상담 유형/형태</div>
                            <div className="col-span-3">
                                {consultation.consultation_type} / {consultation.method === 'OFFLINE' ? '대면' : '비대면'}
                            </div>
                        </div>
                        <div className="grid grid-cols-4 border-b border-gray-100 pb-4">
                            <div className="font-bold text-gray-600">현재 상태</div>
                            <div className="col-span-3">
                                <span className="bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-700">
                                    {consultation.status}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-start min-h-[100px]">
                            <div className="font-bold text-gray-600 pt-1">상담 신청 내용</div>
                            <div className="col-span-3 text-gray-800 whitespace-pre-wrap leading-relaxed bg-gray-50 p-4 rounded">
                                {consultation.content}
                            </div>
                        </div>

                        <div className="flex justify-between pt-6 border-t border-gray-200 mt-8">
                            <button
                                onClick={() => router.push('/consultation')}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                            >
                                목록으로
                            </button>

                            {/* 상태가 '신청완료(PENDING)'일 때만 수정 가능하도록 제한 */}
                            {consultation.status === 'PENDING' && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-2 bg-sky-600 text-white rounded hover:bg-sky-700 font-bold"
                                >
                                    수정하기
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}