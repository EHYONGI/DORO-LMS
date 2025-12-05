// app/teacher/dashboard/courses/[id]/assignments/[assignmentId]/submissions/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Submission {
    id: number;
    student_name: string;
    content: string;
    submitted_at: string;
    grade?: number;
    feedback?: string;
    file?: string;
}

// [수정] 백엔드 Serializer(AssignmentSerializer)에 맞춰 필드명 변경
interface Assignment {
    id: number;
    title: string;
    content: string;   // description -> content
    deadline: string;  // due_date -> deadline
}

export default function SubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;
    const assignmentId = params.assignmentId;

    const [assignment, setAssignment] = useState<Assignment | null>(null);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [loading, setLoading] = useState(true);

    // [채점 모달 상태]
    const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
    const [gradeInput, setGradeInput] = useState('');
    const [feedbackInput, setFeedbackInput] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                // 1. 과제 정보 조회
                const assignmentRes = await fetch(`http://127.0.0.1:8000/api/lectures/${courseId}/assignments/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (assignmentRes.ok) {
                    const assignments = await assignmentRes.json();
                    const current = assignments.find((a: Assignment) => a.id === parseInt(assignmentId as string));
                    setAssignment(current);
                }

                // 2. 학생들 제출 현황 조회
                const submissionsRes = await fetch(`http://127.0.0.1:8000/api/lectures/teacher/assignments/${assignmentId}/submissions/`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                });
                if (submissionsRes.ok) {
                    setSubmissions(await submissionsRes.json());
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [courseId, assignmentId, router]);

    // 채점 모달 열기
    const openGradingModal = (submission: Submission) => {
        setGradingSubmission(submission);
        setGradeInput(submission.grade?.toString() || '');
        setFeedbackInput(submission.feedback || '');
    };

    // 채점 모달 닫기
    const closeGradingModal = () => {
        setGradingSubmission(null);
        setGradeInput('');
        setFeedbackInput('');
    };

    // 채점 저장 핸들러
    const handleSaveGrade = async () => {
        if (!gradingSubmission) return;
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/teacher/submissions/${gradingSubmission.id}/grade/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    grade: parseInt(gradeInput),
                    feedback: feedbackInput
                }),
            });

            if (res.ok) {
                alert("채점이 완료되었습니다.");

                // 목록 즉시 갱신 (새로고침 없이 반영)
                setSubmissions(prev => prev.map(sub =>
                    sub.id === gradingSubmission.id
                        ? { ...sub, grade: parseInt(gradeInput), feedback: feedbackInput }
                        : sub
                ));
                closeGradingModal();
            } else {
                alert("저장에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("오류가 발생했습니다.");
        }
    };

    // 파일 URL 처리 함수
    const getFileUrl = (path: string | undefined) => {
        if (!path) return '#';
        if (path.startsWith('http')) return path;
        return `http://127.0.0.1:8000${path}`;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    };

    if (loading) return <div className="p-10 text-center text-gray-500">로딩 중...</div>;

    return (
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative">
            <button
                onClick={() => router.push(`/teacher/dashboard/courses/${courseId}/management`)}
                className="text-sm text-gray-500 hover:text-sky-600 mb-4 flex items-center gap-1"
            >
                ← 목록으로 돌아가기
            </button>

            {/* 과제 정보 헤더 */}
            {assignment && (
                <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
                    <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 mb-4 whitespace-pre-wrap border border-gray-100">
                        {/* [수정] description -> content 사용 */}
                        {assignment.content}
                    </div>
                    <div className="flex gap-4 text-sm text-gray-500 border-t pt-4">
                        {/* [수정] due_date -> deadline 사용 */}
                        <span>📅 마감일: {formatDate(assignment.deadline)}</span>
                        <span>📝 제출 인원: <strong className="text-sky-600">{submissions.length}명</strong></span>
                    </div>
                </div>
            )}

            {/* 제출 현황 테이블 */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-800">학생 제출 현황</h2>
                </div>

                <table className="w-full text-sm">
                    <thead className="bg-white border-b border-gray-200 text-gray-600">
                        <tr>
                            <th className="py-3 px-4 text-center font-medium w-16">번호</th>
                            <th className="py-3 px-4 text-center font-medium w-32">학생명</th>
                            <th className="py-3 px-4 text-left font-medium">제출 내용 / 파일</th>
                            <th className="py-3 px-4 text-center font-medium w-40">제출일시</th>
                            <th className="py-3 px-4 text-center font-medium w-24">점수</th>
                            <th className="py-3 px-4 text-center font-medium w-24">채점</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {submissions.length > 0 ? submissions.map((submission, index) => (
                            <tr key={submission.id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-4 text-center text-gray-500">{index + 1}</td>
                                <td className="py-4 px-4 text-center text-gray-800 font-bold">
                                    {submission.student_name}
                                </td>
                                <td className="py-4 px-4 text-gray-700">
                                    <div className="mb-1 text-sm">{submission.content}</div>
                                    {submission.file && (
                                        <a
                                            href={getFileUrl(submission.file)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            download
                                            className="text-xs inline-flex items-center gap-1 text-sky-600 bg-sky-50 px-2 py-1 rounded hover:bg-sky-100 transition border border-sky-200"
                                        >
                                            📎 첨부파일 다운로드
                                        </a>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center text-gray-500 text-xs">
                                    {formatDate(submission.submitted_at)}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    {submission.grade != null ? (
                                        <span className="text-sky-600 font-bold text-lg">{submission.grade}</span>
                                    ) : (
                                        <span className="text-gray-400 text-xs">-</span>
                                    )}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <button
                                        onClick={() => openGradingModal(submission)}
                                        className={`px-3 py-1.5 rounded text-xs font-bold transition border
                                            ${submission.grade != null
                                                ? 'bg-white border-sky-200 text-sky-600 hover:bg-sky-50'
                                                : 'bg-sky-600 border-sky-600 text-white hover:bg-sky-700'}`}
                                    >
                                        {submission.grade != null ? '수정' : '채점'}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan={6} className="py-12 text-center text-gray-400">
                                    아직 제출된 과제가 없습니다.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* === 채점 모달 === */}
            {gradingSubmission && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="bg-gray-800 px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-white">과제 채점</h3>
                            <button onClick={closeGradingModal} className="text-gray-400 hover:text-white transition">✕</button>
                        </div>

                        <div className="p-6 space-y-5">
                            <div className="flex justify-between items-center border-b pb-4">
                                <div>
                                    <span className="text-xs text-gray-500 block mb-1">학생명</span>
                                    <span className="font-bold text-lg text-gray-800">{gradingSubmission.student_name}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-xs text-gray-500 block mb-1">제출일</span>
                                    <span className="text-sm text-gray-800">{new Date(gradingSubmission.submitted_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">점수 (0~100)</label>
                                <input
                                    type="number"
                                    min="0" max="100"
                                    className="w-full border border-gray-300 rounded-lg p-3 text-lg font-bold focus:ring-2 focus:ring-sky-500 outline-none"
                                    value={gradeInput}
                                    onChange={e => setGradeInput(e.target.value)}
                                    placeholder="점수를 입력하세요"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">피드백 (선택사항)</label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none resize-none h-32"
                                    value={feedbackInput}
                                    onChange={e => setFeedbackInput(e.target.value)}
                                    placeholder="학생에게 전달할 피드백을 입력하세요..."
                                />
                            </div>
                        </div>

                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                            <button
                                onClick={closeGradingModal}
                                className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition"
                            >
                                취소
                            </button>
                            <button
                                onClick={handleSaveGrade}
                                className="px-5 py-2.5 bg-sky-600 text-white rounded-lg text-sm font-bold hover:bg-sky-700 shadow-sm transition"
                            >
                                저장하기
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}