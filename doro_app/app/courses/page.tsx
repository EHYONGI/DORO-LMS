"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseTabs from "./CourseTabs";

type Course = {
  id: number;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  capacity: number;
  enrolled: number;
  description?: string;
};

export default function CoursesListPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses");
        
        if (!res.ok) {
          throw new Error("강의 목록 조회 실패");
        }

        const data = await res.json();
        setCourses(data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <>
      <header className="navbar">
        <div className="nav-left">
          <Link href="/" className="brand">
            <img src="/logo.png" alt="DORO" />
          </Link>
        </div>

        <nav className="nav-center">
          <Link href="/courses" className="nav-btn is-active">
            수강신청
          </Link>
          <Link href="/dashboard" className="nav-btn">
            대시보드
          </Link>
          <Link href="/counsel" className="nav-btn">
            상담페이지
          </Link>
          <Link href="/mypage" className="nav-btn">
            마이페이지
          </Link>
        </nav>

        <div className="nav-right">
          <button className="link-btn">로그아웃</button>
        </div>
      </header>

      <main className="counsel-page">
        <div className="counsel-container">
          <CourseTabs />
          <div style={{ padding: '24px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
              강의 목록
            </h2>

            {loading && (
              <p style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                불러오는 중...
              </p>
            )}

            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <div className="counsel-table-wrap">
                <table className="counsel-table">
                  <thead>
                    <tr>
                      <th>번호</th>
                      <th>강의명</th>
                      <th>담당교수</th>
                      <th>학점</th>
                      <th>시간</th>
                      <th>수강인원</th>
                      <th>상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ padding: '40px', color: '#999' }}>
                          등록된 강의가 없습니다.
                        </td>
                      </tr>
                    )}

                    {courses.map((course, index) => (
                      <tr key={course.id}>
                        <td>{index + 1}</td>
                        <td>{course.name}</td>
                        <td>{course.instructor}</td>
                        <td>{course.credits}</td>
                        <td>{course.schedule}</td>
                        <td>
                          {course.enrolled}/{course.capacity}
                        </td>
                        <td>
                          <button
                            className="btn-detail"
                            onClick={() => router.push(`/courses/${course.id}`)}
                          >
                            상세보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}