// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      {/* 히어로 영역 */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-16">
        {/* 배경 이미지 영역 – 실제 이미지는 CSS(background-image)나 <Image>로 넣어도 됨 */}
        <div className="relative overflow-hidden rounded-xl bg-black/60">
          {/* 비디오/이미지 배경 대신 임시 회색 배경 */}
          <div className="h-[360px] w-full bg-cover bg-center bg-[url('/images/main_banner.jpg')] opacity-60" />

          {/* 내용 오버레이 */}
          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between px-10 py-8 text-white">
            {/* 왼쪽 메인 카피 */}
            <div>
              <p className="mb-2 text-sm font-light">Do with Robot</p>
              <h1 className="text-3xl font-bold leading-tight">
                AI 로봇시대 생존교육
              </h1>
              <p className="mt-3 text-sm text-gray-200">
                로봇 대중화 시대가 다가온다! <br />
                Korea No.1 Robot Edu Do with Robot
              </p>
            </div>

            {/* 오른쪽 하단 통계 카드들 */}
            <div className="flex flex-wrap justify-end gap-8 text-xs font-light">
              <div className="flex flex-col items-start gap-1">
                <span className="text-[11px] text-gray-300">대회 수상 실적</span>
                <span className="text-sm font-semibold">
                  대회 출전·개최 · 수상 경험 다수
                </span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-[11px] text-gray-300">누적 교육 시간</span>
                <span className="text-sm font-semibold">5,206 시간</span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-[11px] text-gray-300">학생 만족도 조사</span>
                <span className="text-sm font-semibold">4.7 / 5.0</span>
              </div>

              <div className="flex flex-col items-start gap-1">
                <span className="text-[11px] text-gray-300">누적 교육 수강생</span>
                <span className="text-sm font-semibold">40,350 명</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 아래 여백 + 간단 안내 섹션 (필요 없으면 삭제해도 됨) */}
      <section className="mx-auto mb-16 max-w-6xl px-4">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-800">
              로봇·AI 융합 교육
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              초·중·고 학생을 위한 단계별 로봇 코딩 커리큘럼으로
              하드웨어와 소프트웨어를 함께 경험할 수 있습니다.
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-800">
              대회·프로젝트 경험
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              실제 로봇 대회와 프로젝트를 통해
              문제 해결 능력과 팀 협업 능력을 함께 성장시킵니다.
            </p>
          </div>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="mb-2 text-sm font-semibold text-gray-800">
              진로·진학에 도움이 되는 포트폴리오
            </h2>
            <p className="text-xs text-gray-600 leading-relaxed">
              로봇 제작과 AI 프로젝트 결과물을 바탕으로
              학생 개개인의 포트폴리오를 만들어 갈 수 있습니다.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
