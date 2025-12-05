// app/teacher/course/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Lecture {
  id: number;
  name: string;
  description: string;
  instructor_name: string;
  capacity: number;
  enrolled_count: number;
  day_time: string;
  status: 'OPEN' | 'RECRUITING' | 'IN_PROGRESS' | 'CLOSED';
}

interface Enrollment {
  id: number;
  lecture: Lecture;
  joined_at: string;
}

export default function TeacherCourseRegistrationPage() {
  const router = useRouter();

  // 탭: 수강신청 / 희망과목 / 신청내역 확인
  const [activeTab, setActiveTab] = useState<'register' | 'wishlist' | 'enrolled'>('register');

  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [wishlistLectures, setWishlistLectures] = useState<Lecture[]>([]);
  const [enrolledLectures, setEnrolledLectures] = useState<Enrollment[]>([]);

  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RECRUITING'>('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    fetchData();
  }, [router, activeTab]);

  // 탭마다 데이터 로딩
  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    setLoading(true);
    try {
      if (activeTab === 'register') {
        // (강사용) 수강신청 가능한 강의 목록
        const res = await fetch('http://127.0.0.1:8000/api/courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setLectures(await res.json());
      } else if (activeTab === 'wishlist') {
        // (강사용) 희망과목 목록
        const res = await fetch('http://127.0.0.1:8000/api/courses/wishlist', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setWishlistLectures(await res.json());
      } else if (activeTab === 'enrolled') {
        // (강사용) 신청내역 확인 – 일단 학생용과 같은 엔드포인트 사용
        const res = await fetch('http://127.0.0.1:8000/api/dashboard/my-courses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setEnrolledLectures(await res.json());
      }
    } catch (e) {
      console.error('강사용 수강신청 데이터 로딩 오류:', e);
    } finally {
      setLoading(false);
    }
  };

  // 수강신청(강의 담당 신청)
  const handleEnroll = async (lectureId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/enroll`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        alert('수강신청이 완료되었습니다!');
        fetchData();
      } else {
        const error = await res.json();
        alert(error.error || '수강신청에 실패했습니다.');
      }
    } catch (e) {
      console.error('강사용 수강신청 오류:', e);
      alert('서버 오류가 발생했습니다.');
    }
  };

  // 희망과목 추가
  const handleAddWishlist = async (lectureId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        alert('희망과목에 추가되었습니다!');
      } else {
        const error = await res.json();
        alert(error.error || '추가에 실패했습니다.');
      }
    } catch (e) {
      console.error('희망과목 추가 오류:', e);
    }
  };

  // 희망과목 삭제
  const handleRemoveWishlist = async (lectureId: number) => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/courses/${lectureId}/wishlist`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('희망과목에서 삭제되었습니다.');
        fetchData();
      } else {
        alert('삭제에 실패했습니다.');
      }
    } catch (e) {
      console.error('희망과목 삭제 오류:', e);
    }
  };

  // 상태 + 검색 필터
  const getFilteredLectures = (lectureList: Lecture[]) => {
    let filtered = lectureList;

    if (filter === 'OPEN') {
      filtered = filtered.filter((l) => l.status === 'OPEN');
    } else if (filter === 'RECRUITING') {
      filtered = filtered.filter((l) => l.status === 'RECRUITING');
    } else {
      filtered = filtered.filter((l) => l.status !== 'CLOSED');
    }

    if (searchKeyword.trim()) {
      filtered = filtered.filter(
        (l) =>
          l.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          l.instructor_name?.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'OPEN':
        return (
          <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">
            수강신청 가능
          </span>
        );
      case 'RECRUITING':
        return (
          <span className="bg-yellow-100 text-yellow-700 text-xs font-bold px-3 py-1 rounded-full">
            강사 배정 중
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
            진행 중
          </span>
        );
      case 'CLOSED':
        return (
          <span className="bg-gray-100 text-gray-700 text-xs font-bold px-3 py-1 rounded-full">
            마감
          </span>
        );
      default:
        return null;
    }
  };

  const LectureCard = ({
    lecture,
    showWishlistBtn = false,
    showRemoveBtn = false,
  }: {
    lecture: Lecture;
    showWishlistBtn?: boolean;
    showRemoveBtn?: boolean;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      <div className="bg-gradient-to-r from-sky-500 to-sky-600 p-4">
        <div className="flex justify-between items-start mb-2">
          {getStatusBadge(lecture.status)}
          <span className="text-white text-xs font-medium">
            {lecture.enrolled_count} / {lecture.capacity}명
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-1">{lecture.name}</h3>
        <p className="text-sky-100 text-sm">
          {lecture.instructor_name ? `${lecture.instructor_name} 강사님` : '강사 미정'}
        </p>
      </div>

      <div className="p-5">
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 min-h-[60px]">
          {lecture.description || '강의 설명이 없습니다.'}
        </p>

        {lecture.day_time && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{lecture.day_time}</span>
          </div>
        )}

        <div className="flex gap-2">
          {lecture.status === 'OPEN' && lecture.enrolled_count < lecture.capacity ? (
            <button
              onClick={() => handleEnroll(lecture.id)}
              className="flex-1 bg-sky-600 text-white py-2.5 rounded-lg font-bold hover:bg-sky-700 transition shadow-sm"
            >
              수강신청
            </button>
          ) : lecture.status === 'OPEN' &&
            lecture.enrolled_count >= lecture.capacity ? (
            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed"
            >
              정원 마감
            </button>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-200 text-gray-500 py-2.5 rounded-lg font-bold cursor-not-allowed"
            >
              신청 불가
            </button>
          )}

          {showWishlistBtn && (
            <button
              onClick={() => handleAddWishlist(lecture.id)}
              className="px-4 py-2.5 border border-sky-600 text-sky-600 rounded-lg hover:bg-sky-50 transition"
            >
              ♡
            </button>
          )}

          {showRemoveBtn && (
            <button
              onClick={() => handleRemoveWishlist(lecture.id)}
              className="px-4 py-2.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition text-sm font-bold"
            >
              삭제
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">수강신청 (강사용)</h1>
        <p className="text-gray-600">담당하고 싶은 강의를 선택하여 신청하세요.</p>
      </div>

      {/* 탭: 수강신청 / 희망과목 / 신청내역 확인 */}
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
          onClick={() => setActiveTab('enrolled')}
          className={`px-6 py-2 rounded-t-lg font-bold text-sm transition border-t border-l border-r border-gray-300
            ${
              activeTab === 'enrolled'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-white text-gray-500 hover:bg-gray-50'
            }`}
        >
          신청내역 확인
        </button>
      </div>

      {/* [탭 1] 수강신청 */}
      {activeTab === 'register' && (
        <>
          {/* 검색/필터 바 (학생 페이지 레이아웃 그대로) */}
          <div className="mb-6 flex flex-wrap gap-3 items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
            <input
              type="text"
              placeholder="강의명 또는 강사명으로 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="flex-1 min-w-[200px] border border-gray-300 px-4 py-2 rounded-lg text-sm focus:outline-none focus:border-sky-500"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === 'ALL'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setFilter('OPEN')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === 'OPEN'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                신청 가능
              </button>
              <button
                onClick={() => setFilter('RECRUITING')}
                className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                  filter === 'RECRUITING'
                    ? 'bg-sky-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-100'
                }`}
              >
                모집 중
              </button>
            </div>
          </div>

          {/* 강의 카드 리스트 */}
          {getFilteredLectures(lectures).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredLectures(lectures).map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  showWishlistBtn={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">표시할 강의가 없습니다.</p>
            </div>
          )}
        </>
      )}

      {/* [탭 2] 희망과목 */}
      {activeTab === 'wishlist' && (
        <>
          {wishlistLectures.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlistLectures.map((lecture) => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  showRemoveBtn={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500 text-lg">등록된 희망과목이 없습니다.</p>
              <p className="text-sm text-gray-400 mt-2">
                수강신청 탭에서 ♡ 버튼을 눌러 희망과목을 추가해보세요.
              </p>
            </div>
          )}
        </>
      )}

      {/* [탭 3] 신청내역 확인 */}
      {activeTab === 'enrolled' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr className="text-gray-700">
                <th className="py-3 px-4 text-left font-medium">강의명</th>
                <th className="py-3 px-4 text-center font-medium">강사</th>
                <th className="py-3 px-4 text-center font-medium">수업 시간</th>
                <th className="py-3 px-4 text-center font-medium">신청일</th>
                <th className="py-3 px-4 text-center font-medium">상태</th>
                <th className="py-3 px-4 text-center font-medium">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {enrolledLectures.length > 0 ? (
                enrolledLectures.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="py-4 px-4 font-medium text-gray-800">
                      {item.lecture.name}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      {item.lecture.instructor_name || '강사 미정'}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-600">
                      {item.lecture.day_time || '-'}
                    </td>
                    <td className="py-4 px-4 text-center text-gray-400 text-xs">
                      {new Date(item.joined_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(item.lecture.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/courses/${item.lecture.id}/management`,
                          )
                        }
                        className="text-sky-600 hover:text-sky-700 text-sm font-medium"
                      >
                        강의실 입장
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-400">
                    신청 내역이 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}