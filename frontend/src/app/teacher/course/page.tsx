// app/teacher/course/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type ActiveTab = 'register' | 'wishlist' | 'history';

interface Lecture {
    id: number;
    name: string;
    description?: string;
    instructor_name: string;
    capacity: number;
    enrolled_count: number;
    day_time?: string;
    status?: 'OPEN' | 'RECRUITING' | 'IN_PROGRESS' | 'CLOSED' | string;
    field?: string; // 분야(백엔드에서 필드가 있다면 사용)
}

interface UserProfile {
    fullName: string;
    major: string;
}

// 수강신청 / 희망과목 / 신청내역 공통으로 재사용할 테이블용 함수
const getStatusKorean = (status?: string) => {
    if (!status) return '-';
    switch (status) {
        case 'OPEN':
            return '수강신청 중';
        case 'RECRUITING':
            return '강사 배정 중';
        case 'IN_PROGRESS':
            return '수업 진행 중';
        case 'CLOSED':
            return '마감';
        default:
            return status;
    }
};

export default function TeacherCoursePage() {
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<ActiveTab>('register');

    // 내 정보
    const [profile, setProfile] = useState<UserProfile | null>(null);

    // 리스트들
    const [lectures, setLectures] = useState<Lecture[]>([]);           // 전체 강의 (수강신청 탭)
    const [wishlistLectures, setWishlistLectures] = useState<Lecture[]>([]); // 희망과목
    const [historyLectures, setHistoryLectures] = useState<Lecture[]>([]);   // 신청내역

    // 검색 필터
    const [searchField, setSearchField] = useState<string>(''); // 분야
    const [keyword, setKeyword] = useState<string>('');         // 과목명/강사명 검색

    const [loading, setLoading] = useState(false);

    // 1) 로그인 & 내 정보 로딩
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchProfile = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/user/me/', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) return;
                const data = await res.json();

                const fullName = `${data.last_name || ''}${data.first_name || ''}` || data.username;
                const major = data.interests || ''; // 일단 interests를 전공/분야 칸에 보여주도록 사용

                setProfile({
                    fullName,
                    major,
                });
            } catch (error) {
                console.error('프로필 로딩 오류:', error);
            }
        };

        fetchProfile();
    }, [router]);

    // 2) 탭별 데이터 로딩
    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) return;

        const fetchData = async () => {
            setLoading(true);
            try {
                if (activeTab === 'register') {
                    // ✔ 강사용 수강신청 탭: 전체 강의 목록
                    // 현재는 학생용과 같은 /api/courses 를 사용 (나중에 강사용 전용 API 있으면 여기만 바꾸면 됨)
                    const res = await fetch('http://127.0.0.1:8000/api/courses', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data: Lecture[] = await res.json();
                        setLectures(data);
                    }
                } else if (activeTab === 'wishlist') {
                    // ✔ 희망과목 목록
                    const res = await fetch('http://127.0.0.1:8000/api/courses/wishlist', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data: Lecture[] = await res.json();
                        setWishlistLectures(data);
                    }
                } else if (activeTab === 'history') {
                    // ✔ 신청내역 확인 (대시보드의 my-courses 재사용)
                    const res = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses/', {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data: Lecture[] = await res.json();
                        setHistoryLectures(data);
                    }
                }
            } catch (error) {
                console.error('데이터 로딩 오류:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [activeTab]);

    // 3) 수강신청
    const handleEnroll = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/enroll`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                alert('수강신청이 완료되었습니다.');
                // 현재 탭 데이터 새로고침
                if (activeTab === 'register') {
                    setActiveTab('history'); // 바로 신청내역 탭으로 보내도 되고, 그대로 두고 다시 fetch 해도 됨
                }
            } else {
                const errorData = await res.json();
                alert(errorData.error || '수강신청에 실패했습니다.');
            }
        } catch (error) {
            console.error('수강신청 오류:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 4) 희망과목 추가
    const handleAddWishlist = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.ok) {
                alert('희망과목에 추가되었습니다.');
                if (activeTab === 'register') {
                    // 필요하면 바로 희망과목 탭으로 이동
                    // setActiveTab('wishlist');
                }
            } else {
                const errorData = await res.json();
                alert(errorData.error || '희망과목 추가에 실패했습니다.');
            }
        } catch (error) {
            console.error('희망과목 추가 오류:', error);
            alert('서버 오류가 발생했습니다.');
        }
    };

    // 5) 희망과목 취소
    const handleRemoveWishlist = async (lectureId: number) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            alert('로그인이 필요합니다.');
            router.push('/login');
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                alert('희망과목에서 삭제되었습니다.');
                // 목록 새로고침
                setWishlistLectures((prev) => prev.filter((lec) => lec.id !== lectureId));
            } else {
                alert('삭제에 실패했습니다.');
            }
        } catch (error) {
            console.error('희망과목 삭제 오류:', error);
        }
    };

    // 6) 강의계획서 보기 (대시보드의 과목 관리 페이지로 이동하도록 연결)
    const goToSyllabus = (lectureId: number) => {
        router.push(`/dashboard/courses/${lectureId}/management`);
    };

    // 7) 검색 필터 적용
    const filteredLectures = lectures.filter((lecture) => {
        const matchField = searchField ? lecture.field === searchField : true;
        const lowerKeyword = keyword.toLowerCase();
        const matchKeyword = keyword
            ? lecture.name.toLowerCase().includes(lowerKeyword) ||
              lecture.instructor_name.toLowerCase().includes(lowerKeyword)
            : true;

        return matchField && matchKeyword;
    });

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto py-16 px-4">
                <p className="text-center text-gray-500">불러오는 중입니다...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* 상단 탭 (수강신청 / 희망과목 / 신청내역 확인) */}
            <div className="flex gap-2 mb-6 border-b border-gray-300 pb-1">
                <button
                    onClick={() => setActiveTab('register')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                    ${
                        activeTab === 'register'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    수강신청
                </button>
                <button
                    onClick={() => setActiveTab('wishlist')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                    ${
                        activeTab === 'wishlist'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    희망과목
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
                    ${
                        activeTab === 'history'
                            ? 'bg-sky-600 text-white border-sky-600'
                            : 'bg-white text-gray-500 hover:bg-gray-50'
                    }`}
                >
                    신청내역 확인
                </button>
            </div>

            {/* 본문 레이아웃: 왼쪽(내 정보 + 목록) / 오른쪽(프로필 박스) */}
            <div className="grid grid-cols-12 gap-6">
                {/* 왼쪽 영역 */}
                <div className="col-span-12 lg:col-span-9 space-y-6">
                    {/* 내 정보 */}
                    <section className="border border-gray-300 rounded-md p-4 bg-white">
                        <h2 className="text-base font-bold text-sky-700 mb-3">내 정보</h2>
                        <div className="grid grid-cols-12 gap-4 text-sm">
                            <div className="col-span-12 md:col-span-6 flex items-center">
                                <span className="w-20 text-gray-600">이름</span>
                                <input
                                    type="text"
                                    readOnly
                                    value={profile?.fullName || ''}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 bg-gray-50"
                                />
                            </div>
                            <div className="col-span-12 md:col-span-6 flex items-center">
                                <span className="w-20 text-gray-600">전공분야</span>
                                <input
                                    type="text"
                                    readOnly
                                    value={profile?.major || ''}
                                    className="flex-1 border border-gray-300 rounded px-2 py-1 bg-gray-50"
                                />
                            </div>
                        </div>
                    </section>

                    {/* 탭별 컨텐츠 */}
                    {activeTab === 'register' && (
                        <>
                            {/* 강의 검색 */}
                            <section className="border border-gray-300 rounded-md p-4 bg-white">
                                <h2 className="text-base font-bold text-sky-700 mb-3">강의 검색</h2>
                                <div className="flex flex-wrap items-center gap-3 text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-600">분야</span>
                                        <select
                                            className="border border-gray-300 rounded px-2 py-1"
                                            value={searchField}
                                            onChange={(e) => setSearchField(e.target.value)}
                                        >
                                            <option value="">전체</option>
                                            <option value="AI">AI</option>
                                            <option value="SW">소프트웨어</option>
                                            <option value="디자인">디자인</option>
                                            {/* 실제 도메인에 맞게 옵션 추가 */}
                                        </select>
                                    </div>
                                    <div className="flex items-center gap-2 flex-1 min-w-[220px]">
                                        <span className="text-gray-600">검색어</span>
                                        <input
                                            type="text"
                                            placeholder="과목명 / 강사명 입력"
                                            value={keyword}
                                            onChange={(e) => setKeyword(e.target.value)}
                                            className="flex-1 border border-gray-300 rounded px-2 py-1"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {}}
                                        className="px-4 py-1.5 bg-sky-600 text-white text-sm rounded hover:bg-sky-700"
                                    >
                                        검색
                                    </button>
                                </div>
                            </section>

                            {/* 수강신청 목록 테이블 */}
                            <section className="border border-gray-300 rounded-md bg-white overflow-hidden">
                                <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
                                    <h3 className="text-sm font-bold text-gray-700">수강신청</h3>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full text-sm text-center">
                                        <thead className="bg-sky-50">
                                            <tr>
                                                <th className="px-3 py-2 border">번호</th>
                                                <th className="px-3 py-2 border">수강신청</th>
                                                <th className="px-3 py-2 border">과목명</th>
                                                <th className="px-3 py-2 border">강사명</th>
                                                <th className="px-3 py-2 border">강의계획서</th>
                                                <th className="px-3 py-2 border">희망신청</th>
                                                <th className="px-3 py-2 border">비고</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredLectures.length > 0 ? (
                                                filteredLectures.map((lecture, idx) => (
                                                    <tr key={lecture.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 border">{idx + 1}</td>
                                                        <td className="px-3 py-2 border">
                                                            <button
                                                                className="px-3 py-1 bg-sky-600 text-white rounded text-xs hover:bg-sky-700"
                                                                onClick={() => handleEnroll(lecture.id)}
                                                            >
                                                                신청
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-2 border">{lecture.name}</td>
                                                        <td className="px-3 py-2 border">
                                                            {lecture.instructor_name || '-'}
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            <button
                                                                className="px-3 py-1 bg-white border border-sky-600 text-sky-700 rounded text-xs hover:bg-sky-50"
                                                                onClick={() => goToSyllabus(lecture.id)}
                                                            >
                                                                강의계획서
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            <button
                                                                className="px-3 py-1 bg-white border border-sky-600 text-sky-700 rounded text-xs hover:bg-sky-50"
                                                                onClick={() => handleAddWishlist(lecture.id)}
                                                            >
                                                                희망신청
                                                            </button>
                                                        </td>
                                                        <td className="px-3 py-2 border">
                                                            {getStatusKorean(lecture.status)}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={7}
                                                        className="px-3 py-10 text-gray-400 text-center"
                                                    >
                                                        표시할 강의가 없습니다.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </section>
                        </>
                    )}

                    {activeTab === 'wishlist' && (
                        <section className="border border-gray-300 rounded-md bg-white overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
                                <h3 className="text-sm font-bold text-gray-700">희망과목</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-center">
                                    <thead className="bg-sky-50">
                                        <tr>
                                            <th className="px-3 py-2 border">번호</th>
                                            <th className="px-3 py-2 border">과목명</th>
                                            <th className="px-3 py-2 border">강사명</th>
                                            <th className="px-3 py-2 border">강의계획서</th>
                                            <th className="px-3 py-2 border">희망신청 취소</th>
                                            <th className="px-3 py-2 border">비고</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {wishlistLectures.length > 0 ? (
                                            wishlistLectures.map((lecture, idx) => (
                                                <tr key={lecture.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 border">{idx + 1}</td>
                                                    <td className="px-3 py-2 border">{lecture.name}</td>
                                                    <td className="px-3 py-2 border">
                                                        {lecture.instructor_name || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 border">
                                                        <button
                                                            className="px-3 py-1 bg-white border border-sky-600 text-sky-700 rounded text-xs hover:bg-sky-50"
                                                            onClick={() => goToSyllabus(lecture.id)}
                                                        >
                                                            강의계획서
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 border">
                                                        <button
                                                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                                                            onClick={() => handleRemoveWishlist(lecture.id)}
                                                        >
                                                            취소
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 border">
                                                        {getStatusKorean(lecture.status)}
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-3 py-10 text-gray-400 text-center"
                                                >
                                                    희망과목이 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {activeTab === 'history' && (
                        <section className="border border-gray-300 rounded-md bg-white overflow-hidden">
                            <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
                                <h3 className="text-sm font-bold text-gray-700">신청내역 확인</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm text-center">
                                    <thead className="bg-sky-50">
                                        <tr>
                                            <th className="px-3 py-2 border">번호</th>
                                            <th className="px-3 py-2 border">과목명</th>
                                            <th className="px-3 py-2 border">강사명</th>
                                            <th className="px-3 py-2 border">강의계획서</th>
                                            <th className="px-3 py-2 border">비고</th>
                                            <th className="px-3 py-2 border">신청여부</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {historyLectures.length > 0 ? (
                                            historyLectures.map((lecture, idx) => (
                                                <tr key={lecture.id} className="hover:bg-gray-50">
                                                    <td className="px-3 py-2 border">{idx + 1}</td>
                                                    <td className="px-3 py-2 border">{lecture.name}</td>
                                                    <td className="px-3 py-2 border">
                                                        {lecture.instructor_name || '-'}
                                                    </td>
                                                    <td className="px-3 py-2 border">
                                                        <button
                                                            className="px-3 py-1 bg-white border border-sky-600 text-sky-700 rounded text-xs hover:bg-sky-50"
                                                            onClick={() => goToSyllabus(lecture.id)}
                                                        >
                                                            강의계획서
                                                        </button>
                                                    </td>
                                                    <td className="px-3 py-2 border">
                                                        {getStatusKorean(lecture.status)}
                                                    </td>
                                                    <td className="px-3 py-2 border">O</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={6}
                                                    className="px-3 py-10 text-gray-400 text-center"
                                                >
                                                    신청 내역이 없습니다.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}
                </div>

                {/* 오른쪽 프로필 사이드바 */}
                <aside className="col-span-12 lg:col-span-3 space-y-4">
                    <div className="border border-gray-300 rounded-md bg-white p-4 flex flex-col items-center">
                        <div className="w-24 h-24 rounded-full bg-gray-200 mb-3" />
                        <p className="text-sm font-bold mb-1">
                            {profile?.fullName || '강사 이름'}
                        </p>
                        <p className="text-xs text-gray-500 mb-3">
                            {profile?.major || '전문 분야'}
                        </p>
                        <button className="px-4 py-1.5 text-xs bg-sky-600 text-white rounded hover:bg-sky-700">
                            프로필수정
                        </button>
                    </div>

                    {/* 나머지 박스(강의/자기소개서 등)는 와이어프레임만 맞춰서 껍데기 형태로 */}
                    <div className="border border-gray-300 rounded-md bg-white p-3 text-xs">
                        <p className="font-bold mb-2">강의</p>
                        <ul className="space-y-1 text-gray-600">
                            <li>- ...</li>
                            <li>- ...</li>
                            <li>- ...</li>
                        </ul>
                    </div>

                    <div className="border border-gray-300 rounded-md bg-white p-3 text-xs">
                        <p className="font-bold mb-2">자기소개서</p>
                        <ul className="space-y-1 text-gray-600">
                            <li>- ...</li>
                            <li>- ...</li>
                            <li>- ...</li>
                        </ul>
                    </div>
                </aside>
            </div>
        </div>
    );
}
