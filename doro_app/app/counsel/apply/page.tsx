"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CounselTabs from "../CounselTabs";

export default function CounselApplyPage() {
  const router = useRouter();

  const [teacherId, setTeacherId] = useState<string>("");
  const [consultType, setConsultType] = useState("로봇");
  const [consultMethod, setConsultMethod] =
    useState<"대면상담" | "비대면상담">("대면상담");
  const [date, setDate] = useState("2025-10-20");
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError("상담강사를 선택해 주세요.");
      return;
    }
    if (!title.trim()) {
      setError("상담 제목을 입력해 주세요.");
      return;
    }
    if (!content.trim()) {
      setError("상담신청 내용을 입력해 주세요.");
      return;
    }

    try {
      setSubmitting(true);

      const body = {
        teacherId: Number(teacherId),
        consultType,
        consultMethod,
        date,
        startTime,
        endTime,
        title,
        content,
        attachmentIds: [] as number[],
      };

      const res = await fetch("/api/consult/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error("상담 신청 실패");
      }

      alert("상담 신청이 완료되었습니다.");
      router.push("/counsel");
    } catch (e: any) {
      setError(e.message ?? "신청 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setTeacherId("");
    setConsultType("로봇");
    setConsultMethod("대면상담");
    setDate("2025-10-20");
    setStartTime("09:00");
    setEndTime("10:00");
    setTitle("");
    setContent("");
    setError(null);
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
          <Link href="/courses" className="nav-btn">
            수강신청
          </Link>
          <Link href="/dashboard" className="nav-btn">
            대시보드
          </Link>
          <Link href="/counsel" className="nav-btn is-active">
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
          <CounselTabs />

          <form className="counsel-form" onSubmit={handleSubmit}>
            {/* 상담강사 선택 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담강사 선택
              </div>
              <div className="counsel-form-body">
                <select
                  className="c-select"
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                >
                  <option value="">상담강사</option>
                  <option value="1">김OO</option>
                  <option value="2">박OO</option>
                  <option value="3">이OO</option>
                </select>
                <p className="counsel-help">
                  상담을 희망하는 강사를 선택해 주세요.
                </p>
              </div>
            </div>

            {/* 상담형태 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담형태
              </div>
              <div className="counsel-form-body">
                <div className="counsel-radio-group">
                  <label>
                    <input
                      type="radio"
                      name="method"
                      value="대면상담"
                      checked={consultMethod === "대면상담"}
                      onChange={(e) =>
                        setConsultMethod(e.target.value as "대면상담")
                      }
                    />
                    대면상담
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="method"
                      value="비대면상담"
                      checked={consultMethod === "비대면상담"}
                      onChange={(e) =>
                        setConsultMethod(e.target.value as "비대면상담")
                      }
                    />
                    비대면상담
                  </label>
                </div>
              </div>
            </div>

            {/* 상담 희망일 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담희망일
              </div>
              <div className="counsel-form-body">
                <div className="counsel-datetime">
                  <input
                    type="date"
                    className="c-input"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                  <select
                    className="c-select"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    <option value="09:00">09:00</option>
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="13:00">13:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                  </select>
                  <span>~</span>
                  <select
                    className="c-select"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  >
                    <option value="10:00">10:00</option>
                    <option value="11:00">11:00</option>
                    <option value="12:00">12:00</option>
                    <option value="14:00">14:00</option>
                    <option value="15:00">15:00</option>
                    <option value="16:00">16:00</option>
                    <option value="17:00">17:00</option>
                  </select>
                </div>
                <p className="counsel-help">
                  상담을 희망하는 일자 및 시간을 선택해 주세요.
                </p>
              </div>
            </div>

            {/* 상담유형 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담유형
              </div>
              <div className="counsel-form-body">
                <select
                  className="c-select"
                  value={consultType}
                  onChange={(e) => setConsultType(e.target.value)}
                >
                  <option value="로봇">로봇</option>
                  <option value="인공지능">인공지능</option>
                  <option value="진로상담">진로상담</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>

            {/* 상담 제목 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담 제목
              </div>
              <div className="counsel-form-body">
                <input
                  className="c-input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="상담 제목을 입력해 주세요."
                />
              </div>
            </div>

            {/* 상담신청내용 */}
            <div className="counsel-form-row">
              <div className="counsel-form-label">
                <span className="required">*</span>상담신청내용
              </div>
              <div className="counsel-form-body">
                <textarea
                  className="c-textarea"
                  rows={8}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="상담 받고 싶은 내용, 현재 상황 등을 자세히 적어 주세요."
                />
              </div>
            </div>
          </form>

          {/* 하단 버튼 */}
          <div className="counsel-actions">
            <button
              type="button"
              className="btn-gray"
              onClick={() => router.push("/counsel")}
              disabled={submitting}
            >
              취소하기
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={handleReset}
              disabled={submitting}
            >
              내용 초기화
            </button>
            <button
              type="submit"
              className="btn"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "신청 중..." : "신청하기"}
            </button>
          </div>

          {error && (
            <p className="error-text">
              {error}
            </p>
          )}
        </div>
      </main>
    </>
  );
}