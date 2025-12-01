// src/app/teacher/assignment/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Assignment {
  id: number;
  title: string;
  deadline: string;
  content: string;
  lecture_name?: string;
}

export default function TeacherAssignmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get('course') ?? '1';

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 과제 목록 불러오기
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('access_token');
    if (!token) {
      setError('로그인이 필요합니다.');
      setLoading(false);
      return;
    }

    async function fetchAssignments() {
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/api/lecture/${courseId}/assignments/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!res.ok) {
          throw new Error('과제 목록을 불러오지 못했습니다.');
        }

        const data: Assignment[] = await res.json();
        setAssignments(data);
      } catch (err: any) {
        setError(err.message ?? '오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    }

    fetchAssignments();
  }, [courseId]);

  const handleCreate = () => {
    router.push(`/teacher/assignment/write?course=${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* 상단 타이틀 + 새 과제 버튼 */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800">과제 관리</h1>
          <button
            type="button"
            onClick={handleCreate}
            className="px-4 py-2 text-sm bg-sky-600 text-white rounded hover:bg-sky-700"
          >
            새 과제 등록
          </button>
        </div>

        {/* 목록 박스 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          {loading && (
            <div className="p-6 text-sm text-gray-500">과제 목록을 불러오는 중입니다…</div>
          )}

          {!loading && error && (
            <div className="p-6 text-sm text-red-500">{error}</div>
          )}

          {!loading && !error && assignments.length === 0 && (
            <div className="p-6 text-sm text-gray-500">
              아직 등록된 과제가 없습니다. 우측 상단 버튼으로 새 과제를 추가할 수 있습니다.
            </div>
          )}

          {!loading && !error && assignments.length > 0 && (
            <ul>
              {assignments.map((a) => (
                <li
                  key={a.id}
                  className="px-6 py-4 border-t border-gray-200 first:border-t-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/teacher/assignment/write?course=${courseId}&assignmentId=${a.id}`,
                    )
                  }
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        마감일:{' '}
                        {a.deadline
                          ? new Date(a.deadline).toLocaleString()
                          : '마감일 미설정'}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
