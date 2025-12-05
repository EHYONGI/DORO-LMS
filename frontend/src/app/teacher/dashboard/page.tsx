// app/teacher/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface LectureSummary {
  id: number;
  name: string;
  code: string;
  studentCount: number;
}

interface NoticeSummary {
  id: number;
  title: string;
  lectureName?: string;
  createdAt: string;
}

interface CommunitySummary {
  id: number;
  title: string;
  lectureName?: string;
  createdAt: string;
}

type RecentType = 'NOTICE' | 'COMMUNITY';

interface RecentItem {
  id: number;
  title: string;
  lectureName?: string;
  createdAt: string;
  type: RecentType;
}

export default function TeacherDashboardPage() {
  const [lectures, setLectures] = useState<LectureSummary[]>([]);
  const [notices, setNotices] = useState<NoticeSummary[]>([]);
  const [communityPosts, setCommunityPosts] = useState<CommunitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [lectureRes, noticeRes, communityRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/teacher/dashboard/lectures/', {
            headers,
          }),
          fetch('http://127.0.0.1:8000/api/teacher/dashboard/notices/', {
            headers,
          }),
          fetch('http://127.0.0.1:8000/api/teacher/dashboard/community/', {
            headers,
          }),
        ]);

        if (lectureRes.ok) {
          const data = await lectureRes.json();
          setLectures(
            data.map((item: any) => ({
              id: item.id,
              name: item.name ?? item.lecture_name ?? '',
              code: item.code ?? item.lecture_code ?? '',
              studentCount: item.student_count ?? 0,
            })),
          );
        }

        if (noticeRes.ok) {
          const data = await noticeRes.json();
          setNotices(
            data.map((item: any) => ({
              id: item.id,
              title: item.title ?? '',
              lectureName: item.lecture_name ?? item.category ?? undefined,
              createdAt: item.created_at ?? '',
            })),
          );
        }

        if (communityRes.ok) {
          const data = await communityRes.json();
          setCommunityPosts(
            data.map((item: any) => ({
              id: item.id,
              title: item.title ?? '',
              lectureName: item.lecture_name ?? undefined,
              createdAt: item.created_at ?? '',
            })),
          );
        }
      } catch (e) {
        console.error('Teacher dashboard fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (d: string) => {
    if (!d) return '-';
    const date = new Date(d);
    if (Number.isNaN(date.getTime())) return d;
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(
      2,
      '0',
    )}.${String(date.getDate()).padStart(2, '0')}`;
  };

  // 학생 대시보드처럼: 이니셜 원형 아이콘
  const getInitial = (name: string) => {
    if (!name) return '?';
    return name.trim().charAt(0).toUpperCase();
  };

  // 공지 + 커뮤니티를 하나의 "최근 알림" 리스트로 합치기
  const recentItems: RecentItem[] = [
    ...notices.map((n) => ({
      id: n.id,
      title: n.title,
      lectureName: n.lectureName,
      createdAt: n.createdAt,
      type: 'NOTICE' as const,
    })),
    ...communityPosts.map((c) => ({
      id: c.id,
      title: c.title,
      lectureName: c.lectureName,
      createdAt: c.createdAt,
      type: 'COMMUNITY' as const,
    })),
  ]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 10);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2">
          강사 대시보드
        </h1>
        <div className="p-10 text-center text-gray-500">
          대시보드 정보를 불러오는 중입니다...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* 제목 부분 – 학생 대시보드 스타일 그대로 */}
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-sky-500 pb-2">
        강사 대시보드
      </h1>

      {/* 메인 2열 레이아웃 – 좌: 담당 강의 / 우: 최근 알림 */}
      <div className="flex flex-col lg:flex-row gap-6 h-[600px]">
        {/* [좌측] 담당 강의 목록 */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="flex justify-between items-end mb-4 px-1">
            <h2 className="text-lg font-bold text-gray-700">
              담당 강의 목록
            </h2>
            <span className="text-sm text-gray-500">
              총{' '}
              <span className="font-semibold text-gray-800">
                {lectures.length}
              </span>
              개의 강의를 담당 중입니다.
            </span>
          </div>

          <div className="space-y-4">
            {lectures.length > 0 ? (
              lectures.map((lec) => (
                <Link
                  key={lec.id}
                  href={`/dashboard/courses/${lec.id}/management`}
                  className="bg-white rounded-xl border border-gray-200 p-4 flex items-center justify-between cursor-pointer transition hover:border-sky-400 hover:shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    {/* 동그란 아이콘 – 학생용 카드와 같은 느낌 */}
                    <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 font-bold text-lg">
                      {getInitial(lec.name)}
                    </div>

                    {/* 텍스트 정보 */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-bold text-gray-800 group-hover:text-sky-600 transition">
                          {lec.name}
                        </h3>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                          {lec.code || '코드 미정'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">
                        수강 인원{' '}
                        <span className="font-semibold">
                          {lec.studentCount}
                        </span>
                        명
                      </p>
                    </div>
                  </div>

                  {/* > 화살표 아이콘 */}
                  <div className="text-gray-300 group-hover:text-sky-500 transition">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </Link>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 border rounded-xl bg-white h-full">
                <p className="mb-2 text-lg">담당 중인 강의가 없습니다.</p>
                <p className="text-sm">
                  강의가 생성되면 이 영역에서 바로 관리할 수 있습니다.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* [우측] 최근 알림 – 학생용 “📢 최근 알림” 카드 스타일 */}
        <div className="w-full lg:w-1/3 bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col h-full">
          <div className="mb-4 border-b pb-3 flex justify-between items-center">
            <h2 className="text-lg font-bold text-sky-600 flex items-center gap-2">
              <span>📢</span> 최근 알림
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto pr-1 space-y-3 custom-scrollbar">
            {recentItems.length > 0 ? (
              recentItems.map((item) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="p-3 rounded-lg hover:bg-gray-50 transition border border-gray-100 cursor-pointer group"
                >
                  <div className="flex justify-between text-xs mb-1.5">
                    <span
                      className={`font-bold px-1.5 py-0.5 rounded ${
                        item.type === 'NOTICE'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-emerald-100 text-emerald-600'
                      }`}
                    >
                      {item.type === 'NOTICE' ? '공지' : '커뮤니티'}
                    </span>
                    <span className="text-gray-400">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800 font-medium group-hover:text-sky-600 line-clamp-2">
                    {item.title}
                  </p>
                  {item.lectureName && (
                    <p className="mt-1 text-xs text-gray-500">
                      {item.lectureName}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 text-sm">
                새로운 알림이 없습니다.
              </div>
            )}
          </div>

          {/* 필요하면 아래에 “전체 보기” 버튼 추가해도 됨 */}
          <div className="pt-3 mt-3 border-t text-right text-xs">
            <Link
              href="/dashboard/notices"
              className="text-sky-600 hover:text-sky-700 font-medium mr-3"
            >
              공지 전체 보기 →
            </Link>
            <Link
              href="/dashboard/community"
              className="text-sky-600 hover:text-sky-700 font-medium"
            >
              커뮤니티 전체 보기 →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
