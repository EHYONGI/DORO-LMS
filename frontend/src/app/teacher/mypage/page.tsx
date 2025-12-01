// src/app/teacher/mypage/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface UserProfile {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  interests: string | null;
  role: number | string | null;
}

type ActiveTab = 'profile' | 'lecture';

export default function TeacherMyPage() {
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');

  // 프로필 정보 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    async function fetchProfile() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/user/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error('프로필 정보를 불러오지 못했습니다.');
        }

        const data: UserProfile = await res.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message ?? '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const fullName =
    (profile?.last_name ?? '') + (profile?.first_name ?? '') ||
    profile?.username ||
    '';

  // 직종 / 직위 / 담당업무는 임시 값
  const jobType = profile?.interests ?? '';
  const position = '';
  const duty = '';

  const handleEditClick = () => {
    alert('프로필 수정 기능은 추후 추가 예정입니다 🙂');
  };

  const handleTabChange = (tab: ActiveTab) => {
    if (tab === 'profile') {
      setActiveTab('profile');
    } else {
      // 강의관리 탭 클릭 시 강사용 강의 관리 페이지로 이동
      router.push('/teacher/course');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200">
        {/* 상단 제목 */}
        <div className="px-8 pt-8 pb-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-sky-800">마이페이지</h1>
          <p className="mt-1 text-sm text-gray-500">
            강사 정보를 확인하고 프로필을 관리하는 페이지입니다.
          </p>
        </div>

        {/* 탭 영역 – 상담페이지와 동일 느낌 */}
        <div className="px-8 pt-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleTabChange('profile')}
              className={`px-6 py-2 rounded-t-lg font-semibold text-sm border
                ${
                  activeTab === 'profile'
                    ? 'bg-sky-600 text-white border-sky-600 border-b-white'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
            >
              프로필 관리
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('lecture')}
              className={`px-6 py-2 rounded-t-lg font-semibold text-sm border
                ${
                  activeTab === 'lecture'
                    ? 'bg-sky-600 text-white border-sky-600 border-b-white'
                    : 'bg-white text-gray-500 border-gray-300 hover:bg-gray-50'
                }`}
            >
              강의 관리
            </button>
          </div>
        </div>

        {/* 컨텐츠 영역 */}
        <div className="px-8 py-6">
          {loading && (
            <p className="text-sm text-gray-500">
              프로필 정보를 불러오는 중입니다…
            </p>
          )}

          {!loading && error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          {!loading && !error && profile && (
            <section className="border border-gray-200 rounded-md bg-white px-6 py-5">
              {/* 내 프로필 제목 + 수정 버튼 */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-800">내 프로필</h2>
                <button
                  type="button"
                  onClick={handleEditClick}
                  className="px-4 py-1.5 text-sm bg-gray-100 border border-gray-300 rounded shadow hover:bg-gray-200"
                >
                  수정하기
                </button>
              </div>

              <div className="flex gap-8">
                {/* 왼쪽 프로필 이미지 자리 */}
                <div className="flex-shrink-0">
                  <div className="w-32 h-32 rounded-md border border-gray-300 bg-gray-100 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-300" />
                  </div>
                </div>

                {/* 오른쪽 정보 테이블 */}
                <div className="flex-1 space-y-4">
                  {/* 이름 / 직종 / 직위 */}
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <th className="w-24 bg-gray-50 px-3 py-2 text-left font-medium">
                          성명
                        </th>
                        <td className="px-3 py-2">{fullName}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <th className="bg-gray-50 px-3 py-2 text-left font-medium">
                          직종
                        </th>
                        <td className="px-3 py-2">{jobType}</td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-3 py-2 text-left font-medium">
                          직위
                        </th>
                        <td className="px-3 py-2">{position}</td>
                      </tr>
                    </tbody>
                  </table>

                  {/* 이메일 / 전화번호 / 담당업무 */}
                  <table className="w-full border border-gray-300 text-sm">
                    <tbody>
                      <tr className="border-b border-gray-300">
                        <th className="w-24 bg-gray-50 px-3 py-2 text-left font-medium">
                          이메일
                        </th>
                        <td className="px-3 py-2">{profile.email}</td>
                      </tr>
                      <tr className="border-b border-gray-300">
                        <th className="bg-gray-50 px-3 py-2 text-left font-medium">
                          전화번호
                        </th>
                        <td className="px-3 py-2">{profile.phone ?? ''}</td>
                      </tr>
                      <tr>
                        <th className="bg-gray-50 px-3 py-2 text-left font-medium">
                          담당업무
                        </th>
                        <td className="px-3 py-2">{duty}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
