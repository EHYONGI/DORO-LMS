// app/teacher/course/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://127.0.0.1:8000';

type SubTab = 'apply' | 'wishlist' | 'history';

interface UserProfile {
  fullName: string;
  major: string;
}

interface LectureRow {
  id: number;
  name: string;
  field?: string;
  instructor_name?: string;
  day_time?: string;
  room?: string;
  credit?: number;
  enrolled_count?: number;
  capacity?: number;
  status?: string;
}

// 희망과목 / 신청내역용 더미 타입
interface WishRow {
  id: number;
  name: string;
  instructor_name: string;
  credit: number;
  status: '장바구니' | '신청완료';
}

interface HistoryRow {
  id: number;
  name: string;
  syllabus: string;
  status: '신청완료' | '대기' | '취소';
  result: 'O' | 'X' | '-';
}

export default function TeacherCoursePage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<SubTab>('apply');

  const [lectures, setLectures] = useState<LectureRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 검색 폼 상태 (분야 + 키워드)
  const [searchField, setSearchField] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');

  // 희망과목 / 신청내역 더미 데이터 (추후 API로 교체)
  const [wishList] = useState<WishRow[]>([
    { id: 1, name: '과목 A', instructor_name: '홍길동', credit: 3, status: '장바구니' },
    { id: 2, name: '과목 B', instructor_name: '김철수', credit: 3, status: '장바구니' },
    { id: 3, name: '과목 C', instructor_name: '이영희', credit: 2, status: '신청완료' },
  ]);

  const [historyList] = useState<HistoryRow[]>([
    { id: 1, name: '과목 A', syllabus: '강의계획서 보기', status: '신청완료', result: 'O' },
    { id: 2, name: '과목 B', syllabus: '강의계획서 보기', status: '신청완료', result: 'O' },
    { id: 3, name: '과목 C', syllabus: '강의계획서 보기', status: '대기', result: '-' },
    { id: 4, name: '과목 D', syllabus: '강의계획서 보기', status: '취소', result: 'X' },
  ]);

  // 1) 로컬스토리지에서 유저 정보 읽고 강사 권한 체크 + 프로필 세팅
  useEffect(() => {
    const userRaw = localStorage.getItem('user');
    const access = localStorage.getItem('access_token');

    if (!userRaw || !access) {
      router.push('/login');
      return;
    }

    try {
      const user = JSON.parse(userRaw);
      const r = user.role;

      const isTeacher =
        r === 2 ||
        r === '2' ||
        r === 'TEACHER' ||
        r === 'teacher' ||
        r === 'INSTRUCTOR';

      if (!isTeacher) {
        alert('강사 전용 페이지입니다.');
        router.push('/student/dashboard');
        return;
      }

      const fullName =
        `${user.last_name || ''}${user.first_name || ''}`.trim() || user.username;
      const major = user.interests || '';

      setProfile({ fullName, major });
    } catch {
      router.push('/login');
    }
  }, [router]);

  // 2) 내가 담당하는 강의 목록 로드 (/api/dashboard/my-courses/)
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) return;

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/dashboard/my-courses/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          setError('강의 목록을 불러오지 못했습니다.');
          return;
        }

        const data = await res.json();
        // API 형식에 맞게 필요하면 여기서 매핑
        setLectures(data || []);
      } catch {
        setError('강의 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const getStatusKorean = (status?: string) => {
    if (!status) return '-';
    switch (status) {
      case 'OPEN':
        return '수강 신청 중';
      case 'IN_PROGRESS':
        return '수업 진행 중';
      case 'CLOSED':
        return '마감';
      case 'RECRUITING':
        return '강사 모집 중';
      default:
        return status;
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 검색 API 붙이면 여기서 사용
    alert(`검색 기능은 추후 구현 예정입니다.\n분야: ${searchField}, 키워드: ${searchKeyword}`);
  };

  const handleClickApply = (lectureId: number) => {
    // TODO: 강사용 "강의 신청" / "수강신청 관리" API 붙일 자리
    alert(`강의(ID: ${lectureId}) 신청/관리 기능은 추후 구현 예정입니다.`);
  };

  const handleWishAction = (id: number, action: 'apply' | 'cancel') => {
    alert(`희망과목 ID ${id} - ${action === 'apply' ? '신청' : '취소'} 기능은 추후 구현 예정입니다.`);
  };

  const handleHistoryDetail = (id: number) => {
    alert(`신청내역 ID ${id} 상세보기 기능은 추후 구현 예정입니다.`);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto flex gap-6">
        {/* 왼쪽: 수강신청 메인 카드 */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200">
          {/* 상단 제목 영역 */}
          <div className="px-8 pt-6 pb-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-sky-800">수강신청</h1>
            <p className="mt-1 text-sm text-gray-500">
              담당 강의 및 희망 과목을 관리하고, 신청 내역을 확인할 수 있습니다.
            </p>
          </div>

          {/* 서브 탭: 수강신청 / 희망과목 / 신청내역 확인 */}
          <div className="px-8 pt-4 border-b border-gray-200">
            <div className="flex gap-2">
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'apply'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('apply')}
              >
                수강신청
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'wishlist'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('wishlist')}
              >
                희망과목
              </button>
              <button
                type="button"
                className={`px-6 py-2 text-sm font-semibold border-t border-x rounded-t-md
                  ${
                    activeTab === 'history'
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                  }`}
                onClick={() => setActiveTab('history')}
              >
                신청내역 확인
              </button>
            </div>
          </div>

          {/* 본문 */}
          <div className="px-8 py-6">
            {/* 내 정보 */}
            <section className="mb-6">
              <h3 className="text-sm font-semibold text-sky-700 mb-2">내 정보</h3>
              <div className="grid grid-cols-[80px_1fr] items-center gap-y-2 text-sm">
                <div className="text-gray-500">이름</div>
                <div className="border border-gray-300 rounded px-3 py-1 bg-gray-50">
                  {profile?.fullName || '---'}
                </div>
                <div className="text-gray-500">전공분야</div>
                <div className="border border-gray-300 rounded px-3 py-1 bg-gray-50">
                  {profile?.major || '---'}
                </div>
              </div>
            </section>

            {/* 탭별 내용 */}
            {activeTab === 'apply' && (
              <section>
                {/* 강의 검색 영역 */}
                <div className="flex items-end gap-4 mb-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">분야</label>
                    <select
                      className="border border-gray-300 rounded px-3 py-2 text-sm bg-white min-w-[120px]"
                      value={searchField}
                      onChange={(e) => setSearchField(e.target.value)}
                    >
                      <option value="전체">전체</option>
                      <option value="전공">전공</option>
                      <option value="교양">교양</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-gray-500 mb-1">입력란</label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                      placeholder="교과목명 입력"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleSearch}
                    className="h-[38px] px-5 text-sm font-semibold rounded bg-sky-600 text-white hover:bg-sky-700"
                  >
                    검색
                  </button>
                </div>

                {/* 강의 목록 테이블 */}
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">번호</th>
                        <th className="px-3 py-2 border">강의명</th>
                        <th className="px-3 py-2 border">분야</th>
                        <th className="px-3 py-2 border">강사명</th>
                        <th className="px-3 py-2 border">강의계획서</th>
                        <th className="px-3 py-2 border">신청하기</th>
                        <th className="px-3 py-2 border">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading && (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-gray-500">
                            강의 목록을 불러오는 중입니다...
                          </td>
                        </tr>
                      )}
                      {!loading && error && (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-red-500">
                            {error}
                          </td>
                        </tr>
                      )}
                      {!loading && !error && lectures.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-3 py-6 text-gray-500">
                            표시할 강의가 없습니다.
                          </td>
                        </tr>
                      )}
                      {!loading &&
                        !error &&
                        lectures.map((lec, idx) => (
                          <tr key={lec.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">{idx + 1}</td>
                            <td className="px-3 py-2 border text-left">
                              <div className="font-medium">{lec.name || '-'}</div>
                              {lec.day_time && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {lec.day_time} / {lec.room || '-'}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 border">{lec.field || '-'}</td>
                            <td className="px-3 py-2 border">
                              {lec.instructor_name || profile?.fullName || '-'}
                            </td>
                            <td className="px-3 py-2 border">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs rounded bg-white border border-sky-600 text-sky-700 hover:bg-sky-50"
                                onClick={() => alert('강의계획서 보기 기능은 추후 구현 예정입니다.')}
                              >
                                강의계획서
                              </button>
                            </td>
                            <td className="px-3 py-2 border">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs rounded bg-sky-600 text-white hover:bg-sky-700"
                                onClick={() => handleClickApply(lec.id)}
                              >
                                신청하기
                              </button>
                            </td>
                            <td className="px-3 py-2 border text-xs text-gray-500">
                              {lec.capacity
                                ? `신청 ${lec.enrolled_count ?? 0} / 정원 ${lec.capacity}`
                                : getStatusKorean(lec.status)}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'wishlist' && (
              <section>
                <h3 className="text-sm font-semibold text-sky-700 mb-3">희망과목 목록</h3>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">번호</th>
                        <th className="px-3 py-2 border">과목명</th>
                        <th className="px-3 py-2 border">강사명</th>
                        <th className="px-3 py-2 border">학점</th>
                        <th className="px-3 py-2 border">상태</th>
                        <th className="px-3 py-2 border">신청 / 취소</th>
                      </tr>
                    </thead>
                    <tbody>
                      {wishList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-gray-500">
                            희망과목이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        wishList.map((w, idx) => (
                          <tr key={w.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">{idx + 1}</td>
                            <td className="px-3 py-2 border text-left">{w.name}</td>
                            <td className="px-3 py-2 border">{w.instructor_name}</td>
                            <td className="px-3 py-2 border">{w.credit}</td>
                            <td className="px-3 py-2 border">{w.status}</td>
                            <td className="px-3 py-2 border">
                              {w.status === '장바구니' ? (
                                <button
                                  type="button"
                                  className="px-3 py-1 text-xs rounded bg-sky-600 text-white hover:bg-sky-700"
                                  onClick={() => handleWishAction(w.id, 'apply')}
                                >
                                  신청
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  className="px-3 py-1 text-xs rounded bg-white border border-gray-400 text-gray-600 hover:bg-gray-50"
                                  onClick={() => handleWishAction(w.id, 'cancel')}
                                >
                                  취소
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activeTab === 'history' && (
              <section>
                <h3 className="text-sm font-semibold text-sky-700 mb-3">신청내역 확인</h3>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <table className="w-full text-center text-sm">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-2 border">번호</th>
                        <th className="px-3 py-2 border">과목명</th>
                        <th className="px-3 py-2 border">강의계획서</th>
                        <th className="px-3 py-2 border">신청상태</th>
                        <th className="px-3 py-2 border">신청완료여부</th>
                        <th className="px-3 py-2 border">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyList.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-gray-500">
                            신청내역이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        historyList.map((h, idx) => (
                          <tr key={h.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2 border">{idx + 1}</td>
                            <td className="px-3 py-2 border text-left">{h.name}</td>
                            <td className="px-3 py-2 border">
                              <button
                                type="button"
                                className="px-3 py-1 text-xs rounded bg-white border border-sky-600 text-sky-700 hover:bg-sky-50"
                                onClick={() => handleHistoryDetail(h.id)}
                              >
                                {h.syllabus}
                              </button>
                            </td>
                            <td className="px-3 py-2 border">{h.status}</td>
                            <td className="px-3 py-2 border">{h.result}</td>
                            <td className="px-3 py-2 border text-xs text-gray-500">-</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        </div>

        {/* 오른쪽: 프로필 패널 */}
        <aside className="w-[260px] bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h2 className="text-base font-semibold mb-4">프로필</h2>
          <div className="flex flex-col items-center mb-4">
            <div className="w-24 h-24 rounded-full border border-gray-300 bg-gray-100 mb-3" />
            <div className="text-sm font-semibold">
              {profile?.fullName || '이름'}
            </div>
            <div className="text-xs text-gray-500">
              {profile?.major || '전공분야'}
            </div>
          </div>
          <button
            type="button"
            className="w-full mb-4 py-2 text-sm font-semibold rounded bg-sky-600 text-white hover:bg-sky-700"
          >
            프로필 수정
          </button>

          <div className="border-t border-gray-200 pt-4 mt-2 text-sm">
            <div className="mb-3">
              <div className="font-semibold mb-1">강의 수</div>
              <div className="border border-gray-300 rounded px-3 py-1 bg-gray-50">
                {lectures.length} 개
              </div>
            </div>
            <div className="mb-3">
              <div className="font-semibold mb-1">상태</div>
              <div className="border border-gray-300 rounded px-3 py-1 bg-gray-50">
                활동 중
              </div>
            </div>
            <div>
              <div className="font-semibold mb-1">메모</div>
              <div className="border border-gray-300 rounded px-3 py-2 bg-gray-50 text-xs text-gray-500 h-20">
                자기소개서 / 한 줄 메모 영역
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
