// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// [수정] 인터페이스를 instructor_name으로 변경
interface Lecture {
    id: number;
    name: string;
    instructor_name: string; // teacher_name -> instructor_name
    status: 'RECRUITING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
    room?: string;
    day_time?: string;
}

interface EnrollmentData {
    lecture: Lecture;
    joined_at: string;
}

interface Notice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    category?: string;
    type?: 'system' | 'lecture';
    lecture?: number;
}

export default function DashboardPage() {
    const router = useRouter();
    const [enrolledCourses, setEnrolledCourses] = useState<EnrollmentData[]>([]);
    const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const headers = { 'Authorization': `Bearer ${token}` };

                // 1. 내 수업 목록
                const courseRes = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses/', { headers });
                if (courseRes.ok) setEnrolledCourses(await courseRes.json());

                // 2. 공지사항 (최신 5개)
                const noticeRes = await fetch('http://127.0.0.1:8000/api/dashboard/notices/', { headers });
                if (noticeRes.ok) {
                    const data = await noticeRes.json();
                    setRecentNotices(data.slice(0, 5));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    // 종료된 수업(CLOSED)은 제외
    const activeCourses = enrolledCourses.filter(item => item.lecture.status !== 'CLOSED');

    // 상태 뱃지 (텍스트 일부 수정 가능)
    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS':
                return <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">수업 진행 중</span>;
            case 'OPEN':
                return <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">수강 신청 중</span>;
            case 'RECRUITING':
                return <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-2 py-1 rounded">강사 배정 중</span>;
            default:
                return null;
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2">대시보드</h1>

            <div className="flex flex-col lg:flex-row gap-6 h-[600px]">

                {/* [좌측] 수강 중인 수업 리스트 */}
                <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                    <div className="flex justify-between items-end mb-4 px-1">
                        <h2 className="text-lg font-bold text-gray-700">나의 수업 목록</h2>
                        <span className="text-sm text-gray-500">총 {activeCourses.length}개의 수업이 진행 중입니다.</span>
                    </div>

                    <div className="space-y-4">
                        {activeCourses.length > 0 ? activeCourses.map((item) => (
                            <div
                                key={item.lecture.id}
                                onClick={() => router.push(`/dashboard/courses/${item.lecture.id}/management`)}
                                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-sky-300 cursor-pointer transition flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* 아이콘 */}
                                    <div className="w-12 h-12 bg-sky-50 rounded-full flex items-center justify-center text-sky-300 group-hover:text-sky-600 group-hover:bg-sky-100 transition">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    </div>

                                    {/* 텍스트 정보 */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-sky-600 transition">
                                                {item.lecture.name}
                                            </h3>
                                            {getStatusBadge(item.lecture.status)}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {/* [수정] instructor_name 사용 및 '강사님' 호칭 적용 */}
                                            {item.lecture.instructor_name
                                                ? `${item.lecture.instructor_name} 강사님`
                                                : '강사 미정'}
                                            {item.lecture.day_time && ` | ${item.lecture.day_time}`}
                                        </p>
                                    </div>
                                </div>

                                {/* 화살표 */}
                                <div className="text-gray-300 group-hover:text-sky-500 transition">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            </div>
                        )) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400 border rounded-xl bg-white h-full">
                                <p className="mb-2 text-lg">수강 중인 수업이 없습니다.</p>
                                <button onClick={() => router.push('/course-registration')} className="text-sm text-sky-600 underline hover:text-sky-800">
                                    수강신청 하러 가기
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* [우측] 공지사항 (기존 유지) */}
                <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
                    <div className="mb-4 border-b pb-3 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-sky-600 flex items-center gap-2">
                            <span>📢</span> 최근 알림
                        </h2>
                    </div>

                    <div className="flex-grow overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {recentNotices.length > 0 ? recentNotices.map((notice) => (
                            <div
                                key={`${notice.type}-${notice.id}`}
                                onClick={() => router.push(notice.type === 'system' ? `/dashboard/notices/${notice.id}` : `/dashboard/courses/${notice.lecture}/notices/${notice.id}`)}
                                className="p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 cursor-pointer group"
                            >
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className={`font-bold px-1.5 py-0.5 rounded ${notice.type === 'system' ? 'bg-red-100 text-red-600' : 'bg-sky-100 text-sky-600'}`}>
                                        {notice.category || '공지'}
                                    </span>
                                    <span className="text-gray-400">{new Date(notice.created_at).toLocaleDateString()}</span>
                                </div>
                                <h3 className="text-sm font-medium text-gray-800 group-hover:text-sky-600 line-clamp-1">{notice.title}</h3>
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{notice.content}</p>
                            </div>
                        )) : (
                            <p className="text-center text-gray-400 py-10 text-sm">등록된 공지사항이 없습니다.</p>
                        )}
                    </div>

                    <div className="mt-auto pt-4 border-t text-right">
                        <button
                            onClick={() => router.push('/dashboard/notices')}
                            className="text-sm text-gray-500 font-bold hover:text-sky-600 hover:underline flex items-center justify-end gap-1 ml-auto"
                        >
                            전체 공지 보기
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}