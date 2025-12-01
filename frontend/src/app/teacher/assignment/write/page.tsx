// src/app/teacher/assignment/write/page.tsx
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function TeacherAssignmentWritePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const courseId = searchParams.get('course') ?? '1';
  const editingId = searchParams.get('assignmentId'); // 지금은 사용 X (업로드 중심)

  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(''); // "2025-12-01T23:59" 같은 형태
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('access_token');
    if (!token) {
      alert('로그인이 필요합니다.');
      router.push('/login');
      return;
    }

    if (!title.trim()) {
      alert('과제 제목을 입력해 주세요.');
      return;
    }

    if (!deadline) {
      alert('마감일을 선택해 주세요.');
      return;
    }

    setSaving(true);

    try {
      // HTML datetime-local → ISO 문자열로 변환
      const deadlineISO = new Date(deadline).toISOString();

      const url = `${API_BASE_URL}/api/lecture/${courseId}/assignments/`;
      console.log('[Assignment WRITE] POST URL =', url);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          content,
          deadline: deadlineISO,
        }),
      });

      console.log('[Assignment WRITE] status =', res.status);

      if (!res.ok) {
        let data: any = null;
        try {
          data = await res.json();
        } catch (_) {
          // JSON 아닐 수도 있어서 무시
        }
        console.error('[Assignment WRITE] error response =', data);

        alert(
          `과제 등록에 실패했습니다.\n(status: ${res.status}${
            data?.detail ? `, detail: ${data.detail}` : ''
          })`,
        );
        return;
      }

      alert('과제가 성공적으로 등록되었습니다.');
      router.push(`/teacher/assignment?course=${courseId}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-6 py-8">
      <div className="max-w-5xl mx-auto">
        {/* 상단 제목 */}
        <h1 className="text-xl font-bold text-gray-800 mb-4">
          {editingId ? '과제 수정' : '새 과제 등록'}
        </h1>

        {/* 메인 박스 */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium mb-1">과제 제목</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
                placeholder="과제 제목을 입력하세요"
              />
            </div>

            {/* 마감일 */}
            <div>
              <label className="block text-sm font-medium mb-1">마감일</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-sky-600"
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium mb-1">과제 내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-48 border border-gray-300 rounded px-3 py-2 text-sm resize-none focus:outline-none focus:border-sky-600"
                placeholder="과제 설명, 제출 형식 등을 적어 주세요."
              />
            </div>

            {/* 버튼들 */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-sm border border-gray-300 rounded bg-white hover:bg-gray-50"
              >
                취소
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm rounded bg-sky-600 text-white hover:bg-sky-700 disabled:opacity-60"
              >
                {saving ? '저장 중...' : '등록하기'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
