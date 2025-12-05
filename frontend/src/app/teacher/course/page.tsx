// app/teacher/course/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lecture {
    id: number;
    name: string;
    description: string;
    instructor_name: string | null;
    capacity?: number;
    enrolled_count?: number;
    day_time?: string;
    status: 'OPEN' | 'RECRUITING' | 'IN_PROGRESS' | 'CLOSED';
    course_code?: string;
    competency_type?: string;
    competency_type_display?: string;
    level?: string;
    level_display?: string;
    required_score?: number;
}

interface LectureApplication {
    id: number;
    lecture: Lecture;
    message: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    created_at: string;
}

export default function TeacherCourseApplicationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'register' | 'wishlist' | 'enrolled'>('register');

    // 데이터 상태
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [wishlistLectures, setWishlistLectures] = useState<LectureApplication[]>([]);
    const [enrolledLectures, setEnrolledLectures] = useState<LectureApplication[]>([]);

    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'RECRUITING'>('ALL');
    const [searchKeyword, setSearchKeyword] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        fetchData();
    }, [router, activeTab]);

    // 데이터 가져오기
    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        setLoading(true);

        try {
            if (activeTab === 'register') {
                // 전체 강의 목록
                const res = await fetch('http://127.0.0.1:8000/api/lectures/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    // 강사 미배정 강의만 필터링
                    const recruiting = data.filter((lecture: Lecture) => 
                        lecture.status === 'RECRUITING' || !lecture.instructor_name
                    );
                    setLectures(recruiting);
                }
            }
            else if (activeTab === 'wishlist') {
                // 희망 과목 (지원한 강의)
                const res = await fetch('http://127.0.0.1:8000/api/teacher/applications/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setWishlistLectures(await res.json());
            }
            else if (activeTab === 'enrolled') {
                // 신청 내역 확인
                const res = await fetch('http://127.0.0.1:8000/api/teacher/applications/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setEnrolledLectures(await res.json());
            }
        } catch (error) {
            console.error('데이터 로딩 오류:', error);
        } finally {
            setLoading(false);
        }
    };

    // 강의 지원
    const handleEnroll = async (lectureId: number, lectureName: string) => {
        const token = localStorage.getItem('access_token');
        const message = prompt(`"${lectureName}" 강의에 지원하시겠습니까?\n지원 메시지를 입력해주세요:`, '');

        if (message === null) return;

        try {
            const res = await fetch('http://127.0.0.1:8000/api/teacher/applications/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lecture_id: lectureId,
                    message: message
                })
            });

            if (res.ok) {
                alert('강의 지원이 완료되었습니다!');
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || '지원에 실패했습니다.');
            }
        } catch (error) {
            console.error('지원 오류:', error);
            alert('지원 중 오류가 발생했습니다.');
        }
    };

    // 희망과목에 추가 (메시지 없이 바로 지원)
    const handleAddToWishlist = async (lectureId: number, lectureName: string) => {
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/teacher/applications/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    lecture_id: lectureId,
                    message: '희망과목으로 등록하였습니다.'
                })
            });

            if (res.ok) {
                alert(`"${lectureName}" 강의가 희망과목에 추가되었습니다!`);
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || '희망과목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('희망과목 추가 오류:', error);
            alert('희망과목 추가 중 오류가 발생했습니다.');
        }
    };

    // 지원 취소
    const handleCancelEnrollment = async (applicationId: number, lectureName: string) => {
        if (!confirm(`"${lectureName}" 지원을 취소하시겠습니까?`)) return;

        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/teacher/applications/${applicationId}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('지원이 취소되었습니다.');
                fetchData();
            } else {
                alert('지원 취소에 실패했습니다.');
            }
        } catch (error) {
            console.error('지원 취소 오류:', error);
            alert('지원 취소 중 오류가 발생했습니다.');
        }
    };

    // 필터링 및 검색
    const getFilteredLectures = (lectureList: Lecture[]) => {
        let filtered = lectureList;

        // 상태 필터
        if (filter === 'RECRUITING') {
            filtered = filtered.filter(l => l.status === 'RECRUITING');
        }

        // 검색어 필터
        if (searchKeyword.trim()) {
            filtered = filtered.filter(l =>
                l.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                l.instructor_name?.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        return filtered;
    };

    // 상태 뱃지
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PENDING':
                return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">대기 중</span>;
            case 'APPROVED':
                return <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">승인됨</span>;
            case 'REJECTED':
                return <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">반려됨</span>;
            case 'RECRUITING':
                return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">강사 배정 중</span>;
            case 'OPEN':
                return <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">수강신청</span>;
            default:
                return null;
        }
    };

    // 역량 타입별 아이콘
    const getCompetencyIcon = (type: string | null) => {
        switch (type) {
            case 'D': return '💻';
            case 'I': return '🤖';
            case 'M': return '⚙️';
            case 'C': return '💡';
            default: return '📚';
        }
    };

    // 난이도별 색상
    const getLevelColor = (level: string) => {
        switch (level) {
            case 'common': return 'bg-gray-100 text-gray-700';
            case 'basic': return 'bg-green-100 text-green-700';
            case 'intermediate': return 'bg-blue-100 text-blue-700';
            case 'advanced': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // 강의 카드 컴포넌트 (수강신청 탭용)
    const LectureCard = ({ lecture }: { lecture: Lecture }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        {getStatusBadge(lecture.status)}
                        {lecture.level_display && (
                            <span className={`${getLevelColor(lecture.level || '')} text-xs font-bold px-3 py-1 rounded-full`}>
                                {lecture.level_display}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {lecture.competency_type && (
                        <span className="text-2xl">{getCompetencyIcon(lecture.competency_type)}</span>
                    )}
                    <h3 className="text-white font-bold text-lg">{lecture.name}</h3>
                </div>
                {lecture.course_code && (
                    <p className="text-sky-100 text-xs mt-1">{lecture.course_code}</p>
                )}
                <p className="text-sky-100 text-sm mt-1">
                    {lecture.instructor_name ? `${lecture.instructor_name} 강사님` : '강사 미정'}
                </p>
            </div>

            {/* 카드 본문 */}
            <div className="p-5">
                {/* 역량 정보 */}
                {lecture.competency_type_display && lecture.required_score !== undefined && (
                    <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                        <p className="text-xs text-blue-700">
                            <strong>{lecture.competency_type_display} 역량</strong> {lecture.required_score}점 이상 필요
                        </p>
                    </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                    {lecture.description || '강의 설명이 없습니다.'}
                </p>

                {lecture.day_time && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{lecture.day_time}</span>
                    </div>
                )}

                {/* 버튼 영역 */}
                <div className="flex gap-2">
                    <button
                        onClick={() => handleEnroll(lecture.id, lecture.name)}
                        className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-bold hover:bg-sky-700 transition shadow-sm"
                    >
                        신청
                    </button>
                    <button
                        onClick={() => handleAddToWishlist(lecture.id, lecture.name)}
                        className="px-4 py-2.5 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition"
                        title="희망과목 추가"
                    >
                        ♡
                    </button>
                </div>
            </div>
        </div>
    );

    // 지원 내역 카드 컴포넌트 (희망과목 탭용)
    const ApplicationCard = ({ app }: { app: LectureApplication }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        {getStatusBadge(app.status)}
                        {app.lecture.level_display && (
                            <span className={`${getLevelColor(app.lecture.level || '')} text-xs font-bold px-3 py-1 rounded-full`}>
                                {app.lecture.level_display}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {app.lecture.competency_type && (
                        <span className="text-2xl">{getCompetencyIcon(app.lecture.competency_type)}</span>
                    )}
                    <h3 className="text-white font-bold text-lg">{app.lecture.name}</h3>
                </div>
                {app.lecture.course_code && (
                    <p className="text-sky-100 text-xs mt-1">{app.lecture.course_code}</p>
                )}
                <p className="text-sky-100 text-sm mt-1">
                    {app.lecture.instructor_name ? `${app.lecture.instructor_name} 강사님` : '강사 미정'}
                </p>
            </div>

            {/* 카드 본문 */}
            <div className="p-5">
                {/* 지원 메시지 */}
                {app.message && (
                    <div className="mb-3 p-2 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600">
                            <strong>지원 메시지:</strong> {app.message}
                        </p>
                    </div>
                )}

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                    {app.lecture.description || '강의 설명이 없습니다.'}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{new Date(app.created_at).toLocaleDateString()}</span>
                </div>

                {/* 버튼 */}
                {app.status === 'PENDING' && (
                    <button
                        onClick={() => handleCancelEnrollment(app.id, app.lecture.name)}
                        className="w-full bg-red-100 text-red-600 py-2.5 rounded-lg font-bold hover:bg-red-200 transition"
                    >
                        취소
                    </button>
                )}
            </div>
        </div>
    );

    // 승인 내역 카드 컴포넌트 (신청내역 확인 탭용)
    const ApprovalCard = ({ app }: { app: LectureApplication }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                        {app.lecture.level_display && (
                            <span className={`${getLevelColor(app.lecture.level || '')} text-xs font-bold px-3 py-1 rounded-full`}>
                                {app.lecture.level_display}
                            </span>
                        )}
                    </div>
                    {/* 승인여부 */}
                    <div className="text-right">
                        <div className="text-white text-xs mb-1">승인여부</div>
                        <span className={`text-4xl font-bold ${
                            app.status === 'APPROVED' ? 'text-white' :
                            app.status === 'REJECTED' ? 'text-red-200' :
                            'text-gray-300'
                        }`}>
                            {app.status === 'APPROVED' ? 'O' :
                             app.status === 'REJECTED' ? 'X' : '-'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {app.lecture.competency_type && (
                        <span className="text-2xl">{getCompetencyIcon(app.lecture.competency_type)}</span>
                    )}
                    <h3 className="text-white font-bold text-lg">{app.lecture.name}</h3>
                </div>
                {app.lecture.course_code && (
                    <p className="text-sky-100 text-xs mt-1">{app.lecture.course_code}</p>
                )}
            </div>

            {/* 카드 본문 */}
            <div className="p-5">
                {/* 상태 배지 */}
                <div className="mb-3">
                    {getStatusBadge(app.status)}
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
                    {app.lecture.description || '강의 설명이 없습니다.'}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>신청일: {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">강의 지원</h1>
                <p className="text-gray-600">강의를 지원하고 승인 상태를 확인하세요</p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button
                    onClick={() => setActiveTab('register')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'register' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    수강신청
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'wishlist' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    희망과목
                </button>
                <button
                    onClick={() => setActiveTab('enrolled')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'enrolled' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    신청내역 확인
                </button>
            </div>

            {/* [탭 1] 수강신청 */}
            {activeTab === 'register' && (
                <>
                    {/* 검색 & 필터 바 */}
                    <div className="mb-6 flex flex-wrap gap-3 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <input
                            type="text"
                            placeholder="강의명으로 검색"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 min-w-[200px] border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${filter === 'ALL' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setFilter('RECRUITING')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${filter === 'RECRUITING' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'}`}
                            >
                                모집 중
                            </button>
                        </div>
                    </div>

                    {/* 강의 카드 그리드 */}
                    {getFilteredLectures(lectures).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getFilteredLectures(lectures).map((lecture) => (
                                <LectureCard key={lecture.id} lecture={lecture} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-500 text-lg">지원 가능한 강의가 없습니다.</p>
                        </div>
                    )}
                </>
            )}

            {/* [탭 2] 희망과목 */}
            {activeTab === 'wishlist' && (
                <>
                    {wishlistLectures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistLectures.map((app) => (
                                <ApplicationCard key={app.id} app={app} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">지원한 강의가 없습니다.</p>
                        </div>
                    )}
                </>
            )}

            {/* [탭 3] 신청내역 확인 */}
            {activeTab === 'enrolled' && (
                <>
                    {enrolledLectures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {enrolledLectures.map((app) => (
                                <ApprovalCard key={app.id} app={app} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-gray-500 text-lg">신청 내역이 없습니다.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}