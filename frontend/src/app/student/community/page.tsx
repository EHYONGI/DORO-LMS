// src/app/student/community/page.tsx
'use client';

import { useEffect, useState } from 'react';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8000';

interface CommunityPost {
  id: number;
  title: string;
  content: string;
  author?: string;
  created_at?: string;
  comment_count?: number;
}

export default function StudentCommunityPage() {
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [creating, setCreating] = useState(false);

  const loadPosts = async () => {
    setLoading(true);
    setError('');

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access')
          : null;

      const res = await fetch(`${API_BASE_URL}/api/community`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        throw new Error('커뮤니티 글을 불러오지 못했습니다.');
      }

      const data = await res.json();
      const list: CommunityPost[] = Array.isArray(data) ? data : data.results ?? [];
      setPosts(list);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? '알 수 없는 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    setCreating(true);
    setError('');

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('access')
          : null;

      const res = await fetch(`${API_BASE_URL}/api/community`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          title: newTitle.trim(),
          content: newContent.trim(),
        }),
      });

      if (!res.ok) {
        throw new Error('글 작성에 실패했습니다.');
      }

      setNewTitle('');
      setNewContent('');
      // 다시 목록 로드
      await loadPosts();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? '알 수 없는 오류가 발생했습니다.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold">커뮤니티</h1>

      {/* 글 작성 영역 */}
      <section className="rounded-lg bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold">새 글 작성</h2>
        <form className="space-y-3" onSubmit={handleCreatePost}>
          <input
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="제목을 입력하세요"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <textarea
            className="min-h-[120px] w-full rounded border px-3 py-2 text-sm"
            placeholder="내용을 입력하세요"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
            >
              {creating ? '작성 중...' : '등록'}
            </button>
          </div>
        </form>
      </section>

      {/* 글 목록 영역 */}
      <section className="rounded-lg bg-white p-4 shadow-sm">
        {loading && (
          <p className="py-4 text-center text-sm text-gray-500">
            글을 불러오는 중입니다...
          </p>
        )}

        {error && !loading && (
          <p className="py-4 text-center text-sm text-red-500">{error}</p>
        )}

        {!loading && !error && posts.length === 0 && (
          <p className="py-4 text-center text-sm text-gray-400">
            등록된 글이 없습니다. 첫 글을 작성해보세요!
          </p>
        )}

        {!loading && !error && posts.length > 0 && (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="cursor-pointer rounded border px-3 py-2 text-sm hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{post.title}</h3>
                  <span className="text-xs text-gray-400">
                    {post.created_at
                      ? new Date(post.created_at).toLocaleString()
                      : ''}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                  {post.content}
                </p>
                <div className="mt-1 flex gap-3 text-xs text-gray-400">
                  {post.author && <span>작성자 {post.author}</span>}
                  {typeof post.comment_count === 'number' && (
                    <span>댓글 {post.comment_count}개</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
