'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AssignmentCreatePage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !description.trim() || !dueDate) {
            alert("모든 항목을 입력해주세요.");
            return;
        }

        setIsSubmitting(true);
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/lectures/${courseId}/assignments/`,
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title,
                        description,
                        due_date: dueDate,
                    }),
                }
            );

            if (res.ok) {
                alert("과제가 등록되었습니다.");
                router.push(`/teacher/dashboard/courses/${courseId}/management`);
            } else {
                alert("과제 등록에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("서버와 연결할 수 없습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b-2 border-gray-800 pb-4">
                과제 등록
            </h1>

            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm border border-gray-200">
                {/* 과제 제목 */}
                <div className="mb-6">
                    <label htmlFor="title" className="block text-sm font-bold text-gray-700 mb-2">
                        과제 제목 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                        placeholder="과제 제목을 입력하세요"
                    />
                </div>

                {/* 과제 설명 */}
                <div className="mb-6">
                    <label htmlFor="description" className="block text-sm font-bold text-gray-700 mb-2">
                        과제 설명 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                        placeholder="과제 설명을 입력하세요"
                    ></textarea>
                </div>

                {/* 마감일 */}
                <div className="mb-6">
                    <label htmlFor="dueDate" className="block text-sm font-bold text-gray-700 mb-2">
                        마감일 <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>

                {/* 버튼 */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition"
                    >
                        취소
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`px-6 py-2.5 bg-sky-600 text-white rounded-lg hover:bg-sky-700 font-bold transition shadow-sm
                            ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? '등록 중...' : '등록하기'}
                    </button>
                </div>
            </form>
        </div>
    );
}
