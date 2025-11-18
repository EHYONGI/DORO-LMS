"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseTabs from "../CourseTabs";

type WishlistCourse = {
  id: number;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  capacity: number;
  enrolled: number;
};

export default function WishlistPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<WishlistCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWishlist() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses/wishlist");

        if (!res.ok) {
          throw new Error("관심강의 목록 조회 실패");
        }

        const data = await res.json();
        setCourses(data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchWishlist();
  }, []);

  async function handleRemove(courseId: number) {
    if (!confirm("관심강의에서 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/wishlist`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("관심강의 삭제 실패");
      }

      alert("관심강의에서 삭제되었습니다.");
      setCourses((prev) => prev.filter((course) => course.id !== courseId));
    } catch (e: any) {
      alert(e.message ?? "삭제 중 오류가 발생했습니다.");
    }
  }

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
          <div style={{ padding: "24px" }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
                관심강의 목록
              </h2>
              <Link href="/courses" className="btn-outline">
                전체 강의 보기
              </Link>
            </div>

            {loading && (
              <p style={{ padding: "40px", textAlign: "center", color: "#666" }}>
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
                      <th>삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "40px", color: "#999" }}>
                          관심강의가 없습니다.
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
                        <td>
                          <button
                            className="btn-outline btn-small"
                            onClick={() => handleRemove(course.id)}
                          >
                            삭제
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