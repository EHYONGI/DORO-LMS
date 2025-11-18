"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import CounselTabs from "./CounselTabs";

type ScheduledAt = {
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
};

type ConsultItem = {
  id: number;
  consultType: string;
  consultMethod: string;
  teacherName: string;
  title: string;
  detail: string;
  scheduledAt: ScheduledAt;
  status: string;
  statusLabel?: string;
  statusStyle?: string;
  note?: string;
};

type ConsultListResponse = {
  items: ConsultItem[];
};

function getStatusClass(item: ConsultItem) {
  if (item.statusStyle === "secondary" || item.status === "DONE") {
    return "status-done";
  }
  return "status-complete";
}

function formatDateLabel(s: ScheduledAt) {
  return `${s.date}(${s.dayOfWeek}) ${s.startTime}-${s.endTime}`;
}

export default function CounselListPage() {
  const [items, setItems] = useState<ConsultItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/consult/list", { method: "GET" });
        if (!res.ok) {
          throw new Error("상담 내역 조회 실패");
        }

        const data: ConsultListResponse | ConsultItem[] = await res.json();
        const list = Array.isArray(data)
          ? data
          : (data as ConsultListResponse).items;

        setItems(list);
      } catch (e: any) {
        setError(e.message ?? "알 수 없는 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  async function handleStatusChange(id: number, status: string) {
    try {
      const res = await fetch(`/api/consult/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        throw new Error("상담 상태 변경 실패");
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, status } : item
        )
      );
      alert("상태가 변경되었습니다.");
    } catch (e: any) {
      alert(e.message ?? "상태 변경 중 오류가 발생했습니다.");
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

          <div className="counsel-filters">
            <select className="c-select">
              <option>상담유형</option>
              <option>로봇</option>
              <option>인공지능</option>
              <option>진로상담</option>
              <option>기타</option>
            </select>
            <select className="c-select">
              <option>상담형태</option>
              <option>대면상담</option>
              <option>비대면상담</option>
            </select>
            <select className="c-select">
              <option>상담강사</option>
              <option>김OO</option>
              <option>박OO</option>
            </select>
            <select className="c-select">
              <option>상태</option>
              <option>신청완료</option>
              <option>상담완료</option>
            </select>

            <Link href="/counsel/apply" className="btn-primary" style={{ marginLeft: 'auto' }}>
              + 상담신청
            </Link>
          </div>

          <div className="counsel-table-wrap">
            {loading && (
              <p style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                불러오는 중...
              </p>
            )}
            
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <table className="counsel-table">
                <thead>
                  <tr>
                    <th>번호</th>
                    <th>상담유형</th>
                    <th>상담형식</th>
                    <th>상담강사</th>
                    <th>상담 내용</th>
                    <th>상담일(상담예정일)</th>
                    <th>상태</th>
                    <th>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '40px', color: '#999' }}>
                        상담 내역이 없습니다.
                      </td>
                    </tr>
                  )}

                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.consultType}</td>
                      <td>{item.consultMethod}</td>
                      <td>{item.teacherName}</td>
                      <td>
                        <button
                          className="btn-detail"
                          type="button"
                          onClick={() =>
                            alert(`제목: ${item.title}\n\n내용:\n${item.detail}`)
                          }
                        >
                          자세히 보기
                        </button>
                      </td>
                      <td>{formatDateLabel(item.scheduledAt)}</td>
                      <td>
                        <span className={getStatusClass(item)}>
                          {item.statusLabel ??
                            (item.status === "DONE"
                              ? "상담완료"
                              : "신청완료")}
                        </span>
                      </td>
                      <td>
                        {item.status !== "DONE" && (
                          <button
                            className="btn-outline btn-small"
                            type="button"
                            onClick={() =>
                              handleStatusChange(item.id, "DONE")
                            }
                          >
                            완료 처리
                          </button>
                        )}
                        {item.note && <div style={{ marginTop: '4px', fontSize: '12px' }}>{item.note}</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </>
  );
}