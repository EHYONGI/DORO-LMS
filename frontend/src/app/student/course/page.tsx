// app/course/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lecture {
    id: number;
    name: string;
    description: string;
    instructor_name: string;
    capacity: number;
    enrolled_count: number;
    day_time: string;
    status: 'OPEN' | 'RECRUITING' | 'IN_PROGRESS' | 'CLOSED';
}

interface Enrollment {
    id: number;
    lecture: Lecture;
    joined_at: string;
}

export default function CourseRegistrationPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'register' | 'recommend' | 'wishlist' | 'enrolled'>('register');
    
    // 데이터 상태
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [recommendedLectures, setRecommendedLectures] = useState<Lecture[]>([]);
    const [wishlistLectures, setWishlistLectures] = useState<Lecture[]>([]);
    const [enrolledLectures, setEnrolledLectures] = useState<Enrollment[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RECRUITING'>('ALL');
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
                const res = await fetch('http://127.0.0.1:8000/api/courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setLectures(await res.json());
            } 
            else if (activeTab === 'recommend') {
                // 추천 강의 목록
                const res = await fetch('http://127.0.0.1:8000/api/courses/recommend', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setRecommendedLectures(await res.json());
            } 
            else if (activeTab === 'wishlist') {
                // 관심 강의 목록
                const res = await fetch('http://127.0.0.1:8000/api/courses/wishlist', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) setWishlistLectures(await res.json());
            } 
            else if (activeTab === 'enrolled') {
                // 신청 내역 (대시보드 API 재사용)
                const res = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses', {
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

    // 수강신청 핸들러
    const handleEnroll = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/enroll`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('수강신청이 완료되었습니다!');
                fetchData();
            } else {
                const error = await res.json();
                alert(error.error || '수강신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('수강신청 오류:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 관심 강의 추가
    const handleAddWishlist = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                alert('관심 강의에 추가되었습니다!');
            } else {
                const error = await res.json();
                alert(error.error || '추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('관심 강의 추가 오류:', error);
        }
    };

    // 관심 강의 삭제
    const handleRemoveWishlist = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert('관심 강의에서 삭제되었습니다.');
                fetchData();
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('관심 강의 삭제 오류:', error);
        }
    };

    // 필터링 및 검색
    const getFilteredLectures = (lectureList: Lecture[]) => {
        let filtered = lectureList;

        // 상태 필터
        if (filter === 'OPEN') {
            filtered = filtered.filter(l => l.status === 'OPEN');
        } else if (filter === 'RECRUITING') {
            filtered = filtered.filter(l => l.status === 'RECRUITING');
        } else {
            filtered = filtered.filter(l => l.status !== 'CLOSED');
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
            case 'OPEN':
                return <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">수강신청 가능</span>;
            case 'RECRUITING':
                return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">강사 배정 중</span>;
            case 'IN_PROGRESS':
                return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">진행 중</span>;
            case 'CLOSED':
                return <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">마감</span>;
            default:
                return null;
        }
    };

    // 강의 카드 컴포넌트
    const LectureCard = ({ lecture, showWishlistBtn = false, showRemoveBtn = false }: { lecture: Lecture; showWishlistBtn?: boolean; showRemoveBtn?: boolean }) => (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
            {/* 카드 헤더 */}
            <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-4">
                <div className="flex justify-between items-start mb-2">
                    {getStatusBadge(lecture.status)}
                    <span className="text-white text-xs font-medium">
                        {lecture.enrolled_count} / {lecture.capacity}명
                    </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-1">{lecture.name}</h3>
                <p className="text-sky-100 text-sm">
                    {lecture.instructor_name ? `${lecture.instructor_name} 강사님` : '강사 미정'}
                </p>
            </div>

            {/* 카드 본문 */}
            <div className="p-5">
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
                    {/* 수강신청 버튼 */}
                    {lecture.status === 'OPEN' && lecture.enrolled_count < lecture.capacity ? (
                        <button
                            onClick={() => handleEnroll(lecture.id)}
                            className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-bold hover:bg-sky-700 transition shadow-sm"
                        >
                            수강신청
                        </button>
                    ) : lecture.status === 'OPEN' && lecture.enrolled_count >= lecture.capacity ? (
                        <button disabled className="flex-1 bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed">
                            정원 마감
                        </button>
                    ) : (
                        <button disabled className="flex-1 bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed">
                            신청 불가
                        </button>
                    )}

                    {/* 관심 강의 추가 버튼 */}
                    {showWishlistBtn && (
                        <button
                            onClick={() => handleAddWishlist(lecture.id)}
                            className="px-4 py-2.5 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition"
                            title="관심 강의 추가"
                        >
                            ♡
                        </button>
                    )}

                    {/* 관심 강의 삭제 버튼 */}
                    {showRemoveBtn && (
                        <button
                            onClick={() => handleRemoveWishlist(lecture.id)}
                            className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-bold"
                        >
                            삭제
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">로딩 중...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* 헤더 */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">수강신청</h1>
                <p className="text-gray-600">원하는 강의를 선택하여 수강신청하세요.</p>
            </div>

            {/* 탭 네비게이션 */}
            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button
                    onClick={() => setActiveTab('register')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'register' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    강의 목록
                </button>
                <button
                    onClick={() => setActiveTab('recommend')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'recommend' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    강의 추천
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'wishlist' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    관심 강의
                </button>
                <button
                    onClick={() => setActiveTab('enrolled')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                        ${activeTab === 'enrolled' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                    신청 내역
                </button>
            </div>

            {/* [탭 1] 수강신청 - 강의 목록 */}
            {activeTab === 'register' && (
                <>
                    {/* 검색 & 필터 바 */}
                    <div className="mb-6 flex flex-wrap gap-3 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <input
                            type="text"
                            placeholder="강의명 또는 강사명으로 검색"
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            className="flex-1 min-w-[200px] border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFilter('ALL')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    filter === 'ALL' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                전체
                            </button>
                            <button
                                onClick={() => setFilter('OPEN')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    filter === 'OPEN' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                신청 가능
                            </button>
                            <button
                                onClick={() => setFilter('RECRUITING')}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                                    filter === 'RECRUITING' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                                }`}
                            >
                                모집 중
                            </button>
                        </div>
                    </div>

                    {/* 강의 카드 그리드 */}
                    {getFilteredLectures(lectures).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {getFilteredLectures(lectures).map((lecture) => (
                                <LectureCard key={lecture.id} lecture={lecture} showWishlistBtn={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                        </div>
                    )}
                </>
            )}

            {/* [탭 2] 강의 추천 */}
            {activeTab === 'recommend' && (
                <>
                    <div className="mb-6 bg-sky-50 border border-sky-200 rounded-lg p-4">
                        <p className="text-sm text-sky-700">
                            <strong>💡 관심분야 기반 추천</strong> - 회원님의 관심분야를 바탕으로 맞춤 강의를 추천합니다.
                        </p>
                    </div>

                    {recommendedLectures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recommendedLectures.map((lecture) => (
                                <LectureCard key={lecture.id} lecture={lecture} showWishlistBtn={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <p className="text-gray-500 text-lg">추천 강의가 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-2">마이페이지에서 관심분야를 설정해보세요!</p>
                        </div>
                    )}
                </>
            )}

            {/* [탭 3] 관심 강의 */}
            {activeTab === 'wishlist' && (
                <>
                    {wishlistLectures.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlistLectures.map((lecture) => (
                                <LectureCard key={lecture.id} lecture={lecture} showRemoveBtn={true} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            <p className="text-gray-500 text-lg">관심 강의가 없습니다.</p>
                            <p className="text-sm text-gray-400 mt-2">강의 목록에서 ♡ 버튼을 눌러 추가해보세요!</p>
                        </div>
                    )}
                </>
            )}

            {/* [탭 4] 신청 내역 */}
            {activeTab === 'enrolled' && (
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr className="text-gray-700">
                                <th className="py-3 px-4 text-left font-medium">강의명</th>
                                <th className="py-3 px-4 text-center font-medium">강사</th>
                                <th className="py-3 px-4 text-center font-medium">수업 시간</th>
                                <th className="py-3 px-4 text-center font-medium">신청일</th>
                                <th className="py-3 px-4 text-center font-medium">상태</th>
                                <th className="py-3 px-4 text-center font-medium">관리</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {enrolledLectures.length > 0 ? enrolledLectures.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="py-4 px-4 font-medium text-gray-800">{item.lecture.name}</td>
                                    <td className="py-4 px-4 text-center text-gray-600">
                                        {item.lecture.instructor_name || '강사 미정'}
                                    </td>
                                    <td className="py-4 px-4 text-center text-gray-600">
                                        {item.lecture.day_time || '-'}
                                    </td>
                                    <td className="py-4 px-4 text-center text-gray-400 text-xs">
                                        {new Date(item.joined_at).toLocaleDateString()}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        {getStatusBadge(item.lecture.status)}
                                    </td>
                                    <td className="py-4 px-4 text-center">
                                        <button
                                            onClick={() => router.push(`/dashboard/courses/${item.lecture.id}/management`)}
                                            className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                                        >
                                            강의실 입장
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-gray-400">
                                        신청한 강의가 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}