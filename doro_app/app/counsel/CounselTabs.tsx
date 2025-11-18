"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CounselTabs() {
  const pathname = usePathname();

  const isList = pathname === "/counsel";
  const isApply = pathname === "/counsel/apply";

  return (
    <div className="counsel-tabs">
      <Link
        href="/counsel"
        className={`counsel-tab ${isList ? "active" : ""}`}
      >
        나의 상담내역
      </Link>
      <Link
        href="/counsel/apply"
        className={`counsel-tab ${isApply ? "active" : ""}`}
      >
        상담신청
      </Link>
    </div>
  );
}