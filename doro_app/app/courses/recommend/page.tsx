"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CourseTabs from "../CourseTabs";

type RecommendedCourse = {
  id: number;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  capacity: number;
  enrolled: number;
  reason: string;
  matchScore: number;
};

export default function RecommendPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<RecommendedCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const res = await fetch("/api/courses/recommend");

        if (!res.ok) {
          throw new Error("추천 강의 조회 실패");
        }

        const data = await res.json();
        setCourses(data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
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
          <div style={{ padding: "24px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px" }}>
                  추천 강의
                </h2>
                <p style={{ fontSize: "13px", color: "#666" }}>
                  회원님의 관심분야와 수강이력을 기반으로 추천된 강의입니다.
                </p>
              </div>
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
                      <th>추천이유</th>
                      <th>매칭도</th>
                      <th>상세</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ padding: "40px", color: "#999" }}>
                          추천 강의가 없습니다.
                        </td>
                      </tr>
                    )}

                    {courses.map((course, index) => (
                      <tr key={course.id}>
                        <td>{index + 1}</td>
                        <td>{course.name}</td>
                        <td>{course.instructor}</td>
                        <td>{course.credits}</td>
                        <td style={{ whiteSpace: "nowrap" }}>{course.schedule}</td>
                        <td>
                          {course.enrolled}/{course.capacity}
                        </td>
                        <td>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              maxWidth: "200px",
                              lineHeight: "1.4",
                            }}
                          >
                            {course.reason}
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              fontWeight: "600",
                              color: course.matchScore >= 80 ? "#4a90b8" : "#666",
                            }}
                          >
                            {course.matchScore}%
                          </span>
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