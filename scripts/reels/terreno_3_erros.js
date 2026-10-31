// Reels "3 erros ao comprar terreno" (@eng.aliff) — texto animado, sem gravação.
// Uso: node scripts/reels/terreno_3_erros.js  → conteudo/engenheiro/reels/2026-11-terreno-3-erros.mp4 (+ capa .jpg)
// Para mudar texto/tempo: edite CENAS e rode de novo. Música: escolher no app do Instagram.
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const RAIZ = path.join(__dirname, '..', '..');
const SAIDA = path.join(RAIZ, 'conteudo', 'engenheiro', 'reels', '2026-11-terreno-3-erros');
const FPS = 30, BG = '#0f3b40', CLARO = '#e8f1f0', ACENTO = '#f2b84b';
const foto = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(RAIZ, 'assets', 'artes-base', 'eng.jpg')).toString('base64');

// [início, fim, html]  (s). Elementos com data-in="atraso" entram em sequência.
const CENAS = [
  [0, 2.6, `<div class="k" data-in="0">Vai comprar terreno?</div>
            <h1 data-in=".15">Esse erro pode <em>travar</em> seu financiamento.</h1>`],
  [2.6, 5, `<div class="eu" data-in="0"><img src="${foto}"><div><b>Eng. Aliff Stéfano</b><span>Civil · CREA-MS 68001</span></div></div>
            <h1 class="g" data-in=".2"><em>3 erros</em> ao comprar terreno</h1>`],
  [5, 9.6, `<div class="n" data-in="0">1</div><div class="k" data-in=".05">Erro 1 de 3</div>
            <h1 data-in=".15">Comprar sem conferir a <em>documentação</em></h1>
            <div class="sub" data-in=".9">Terreno com papel fora de ordem vira dor de cabeça.</div>`],
  [9.6, 14.2, `<div class="n" data-in="0">2</div><div class="k" data-in=".05">Erro 2 de 3</div>
            <h1 data-in=".15">Não ver se <em>pode construir</em> ali</h1>
            <div class="sub" data-in=".9">Tamanho, rua, água e luz.<br>Pergunte na prefeitura antes.</div>`],
  [14.2, 18.8, `<div class="n" data-in="0">3</div><div class="k" data-in=".05">Erro 3 de 3</div>
            <h1 data-in=".15">Fechar sem um <em>profissional</em> olhar antes</h1>
            <div class="sub" data-in=".9">Uma conversa antes evita prejuízo depois.</div>`],
  [18.8, 22.5, `<h1 data-in="0">Vai comprar terreno?</h1>
            <h1 class="cta" data-in=".35"><em>Salva</em> antes de assinar.</h1>
            <div class="eu fim" data-in=".8"><img src="${foto}"><div><b>@eng.aliff</b><span>Eng. Civil · CREA-MS 68001</span></div></div>`],
];
const DUR = CENAS[CENAS.length - 1][1];

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;900&display=block" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden;background:${BG};color:#fff;font-family:Montserrat,sans-serif}
.cena{position:absolute;inset:0;padding:330px 100px 0;display:none}
.k{font-weight:700;font-size:44px;color:${ACENTO};letter-spacing:.5px}
h1{font-weight:900;font-size:118px;line-height:1.14;letter-spacing:-2px;margin-top:30px}
h1.g{font-size:132px}h1.cta{margin-top:60px}
em{font-style:normal;background:#fff;color:${BG};padding:0 16px;border-radius:12px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.sub{font-weight:600;font-size:56px;line-height:1.4;margin-top:60px;color:${CLARO}}
.n{position:absolute;right:40px;top:860px;font-weight:900;font-size:760px;line-height:1;color:rgba(255,255,255,.07)}
.eu{display:flex;align-items:center;gap:30px;margin-bottom:40px}.eu img{width:190px;height:190px;border-radius:50%;object-fit:cover;border:6px solid #fff}
.eu b{display:block;font-size:52px;font-weight:900}.eu span{display:block;font-size:38px;font-weight:600;color:${CLARO};margin-top:6px}
.eu.fim{margin-top:120px}
.barra{position:absolute;left:100px;right:100px;top:230px;height:10px;border-radius:5px;background:rgba(255,255,255,.18)}
.barra i{display:block;height:100%;border-radius:5px;background:${ACENTO};width:0}
</style></head><body><div class="barra"><i id="p"></i></div>
${CENAS.map(([a, b, h], i) => `<div class="cena" id="c${i}" data-a="${a}" data-b="${b}">${h}</div>`).join('')}
<script>
const ease=x=>1-Math.pow(1-Math.min(Math.max(x,0),1),3);
window.setT=t=>{document.getElementById('p').style.width=(100*t/${DUR})+'%';
 document.querySelectorAll('.cena').forEach(c=>{const a=+c.dataset.a,b=+c.dataset.b,on=t>=a&&t<b;c.style.display=on?'block':'none';if(!on)return;
  c.querySelectorAll('[data-in]').forEach(e=>{const p=ease((t-a-(+e.dataset.in))/.45);
   e.style.opacity=p;e.style.transform=e.classList.contains('n')?'scale('+(1.15-.15*p)+')':'translateY('+(60*(1-p))+'px)';});});};
</script></body></html>`;

(async () => {
  const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'reels-'));
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  await p.setContent(html, { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  const total = Math.round(DUR * FPS);
  for (let f = 0; f < total; f++) {
    await p.evaluate(t => window.setT(t), f / FPS);
    await p.screenshot({ path: path.join(tmp, String(f).padStart(5, '0') + '.jpg'), type: 'jpeg', quality: 92 });
  }
  await p.evaluate(t => window.setT(t), 4.2); await p.screenshot({ path: SAIDA + '-capa.jpg', type: 'jpeg', quality: 92 });
  await b.close();
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', path.join(tmp, '%05d.jpg'),
    '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo', '-shortest', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18',
    '-preset', 'medium', '-c:a', 'aac', '-b:a', '128k', '-movflags', '+faststart', SAIDA + '.mp4']);
  fs.rmSync(tmp, { recursive: true });
  console.log(SAIDA + '.mp4', total, 'quadros');
})();
