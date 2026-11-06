// Stories extras de 06/11 (dia de exame prático em Caarapó). Mesmo padrão V2 das artes da semana.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
const S = path.join(__dirname, '..', '..', 'assets', 'artes-base'), R = path.join(__dirname, '..', '..', 'conteudo', 'artes', '2026-11-06');
const img = f => 'data:image/png;base64,' + fs.readFileSync(path.join(S, f)).toString('base64');
const RED = '#C00204';
const TH = { preto: { bg: '#121212', fg: '#fff', logo: 'escuro', drop: .18 }, branco: { bg: '#FFFFFF', fg: '#111', logo: 'orig', drop: .07 } };
const na = (th, t) => `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=block" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}body{font-family:Montserrat,sans-serif;position:relative;background:${TH[th].bg};color:${TH[th].fg}}
.w{position:absolute;left:96px;right:96px;top:300px}.k{font-weight:700;font-size:34px;opacity:.8}
h1{font-weight:900;font-size:112px;line-height:1.15;margin-top:28px;letter-spacing:-2px}
.sub{font-weight:700;font-size:56px;line-height:1.4;margin-top:50px}
.logo{position:absolute;left:50%;transform:translateX(-50%);bottom:140px;max-height:200px;max-width:420px}
em{font-style:normal;text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:14px;text-underline-offset:14px;text-decoration-skip-ink:none}
</style></head><body>
<svg style="position:absolute;right:-120px;bottom:420px;opacity:${TH[th].drop}" width="420" height="483" viewBox="0 0 100 115"><path d="M50 0 L95 78 A45 45 0 0 1 5 78 Z" fill="${RED}"/></svg>
<div class="w"><div class="k">${t.k}</div><h1>${t.h}</h1>${t.sub ? `<div class="sub">${t.sub}</div>` : ''}</div>
<img class="logo" src="${img(`na_caarapo_${TH[th].logo}.png`)}"></body></html>`;
const ARTES = [
  ['autoescola-caarapo-exame-torcida_SLIDER', 'preto', { k: 'Hoje · Caarapó', h: 'Hoje é dia de <em>exame prático</em>. 🚗', sub: 'Manda energia pra quem vai pra prova hoje.' }],
  ['autoescola-caarapo-exame-lembranca_ENQUETE', 'branco', { k: 'Dia de exame em Caarapó', h: 'Você lembra como foi o seu <em>exame prático</em>?' }],
];
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  for (const [f, th, t] of ARTES) {
    await p.setContent(na(th, t), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: path.join(R, f + '.png') }); console.log(f);
  }
  await b.close();
})();
