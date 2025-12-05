'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Submission {
    id: number;
    student_id: number;
    student_name: string;
    content: string;
    file_url?: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
    graded_at?: string;
}

interface Assignment {
    id: number;
    title: string;
    content: string;  // serializer에서 description -> content로 매핑
    deadline: string;  // serializer에서 due_date -> deadline으로 매핑
}

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const assignmentId = params.assignmentId;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);
    const [gradingSubmission, setGradingSubmission] = useState<number | null>(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');

    useEffect(() => {
        fetchData();
    }, [courseId, assignmentId]);

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        try {
            // 1. 과제 정보 가져오기
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
            } else {
                console.error('과제 정보 로딩 실패');
            }

            // 2. 제출 현황 가져오기
            const submissionsRes = await fetch(
                `http://127.0.0.1:8000/api/lecture/${courseId}/assignments/${assignmentId}/submissions/`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                }
            );

            if (submissionsRes.ok) {
                const submissionsData = await submissionsRes.json();
                setSubmissions(submissionsData);
            } else {
                console.error('제출 현황 로딩 실패');
            }
        } catch (err) {
            console.error('데이터 로딩 에러:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleGrade = async (submissionId: number) => {
        const token = localStorage.getItem('access_token');
        
        if (!gradeInput || parseInt(gradeInput) < 0 || parseInt(gradeInput) > 100) {
            alert('0~100 사이의 점수를 입력해주세요.');
            return;
        }
        
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/api/lecture/${courseId}/assignments/${assignmentId}/submissions/${submissionId}/grade/`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        grade: parseInt(gradeInput),
                        feedback: feedbackInput,
                    }),
                }
            );

            if (res.ok) {
                const updatedSubmission = await res.json();
                // 제출 목록 업데이트
                setSubmissions(prev => 
                    prev.map(s => s.id === submissionId ? updatedSubmission : s)
                );
                setGradingSubmission(null);
                setGradeInput('');
                setFeedbackInput('');
                alert('채점이 완료되었습니다.');
            } else {
                const errorData = await res.json();
                alert(errorData.detail || '채점 중 오류가 발생했습니다.');
            }
        } catch (err) {
            console.error('채점 에러:', err);
            alert('채점 중 오류가 발생했습니다.');
        }
    };

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
                    <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{assignment.content}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                        <span>📅 마감일: {formatDate(assignment.deadline)}</span>
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
                            <th className="py-3 px-4 text-center font-semibold text-gray-700 w-32">점수/채점</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.length > 0 ? submissions.map((submission, index) => (
                            <tr key={submission.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-4 text-center text-gray-600">{index + 1}</td>
                                <td className="py-4 px-4 text-center text-gray-800 font-medium">
                                    {submission.student_name}
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                    <div className="mb-1">{submission.content}</div>
                                    {submission.file_url && (
                                        <a 
                                            href={submission.file_url} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="text-xs text-sky-600 hover:underline inline-flex items-center gap-1"
                                        >
                                            📎 첨부파일 보기
                                        </a>
                                    )}
                                    {submission.feedback && (
                                        <div className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                                            <strong>피드백:</strong> {submission.feedback}
                                        </div>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center text-gray-500 text-xs">
                                    {formatDate(submission.submitted_at)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {gradingSubmission === submission.id ? (
                                        <div className="space-y-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={gradeInput}
                                                onChange={(e) => setGradeInput(e.target.value)}
                                                placeholder="점수 (0-100)"
                                                className="w-24 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                                            />
                                            <textarea
                                                value={feedbackInput}
                                                onChange={(e) => setFeedbackInput(e.target.value)}
                                                placeholder="피드백 (선택사항)"
                                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                                                rows={2}
                                            />
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => handleGrade(submission.id)}
                                                    className="flex-1 bg-sky-600 text-white px-2 py-1 rounded text-xs hover:bg-sky-700"
                                                >
                                                    저장
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setGradingSubmission(null);
                                                        setGradeInput('');
                                                        setFeedbackInput('');
                                                    }}
                                                    className="flex-1 bg-gray-300 text-gray-700 px-2 py-1 rounded text-xs hover:bg-gray-400"
                                                >
                                                    취소
                                                </button>
                                            </div>
                                        </div>
                                    ) : submission.grade != null ? (
                                        <div className="space-y-1">
                                            <div className="text-sky-600 font-bold">{submission.grade}점</div>
                                            {submission.graded_at && (
                                                <div className="text-xs text-gray-400">
                                                    채점일: {formatDate(submission.graded_at)}
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setGradingSubmission(submission.id);
                                                    setGradeInput(submission.grade?.toString() || '');
                                                    setFeedbackInput(submission.feedback || '');
                                                }}
                                                className="text-xs text-gray-500 hover:text-sky-600 underline"
                                            >
                                                수정
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setGradingSubmission(submission.id);
                                                setGradeInput('');
                                                setFeedbackInput('');
                                            }}
                                            className="bg-sky-600 text-white px-3 py-1 rounded text-xs hover:bg-sky-700"
                                        >
                                            채점하기
                                        </button>
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