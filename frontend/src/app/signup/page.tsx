// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        email: '',
        last_name: '',  // 성
        first_name: '', // 이름
        birth: '',      // 생년월일
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/signup/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    email: formData.email,
                    last_name: formData.last_name,
                    first_name: formData.first_name,
                    birth: formData.birth || null, // 비어있으면 null 전송
                }),
            });

            if (res.ok) {
                alert("회원가입이 완료되었습니다! 로그인해주세요.");
                router.push('/login');
            } else {
                const data = await res.json();
                const msg = Object.values(data).flat().join('\n') || "가입 실패";
                alert(msg);
            }
        } catch (err) {
            console.error(err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-white py-10">
            <div className="w-full max-w-md px-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-700">회원가입</h2>
                    <p className="text-sm text-gray-400 mt-2">DORO LMS에 오신 것을 환영합니다.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">아이디 <span className="text-red-500">*</span></label>
                        <input name="username" type="text" required onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" />
                    </div>

                    <div className="flex gap-2">
                        <div className="w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-1">성</label>
                            <input name="last_name" type="text" onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" placeholder="홍" />
                        </div>
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
                            <input name="first_name" type="text" onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" placeholder="길동" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">생년월일</label>
                        <input name="birth" type="date" onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">이메일 <span className="text-red-500">*</span></label>
                        <input name="email" type="email" required onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 <span className="text-red-500">*</span></label>
                        <input name="password" type="password" required onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호 확인 <span className="text-red-500">*</span></label>
                        <input name="confirmPassword" type="password" required onChange={handleChange} className="w-full border border-gray-300 p-3 text-sm rounded focus:border-sky-500 outline-none" />
                    </div>

                    <button type="submit" className="w-full bg-sky-600 text-white py-3 rounded font-bold hover:bg-sky-700 transition mt-6">
                        가입하기
                    </button>
                </form>
            </div>
        </div>
    );
}