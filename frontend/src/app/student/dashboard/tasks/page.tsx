// app/dashboard/tasks/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Assignment {
    id: number;
    lecture_name: string;
    title: string;
    content: string;
    deadline: string;
}

export default function TasksPage() {
    const router = useRouter();
    const [tasks, setTasks] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchTasks = async () => {
            try {
                const res = await fetch('http://127.0.0.1:8000/api/dashboard/tasks/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    setTasks(await res.json());
                } else {
                    console.error("과제 목록 로딩 실패:", res.status);
                }
            } catch (error) {
                console.error("과제 목록 서버 에러:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTasks();
    }, [router]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ko-KR', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">과제 목록</h2>
            {loading ? (
                <p className="text-center text-gray-500 py-10">과제 정보를 불러오는 중입니다...</p>
            ) : tasks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {tasks.map((task) => (
                        <li key={task.id} className="py-4">
                            <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                            <p className="text-sm text-sky-600">{task.lecture_name}</p>
                            <p className="text-sm text-gray-600 mt-1">{task.content}</p>
                            <p className="text-xs text-gray-400 mt-2">마감 기한: {formatDate(task.deadline)}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-center text-gray-500 py-10">등록된 과제가 없습니다.</p>
            )}
        </div>
    );
}