// app/find-password/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function FindPasswordPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/password/reset/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (res.ok) {
                alert("해당 이메일로 임시 비밀번호가 전송되었습니다."); // 실제 메일 서버가 없으면 콘솔(백엔드 로그)에 뜸
                router.push('/login');
            } else {
                const data = await res.json();
                setMessage(data.error || "일치하는 회원을 찾을 수 없습니다.");
            }
        } catch (err) {
            setMessage("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white">
            <div className="w-full max-w-md px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-700">비밀번호 찾기</h2>
                    <p className="text-sm text-gray-400 mt-2">가입 시 등록한 이메일을 입력해주세요.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            placeholder="이메일 주소"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none"
                        />
                    </div>

                    {message && <p className="text-red-500 text-sm text-center">{message}</p>}

                    <button
                        type="submit"
                        className="w-full bg-gray-700 text-white py-3 rounded font-bold hover:bg-gray-800 transition"
                    >
                        임시 비밀번호 발송
                    </button>
                </form>

                <div className="text-center mt-4">
                    <button onClick={() => router.back()} className="text-sm text-gray-500 hover:underline">
                        뒤로가기
                    </button>
                </div>
            </div>
        </div>
    );
}