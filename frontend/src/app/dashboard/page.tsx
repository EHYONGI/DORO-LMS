'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// 1. 데이터 타입 정의 (백엔드에서 받을 모양)
interface Course {
    id: number;
    title: string;
    instructor: string;
}

interface Notice {
    id: number;
    title: string;
    content: string;
    date: string;
}

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<string>('');

    // 실제 연동 시 사용할 상태값 (지금은 더미 데이터 사용)
    const [courses, setCourses] = useState<Course[]>([]);
    const [notice, setNotice] = useState<Notice | null>(null);

    // 2. 초기 데이터 로드 (로그인 체크 및 데이터 가져오기)
    useEffect(() => {
        // (1) 로그인 여부 체크
        const userData = localStorage.getItem('user');
        if (!userData) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }
        setUser(JSON.parse(userData).username || '사용자');

        // (2) 백엔드에서 데이터 가져오기 (나중에 주석 해제해서 사용!)
        /*
        const fetchData = async () => {
          try {
            // 강의 목록 가져오기
            const courseRes = await fetch('http://127.0.0.1:8000/api/lecture/my-courses/');
            const courseData = await courseRes.json();
            setCourses(courseData);
    
            // 공지사항 가져오기
            const noticeRes = await fetch('http://127.0.0.1:8000/api/notice/recent/');
            const noticeData = await noticeRes.json();
            setNotice(noticeData);
          } catch (err) {
            console.error("데이터 로딩 실패", err);
          }
        };
        fetchData();
        */

        // (3) 더미 데이터 (UI 확인용, 백엔드 연동 전까지 사용)
        setCourses([
            { id: 1, title: '데이터베이스 기초', instructor: '김철수 교수' },
            { id: 2, title: '인공지능 개론', instructor: '이영희 교수' },
            { id: 3, title: '웹 프로그래밍', instructor: '박민수 교수' },
            { id: 4, title: '알고리즘', instructor: '최지훈 교수' },
        ]);

        setNotice({
            id: 1,
            title: '[전체 공지] 1학기 중간고사 일정 안내',
            content: '2025년 10월 28일(화)에 중간고사가 진행됩니다. 각 과목별 세부 일정은 "과목별 공지사항"에서 확인해주세요.',
            date: '2025년 10월 15일 오전 10:00'
        });

    }, [router]);

    // 3. 로그아웃 처리
    const handleLogout = () => {
        localStorage.removeItem('user'); // 저장된 정보 삭제
        alert('로그아웃 되었습니다.');
        router.push('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* === 상단 네비게이션 바 === */}
            <nav className="bg-sky-600 text-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* 로고 */}
                        <div className="flex-shrink-0 font-bold text-2xl tracking-wider">
                            DORO
                        </div>

                        {/* 메뉴 링크들 */}
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link href="/course-registration" className="hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium">수강신청</Link>
                                <Link href="/dashboard" className="bg-sky-700 px-3 py-2 rounded-md text-sm font-medium">대시보드</Link>
                                <Link href="/consultation" className="hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium">상담페이지</Link>
                                <Link href="/mypage" className="hover:bg-sky-500 px-3 py-2 rounded-md text-sm font-medium">마이페이지</Link>
                            </div>
                        </div>

                        {/* 로그아웃 버튼 */}
                        <div>
                            <button
                                onClick={handleLogout}
                                className="text-xs bg-sky-700 hover:bg-sky-800 px-3 py-1 rounded-full transition"
                            >
                                로그아웃
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* === 메인 콘텐츠 영역 === */}
            <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">

                {/* 페이지 제목 */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-200 pb-4">
                    대시보드
                </h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* [좌측] 수강 과목 리스트 (2칸 차지) */}
                    <div className="lg:col-span-2 space-y-4">
                        {courses.map((course) => (
                            <div key={course.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center justify-between hover:shadow-md transition cursor-pointer">
                                <div className="flex items-center space-x-4">
                                    {/* 프로필 아이콘 (회색 원) */}
                                    <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A7.5 7.5 0 0 1 4.501 20.118Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-800">{course.title}</h2>
                                        <p className="text-sm text-gray-500">{course.instructor}</p>
                                    </div>
                                </div>

                                {/* 더보기 메뉴 아이콘 (점 3개) */}
                                <button className="text-gray-400 hover:text-gray-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* [우측] 중요 공지 (1칸 차지) */}
                    <div className="lg:col-span-1">
                        <div className="bg-white h-full rounded-lg shadow-sm border border-gray-200 p-6 relative min-h-[300px]">
                            <h3 className="text-xl font-bold text-sky-600 mb-6">중요 공지</h3>

                            {notice ? (
                                <div>
                                    <h4 className="font-bold text-gray-800 text-lg mb-2">{notice.title}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4">
                                        {notice.content}
                                    </p>
                                    <p className="text-xs text-gray-400">{notice.date}</p>
                                </div>
                            ) : (
                                <p className="text-gray-500">등록된 공지사항이 없습니다.</p>
                            )}

                            <div className="absolute bottom-6 right-6">
                                <Link href="/notice" className="text-sm font-bold text-gray-800 hover:underline">
                                    [더보기]
                                </Link>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}