#!/usr/bin/env node
/**
 * Renderizador de carrosséis do Instagram (1080×1350, formato 4:5).
 *
 * Uso:
 *   node ferramentas/carrossel/render.mjs <carrossel.json> [--out <pasta>] [--html]
 *
 * Lê o roteiro em JSON (ver README.md), aplica o tema do perfil (temas.json)
 * e gera slide-01.png, slide-02.png... + previa.png (todos lado a lado) na
 * mesma pasta do JSON (ou em --out). Com --html, salva também o HTML usado.
 *
 * Inspirado nos templates do growthOS (MIT), reescrito para os 4 perfis.
 */
import { createRequire } from 'module';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname, resolve, extname } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('❌ Playwright não encontrado. Rode: cd ferramentas/carrossel && npm install && npx playwright install chromium');
  process.exit(1);
}

const AQUI = dirname(fileURLToPath(import.meta.url));
const LARGURA = 1080;
const ALTURA = 1350;

// ---------- argumentos ----------
const args = process.argv.slice(2);
let entrada = null, saida = null, salvarHtml = false;
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') saida = args[++i];
  else if (args[i] === '--html') salvarHtml = true;
  else entrada = args[i];
}
if (!entrada) {
  console.error('uso: node ferramentas/carrossel/render.mjs <carrossel.json> [--out pasta] [--html]');
  process.exit(1);
}
entrada = resolve(entrada);
const pastaJson = dirname(entrada);
saida = resolve(saida || pastaJson);
mkdirSync(saida, { recursive: true });

const roteiro = JSON.parse(readFileSync(entrada, 'utf8'));
const temas = JSON.parse(readFileSync(resolve(AQUI, 'temas.json'), 'utf8'));
const tema = temas[roteiro.perfil];
if (!tema) {
  console.error(`❌ perfil "${roteiro.perfil}" não existe. Use: ${Object.keys(temas).join(', ')}`);
  process.exit(1);
}
if (!Array.isArray(roteiro.slides) || roteiro.slides.length < 2) {
  console.error('❌ o carrossel precisa de pelo menos 2 slides');
  process.exit(1);
}
if (roteiro.slides.length > 20) {
  console.error('❌ o Instagram aceita no máximo 20 slides');
  process.exit(1);
}

// ---------- handle / rodapé ----------
const avisos = [];
let handle;
if (roteiro.perfil === 'autoescolas') {
  const u = roteiro.unidade;
  if (!u || !tema.handles[u]) {
    console.error(`❌ autoescolas precisa de "unidade": ${Object.keys(tema.handles).join(' | ')}`);
    process.exit(1);
  }
  handle = tema.handles[u];
} else {
  handle = roteiro.handle || tema.handles.padrao;
}
if (handle.includes('[PREENCHER')) avisos.push(`handle ainda é "${handle}" — defina "handle" no JSON ou em temas.json`);
const rodape = [handle, tema.rodapeExtra].filter(Boolean).join('  ·  ');

// ---------- utilidades ----------
const esc = (s = '') => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// **texto** vira destaque; quebra de linha vira <br>
const fmt = (s = '') => esc(s).replace(/\*\*(.+?)\*\*/g, '<mark>$1</mark>').replace(/\n/g, '<br>');

function dataUri(caminho) {
  const abs = resolve(pastaJson, caminho);
  if (!existsSync(abs)) {
    avisos.push(`imagem não encontrada: ${caminho}`);
    return null;
  }
  const ext = extname(abs).slice(1).toLowerCase().replace('jpg', 'jpeg');
  return `data:image/${ext};base64,${readFileSync(abs).toString('base64')}`;
}

function fontFaces() {
  const vistos = new Set();
  return Object.values(tema.fontes).map(f => {
    if (vistos.has(f.arquivo)) return '';
    vistos.add(f.arquivo);
    const b64 = readFileSync(resolve(AQUI, 'fontes', `${f.arquivo}.woff2`)).toString('base64');
    return `@font-face{font-family:"${f.familia}";font-weight:${f.peso};src:url(data:font/woff2;base64,${b64}) format("woff2");}`;
  }).join('\n');
}

const F = tema.fontes;
const fam = f => `"${f.familia}", system-ui, sans-serif`;
const C = tema.cores;

// ---------- slides ----------
const total = roteiro.slides.length;
const pad = n => String(n).padStart(2, '0');

function marcadorNumero(n) {
  switch (roteiro.perfil) {
    case 'autoescolas': return `<div class="num num-placa"><span>${n}</span></div>`;
    case 'cfc-inteligente': return `<div class="num num-mono">// ${pad(n)}</div>`;
    case 'engenheiro': return `<div class="num num-tecnico"><span class="lbl">ITEM</span>${pad(n)}</div>`;
    default: return `<div class="num num-serif">${n}.</div>`;
  }
}

