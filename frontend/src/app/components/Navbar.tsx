// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    // 유저 정보 로드 함수
    const loadUser = () => {
        const userData = localStorage.getItem('user');
        if (userData) {
            try {
                const parsedUser = JSON.parse(userData);
                // 이름이 있으면 이름(성+이름) 표시, 없으면 아이디 표시
                const fullName = `${parsedUser.last_name || ''}${parsedUser.first_name || ''}`;
                setUser(fullName.trim() ? fullName : parsedUser.username);
            } catch (e) {
                setUser(null);
            }
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        // 1. 초기 로드
        loadUser();

        // 2. 로그인/로그아웃 이벤트 리스너 등록
        window.addEventListener('authChange', loadUser);

        // 3. 클린업
        return () => {
            window.removeEventListener('authChange', loadUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        setUser(null);
        // 로그아웃 시에도 이벤트 발생시켜 상태 초기화
        window.dispatchEvent(new Event('authChange'));
        router.push('/login');
    };

    return (
        <nav className="bg-[#5B9BD5] text-white shadow-sm sticky top-0 z-50 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-14">
                    {/* 로고 */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
                        <div className="font-bold text-2xl tracking-wide flex items-center gap-1">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                            DORO
                        </div>
                    </div>

                    {/* 중앙 메뉴 */}
                    <div className="hidden md:flex space-x-12">
                        <Link href="/course-registration" className="hover:text-gray-200 text-sm font-medium">수강신청</Link>
                        <Link href="/dashboard" className="hover:text-gray-200 text-sm font-medium">대시보드</Link>
                        <Link href="/consultation" className="hover:text-gray-200 text-sm font-medium">상담페이지</Link>
                        <Link href="/mypage" className="hover:text-gray-200 text-sm font-medium">마이페이지</Link>
                    </div>

                    {/* 우측 상단 로그인/회원가입 링크 */}
                    <div className="text-xs flex gap-3 items-center min-w-[100px] justify-end">
                        {user ? (
                            <>
                                <span className="font-bold">{user}님</span>
                                <button onClick={handleLogout} className="hover:underline opacity-90">로그아웃</button>
                            </>
                        ) : (
                            <>
                                <Link href="/login" className="hover:underline">로그인</Link>
                                <span className="opacity-50">|</span>
                                <Link href="/signup" className="hover:underline">회원가입</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}