// Aprovados de 23/11/2026 (Eldorado): carrossel do feed (1080x1350) e 2 stories (1080x1920).
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
const R=path.join(__dirname,'..','..'), F=`${R}/conteudo/autoescolas/fotos/2026-11-23-aprovados-eldorado`;
const OUT=`${R}/conteudo/artes/2026-11-25`, A=path.join(R,'assets','artes-base');
const b64=(f,m)=>`data:image/${m};base64,`+fs.readFileSync(f).toString('base64');
const foto=n=>b64(`${F}/foto-${n}.jpg`,'jpeg'), logo=v=>b64(`${A}/na_eldorado_${v}.png`,'png');
const RED='#C00204';
const css=(w,h,bg,fg)=>`<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=block" rel="stylesheet"><style>
*{margin:0;padding:0;box-sizing:border-box}html,body{width:${w}px;height:${h}px;overflow:hidden}
body{font-family:Montserrat,sans-serif;background:${bg};color:${fg};position:relative}
.k{font-weight:700;font-size:34px;opacity:.8}h1{font-weight:900;font-size:110px;line-height:1.1;letter-spacing:-2px;margin-top:18px}
.sub{font-weight:700;font-size:48px;line-height:1.35;margin-top:30px}
em{font-style:normal;text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:14px;text-underline-offset:14px;text-decoration-skip-ink:none}
.sub em{text-decoration-thickness:8px;text-underline-offset:8px}
.t{position:absolute;left:80px;right:80px}.f{position:absolute;left:0;width:1080px;height:810px;object-fit:cover}
.logo{position:absolute;left:50%;transform:translateX(-50%);max-height:150px;max-width:380px}</style>`;
const pg=(w,h,bg,fg,body)=>`<!doctype html><html><head><meta charset="utf-8">${css(w,h,bg,fg)}</head><body>${body}</body></html>`;
const P=[ // [arquivo, w, h, html]
 ['carrossel-1-aprovados.png',1080,1350,pg(1080,1350,'#121212','#fff',`<div class="t" style="top:70px"><div class="k">Nova Alvorada · Eldorado · 23/11</div><h1><em>Aprovados!</em> ✅</h1></div>
   <img class="f" style="top:330px" src="${foto(4)}"><img class="logo" style="bottom:45px;max-height:120px" src="${logo('escuro')}">`)],
 ['carrossel-2-time.png',1080,1350,pg(1080,1350,'#fff','#111',`<div class="t" style="top:70px"><div class="k">Do primeiro dia até a CNH</div><h1 style="font-size:96px">Parabéns, <em>motoristas</em>! 🚗</h1></div>
   <img class="f" style="top:400px" src="${foto(5)}"><img class="logo" style="bottom:30px;max-height:110px" src="${logo('orig')}">`)],
 ['carrossel-3-cta.png',1080,1350,pg(1080,1350,'#121212','#fff',`<div class="t" style="top:300px"><div class="k">Sua vez</div><h1>O próximo aprovado pode ser <em>você</em>.</h1>
   <div class="sub">Chama no WhatsApp:<br>(67) 99613-2269</div><div class="sub" style="font-size:36px;opacity:.8">Seg a sex · 8h–11h30 e 13h–18h</div></div><img class="logo" style="bottom:80px" src="${logo('escuro')}">`)],
 ['autoescola-eldorado-aprovados-1_SLIDER.png',1080,1920,pg(1080,1920,'#121212','#fff',`<div class="t" style="top:170px"><div class="k">Eldorado · 23/11</div><h1><em>Aprovados!</em> 🎉</h1></div>
   <img class="f" style="top:420px" src="${foto(4)}"><img class="logo" style="bottom:140px" src="${logo('escuro')}">`)],
 ['autoescola-eldorado-aprovados-2_LINK.png',1080,1920,pg(1080,1920,'#fff','#111',`<div class="t" style="top:170px"><div class="k">Parabéns, motoristas!</div><h1 style="font-size:96px">O próximo pode ser <em>você</em>.</h1></div>
   <img class="f" style="top:560px" src="${foto(5)}"><img class="logo" style="bottom:140px" src="${logo('orig')}">`)]];
(async()=>{const b=await chromium.launch();fs.mkdirSync(OUT,{recursive:true});
 for(const [f,w,h,html] of P){const p=await b.newPage({viewport:{width:w,height:h}});await p.setContent(html,{waitUntil:'networkidle'});
   await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${OUT}/${f}`});await p.close();}
 await b.close();console.log('ok');})();
