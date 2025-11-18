"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CourseTabs() {
  const pathname = usePathname();

  const isList = pathname === "/courses";
  const isRecommend = pathname === "/courses/recommend";
  const isWishlist = pathname === "/courses/wishlist";
  const isEnrolled = pathname === "/courses/enrolled";

  return (
    <div className="counsel-tabs">
      <Link
        href="/courses/recommend"
        className={`counsel-tab ${isRecommend ? "active" : ""}`}
      >
        강의 추천
      </Link>
      <Link
        href="/courses/wishlist"
        className={`counsel-tab ${isWishlist ? "active" : ""}`}
      >
        희망과목
      </Link>
      <Link
        href="/courses"
        className={`counsel-tab ${isList ? "active" : ""}`}
      >
        수강신청
      </Link>
      <Link
        href="/courses/enrolled"
        className={`counsel-tab ${isEnrolled ? "active" : ""}`}
      >
        신청내역 확인
      </Link>
    </div>
  );
}