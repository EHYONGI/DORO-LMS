"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

type CourseDetail = {
  id: number;
  name: string;
  instructor: string;
  credits: number;
  schedule: string;
  capacity: number;
  enrolled: number;
  description: string;
  objectives: string[];
  prerequisites: string;
  isEnrolled: boolean;
  isWishlisted: boolean;
};

export default function CourseDetailPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourseDetail() {
      try {
        setLoading(true);
        const res = await fetch(`/api/courses/${courseId}`);

        if (!res.ok) {
          throw new Error("강의 정보 조회 실패");
        }

        const data = await res.json();
        setCourse(data);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDetail();
  }, [courseId]);

  async function handleEnroll() {
    if (!course) return;

    try {
      const res = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("수강신청 실패");
      }

      alert("수강신청이 완료되었습니다.");
      setCourse({ ...course, isEnrolled: true, enrolled: course.enrolled + 1 });
    } catch (e: any) {
      alert(e.message ?? "수강신청 중 오류가 발생했습니다.");
    }
  }

  async function handleWishlist() {
    if (!course) return;

    try {
      const method = course.isWishlisted ? "DELETE" : "POST";
      const res = await fetch(`/api/courses/${courseId}/wishlist`, {
        method,
      });

      if (!res.ok) {
        throw new Error(course.isWishlisted ? "관심강의 삭제 실패" : "관심강의 등록 실패");
      }

      alert(
        course.isWishlisted
          ? "관심강의에서 삭제되었습니다."
          : "관심강의에 등록되었습니다."
      );
      setCourse({ ...course, isWishlisted: !course.isWishlisted });
    } catch (e: any) {
      alert(e.message ?? "오류가 발생했습니다.");
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
          <div style={{ padding: "24px" }}>
            {loading && (
              <p style={{ padding: "40px", textAlign: "center", color: "#666" }}>
                불러오는 중...
              </p>
            )}

            {error && <p className="error-text">{error}</p>}

            {!loading && !error && course && (
              <>
                <div style={{ marginBottom: "24px" }}>
                  <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
                    {course.name}
                  </h2>
                  <p style={{ color: "#666", fontSize: "14px" }}>
                    담당교수: {course.instructor}
                  </p>
                </div>

                <div className="counsel-form">
                  <div className="counsel-form-row">
                    <div className="counsel-form-label">학점</div>
                    <div className="counsel-form-body">{course.credits}학점</div>
                  </div>

                  <div className="counsel-form-row">
                    <div className="counsel-form-label">강의시간</div>
                    <div className="counsel-form-body">{course.schedule}</div>
                  </div>

                  <div className="counsel-form-row">
                    <div className="counsel-form-label">수강인원</div>
                    <div className="counsel-form-body">
                      {course.enrolled}/{course.capacity}명
                      {course.enrolled >= course.capacity && (
                        <span style={{ marginLeft: "8px", color: "#e53935", fontWeight: "600" }}>
                          (마감)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="counsel-form-row">
                    <div className="counsel-form-label">선수과목</div>
                    <div className="counsel-form-body">
                      {course.prerequisites || "없음"}
                    </div>
                  </div>

                  <div className="counsel-form-row">
                    <div className="counsel-form-label">강의설명</div>
                    <div className="counsel-form-body">
                      <p style={{ lineHeight: "1.6" }}>{course.description}</p>
                    </div>
                  </div>

                  {course.objectives && course.objectives.length > 0 && (
                    <div className="counsel-form-row">
                      <div className="counsel-form-label">학습목표</div>
                      <div className="counsel-form-body">
                        <ul style={{ paddingLeft: "20px", lineHeight: "1.8" }}>
                          {course.objectives.map((obj, idx) => (
                            <li key={idx}>{obj}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>

                <div className="counsel-actions">
                  <button
                    type="button"
                    className="btn-gray"
                    onClick={() => router.push("/courses")}
                  >
                    목록으로
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={handleWishlist}
                  >
                    {course.isWishlisted ? "관심강의 삭제" : "관심강의 등록"}
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={handleEnroll}
                    disabled={course.isEnrolled || course.enrolled >= course.capacity}
                  >
                    {course.isEnrolled
                      ? "수강신청 완료"
                      : course.enrolled >= course.capacity
                      ? "마감"
                      : "수강신청"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}