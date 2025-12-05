'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Submission {
    id: number;
    student_name: string;
    content: string;
    submitted_at: string;
    grade?: number;
}

interface Assignment {
    id: number;
    title: string;
    description: string;
    due_date: string;
}

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const assignmentId = params.assignmentId;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            try {
                // ✅ 과제 정보: /api/lectures/<lecture_id>/assignments/
                const assignmentRes = await fetch(
                    `http://127.0.0.1:8000/api/lectures/${courseId}/assignments/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }
                );
                
                if (assignmentRes.ok) {
                    const assignments = await assignmentRes.json();
                    const currentAssignment = assignments.find(
                        (a: Assignment) => a.id === parseInt(assignmentId as string, 10)
                    );
                    setAssignment(currentAssignment);
                }

                // 제출 현황 (임시 더미 데이터)
                setSubmissions([
                    { id: 1, student_name: '김학생', content: '과제 제출 완료', submitted_at: '2025-12-01T10:00:00', grade: 95 },
                    { id: 2, student_name: '이학생', content: '과제 제출 완료', submitted_at: '2025-12-02T14:30:00' },
                ]);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, assignmentId]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) {
        return <div className="p-10 text-center text-gray-500">로딩 중...</div>;
    }

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {/* 뒤로가기 */}
            <button
                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/management`)}
                className="text-sm text-gray-500 hover:text-sky-600 mb-4 flex items-center gap-1"
            >
                ← 목록으로 돌아가기
            </button>

            {/* 과제 정보 */}
            {assignment && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                    <p className="text-sm text-gray-600 mb-4">{assignment.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>📅 마감일: {formatDate(assignment.due_date)}</span>
                        <span>📝 제출: {submissions.length}명</span>
                    </div>
                </div>
            )}

            {/* 제출 현황 테이블 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">제출 현황</h2>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-20">번호</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-32">학생명</th>
                            <th className="py-3 px-4 text-left font-semibold text-gray-700">제출 내용</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-40">제출일시</th>
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-24">점수</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.length > 0 ? submissions.map((submission, index) => (
                            <tr key={submission.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-4 text-center text-gray-600">{index + 1}</td>
                                <td className="py-4 px-4 text-center text-gray-800 font-medium">
                                    {submission.student_name}
                                </td>
                                <td className="py-4 px-4 text-gray-700">{submission.content}</td>
                                <td className="py-4 px-4 text-center text-gray-500 text-xs">
                                    {formatDate(submission.submitted_at)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {submission.grade != null ? (
                                        <span className="text-sky-600 font-bold">{submission.grade}점</span>
                                    ) : (
                                        <span className="text-gray-400">미채점</span>
                                    )}
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={5} className="py-10 text-center text-gray-400">
                                    제출한 학생이 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
