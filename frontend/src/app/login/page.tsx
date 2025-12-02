'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { API_BASE_URL } from '@/lib/api';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        try {
            const res = await fetch(`${API_BASE_URL}/api/user/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // 1) 토큰 / 유저 정보 저장
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('access_token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);

                // 2) Navbar 등 업데이트
                window.dispatchEvent(new Event('authChange'));

                // 3) role 체크
                const r = data.user.role;

                const isTeacher =
                    r === 2 ||
                    r === '2' ||
                    r === 'TEACHER' ||
                    r === 'teacher' ||
                    r === 'INSTRUCTOR';

                if (isTeacher) {
                    router.push('/teacher/dashboard');
                } else {
                    router.push('/student/dashboard');
                }
            } else {
                setError(data.error || '아이디 또는 비밀번호를 확인해주세요.');
            }
        } catch (err) {
            console.log(err);
            setError('서버에 연결할 수 없습니다.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-full max-w-lg px-8">
                <div className="flex justify-center mb-10">
                    <div className="bg-gray-100 border border-gray-300 px-12 py-2 rounded-md shadow-sm">
                        <h2 className="text-xl font-bold text-gray-600 tracking-widest">
                            로 그 인
                        </h2>
                    </div>
                </div>

                <form
                    onSubmit={handleLogin}
                    className="bg-white border border-gray-300 rounded-lg px-10 py-8 shadow-sm"
                >
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            아이디
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm"
                            placeholder="아이디를 입력하세요"
                            required
                        />
                    </div>

                    <div className="mb-6">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">
                            비밀번호
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-sm px-3 py-2 text-sm"
                            placeholder="비밀번호를 입력하세요"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-[#4b5563] hover:bg-[#374151] text-white font-semibold py-2 rounded-sm text-sm mb-4"
                    >
                        로그인
                    </button>

                    {error && (
                        <p className="text-red-500 text-xs text-center mb-4">{error}</p>
                    )}

                    <div className="flex justify-between text-xs text-gray-500 border-t border-gray-300 pt-3">
                        <Link href="/find-password" className="hover:text-gray-800">
                            아이디/비밀번호 찾기
                        </Link>
                        <Link href="/signup" className="hover:text-gray-800 font-medium">
                            회원가입
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
