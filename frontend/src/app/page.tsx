// src/app/page.tsx

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-64px)] bg-[#f5f5f5]">
      {/* 히어로 영역 */}
      <section className="relative mx-auto max-w-6xl px-4 pt-10 pb-16">
        <div className="relative overflow-hidden rounded-xl">

          {/* 🔥 home.png 배경 적용 */}
          <div
            className="h-[360px] w-full bg-cover bg-center opacity-60"
            style={{ backgroundImage: "url('/home.png')" }}
          />

        </div>
      </section>

      {/* 하단 카드 섹션 */}
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