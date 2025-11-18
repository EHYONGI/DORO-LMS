"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseTabs from "../CourseTabs";

type EnrolledCourse = {
  id: number;
  courseId: number;
  courseName: string;
  instructor: string;
  credits: number;
  schedule: string;
  enrolledAt: string;
  status: "confirmed" | "pending" | "cancelled";
};

export default function EnrolledCoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEnrolledCourses() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses/enrolled");

        if (!res.ok) {
          throw new Error("신청내역 조회 실패");
        }

        const data = await res.json();
        setCourses(data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, []);

  async function handleCancel(enrollId: number) {
    if (!confirm("수강신청을 취소하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/courses/enroll/${enrollId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("수강신청 취소 실패");
      }

      alert("수강신청이 취소되었습니다.");
      setCourses((prev) => prev.filter((course) => course.id !== enrollId));
    } catch (e: any) {
      alert(e.message ?? "취소 중 오류가 발생했습니다.");
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "confirmed":
        return <span className="status-done">확정</span>;
      case "pending":
        return <span className="status-complete">대기중</span>;
      case "cancelled":
        return <span style={{ color: "#999" }}>취소</span>;
      default:
        return <span>{status}</span>;
    }
  }

  const totalCredits = courses
    .filter((c) => c.status === "confirmed")
    .reduce((sum, c) => sum + c.credits, 0);

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
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ fontSize: "20px", fontWeight: "bold" }}>
                신청내역 확인
              </h2>
              <div style={{ fontSize: "14px", color: "#666" }}>
                총 신청학점: <strong style={{ color: "#4a90b8" }}>{totalCredits}학점</strong>
              </div>
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
                      <th>신청일</th>
                      <th>상태</th>
                      <th>취소</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={8} style={{ padding: "40px", color: "#999" }}>
                          신청한 강의가 없습니다.
                        </td>
                      </tr>
                    )}

                    {courses.map((course, index) => (
                      <tr key={course.id}>
                        <td>{index + 1}</td>
                        <td>{course.courseName}</td>
                        <td>{course.instructor}</td>
                        <td>{course.credits}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{course.schedule}</td>
                        <td>{course.enrolledAt}</td>
                        <td>{getStatusBadge(course.status)}</td>
                        <td>
                          {course.status !== "cancelled" && (
                            <button
                              className="btn-outline btn-small"
                              onClick={() => handleCancel(course.id)}
                            >
                              취소
                            </button>
                          )}
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