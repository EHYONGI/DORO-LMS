// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image'; // [추가] 이미지 컴포넌트 임포트
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

type UserRole = 'student' | 'teacher' | 'manager' | null;

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);
    const [role, setRole] = useState<UserRole>(null);

    // ... (loadUser 함수 및 useEffect 등 기존 로직은 그대로 유지) ...
    const loadUser = () => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            setUser(null);
            setRole(null);
            return;
        }

        try {
            const parsedUser = JSON.parse(userData);
            const fullName = `${parsedUser.last_name || ''}${parsedUser.first_name || ''}`;
            setUser(fullName.trim() ? fullName : parsedUser.username);

            const rawRole = parsedUser.role as number | string | null | undefined;
            let numericRole: number | null = null;
            if (typeof rawRole === 'number') {
                numericRole = rawRole;
            } else if (typeof rawRole === 'string' && /^[0-9]+$/.test(rawRole)) {
                numericRole = parseInt(rawRole, 10);
            }
            const stringRole = typeof rawRole === 'string' && !/^[0-9]+$/.test(rawRole) ? rawRole.toUpperCase() : null;

            const isManager = numericRole === 0 || stringRole === 'MANAGER';
            const isTeacher = numericRole === 2 || stringRole === 'TEACHER' || stringRole === 'INSTRUCTOR';

            if (isManager) setRole('manager');
            else if (isTeacher) setRole('teacher');
            else setRole('student');
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

    const dashboardHref = role === 'manager' ? '/manager/dashboard' : role === 'teacher' ? '/teacher/dashboard' : role === 'student' ? '/student/dashboard' : '/login';
    const courseHref = role === 'manager' ? '/manager/course' : role === 'teacher' ? '/teacher/course' : role === 'student' ? '/student/course' : '/login';
    const consultationHref = role === 'teacher' ? '/teacher/consultation' : role === 'student' ? '/student/consultation' : '/login';
    const mypageHref = role === 'manager' ? '/manager/mypage' : role === 'teacher' ? '/teacher/mypage' : role === 'student' ? '/student/mypage' : '/login';

    return (
        <nav className="bg-[#5B9BD5] text-white shadow-sm sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">

                    <div
                        className="flex-shrink-0 flex items-center cursor-pointer"
                        onClick={() => router.push('/')}
                    >
                        <Image
                            src="/logo.png"
                            alt="DORO Logo"
                            width={100}
                            height={40}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* 중앙 메뉴 */}
                    <div className="hidden md:flex space-x-12">
                        <Link href={courseHref} className="hover:text-gray-200 text-sm font-medium">
                            수강신청
                        </Link>
                        <Link href={dashboardHref} className="hover:text-gray-200 text-sm font-medium">
                            대시보드
                        </Link>

                        {/* 매니저가 아닐 때만 상담페이지 링크 표시 */}
                        {role !== 'manager' && (
                            <Link href={consultationHref} className="hover:text-gray-200 text-sm font-medium">
                                상담페이지
                            </Link>
                        )}

                        <Link href={mypageHref} className="hover:text-gray-200 text-sm font-medium">
                            마이페이지
                        </Link>
                    </div>

                    {/* 우측 로그인 / 로그아웃 */}
                    <div className="text-xs flex gap-3 items-center min-w-[100px] justify-end">
                        {user ? (
                            <>
                                <span className="text-white font-medium">{user}님</span>
                                {role === 'teacher' && <span className="px-2 py-[2px] text-[10px] border border-white/60 rounded-full">강사</span>}
                                {role === 'manager' && <span className="px-2 py-[2px] text-[10px] border border-white/60 rounded-full bg-yellow-500 border-none text-white">관리자</span>}
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