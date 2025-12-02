// app/teacher/mypage/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 데이터 타입 정의 (학생용과 동일 구조 유지)
interface UserProfile {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string;
    birth: string;
    interests: string;
}

interface Lecture {
    id: number;
    name: string;
    instructor_name: string;
    status: 'RECRUITING' | 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
}

interface Enrollment {
    lecture: Lecture;
    joined_at: string;
}

interface MyActivity {
    threads: { id: number; title: string; created_at: string }[];
    comments: { id: number; content: string; thread_title: string; created_at: string }[];
}

export default function TeacherMyPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'courses' | 'activity'>('profile');

    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [activity, setActivity] = useState<MyActivity>({ threads: [], comments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 프로필 수정용 상태
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<UserProfile | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            console.log('No token found, redirecting to login');
            router.push('/login');
            return;
        }

        const fetchData = async () => {
            setLoading(true);
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                console.log('Fetching teacher data...');

                // 1. 내 정보 가져오기 (강사/학생 공용 엔드포인트)
                const userRes = await fetch('http://127.0.0.1:8000/api/user/me/', { headers });
                console.log('User response status:', userRes.status);

                if (userRes.ok) {
                    const userData = await userRes.json();
                    console.log('User data:', userData);
                    setProfile(userData);
                    setEditData(userData);
                } else {
                    const errorData = await userRes.text();
                    console.error('User fetch failed:', userRes.status, errorData);
                    setError(`사용자 정보 로드 실패: ${userRes.status}`);
                }

                // 2. 담당 강의 / 수강 내역 가져오기
                //    백엔드에서 role에 따라 "내 강의"를 돌려주도록 구현되어 있다면 그대로 사용
                const courseRes = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses/', { headers });
                console.log('Course response status:', courseRes.status);

                if (courseRes.ok) {
                    const courseData = await courseRes.json();
                    console.log('Course data:', courseData);
                    setEnrollments(courseData);
                } else {
                    console.error('Course fetch failed:', courseRes.status);
                }

                // 3. 활동 내역 가져오기 (강사가 쓴 글/댓글)
                const activityRes = await fetch('http://127.0.0.1:8000/api/community/me/', { headers });
                console.log('Activity response status:', activityRes.status);

                if (activityRes.ok) {
                    const activityData = await activityRes.json();
                    console.log('Activity data:', activityData);
                    setActivity(activityData);
                } else {
                    console.error('Activity fetch failed:', activityRes.status);
                }

            } catch (err) {
                console.error('Fetch error:', err);
                setError('서버 연결에 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [router]);

    // 프로필 저장 핸들러
    const handleSaveProfile = async () => {
        if (!editData) return;
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch('http://127.0.0.1:8000/api/user/me/', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(editData),
            });

            if (res.ok) {
                alert('회원 정보가 수정되었습니다.');
                setProfile(editData);
                setEditMode(false);
            } else {
                alert('수정에 실패했습니다.');
            }
        } catch (err) {
            console.error(err);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 로딩 중
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-600 mx-auto mb-4"></div>
                    <p className="text-gray-500">로딩 중...</p>
                </div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <p className="text-red-500 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/teacher/dashboard')}
                        className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                    >
                        강사 대시보드로 돌아가기
                    </button>
                </div>
            </div>
        );
    }

    // 프로필 없음
    if (!profile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center max-w-md">
                    <p className="text-red-500 mb-4">프로필 정보를 불러올 수 없습니다.</p>
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                        >
                            다시 시도
                        </button>
                        <button
                            onClick={() => router.push('/teacher/dashboard')}
                            className="px-4 py-2 bg-sky-600 text-white rounded hover:bg-sky-700"
                        >
                            강사 대시보드로 이동
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // 관심분야 체크박스용 옵션
    const interestOptions = ['인공지능', '로봇공학', '코딩', '사물인터넷(IoT)', '3D프린팅', '드론'];

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white max-w-7xl mx-auto my-8">
            {/* === 좌측 사이드바 === */}
            <div className="w-48 lg:w-64 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="font-bold text-xl text-gray-800">강사 마이페이지</h2>
                    <p className="text-xs text-gray-500 mt-1">
                        {profile.last_name}
                        {profile.first_name}
                        님, 오늘도 좋은 수업 되세요.
                    </p>
                </div>
                <nav className="flex-grow p-4 space-y-1">
                    <button
                        onClick={() => setActiveTab('profile')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition flex items-center gap-3
                            ${
                                activeTab === 'profile'
                                    ? 'bg-white text-sky-600 shadow-sm border border-gray-100'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-lg">👤</span> 개인정보 수정
                    </button>
                    <button
                        onClick={() => setActiveTab('activity')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition flex items-center gap-3
                            ${
                                activeTab === 'activity'
                                    ? 'bg-white text-sky-600 shadow-sm border border-gray-100'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-lg">📝</span> 내가 쓴 글 / 댓글
                    </button>
                    <button
                        onClick={() => setActiveTab('courses')}
                        className={`w-full text-left px-4 py-3 text-sm font-medium rounded-lg transition flex items-center gap-3
                            ${
                                activeTab === 'courses'
                                    ? 'bg-white text-sky-600 shadow-sm border border-gray-100'
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                    >
                        <span className="text-lg">📚</span> 담당 강의 모아보기
                    </button>
                </nav>
                <div className="p-4 border-t border-gray-200">
                    <p className="text-xs text-gray-400 text-center">DORO LMS for Teacher v1.0</p>
                </div>
            </div>

            {/* === 우측 메인 콘텐츠 === */}
            <div className="flex-1 p-10 overflow-y-auto h-[600px]">
                {/* [탭 1] 프로필 관리 */}
                {activeTab === 'profile' && editData && (
                    <div className="max-w-2xl">
                        <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
                            <h3 className="text-2xl font-bold text-gray-800">프로필 관리</h3>
                            {!editMode ? (
                                <button
                                    onClick={() => setEditMode(true)}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm font-bold"
                                >
                                    수정하기
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => {
                                            setEditMode(false);
                                            setEditData(profile);
                                        }}
                                        className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                                    >
                                        취소
                                    </button>
                                    <button
                                        onClick={handleSaveProfile}
                                        className="px-4 py-2 bg-sky-600 text-white rounded text-sm font-bold hover:bg-sky-700"
                                    >
                                        저장
                                    </button>
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
                                        onChange={(e) =>
                                            setEditData({ ...editData, last_name: e.target.value })
                                        }
                                        className="border border-gray-300 rounded p-2 w-20 bg-gray-50 disabled:text-gray-500"
                                        placeholder="성"
                                    />
                                    <input
                                        type="text"
                                        disabled={!editMode}
                                        value={editData.first_name || ''}
                                        onChange={(e) =>
                                            setEditData({ ...editData, first_name: e.target.value })
                                        }
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
                                    onChange={(e) =>
                                        setEditData({ ...editData, email: e.target.value })
                                    }
                                    className="col-span-3 border border-gray-300 rounded p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label className="text-sm font-bold text-gray-600">전화번호</label>
                                <input
                                    type="text"
                                    disabled={!editMode}
                                    value={editData.phone || ''}
                                    onChange={(e) =>
                                        setEditData({ ...editData, phone: e.target.value })
                                    }
                                    className="col-span-3 border border-gray-300 rounded p-2 w-full disabled:bg-gray-100 disabled:text-gray-500"
                                    placeholder="010-0000-0000"
                                />
                            </div>

                            {/* 관심분야 */}
                            <div className="grid grid-cols-4 items-start gap-4 pt-4 border-t border-gray-100">
                                <label className="text-sm font-bold text-gray-600 pt-1">관심분야</label>
                                <div className="col-span-3 grid grid-cols-2 gap-2">
                                    {interestOptions.map((option) => (
                                        <label
                                            key={option}
                                            className="flex items-center gap-2 cursor-pointer"
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={!editMode}
                                                checked={editData.interests?.includes(option) || false}
                                                onChange={(e) => {
                                                    let currentInterests = editData.interests
                                                        ? editData.interests.split(',')
                                                        : [];
                                                    if (e.target.checked) {
                                                        currentInterests.push(option);
                                                    } else {
                                                        currentInterests = currentInterests.filter(
                                                            (i) => i !== option,
                                                        );
                                                    }
                                                    setEditData({
                                                        ...editData,
                                                        interests: currentInterests.join(','),
                                                    });
                                                }}
                                                className="w-4 h-4 text-sky-600 rounded focus:ring-sky-500"
                                            />
                                            <span className="text-sm text-gray-700">{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* [탭 2] 내 활동 내역 (강사 입장: 내가 쓴 공지/커뮤니티 글/댓글) */}
                {activeTab === 'activity' && (
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-sky-500 pl-3">
                                내가 쓴 글
                            </h3>
                            {activity.threads.length > 0 ? (
                                <ul className="border-t border-gray-200">
                                    {activity.threads.map((thread) => (
                                        <li
                                            key={thread.id}
                                            className="flex justify-between py-3 border-b border-gray-100 hover:bg-gray-50 px-2 cursor-pointer"
                                            onClick={() =>
                                                router.push(`/dashboard/community/${thread.id}`)
                                            }
                                        >
                                            <span className="text-gray-700 text-sm truncate max-w-md">
                                                {thread.title}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(
                                                    thread.created_at,
                                                ).toLocaleDateString()}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 text-sm py-4">
                                    작성한 글이 없습니다.
                                </p>
                            )}
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-sky-500 pl-3">
                                내가 쓴 댓글
                            </h3>
                            {activity.comments.length > 0 ? (
                                <ul className="border-t border-gray-200">
                                    {activity.comments.map((comment) => (
                                        <li
                                            key={comment.id}
                                            className="py-3 border-b border-gray-100 hover:bg-gray-50 px-2 cursor-pointer"
                                        >
                                            <p className="text-gray-800 text-sm mb-1">
                                                {comment.content}
                                            </p>
                                            <div className="flex justify-between text-xs text-gray-400">
                                                <span>원글: {comment.thread_title}</span>
                                                <span>
                                                    {new Date(
                                                        comment.created_at,
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 text-sm py-4">
                                    작성한 댓글이 없습니다.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* [탭 3] 담당 강의 모아보기 */}
                {activeTab === 'courses' && (
                    <div className="space-y-10">
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                현재 담당 중인 강의
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollments
                                    .filter((e) => e.lecture.status !== 'CLOSED')
                                    .map((item) => (
                                        <div
                                            key={item.lecture.id}
                                            onClick={() =>
                                                router.push(
                                                    `/dashboard/courses/${item.lecture.id}/management`,
                                                )
                                            }
                                            className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition cursor-pointer bg-white group"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-sky-100 text-sky-600 text-xs font-bold px-2 py-1 rounded">
                                                    담당
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(
                                                        item.joined_at,
                                                    ).toLocaleDateString()}{' '}
                                                    시작
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-800 text-lg group-hover:text-sky-600">
                                                {item.lecture.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.lecture.instructor_name} 강사
                                            </p>
                                        </div>
                                    ))}
                                {enrollments.filter((e) => e.lecture.status !== 'CLOSED').length ===
                                    0 && (
                                    <div className="col-span-2 text-center py-8 bg-gray-50 rounded-lg text-gray-400 text-sm">
                                        담당 중인 강의가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                지난 강의 (종료됨)
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {enrollments
                                    .filter((e) => e.lecture.status === 'CLOSED')
                                    .map((item) => (
                                        <div
                                            key={item.lecture.id}
                                            className="border border-gray-200 rounded-xl p-5 bg-gray-50 opacity-70"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="bg-gray-200 text-gray-500 text-xs font-bold px-2 py-1 rounded">
                                                    종료
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(
                                                        item.joined_at,
                                                    ).toLocaleDateString()}{' '}
                                                    시작
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-gray-700 text-lg">
                                                {item.lecture.name}
                                            </h4>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {item.lecture.instructor_name} 강사
                                            </p>
                                        </div>
                                    ))}
                                {enrollments.filter((e) => e.lecture.status === 'CLOSED').length ===
                                    0 && (
                                    <div className="col-span-2 text-center py-8 border border-dashed border-gray-300 rounded-lg text-gray-400 text-sm">
                                        종료된 강의가 없습니다.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
