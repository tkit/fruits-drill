import { Metadata } from "next";

export const metadata: Metadata = {
  title: "このサイトについて",
  description: "ふるーつドリルのサイト概要、利用規約、運営者情報など。",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-3xl py-8 space-y-12 text-slate-700">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-rose-600">このサイトについて</h1>
        <p className="text-slate-500">About This Site</p>
      </header>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-amber-500">
          <span className="text-2xl">🍎</span> サイトの概要
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-amber-100 leading-relaxed space-y-4">
          <p>
            「ふるーつドリル」は、学び始めの子どもたちと、それを支える保護者のための無料学習プリントサイトです。
          </p>
          <p>
            「日々の学習に彩りと実りを」をテーマに、子どもたちが楽しみながら続けられる、親しみやすいデザインのドリルを目指しています。
            家庭学習や学校の授業の補助教材として、ぜひご活用ください。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-rose-500">
          <span className="text-xl">⚠️</span> 利用上の注意・免責事項
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 leading-relaxed text-sm">
          <ul className="list-disc list-inside space-y-2 text-slate-600">
            <li>
              当サイトのドリルの内容は、可能な限り正確性を期していますが、その完全性や正確性を保証するものではありません。
            </li>
            <li>
              当サイトの利用によって生じた、いかなるトラブルや損害についても、運営者は一切の責任を負いません。予めご了承ください。
            </li>
            <li>
              誤植や誤りを発見された場合は、お手数ですがお問い合わせよりご連絡いただけますと幸いです。
            </li>
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-rose-500">
          <span className="text-xl">📝</span> 著作権・利用規約
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 leading-relaxed text-sm space-y-4">
          <p>
            当サイトで配布している学習プリント（PDFデータ）は、以下の範囲で無料でご利用いただけます。
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h3 className="font-bold text-green-700 mb-2">⭕️ OK（利用可能）</h3>
              <ul className="list-disc list-inside text-green-800 space-y-1 text-xs">
                <li>ご家庭での個人利用</li>
                <li>公立・私立学校での授業配布</li>
                <li>学習塾、家庭教師での教材利用</li>
                <li>学童保育、放課後クラブ等での利用</li>
              </ul>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="font-bold text-red-700 mb-2">❌ NG（禁止事項）</h3>
              <ul className="list-disc list-inside text-red-800 space-y-1 text-xs">
                <li>ドリルデータの再配布（ご自身のサイトやSNSでのアップロード）</li>
                <li>ドリル自体の販売、商用利用</li>
                <li>直リンクでの配布</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-rose-500">
          <span className="text-xl">🔒</span> プライバシーポリシー
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 leading-relaxed text-sm">
          <p className="text-slate-600">
            当サイトでは、サービスの質の向上とサイトの利用状況を把握するために、アクセス解析ツール（Grafana Faro, Vercel Speed Insights）を使用しています。
            これにより、お使いのブラウザやデバイスの種類、アクセス日時などの匿名の利用データを収集していますが、これらは個人を特定するものではありません。
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-rose-500">
          <span className="text-xl">📬</span> 運営者・お問い合わせ
        </h2>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 leading-relaxed">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-slate-700">運営者</h3>
              <p className="text-slate-600">tkit</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-700">お問い合わせ先</h3>
              <p className="text-slate-600 text-sm mb-2">
                当サイトに関するご意見、ご感想、不具合のご報告は、以下のリンク先よりお願いいたします。
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="font-semibold w-16">GitHub:</span>
                  <a
                    href="https://github.com/tkit/fruits-drill"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:text-rose-600 underline hover:no-underline transition-colors"
                  >
                    Repository / Issues
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold w-16">X (旧Twitter):</span>
                  <a
                    href="https://x.com/tkit__"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-rose-500 hover:text-rose-600 underline hover:no-underline transition-colors"
                  >
                    @tkit__
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
