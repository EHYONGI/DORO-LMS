// app/manager/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// === 타입 정의 ===
interface SystemNotice {
    id: number;
    title: string;
    content: string;
    created_at: string;
    author_name: string;
}

interface UserData {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    birth: string;
    role: number; // 0:Manager, 1:Student, 2:Instructor
    digital_score: number;
    ai_score: number;
    making_score: number;
    computing_score: number;
}

export default function ManagerDashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'write_notice' | 'users'>('write_notice');

    // 데이터
    const [notices, setNotices] = useState<SystemNotice[]>([]);
    const [users, setUsers] = useState<UserData[]>([]);

    // 상태
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [noticeForm, setNoticeForm] = useState({ title: '', content: '' });

    // [NEW] 유저 상세/수정 모달 상태
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [editForm, setEditForm] = useState<UserData | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }
        fetchInitialData(token);
    }, [router]);

    const fetchInitialData = async (token: string) => {
        try {
            const headers = { 'Authorization': `Bearer ${token}` };
            const noticeRes = await fetch('http://127.0.0.1:8000/api/notice/system/', { headers });
            if (noticeRes.ok) setNotices(await noticeRes.json());
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchUsers = async () => {
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/manager/users/', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setUsers(await res.json());
        } catch (err) { console.error(err); }
    };

    const handleTabChange = (tab: 'write_notice' | 'users') => {
        setActiveTab(tab);
        if (tab === 'users') fetchUsers();
    };

    // 공지 작성 핸들러 (기존 동일)
    const handleNoticeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://127.0.0.1:8000/api/notice/system/create/', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(noticeForm)
            });
            if (res.ok) {
                alert("공지사항이 등록되었습니다.");
                setNoticeForm({ title: '', content: '' });
                fetchInitialData(token!);
            }
        } catch (err) { console.error(err); }
    };

    // [NEW] 유저 수정 핸들러
    const handleUserUpdate = async () => {
        if (!editForm) return;
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://127.0.0.1:8000/api/user/manager/users/${editForm.id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                alert("회원 정보가 수정되었습니다.");
                setSelectedUser(null);
                setEditForm(null);
                fetchUsers(); // 목록 갱신
            } else {
                alert("수정 실패");
            }
        } catch (err) { console.error(err); }
    };

    // 유저 목록 필터링
    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase();
        const fullName = `${user.last_name}${user.first_name}`;
        return user.username.toLowerCase().includes(query) || fullName.includes(query);
    });

    // Role 뱃지 헬퍼
    const getRoleBadge = (role: number) => {
        if (role === 0) return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-bold">관리자</span>;
        if (role === 2) return <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-bold">강사</span>;
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded font-bold">학생</span>;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2 flex justify-between items-end">
                <span>관리자 대시보드</span>
                <div className="flex gap-2 text-sm font-medium">
                    <button onClick={() => handleTabChange('write_notice')} className={`px-4 py-2 rounded-t-lg transition ${activeTab === 'write_notice' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'}`}>공지 작성</button>
                    <button onClick={() => handleTabChange('users')} className={`px-4 py-2 rounded-t-lg transition ${activeTab === 'users' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-600'}`}>유저 관리</button>
                </div>
            </h1>

            {/* [탭 1] 공지 작성 (기존 유지) */}
            {activeTab === 'write_notice' && (
                <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
                    <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-700 mb-4">📢 전체 공지사항 작성</h2>
                        <form onSubmit={handleNoticeSubmit} className="space-y-4">
                            <input type="text" className="w-full border rounded-lg p-2" placeholder="제목" value={noticeForm.title} onChange={e => setNoticeForm({ ...noticeForm, title: e.target.value })} required />
                            <textarea rows={12} className="w-full border rounded-lg p-2 resize-none" placeholder="내용" value={noticeForm.content} onChange={e => setNoticeForm({ ...noticeForm, content: e.target.value })} required />
                            <div className="text-right"><button type="submit" className="bg-sky-600 text-white px-6 py-2 rounded-lg font-bold">등록하기</button></div>
                        </form>
                    </div>
                    <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm h-full overflow-y-auto">
                        <h2 className="text-lg font-bold text-gray-600 mb-4">📋 등록된 공지</h2>
                        <div className="space-y-2">
                            {notices.map(n => (
                                <div key={n.id} onClick={() => router.push(`/manager/dashboard/notices/${n.id}`)} className="p-3 border rounded hover:bg-gray-50 cursor-pointer">
                                    <div className="text-xs text-gray-400 mb-1">{new Date(n.created_at).toLocaleDateString()}</div>
                                    <div className="font-medium text-sm truncate">{n.title}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* [탭 2] 유저 관리 (개선됨) */}
            {activeTab === 'users' && (
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden min-h-[600px]">
                    <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
                        <h2 className="font-bold text-gray-700">회원 정보 및 권한 관리</h2>
                        <div className="flex gap-2">
                            <input type="text" placeholder="이름/ID 검색" className="border p-1 rounded text-sm" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                            <button onClick={fetchUsers} className="text-sm text-sky-600 hover:underline px-2">새로고침</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto p-4">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">이름 (ID)</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">역할</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">이메일</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">전화번호</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">관리</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-4 text-sm text-gray-900">
                                            <div className="font-bold">{user.last_name}{user.first_name}</div>
                                            <div className="text-xs text-gray-400">({user.username})</div>
                                        </td>
                                        <td className="px-4 py-4 text-center">{getRoleBadge(user.role)}</td>
                                        <td className="px-4 py-4 text-center text-sm text-gray-600">{user.email}</td>
                                        <td className="px-4 py-4 text-center text-sm text-gray-600">{user.phone || '-'}</td>
                                        <td className="px-4 py-4 text-center">
                                            <button
                                                onClick={() => { setSelectedUser(user); setEditForm(user); }}
                                                className="bg-white border border-sky-500 text-sky-600 text-xs px-3 py-1.5 rounded hover:bg-sky-50 font-bold"
                                            >
                                                상세/수정
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {selectedUser && editForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800">회원 정보 수정</h3>
                            <button onClick={() => { setSelectedUser(null); setEditForm(null); }} className="text-gray-400 hover:text-gray-600">✕</button>
                        </div>

                        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                            {/* 1. 기본 정보 & 권한 */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 border-b pb-1 mb-3">기본 정보 및 권한</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">아이디</label>
                                        <input type="text" disabled value={editForm.username} className="w-full border bg-gray-100 text-gray-500 rounded p-2 text-sm cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-sky-600 mb-1">역할 (수정 가능)</label>
                                        <select
                                            className="w-full border border-sky-300 rounded p-2 text-sm focus:ring-2 focus:ring-sky-500 font-bold text-gray-700"
                                            value={editForm.role}
                                            onChange={e => setEditForm({ ...editForm, role: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>학생 (Student)</option>
                                            <option value={2}>강사 (Instructor)</option>
                                            <option value={0}>관리자 (Manager)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 2. 개인 정보 (읽기 전용으로 변경됨) */}
                            <div>
                                <h4 className="text-sm font-bold text-gray-500 border-b pb-1 mb-3">개인 정보 (수정 불가)</h4>
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">성 (Last Name)</label>
                                        <input type="text" disabled value={editForm.last_name} className="w-full border bg-gray-100 text-gray-500 rounded p-2 text-sm cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">이름 (First Name)</label>
                                        <input type="text" disabled value={editForm.first_name} className="w-full border bg-gray-100 text-gray-500 rounded p-2 text-sm cursor-not-allowed" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">이메일</label>
                                        <input type="email" disabled value={editForm.email} className="w-full border bg-gray-100 text-gray-500 rounded p-2 text-sm cursor-not-allowed" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-600 mb-1">전화번호</label>
                                        <input type="text" disabled value={editForm.phone || ''} className="w-full border bg-gray-100 text-gray-500 rounded p-2 text-sm cursor-not-allowed" />
                                    </div>
                                </div>
                            </div>

                            {/* 3. 역량 점수 (학생일 때만 활성화) */}
                            <div className={editForm.role !== 1 ? 'opacity-50 pointer-events-none' : ''}>
                                <h4 className="text-sm font-bold text-gray-500 border-b pb-1 mb-3 flex justify-between">
                                    <span>역량 평가 점수</span>
                                    {editForm.role !== 1 && <span className="text-xs text-red-500 font-normal">* 학생에게만 적용됩니다</span>}
                                </h4>
                                <div className="grid grid-cols-4 gap-2">
                                    {[
                                        { label: 'Digital', key: 'digital_score', color: 'sky' },
                                        { label: 'AI', key: 'ai_score', color: 'purple' },
                                        { label: 'Making', key: 'making_score', color: 'orange' },
                                        { label: 'Computing', key: 'computing_score', color: 'green' },
                                    ].map((item) => (
                                        <div key={item.key}>
                                            <label className={`block text-xs font-bold text-${item.color}-600 mb-1`}>{item.label}</label>
                                            <input
                                                type="number"
                                                min="0" max="100"
                                                value={editForm[item.key as keyof UserData] as number}
                                                onChange={e => setEditForm({ ...editForm, [item.key]: parseInt(e.target.value) || 0 })}
                                                className={`w-full border rounded p-2 text-center text-sm font-bold focus:ring-${item.color}-500`}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
                            <button onClick={() => { setSelectedUser(null); setEditForm(null); }} className="px-4 py-2 bg-white border border-gray-300 rounded text-sm font-bold hover:bg-gray-50">취소</button>
                            <button onClick={handleUserUpdate} className="px-6 py-2 bg-blue-600 text-white rounded text-sm font-bold hover:bg-blue-700">저장하기</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}