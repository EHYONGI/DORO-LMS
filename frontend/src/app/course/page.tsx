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

export default function CourseRegistrationPage() {
    const router = useRouter();
    const [lectures, setLectures] = useState<Lecture[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RECRUITING'>('ALL');

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        const fetchLectures = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/courses', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setLectures(data);
                } else {
                    console.error('강의 목록 로딩 실패');
                }
            } catch (error) {
                console.error('서버 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLectures();
    }, [router]);

    // 수강신청 핸들러
    const handleEnroll = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

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
                window.location.reload();
            } else {
                const error = await res.json();
                alert(error.error || '수강신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('수강신청 오류:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 필터링된 강의 목록
    const filteredLectures = lectures.filter(lecture => {
        if (filter === 'ALL') return lecture.status !== 'CLOSED';
        return lecture.status === filter;
    });

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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-500">강의 목록을 불러오는 중...</p>
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

            {/* 필터 버튼 */}
            <div className="flex gap-3 mb-6 border-b border-gray-200 pb-4">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                        filter === 'ALL'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    전체
                </button>
                <button
                    onClick={() => setFilter('OPEN')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                        filter === 'OPEN'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    수강신청 가능
                </button>
                <button
                    onClick={() => setFilter('RECRUITING')}
                    className={`px-5 py-2 rounded-lg font-medium text-sm transition ${
                        filter === 'RECRUITING'
                            ? 'bg-sky-600 text-white shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                    강사 배정 중
                </button>
            </div>

            {/* 강의 목록 */}
            {filteredLectures.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredLectures.map((lecture) => (
                        <div
                            key={lecture.id}
                            className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden"
                        >
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

                                {/* 수강신청 버튼 */}
                                {lecture.status === 'OPEN' && lecture.enrolled_count < lecture.capacity ? (
                                    <button
                                        onClick={() => handleEnroll(lecture.id)}
                                        className="w-full bg-sky-600 text-white py-2.5 rounded-lg font-bold hover:bg-sky-700 transition shadow-sm"
                                    >
                                        수강신청
                                    </button>
                                ) : lecture.status === 'OPEN' && lecture.enrolled_count >= lecture.capacity ? (
                                    <button
                                        disabled
                                        className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed"
                                    >
                                        정원 마감
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed"
                                    >
                                        신청 불가
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                    <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500 text-lg">현재 수강신청 가능한 강의가 없습니다.</p>
                </div>
            )}
        </div>
    );
}