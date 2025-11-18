// app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<string | null>(null);

    useEffect(() => {
        // 클라이언트 사이드에서만 실행
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData).username);
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        router.push('/login');
    };

    return (
        <nav className="bg-sky-500 text-white shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* 로고 */}
                    <div className="flex-shrink-0 flex items-center gap-2 cursor-pointer" onClick={() => router.push('/dashboard')}>
                        <div className="font-black text-2xl tracking-wider">DORO</div>
                    </div>

                    {/* 중앙 메뉴 */}
                    <div className="hidden md:flex space-x-8">
                        <Link href="/course-registration" className="hover:text-sky-100 font-medium text-sm">수강신청</Link>
                        <Link href="/dashboard" className="hover:text-sky-100 font-medium text-sm">대시보드</Link>
                        <Link href="/consultation" className="hover:text-sky-100 font-medium text-sm">상담페이지</Link>
                        <Link href="/mypage" className="hover:text-sky-100 font-medium text-sm">마이페이지</Link>
                    </div>

                    {/* 우측 정보 */}
                    <div>
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm font-medium">{user}님</span>
                                <button
                                    onClick={handleLogout}
                                    className="bg-white text-sky-600 text-xs px-3 py-1.5 rounded font-bold hover:bg-gray-100 transition"
                                >
                                    로그아웃
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="bg-white text-sky-600 text-xs px-3 py-1.5 rounded font-bold hover:bg-gray-100 transition">
                                로그인
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}