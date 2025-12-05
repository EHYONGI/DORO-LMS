// app/manager/course/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lecture {
    id: number;
    name: string;
    instructor_name: string | null;
    status: string;
    created_at: string;
    competency_type_display?: string;
    required_score?: number;
}

interface Application {
    id: number;
    instructor_name: string;
    instructor_full_name: string;
    message: string;
    status: string;
    created_at: string;
}

export default function ManagerCoursePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'management' | 'create'>('management');

    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [selectedLectureId, setSelectedLectureId] = useState<number | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);

    const [newLectureName, setNewLectureName] = useState('');
    const [competencyType, setCompetencyType] = useState('');
    const [requiredScore, setRequiredScore] = useState(0);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchLectures(token);
    }, [router]);

    const fetchLectures = async (token: string) => {
        try {
            const res = await fetch('http://127.0.0.1:8000/api/lectures/manager/list/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setLectures(await res.json());
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchApplications = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/manager/lectures/${lectureId}/applications/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setApplications(await res.json());
                setSelectedLectureId(lectureId);
            }
        } catch (err) { console.error(err); }
    };

    // 강의 개설
    const handleCreateLecture = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        if (!newLectureName.trim()) return;

        try {
            const res = await fetch('http://127.0.0.1:8000/api/lectures/manager/create/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newLectureName, competency_type: competencyType || null, required_score: requiredScore })
            });

            if (res.ok) {
                alert("강의가 개설되었습니다.");
                setNewLectureName(''); setCompetencyType(''); setRequiredScore(0);
                fetchLectures(token!);
                setActiveTab('management');
            } else { alert("개설 실패"); }
        } catch (err) { console.error(err); }
    };

    // 지원 승인/반려
    const handleProcessApplication = async (appId: number, action: 'APPROVE' | 'REJECT') => {
        const token = localStorage.getItem('access_token');
        if (!confirm(action === 'APPROVE' ? "승인하시겠습니까?" : "반려하시겠습니까?")) return;

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/manager/applications/${appId}/process/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            if (res.ok) {
                alert("처리되었습니다.");
                if (selectedLectureId) fetchApplications(selectedLectureId);
                fetchLectures(token!);
            } else { alert("처리 실패"); }
        } catch (err) { console.error(err); }
    };

    // 강의 삭제
    const handleDeleteLecture = async (lectureId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("정말 삭제하시겠습니까?")) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/manager/lectures/${lectureId}/delete/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("삭제되었습니다.");
                fetchLectures(token!);
                if (selectedLectureId === lectureId) { setSelectedLectureId(null); setApplications([]); }
            }
        } catch (err) { console.error(err); }
    };

    // 강사 배정 취소
    const handleCancelInstructor = async (lectureId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("배정된 강사를 취소하시겠습니까?")) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/manager/lectures/${lectureId}/cancel-instructor/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("취소되었습니다.");
                fetchLectures(token!);
                if (selectedLectureId === lectureId) fetchApplications(lectureId);
            }
        } catch (err) { console.error(err); }
    };

    // [NEW] 수강신청 마감 (상태 변경: OPEN -> IN_PROGRESS)
    const handleCloseEnrollment = async (lectureId: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm("수강신청을 마감하고 수업을 시작하시겠습니까?\n(상태가 '진행 중'으로 변경됩니다)")) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/manager/lectures/${lectureId}/close-enrollment/`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                alert("수강신청이 마감되었습니다.");
                fetchLectures(token!);
            } else {
                const err = await res.json();
                alert(err.error || "실패했습니다.");
            }
        } catch (err) { console.error(err); }
    };

    const getStatusBadge = (status: string) => {
        if (status === 'RECRUITING') return <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">강사 모집중</span>;
        if (status === 'OPEN') return <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">수강 신청중</span>;
        if (status === 'IN_PROGRESS') return <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">진행중</span>;
        if (status === 'CLOSED') return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">종료됨</span>;
        return <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">{status}</span>;
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2">
                강의 관리 및 개설
            </h1>

            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button onClick={() => setActiveTab('management')} className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300 ${activeTab === 'management' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>강의 관리</button>
                <button onClick={() => setActiveTab('create')} className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300 ${activeTab === 'create' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}>강의 개설</button>
            </div>

            {/* [탭 1] 강의 관리 */}
            {activeTab === 'management' && (
                <div className="flex gap-6 h-[600px]">
                    <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">개설된 강의 목록</h2>
                        <div className="space-y-3">
                            {lectures.map(lecture => (
                                <div
                                    key={lecture.id}
                                    className={`border rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition cursor-pointer relative
                                        ${selectedLectureId === lecture.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 bg-white'}
                                    `}
                                    onClick={() => fetchApplications(lecture.id)}
                                >
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-gray-800">{lecture.name}</span>
                                            {getStatusBadge(lecture.status)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            강사: {lecture.instructor_name || '미정'}
                                            {lecture.competency_type_display && ` | ${lecture.competency_type_display} ${lecture.required_score}점`}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 items-end">
                                        {/* 1. 수강마감 버튼 (OPEN 상태일 때) */}
                                        {lecture.status === 'OPEN' && lecture.instructor_name && (
                                            <button
                                                onClick={(e) => handleCloseEnrollment(lecture.id, e)}
                                                className="bg-green-500 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-green-600 shadow-sm"
                                            >
                                                신청마감
                                            </button>
                                        )}

                                        {/* 2. 배정 취소 버튼 (강사 있음 & OPEN/IN_PROGRESS 등) */}
                                        {lecture.instructor_name && (
                                            <button
                                                onClick={(e) => handleCancelInstructor(lecture.id, e)}
                                                className="bg-white border border-orange-400 text-orange-500 px-2 py-1 rounded text-xs font-bold hover:bg-orange-50"
                                            >
                                                배정 취소
                                            </button>
                                        )}

                                        {/* 3. 지원자 확인 안내 (모집중일 때) */}
                                        {lecture.status === 'RECRUITING' && (
                                            <span className="text-xs text-sky-600 font-bold">지원자 확인 &gt;</span>
                                        )}

                                        {/* 4. 삭제 버튼 (항상 표시) */}
                                        <button
                                            onClick={(e) => handleDeleteLecture(lecture.id, e)}
                                            className="bg-white border border-red-200 text-red-400 px-2 py-1 rounded text-xs hover:bg-red-50 hover:text-red-600 hover:border-red-400"
                                        >
                                            삭제
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {lectures.length === 0 && <div className="text-center text-gray-400 py-10">개설된 강의가 없습니다.</div>}
                        </div>
                    </div>

                    {/* 우측: 지원자 목록 */}
                    <div className="w-1/3 bg-white border border-gray-200 rounded-xl p-6 shadow-sm overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">
                            {selectedLectureId ? '강사 지원자 목록' : '좌측에서 강의를 선택하세요'}
                        </h2>

                        {selectedLectureId && applications.length === 0 && (
                            <div className="text-center text-gray-400 py-10">아직 지원자가 없습니다.</div>
                        )}

                        <div className="space-y-4">
                            {applications.map(app => (
                                <div key={app.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="font-bold text-gray-800">{app.instructor_full_name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded font-bold ${app.status === 'PENDING' ? 'bg-yellow-200 text-yellow-800' : app.status === 'APPROVED' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{app.status}</span>
                                    </div>
                                    <p className="text-sm text-gray-600 bg-white p-2 rounded border border-gray-100 mb-3">{app.message || "메시지 없음"}</p>

                                    {app.status === 'PENDING' && (
                                        <div className="flex gap-2">
                                            <button onClick={() => handleProcessApplication(app.id, 'APPROVE')} className="flex-1 bg-blue-600 text-white py-1.5 rounded text-xs font-bold hover:bg-blue-700">승인</button>
                                            <button onClick={() => handleProcessApplication(app.id, 'REJECT')} className="flex-1 bg-white border border-red-400 text-red-500 py-1.5 rounded text-xs font-bold hover:bg-red-50">반려</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* [탭 2] 강의 개설 (기존 유지) */}
            {activeTab === 'create' && (
                <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm max-w-2xl mx-auto mt-8">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-100 pb-4">새로운 강의 개설</h2>
                    <form onSubmit={handleCreateLecture} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">강의명 <span className="text-red-500">*</span></label>
                            <input type="text" placeholder="예: 아두이노 기초 입문" className="w-full border border-gray-300 rounded-lg px-4 py-3" value={newLectureName} onChange={e => setNewLectureName(e.target.value)} required />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">요구 역량</label>
                                <select className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white" value={competencyType} onChange={e => setCompetencyType(e.target.value)}>
                                    <option value="">없음 (누구나 수강 가능)</option>
                                    <option value="D">디지털 (Digital)</option>
                                    <option value="I">인공지능 (AI)</option>
                                    <option value="M">메이킹 (Making)</option>
                                    <option value="C">컴퓨팅 (Computing)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">최소 점수</label>
                                <input type="number" min="0" max="100" placeholder="0" className="w-full border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100" value={requiredScore} onChange={e => setRequiredScore(parseInt(e.target.value) || 0)} disabled={!competencyType} />
                            </div>
                        </div>
                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <button type="submit" className="bg-sky-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-700">개설하기</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}