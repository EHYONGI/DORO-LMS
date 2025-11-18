'use client'; // 이 페이지는 클라이언트(브라우저)에서 동작함 (입력값 처리 등)

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState(''); // 성공/실패 메시지 표시용
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault(); // 폼 제출 시 새로고침 방지
        setMessage('로그인 시도 중...');

        try {
            // 1. Django 백엔드로 데이터 전송 (POST 요청)
            const res = await fetch('http://127.0.0.1:8000/api/user/login/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password,
                }),
            });

            // 2. 응답 확인
            const data = await res.json();

            if (res.ok) {
                // 1. 정보 저장
                localStorage.setItem('user', JSON.stringify(data.user));

                localStorage.setItem('access_token', data.token.access);
                localStorage.setItem('refresh_token', data.token.refresh);

                alert(`환영합니다, ${data.user.username}님!`);
                router.push('/dashboard');
            } else {
                setMessage(`실패: ${data.error || '로그인 정보를 확인하세요.'}`);
            }
        } catch (error) {
            console.error('에러 발생:', error);
            setMessage('서버와 연결할 수 없습니다.');
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded shadow-md">
                <h2 className="text-2xl font-bold text-center text-gray-900">로그인</h2>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">아이디</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-black"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">비밀번호</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 mt-1 border rounded-md focus:outline-none focus:ring focus:ring-blue-300 text-black"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none"
                    >
                        로그인 하기
                    </button>
                </form>

                {/* 결과 메시지 출력 공간 */}
                {message && (
                    <div className="p-3 text-sm text-center text-blue-800 bg-blue-100 rounded">
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
}