function slideHtml(s, i) {
  const n = i + 1;
  const tipo = s.tipo || 'conteudo';
  const pag = `<span class="pag">${pad(n)}/${pad(total)}</span>`;
  const rod = `<footer><span class="handle">${esc(rodape)}</span>${pag}</footer>`;
  let corpo = '';
  let classes = `slide t-${tipo}`;
  let estilo = '';

  if (tipo === 'capa') {
    const img = s.imagem ? dataUri(s.imagem) : null;
    if (img) {
      classes += ' com-imagem';
      estilo = `style="--img:url('${img}')"`;
    }
    corpo = `
      ${s.rotulo ? `<div class="rotulo">${esc(s.rotulo)}</div>` : ''}
      <h1>${fmt(s.titulo)}</h1>
      ${s.subtitulo ? `<p class="sub">${fmt(s.subtitulo)}</p>` : ''}
      ${s.arrasta ? `<div class="arrasta">${esc(s.arrasta)} <span>→</span></div>` : ''}`;
  } else if (tipo === 'destaque') {
    corpo = `
      <div class="aspas">“</div>
      <p class="frase">${fmt(s.texto)}</p>
      ${s.autor ? `<p class="autor">— ${esc(s.autor)}</p>` : ''}`;
  } else if (tipo === 'cta') {
    corpo = `
      <h2>${fmt(s.titulo)}</h2>
      ${s.texto ? `<p class="txt">${fmt(s.texto)}</p>` : ''}
      ${s.botao ? `<div class="botao">${esc(s.botao)}</div>` : ''}
      ${s.extra ? `<p class="extra">${fmt(s.extra)}</p>` : ''}`;
  } else {
    const itens = Array.isArray(s.itens) && s.itens.length
      ? `<ul>${s.itens.map(it => `<li>${fmt(it)}</li>`).join('')}</ul>` : '';
    corpo = `
      ${s.numero != null ? marcadorNumero(s.numero) : ''}
      <h2>${fmt(s.titulo)}</h2>
      ${s.texto ? `<p class="txt">${fmt(s.texto)}</p>` : ''}
      ${itens}
      ${s.nota ? `<p class="nota">${fmt(s.nota)}</p>` : ''}`;
  }
  return `<section class="${classes}" ${estilo} data-n="${n}"><div class="deco"></div><div class="miolo">${corpo}</div>${rod}</section>`;
}

