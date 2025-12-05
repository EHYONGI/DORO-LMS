// app/manager/mypage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserProfile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    birth: string;
    interests: string;
}

export default function ManagerMyPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<UserProfile | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                const userRes = await fetch('http://127.0.0.1:8000/api/user/me/', { headers });
                if (userRes.ok) {
                    const userData = await userRes.json();
                    setProfile(userData);
                    setEditData(userData);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    const handleSaveProfile = async () => {
        if (!editData) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/me/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editData)
            });
            if (res.ok) {
                alert("정보가 수정되었습니다.");
                setProfile(editData);
                setEditMode(false);
            } else {
                alert("수정에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        }
    };

    if (loading) return <div className="text-center py-20">로딩 중...</div>;
    if (!profile) return <div className="text-center py-20">프로필을 불러올 수 없습니다.</div>;

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white max-w-7xl mx-auto my-8">
            {/* 좌측 사이드바 */}
            <div className="w-48 lg:w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-bold text-xl text-gray-800">관리자 페이지</h2>
                    <p className="text-xs text-gray-500 mt-1">{profile.last_name}{profile.first_name}님</p>
                </div>
                <nav className="flex-grow p-4 space-y-1">
                    <button className="w-full text-left px-4 py-3 text-sm font-medium rounded-lg bg-white text-sky-600 shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-lg">👤</span> 개인정보 수정
                    </button>
                    {/* 관리자는 추가 메뉴가 필요할 수 있음 */}
                </nav>
            </div>

            {/* 우측 메인 콘텐츠 */}
            <div className="flex-1 p-10 overflow-y-auto h-[600px]">
                {editData && (
                    <div className="max-w-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                            <h3 className="text-2xl font-bold text-gray-800">프로필 관리</h3>
                            {!editMode ? (
                                <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm font-bold">수정하기</button>
                            ) : (
                                <div className="flex gap-2">
                                    <button onClick={() => { setEditMode(false); setEditData(profile); }} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">취소</button>
                                    <button onClick={handleSaveProfile} className="px-4 py-2 bg-sky-600 text-white rounded text-sm font-bold hover:bg-sky-700">저장</button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-sm font-bold text-gray-600">아이디</label>
                                <div className="col-span-3 text-gray-800 font-medium">{profile.username}</div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-sm font-bold text-gray-600">이름</label>
                                <div className="col-span-3 flex gap-2">
                                    <input
                                        type="text"
                                        disabled={!editMode}
                                        value={editData.last_name || ''}
                                        onChange={(e) => setEditData({ ...editData, last_name: e.target.value })}
                                        className="border border-gray-300 rounded p-2 w-20 bg-gray-50 disabled:text-gray-500"
                                        placeholder="성"
                                    />
                                    <input
                                        type="text"
                                        disabled={!editMode}
                                        value={editData.first_name || ''}
                                        onChange={(e) => setEditData({ ...editData, first_name: e.target.value })}
                                        className="border border-gray-300 rounded p-2 w-32 bg-gray-50 disabled:text-gray-500"
                                        placeholder="이름"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-sm font-bold text-gray-600">이메일</label>
                                <input
                                    type="email"
                                    disabled={!editMode}
                                    value={editData.email || ''}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="col-span-3 border border-gray-300 rounded p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-sm font-bold text-gray-600">전화번호</label>
                                <input
                                    type="text"
                                    disabled={!editMode}
                                    value={editData.phone || ''}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="col-span-3 border border-gray-300 rounded p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}