import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-white">

      {/* === 메인 비주얼 영역 (Hero Section) === */}
      <div className="relative w-full h-[600px] bg-gray-900 text-white overflow-hidden">

        {/* 1. 배경 이미지 (Unsplash 무료 이미지 사용 - 로봇 관련) */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop')",
          }}
        >
          {/* 검은색 오버레이 (글자 잘 보이게) */}
          <div className="absolute inset-0 bg-black/50" />
        </div>

        {/* 2. 콘텐츠 컨테이너 */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-center">

          {/* 우측 상단 버튼들 (이미지 참고) */}
          <div className="absolute top-8 right-4 sm:right-8 flex gap-3">
            <button className="border border-white/40 bg-white/10 backdrop-blur-sm rounded-full px-5 py-1.5 text-xs font-medium hover:bg-white/20 transition">
              DORO 이달의 하이라이트
            </button>
            <button className="border border-white/40 bg-white/10 backdrop-blur-sm rounded-full px-5 py-1.5 text-xs font-medium hover:bg-white/20 transition">
              교육 문의
            </button>
          </div>

          {/* 중앙~하단 콘텐츠 그리드 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end pb-20 h-full">

            {/* 좌측: 메인 텍스트 */}
            <div className="mb-10 lg:mb-0 flex flex-col justify-center">
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 drop-shadow-lg">
                Do with Robot<br />
                : AI 로봇시대 생존교육
              </h1>
              <p className="text-lg md:text-xl text-gray-200 opacity-90 font-light drop-shadow-md">
                로봇 대중화 시대가 다가온다!<br />
                Korea No.1 Robot Edu Do with Robot
              </p>
            </div>

            {/* 우측: 통계 아이콘 그리드 */}
            <div className="flex justify-start lg:justify-end">
              <div className="grid grid-cols-2 gap-x-8 gap-y-8 bg-black/20 p-6 rounded-xl backdrop-blur-sm border border-white/10">

                {/* Stat 1: 대회 수상 실적 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1"><IconTrophy /></div>
                  <div>
                    <div className="font-bold text-sm mb-1">대회 수상 실적</div>
                    <div className="text-xs text-gray-300">대회 출전 · 개최 · 수상 경험 다수</div>
                  </div>
                </div>

                {/* Stat 2: 학생 만족도 조사 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1"><IconHeart /></div>
                  <div>
                    <div className="font-bold text-sm mb-1">학생 만족도 조사</div>
                    <div className="text-xs text-gray-300">
                      <span className="font-bold text-lg text-white">4.7</span> / 5.0
                    </div>
                  </div>
                </div>

                {/* Stat 3: 누적 교육 시간 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1"><IconBook /></div>
                  <div>
                    <div className="font-bold text-sm mb-1">누적 교육 시간</div>
                    <div className="text-xs text-gray-300">
                      <span className="font-bold text-lg text-white">5,208</span> 시간
                    </div>
                  </div>
                </div>

                {/* Stat 4: 누적 교육 수강생 */}
                <div className="flex items-start gap-3">
                  <div className="mt-1"><IconUser /></div>
                  <div>
                    <div className="font-bold text-sm mb-1">누적 교육 수강생</div>
                    <div className="text-xs text-gray-300">
                      <span className="font-bold text-lg text-white">40,350</span> 명
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === 하단 흰색 여백 (추가 콘텐츠 영역) === */}
      <div className="flex-grow bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">DORO와 함께 미래를 준비하세요</h2>
          <p className="text-gray-600 mb-8">체계적인 커리큘럼과 실습 중심의 교육을 제공합니다.</p>
          <Link href="/course-registration" className="inline-block bg-sky-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-sky-700 transition shadow-md">
            강의 둘러보기
          </Link>
        </div>
      </div>

    </main>
  );
}

// === 아이콘 컴포넌트 (SVG) ===
function IconTrophy() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0V5.625a2.625 2.625 0 11-5.25 0v9.75m-9-3.75a2.25 2.25 0 012.25-2.25h.75a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-.75a2.25 2.25 0 01-2.25-2.25v-3zm14.25 0a2.25 2.25 0 012.25-2.25h.75a2.25 2.25 0 012.25 2.25v3a2.25 2.25 0 01-2.25 2.25h-.75a2.25 2.25 0 01-2.25-2.25v-3z" /></svg>
  );
}

function IconHeart() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>
  );
}

function IconBook() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>
  );
}

function IconUser() {
  return (
    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A7.5 7.5 0 014.501 20.118z" /></svg>
  );
}