// ---------- CSS ----------
const css = `
${fontFaces()}
*{box-sizing:border-box;margin:0;padding:0}
body{background:#777;font-family:${fam(F.corpo)};-webkit-font-smoothing:antialiased}
.slide{--k:1;width:${LARGURA}px;height:${ALTURA}px;position:relative;overflow:hidden;
  background:${C.fundo};color:${C.texto};display:flex;flex-direction:column}
.deco{position:absolute;inset:0;pointer-events:none}
.miolo{position:relative;flex:1;display:flex;flex-direction:column;justify-content:center;
  padding:110px 96px 40px;min-height:0;overflow:hidden}
footer{position:relative;height:120px;padding:0 96px 8px;display:flex;align-items:center;
  justify-content:space-between;font-family:${fam(F.corpoForte)};font-weight:${F.corpoForte.peso};
  font-size:24px;color:${C.textoSuave};letter-spacing:.01em}
.pag{font-variant-numeric:tabular-nums}
mark{background:none;color:${C.acento}}
h1,h2{font-family:${fam(F.titulo)};font-weight:${F.titulo.peso};letter-spacing:-.02em}
h1{font-size:calc(var(--k)*96px);line-height:1.04}
h2{font-size:calc(var(--k)*66px);line-height:1.08}
.rotulo{align-self:flex-start;font-family:${fam(F.corpoForte)};font-weight:${F.corpoForte.peso};
  font-size:26px;letter-spacing:.08em;text-transform:uppercase;padding:12px 22px;border-radius:999px;
  background:${C.acento};color:${C.acentoTexto};margin-bottom:44px}
.sub{font-family:${fam(F.subtitulo)};font-weight:${F.subtitulo.peso};font-size:calc(var(--k)*38px);
  line-height:1.35;color:${C.textoSuave};margin-top:36px;max-width:860px}
.arrasta{margin-top:64px;font-family:${fam(F.corpoForte)};font-weight:${F.corpoForte.peso};font-size:28px;color:${C.textoSuave}}
.arrasta span{color:${C.acento};font-size:34px;margin-left:6px}
.txt{font-size:calc(var(--k)*36px);line-height:1.45;color:${C.textoSuave};margin-top:32px}
.txt b,.txt strong{color:${C.texto}}
ul{list-style:none;margin-top:40px;display:flex;flex-direction:column;gap:calc(var(--k)*22px)}
li{position:relative;padding-left:52px;font-size:calc(var(--k)*34px);line-height:1.38;color:${C.texto}}
li::before{content:"";position:absolute;left:0;top:.42em;width:24px;height:24px;border-radius:6px;background:${C.acento}}
.nota{margin-top:36px;font-size:calc(var(--k)*26px);line-height:1.4;color:${C.textoSuave};
  border-top:2px solid ${C.linha};padding-top:22px}
.num{margin-bottom:40px}
/* destaque (slide invertido) */
.t-destaque{background:${C.fundoAlt};color:${C.textoAlt}}
.t-destaque footer{color:${C.textoAlt};opacity:.7}
.t-destaque .aspas{font-family:${fam(F.titulo)};font-size:220px;line-height:.7;height:110px;color:${C.acento}}
.t-destaque .frase{font-family:${fam(F.titulo)};font-weight:${F.titulo.peso};font-size:calc(var(--k)*68px);
  line-height:1.15;letter-spacing:-.015em;margin-top:30px}
.t-destaque .autor{margin-top:44px;font-size:30px;opacity:.8}
/* CTA */
.t-cta .miolo{align-items:flex-start}
.t-cta h2{font-size:calc(var(--k)*78px)}
.botao{margin-top:56px;display:inline-block;padding:30px 54px;border-radius:20px;background:${C.acento};
  color:${C.acentoTexto};font-family:${fam(F.titulo)};font-weight:${F.titulo.peso};font-size:36px}
.extra{margin-top:40px;font-size:30px;color:${C.textoSuave};line-height:1.4}
/* capa com foto */
.com-imagem{background:#000 var(--img) center/cover no-repeat;color:#fff}
.com-imagem .deco{background:linear-gradient(180deg,rgba(0,0,0,.05) 25%,rgba(0,0,0,.82) 78%)!important;opacity:1!important}
.com-imagem .miolo{justify-content:flex-end;padding-bottom:30px}
.com-imagem .sub,.com-imagem .arrasta,.com-imagem footer{color:rgba(255,255,255,.88)}
${cssDoPerfil()}
`;

