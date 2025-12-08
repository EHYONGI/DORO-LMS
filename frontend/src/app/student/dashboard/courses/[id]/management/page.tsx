// app/student/dashboard/courses/[id]/management/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

// === 데이터 타입 정의 ===
interface Assignment {
    id: number;
    title: string;
    content: string;
    deadline: string;
}

interface Attendance {
    id: number;
    week: number;
    attendance_date: string;
    status: string;
}

interface MySubmission {
    id: number;
    content: string;
    file: string | null; // 파일 URL (백엔드 Serializer 필드명 변경 반영)
    submitted_at: string;
    grade: number | null;
    feedback: string | null;
}

export default function CourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id;

    const [activeMenu, setActiveMenu] = useState<'tasks' | 'attendance'>('tasks');

    const [tasks, setTasks] = useState<Assignment[]>([]);
    const [attendances, setAttendances] = useState<Attendance[]>([]);
    const [selectedTask, setSelectedTask] = useState<Assignment | null>(null);
    const [loading, setLoading] = useState(false);

    // 과제 제출 관련 상태
    const [submissionContent, setSubmissionContent] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null); // 실제 파일 객체
    const [mySubmission, setMySubmission] = useState<MySubmission | null>(null);

    // 1. 과제 목록 및 선택된 과제의 제출 내역 가져오기
    useEffect(() => {
        const fetchTasks = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/lectures/courses/${courseId}/assignments/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (res.ok) {
                    const courseTasks = await res.json();
                    setTasks(courseTasks);
                    if (courseTasks.length > 0) {
                        // 초기 로드시 첫번째 과제 선택
                        setSelectedTask(courseTasks[0]);
                    } else {
                        setSelectedTask(null);
                    }
                }
            } catch (err) {
                console.error('과제 로딩 에러:', err);
            }
        };

        if (activeMenu === 'tasks') {
            fetchTasks();
        }
    }, [courseId, activeMenu, router]);

    // 2. 선택된 과제가 바뀔 때마다 제출 내역(MySubmission) 불러오기
    useEffect(() => {
        if (!selectedTask) return;

        const fetchMySubmission = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch(`http://127.0.0.1:8000/api/lectures/assignments/${selectedTask.id}/my-submission/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok && res.status !== 204) {
                    const data = await res.json();
                    setMySubmission(data);
                    setSubmissionContent(data.content || '');
                    // 파일은 input type="file"에 value로 설정할 수 없으므로 상태만 초기화
                    setSelectedFile(null);
                } else {
                    // 제출 내역이 없으면 초기화
                    setMySubmission(null);
                    setSubmissionContent('');
                    setSelectedFile(null);
                }
            } catch (err) {
                console.error('제출 내역 로딩 에러:', err);
            }
        };
        fetchMySubmission();
    }, [selectedTask]);

    // 3. 출결 데이터 가져오기
    useEffect(() => {
        const fetchAttendances = async () => {
            const token = localStorage.getItem('access_token');
            setLoading(true);
            try {
                const res = await fetch(
                    `http://127.0.0.1:8000/api/lectures/courses/${courseId}/attendance/`,
                    {
                        headers: { 'Authorization': `Bearer ${token}` }
                    }
                );

                if (res.ok) {
                    setAttendances(await res.json());
                }
            } catch (err) { console.error('출결 로딩 에러:', err); } finally { setLoading(false); }
        };

        if (activeMenu === 'attendance') {
            fetchAttendances();
        }
    }, [courseId, activeMenu]);

    // 파일 선택 핸들러
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    // 과제 제출 핸들러 (FormData 사용)
    const handleSubmitTask = async () => {
        if (!selectedTask) return;
        if (!submissionContent.trim()) {
            alert("제출 내용을 입력해주세요.");
            return;
        }
        if (!confirm("과제를 제출하시겠습니까? (재제출 시 내용과 파일이 수정됩니다)")) return;

        const token = localStorage.getItem('access_token');

        // FormData 객체 생성
        const formData = new FormData();
        formData.append('content', submissionContent);
        if (selectedFile) {
            formData.append('file', selectedFile);
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/api/lectures/assignments/${selectedTask.id}/submit/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Content-Type은 브라우저가 자동으로 설정하므로 생략 (multipart/form-data)
                },
                body: formData
            });

            if (res.ok) {
                const data = await res.json();
                alert(data.message || "과제가 제출되었습니다.");

                // 제출 상태 즉시 업데이트
                setMySubmission({
                    ...data.data,
                    grade: mySubmission?.grade || null,
                    feedback: mySubmission?.feedback || null
                });
                setSelectedFile(null); // 파일 선택 초기화
            } else {
                const errData = await res.json();
                console.error("제출 실패:", errData);
                alert(errData.error || "제출에 실패했습니다.");
            }
        } catch (err) {
            console.error(err);
            alert("서버 오류가 발생했습니다.");
        }
    };

    // 출결 통계
    const stats = {
        total: attendances.length,
        present: attendances.filter(a => a.status === 'PRESENT').length,
        late: attendances.filter(a => a.status === 'LATE').length,
        absent: attendances.filter(a => a.status === 'ABSENT').length,
    };

    return (
        <div className="flex min-h-[600px] border border-gray-200 rounded-lg shadow-sm bg-white">
            {/* 좌측 사이드바 */}
            <div className="w-48 lg:w-56 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0">
                <div className="p-5 border-b border-gray-200 font-bold text-gray-700">대시보드</div>
                <nav className="flex-grow p-3 space-y-1">
                    <button onClick={() => setActiveMenu('tasks')} className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeMenu === 'tasks' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span> 과제
                    </button>
                    <button onClick={() => setActiveMenu('attendance')} className={`w-full text-left px-4 py-3 text-sm font-medium rounded-md transition flex items-center gap-2 ${activeMenu === 'attendance' ? 'bg-white text-sky-600 shadow-sm border border-gray-100' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span> 출결 현황
                    </button>
                </nav>
            </div>

            {/* 우측 메인 콘텐츠 */}
            <div className="flex-1 p-8 overflow-y-auto">
                {activeMenu === 'tasks' && (
                    <div className="h-full flex flex-col">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-100">과제</h2>
                        <div className="flex flex-1 gap-6">
                            {/* 과제 목록 */}
                            <div className="w-1/3 border-r pr-4 space-y-2 overflow-y-auto max-h-[500px]">
                                {tasks.length > 0 ? tasks.map(task => (
                                    <div
                                        key={task.id}
                                        onClick={() => setSelectedTask(task)}
                                        className={`p-3 rounded border cursor-pointer transition text-sm
                                            ${selectedTask?.id === task.id ? 'border-sky-500 bg-sky-50 text-sky-700' : 'border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        {task.title}
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-gray-400">과제가 없습니다.</div>
                                )}
                            </div>

                            {/* 과제 상세 및 제출 */}
                            <div className="flex-1 overflow-y-auto">
                                {selectedTask ? (
                                    <>
                                        <h3 className="text-xl font-bold mb-2">{selectedTask.title}</h3>
                                        <p className="text-sm text-gray-500 mb-4">
                                            마감일: {new Date(selectedTask.deadline).toLocaleDateString()}
                                        </p>
                                        <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 min-h-[100px] whitespace-pre-wrap mb-6 border border-gray-100">
                                            {selectedTask.content}
                                        </div>

                                        {/* 제출 영역 */}
                                        <div className="border-t border-gray-200 pt-4">
                                            <div className="flex justify-between items-end mb-2">
                                                <h4 className="font-bold text-gray-800">과제 제출</h4>
                                                {mySubmission && (
                                                    <span className="text-xs text-green-600 font-bold">
                                                        ✔ 제출됨 ({new Date(mySubmission.submitted_at).toLocaleString()})
                                                    </span>
                                                )}
                                            </div>

                                            {mySubmission?.grade != null && (
                                                <div className="bg-blue-50 p-3 rounded mb-4 border border-blue-100">
                                                    <div className="flex justify-between font-bold text-blue-800 mb-1">
                                                        <span>점수: {mySubmission.grade}점</span>
                                                    </div>
                                                    {mySubmission.feedback && (
                                                        <p className="text-sm text-blue-700">📢 피드백: {mySubmission.feedback}</p>
                                                    )}
                                                </div>
                                            )}

                                            <div className="space-y-3">
                                                <textarea
                                                    className="w-full border border-gray-300 p-3 rounded-lg h-32 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                                                    placeholder="과제 내용을 작성하세요..."
                                                    value={submissionContent}
                                                    onChange={(e) => setSubmissionContent(e.target.value)}
                                                />

                                                {/* 파일 첨부 영역 */}
                                                <div className="flex items-center gap-2">
                                                    <label className="block text-sm font-bold text-gray-700 shrink-0">
                                                        파일 첨부
                                                    </label>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileChange}
                                                        className="block w-full text-sm text-gray-500
                                                            file:mr-4 file:py-2 file:px-4
                                                            file:rounded-full file:border-0
                                                            file:text-xs file:font-semibold
                                                            file:bg-sky-50 file:text-sky-700
                                                            hover:file:bg-sky-100"
                                                    />
                                                </div>

                                                {/* 현재 제출된 파일 표시 */}
                                                {mySubmission?.file && !selectedFile && (
                                                    <p className="text-xs text-gray-500">
                                                        현재 제출된 파일: <a href={mySubmission.file} target="_blank" rel="noreferrer" className="text-sky-600 underline">다운로드</a>
                                                    </p>
                                                )}

                                                <div className="text-right">
                                                    <button
                                                        onClick={handleSubmitTask}
                                                        className="bg-sky-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-sky-700 transition shadow-sm"
                                                    >
                                                        {mySubmission ? '수정하여 제출' : '제출하기'}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-400 text-center mt-20">
                                        {tasks.length > 0 ? '좌측에서 과제를 선택하세요.' : '등록된 과제가 없습니다.'}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {activeMenu === 'attendance' && (
                    <div className="h-full">
                        <div className="flex items-center justify-between mb-6 text-sm bg-gray-50 p-3 rounded-lg border border-gray-200">
                            <div className="flex gap-4 font-medium text-gray-700">
                                <span>총 주차 <strong className="text-gray-900">{stats.total}</strong></span>
                                <span className="w-px h-4 bg-gray-300"></span>
                                <span>출석 <strong className="text-blue-600">{stats.present}</strong></span>
                                <span>결석 <strong className="text-red-600">{stats.absent}</strong></span>
                                <span>지각 <strong className="text-orange-500">{stats.late}</strong></span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full text-center text-sm">
                                <thead className="bg-gray-100 text-gray-700 font-semibold border-b border-gray-200">
                                    <tr>
                                        <th className="py-3 border-r border-gray-200">주차</th>
                                        <th className="py-3 border-r border-gray-200">출결일</th>
                                        <th className="py-3">출결여부</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {attendances.length > 0 ? attendances.map((att) => (
                                        <tr key={att.id} className="hover:bg-gray-50">
                                            <td className="py-4 font-medium text-gray-800 border-r border-gray-100">{att.week} 주차</td>
                                            <td className="py-4 text-gray-600 border-r border-gray-100">{new Date(att.attendance_date).toLocaleDateString()}</td>
                                            <td className="py-4 font-bold">
                                                {att.status === 'PRESENT' && <span className="text-blue-600">출석</span>}
                                                {att.status === 'LATE' && <span className="text-orange-500">지각</span>}
                                                {att.status === 'ABSENT' && <span className="text-red-600">결석</span>}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr><td colSpan={3} className="py-10 text-gray-400">출결 기록이 없습니다.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}