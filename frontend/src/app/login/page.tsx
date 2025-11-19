// app/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/login/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // 1. 데이터 저장
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('access_token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);

                // 2. [중요] 로그인 상태 변경 이벤트 발생 (Navbar 갱신용)
                window.dispatchEvent(new Event('authChange'));

                router.push('/dashboard');
            } else {
                setError(data.error || '로그인 정보를 확인해주세요.');
            }
        } catch (err) {
            setError('서버와 연결할 수 없습니다.');
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
            <div className="w-full max-w-lg px-8">

                {/* 로그인 타이틀 박스 */}
                <div className="flex justify-center mb-10">
                    <div className="bg-gray-100 border border-gray-300 px-12 py-2 rounded-md shadow-sm">
                        <h2 className="text-xl font-bold text-gray-600 tracking-widest">로 그 인</h2>
                    </div>
                </div>

                <form onSubmit={handleLogin}>
                    {/* 입력창 + 버튼 레이아웃 */}
                    <div className="flex gap-2 mb-3">
                        {/* 좌측: 입력 필드들 */}
                        <div className="flex-1 flex flex-col gap-2">
                            <input
                                type="text"
                                placeholder="ID"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-sky-500"
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full border border-gray-300 p-3 text-sm outline-none focus:border-sky-500"
                            />
                        </div>
                        {/* 우측: 로그인 버튼 */}
                        <button
                            type="submit"
                            className="bg-[#EAEAEA] border border-gray-300 text-gray-600 w-24 font-bold hover:bg-gray-200 transition shadow-sm"
                        >
                            로그인
                        </button>
                    </div>

                    {/* 로그인 상태 유지 체크박스 */}
                    <div className="flex items-center mb-6">
                        <input type="checkbox" id="keep-logged-in" className="mr-2 w-3 h-3" />
                        <label htmlFor="keep-logged-in" className="text-xs text-gray-500 cursor-pointer">로그인 상태 유지</label>
                    </div>

                    {/* 에러 메시지 */}
                    {error && <p className="text-red-500 text-xs text-center mb-4">{error}</p>}

                    {/* 하단 링크 */}
                    <div className="flex justify-between text-xs text-gray-500 border-t border-gray-300 pt-3">
                        <Link href="/find-password" className="hover:text-gray-800">아이디/비밀번호 찾기</Link>
                        <Link href="/signup" className="hover:text-gray-800 font-medium">회원가입</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}