function cssDoPerfil() {
  switch (roteiro.perfil) {
    case 'autoescolas': return `
/* marca-texto amarelo (sinalização) — legível sobre o creme */
mark{color:inherit;background:linear-gradient(180deg,transparent 58%,${C.acento} 58%,${C.acento} 90%,transparent 90%);padding:0 .06em}
.t-destaque mark,.com-imagem mark{color:${C.acento};background:none}
.deco{background:linear-gradient(90deg,${C.acento} 0 22px,transparent 22px)}
.deco::after{content:"";position:absolute;right:44px;top:0;width:10px;height:100%;
  background:repeating-linear-gradient(180deg,${C.linha} 0 70px,transparent 70px 120px)}
.t-destaque .deco::after{background:repeating-linear-gradient(180deg,rgba(255,183,3,.35) 0 70px,transparent 70px 120px)}
.num-placa{width:120px;height:120px;transform:rotate(45deg);background:${C.acento};border:6px solid ${C.texto};
  border-radius:16px;display:flex;align-items:center;justify-content:center;margin:10px 0 56px 14px}
.num-placa span{transform:rotate(-45deg);font-family:${fam(F.titulo)};font-weight:800;font-size:54px;color:${C.texto}}
li::before{border-radius:50%;background:${C.acento};box-shadow:inset 0 0 0 5px ${C.texto}}
`;
    case 'cfc-inteligente': return `
.deco{background-image:radial-gradient(${C.linha} 2px,transparent 2.5px);background-size:36px 36px;opacity:.9}
.t-destaque .deco{background-image:radial-gradient(rgba(13,17,23,.14) 2px,transparent 2.5px)}
.t-destaque .aspas{color:${C.fundo}}
.t-destaque mark{color:${C.fundo};text-decoration:underline;text-decoration-thickness:6px;text-underline-offset:8px}
.num-mono,.rotulo,footer .pag{font-family:${fam(F.mono)}}
.num-mono{font-size:34px;color:${C.acento};letter-spacing:.04em}
.rotulo{background:transparent;color:${C.acento};border:2px solid ${C.acento};border-radius:8px}
li::before{width:14px;height:14px;top:.55em;border-radius:2px;left:10px}
.botao{border-radius:12px}
`;
    case 'engenheiro': return `
.deco{background-image:linear-gradient(${C.linha} 1.5px,transparent 1.5px),linear-gradient(90deg,${C.linha} 1.5px,transparent 1.5px);
  background-size:54px 54px;background-position:-1px -1px;
  -webkit-mask-image:linear-gradient(180deg,#000 0%,rgba(0,0,0,.35) 60%,rgba(0,0,0,.15) 100%)}
.t-destaque .deco{background-image:linear-gradient(rgba(243,241,236,.07) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(243,241,236,.07) 1.5px,transparent 1.5px)}
.t-destaque mark,.com-imagem mark{color:#FF8A4C}
.miolo::before{content:"";position:absolute;left:96px;top:72px;width:120px;height:10px;background:${C.acento}}
.com-imagem .miolo::before{display:none}
.num-tecnico{font-family:${fam(F.mono)};font-size:64px;color:${C.texto};border:3px solid ${C.texto};
  align-self:flex-start;padding:6px 22px 4px;display:flex;align-items:baseline;gap:16px}
.num-tecnico .lbl{font-size:20px;letter-spacing:.14em;color:${C.acento}}
.rotulo{border-radius:4px;font-family:${fam(F.mono)}}
li::before{width:22px;height:22px;border-radius:0;background:none;border:4px solid ${C.acento}}
.botao{border-radius:6px}
footer .handle{font-family:${fam(F.corpoForte)}}
`;
    default: return `
.deco{border:2px solid ${C.linha};inset:44px}
.t-destaque .deco{border-color:rgba(246,241,234,.18)}
h1,h2{letter-spacing:-.025em}
mark{font-style:normal;color:${C.acento}}
.t-destaque mark,.com-imagem mark{color:#E58A64}
.num-serif{font-family:${fam(F.titulo)};font-size:120px;line-height:1;color:${C.acento}}
.rotulo{background:none;color:${C.acento};padding:0;border-radius:0;border-bottom:3px solid ${C.acento};padding-bottom:6px}
.sub,.t-destaque .frase{font-family:${fam(F.subtitulo)}}
.t-destaque .frase{font-weight:400;font-size:calc(var(--k)*64px)}
li::before{width:28px;height:3px;top:.72em;border-radius:0}
.botao{border-radius:999px}
`;
  }
}

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>${css}</style></head>
<body>${roteiro.slides.map(slideHtml).join('\n')}</body></html>`;

if (salvarHtml) writeFileSync(resolve(saida, 'carrossel.html'), html);

// ---------- render ----------
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: LARGURA, height: ALTURA }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'load' });
await page.evaluate(() => document.fonts.ready);

// encolhe o texto de slides que estouram (até 70%) e avisa
const estouros = await page.evaluate(() => {
  const ruins = [];
  for (const s of document.querySelectorAll('.slide')) {
    const m = s.querySelector('.miolo');
    let k = 1;
    while (m.scrollHeight > m.clientHeight + 1 && k > 0.7) {
      k = Math.round((k - 0.05) * 100) / 100;
      s.style.setProperty('--k', k);
    }
    if (k < 1) ruins.push({ n: +s.dataset.n, k, ainda: m.scrollHeight > m.clientHeight + 1 });
  }
  return ruins;
});
for (const e of estouros) {
  avisos.push(e.ainda
    ? `slide ${e.n}: TEXTO NÃO CABE nem a 70% — corte o texto`
    : `slide ${e.n}: texto reduzido para ${Math.round(e.k * 100)}% — considere enxugar`);
}

const slides = await page.$$('.slide');
const arquivos = [];
for (let i = 0; i < slides.length; i++) {
  const nome = `slide-${pad(i + 1)}.png`;
  await slides[i].screenshot({ path: resolve(saida, nome) });
  arquivos.push(nome);
}

// prévia: todos os slides lado a lado, reduzidos
const cols = Math.min(total, 5);
const linhas = Math.ceil(total / cols);
const mini = 300;
const miniH = mini * ALTURA / LARGURA;
const imgs = arquivos.map(a => `<img src="data:image/png;base64,${readFileSync(resolve(saida, a)).toString('base64')}">`).join('');
await page.setViewportSize({ width: cols * (mini + 16) + 16, height: linhas * (miniH + 16) + 16 });
await page.setContent(`<body style="margin:0;padding:16px;background:#2a2a2a;display:grid;grid-template-columns:repeat(${cols},${mini}px);gap:16px">
<style>img{width:${mini}px;height:${miniH}px;border-radius:6px;display:block}</style>${imgs}</body>`);
await page.screenshot({ path: resolve(saida, 'previa.png') });
await browser.close();

console.log(`✅ ${arquivos.length} slides em ${saida}`);
console.log(`   + previa.png`);
for (const a of avisos) console.log(`⚠️  ${a}`);
