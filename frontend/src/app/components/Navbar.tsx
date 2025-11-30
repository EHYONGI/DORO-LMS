// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'student' | 'teacher' | null;

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(null);

    // 유저 정보 로드 함수
    const loadUser = () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            setUser(null);
            setRole(null);
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);

            // 이름 표시
            const fullName = `${parsedUser.last_name || ''}${parsedUser.first_name || ''}`;
            setUser(fullName.trim() ? fullName : parsedUser.username);

            // role 정규화 (숫자/문자 둘 다 올 수 있음)
            const rawRole = parsedUser.role as number | string | null | undefined;

            let numericRole: number | null = null;
            if (typeof rawRole === 'number') {
                numericRole = rawRole;
            } else if (typeof rawRole === 'string' && /^[0-9]+$/.test(rawRole)) {
                numericRole = parseInt(rawRole, 10);
            }

            const stringRole =
                typeof rawRole === 'string' && !/^[0-9]+$/.test(rawRole)
                    ? rawRole.toUpperCase()
                    : null;

            const isTeacher =
                numericRole === 2 || // 2 = Instructor
                stringRole === 'TEACHER' ||
                stringRole === 'INSTRUCTOR';

            setRole(isTeacher ? 'teacher' : 'student');
        } catch (e) {
            console.error('Navbar user 파싱 오류:', e);
            setUser(null);
            setRole(null);
        }
    };

    useEffect(() => {
        loadUser();
        window.addEventListener('authChange', loadUser);
        return () => {
            window.removeEventListener('authChange', loadUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        setRole(null);
        window.dispatchEvent(new Event('authChange'));
        router.push('/login');
    };

    // ✅ 각 메뉴별 링크 경로 (student / teacher 분리)
    const dashboardHref =
        role === 'teacher'
            ? '/teacher/dashboard'
            : role === 'student'
            ? '/student/dashboard'
            : '/login';

    const courseHref =
        role === 'teacher'
            ? '/teacher/course'
            : role === 'student'
            ? '/student/course'
            : '/login';

    const consultationHref =
        role === 'teacher'
            ? '/teacher/consultation'
            : role === 'student'
            ? '/student/consultation'
            : '/login';

    // teacher 쪽 mypage 폴더 아직 없으면 나중에 만들거나 경로 바꿔도 됨
    const mypageHref =
        role === 'teacher'
            ? '/teacher/mypage'
            : role === 'student'
            ? '/student/mypage'
            : '/login';

    return (
        <nav className="bg-[#5B9BD5] text-white shadow-sm sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* 로고 (홈으로) */}
                    <div
                        className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <div className="font-bold text-2xl tracking-wide flex items-center gap-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                            DORO
                        </div>
                    </div>

                    {/* 중앙 메뉴 */}
                    <div className="hidden md:flex space-x-12">
                        <Link href={courseHref} className="hover:text-gray-200 text-sm font-medium">
                            수강신청
                        </Link>
                        <Link href={dashboardHref} className="hover:text-gray-200 text-sm font-medium">
                            대시보드
                        </Link>
                        <Link href={consultationHref} className="hover:text-gray-200 text-sm font-medium">
                            상담페이지
                        </Link>
                        <Link href={mypageHref} className="hover:text-gray-200 text-sm font-medium">
                            마이페이지
                        </Link>
                    </div>

                    {/* 우측 로그인 / 로그아웃 */}
                    <div className="text-xs flex gap-3 items-center min-w-[100px] justify-end">
                        {user ? (
                            <>
                                <span className="text-white font-medium">{user}님</span>
                                {role === 'teacher' && (
                                    <span className="px-2 py-[2px] text-[10px] border border-white/60 rounded-full">
                                        강사
                                    </span>
                                )}
                                <button onClick={handleLogout} className="hover:text-gray-200">
                                    로그아웃
                                </button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hover:text-gray-200">
                                    로그인
                                </Link>
                                <span className="text-gray-300">|</span>
                                <Link href="/signup" className="hover:text-gray-200">
                                    회원가입
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
