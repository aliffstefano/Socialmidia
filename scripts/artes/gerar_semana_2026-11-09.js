// Gera as artes e agendas de 09 a 15/11/2026. Para ajustar uma arte: edite o texto no array NA/ENGS/CIS e rode
// `node scripts/artes/gerar_semana_2026-11-09.js` (preserva o _aprovado de cada dia).
const { chromium } = require('playwright'); const fs=require('fs'), path=require('path');
const path0=require('path');const S=path0.join(__dirname,'..','..','assets','artes-base'), R=path0.join(__dirname,'..','..','conteudo');
const img=(f,m='png')=>`data:image/${m};base64,`+fs.readFileSync(path.join(S,f)).toString('base64');
const RED='#C00204';
const FONT=`<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&display=block" rel="stylesheet">`;
const BASECSS=`*{margin:0;padding:0;box-sizing:border-box}html,body{width:1080px;height:1920px;overflow:hidden}body{font-family:Montserrat,sans-serif;position:relative}
.w{position:absolute;left:96px;right:96px;top:300px}.k{font-weight:700;font-size:34px;opacity:.8}
h1{font-weight:900;font-size:112px;line-height:1.15;margin-top:28px;letter-spacing:-2px}
.sub{font-weight:700;font-size:56px;line-height:1.4;margin-top:50px}
.logo{position:absolute;left:50%;transform:translateX(-50%);bottom:140px;max-height:200px;max-width:420px}`;
// ----- autoescola: preto/branco + sublinhado vermelho
const TH={preto:{bg:'#121212',fg:'#fff',logo:'escuro',drop:.18},branco:{bg:'#FFFFFF',fg:'#111',logo:'orig',drop:.07}};
const na=(th,c,t)=>`<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${BASECSS}
body{background:${TH[th].bg};color:${TH[th].fg}}
em{font-style:normal;text-decoration:underline;text-decoration-color:${RED};text-decoration-thickness:14px;text-underline-offset:14px;text-decoration-skip-ink:none}
.sub em{text-decoration-thickness:8px;text-underline-offset:10px}</style></head><body>
<svg style="position:absolute;right:-120px;bottom:420px;opacity:${TH[th].drop}" width="420" height="483" viewBox="0 0 100 115"><path d="M50 0 L95 78 A45 45 0 0 1 5 78 Z" fill="${RED}"/></svg>
<div class="w"><div class="k">${t.k}</div><h1>${t.h}</h1>${t.sub?`<div class="sub">${t.sub}</div>`:''}${t.extra||''}</div>
<img class="logo" src="${img(`na_${c}_${TH[th].logo}.png`)}"></body></html>`;
// ----- eng / cfcint: fundo sólido + destaque em caixa
const box=(bg,t,logo='')=>`<!doctype html><html><head><meta charset="utf-8">${FONT}<style>${BASECSS}
body{background:${bg};color:#fff}h1 em,.sub em{font-style:normal;background:#fff;color:${bg};padding:0 14px;border-radius:10px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
</style></head><body><div class="w"><div class="k">${t.k}</div><h1>${t.h}</h1>${t.sub?`<div class="sub">${t.sub}</div>`:''}</div>${logo}</body></html>`;
const ENG='#0f3b40', CI='#2a1b8f', ciLogo=`<img class="logo" style="height:150px;border-radius:28px" src="${img('cfcint.jpg','jpeg')}">`;
// Placa R-2 (Dê a preferência): triângulo invertido, branco com borda vermelha
const r2=`<svg width="340" height="300" viewBox="0 0 340 300" style="margin-top:50px"><path d="M20 20 H320 L170 280 Z" fill="${RED}" stroke="${RED}" stroke-width="24" stroke-linejoin="round"/><path d="M78 54 H262 L170 214 Z" fill="#fff"/></svg>`;

const CID={eldorado:{n:'Eldorado',abre:'8h',hor:'Seg a sex · 8h–11h30 e 13h–18h',var:'DYALOG_ELDORADO'},
 caarapo:{n:'Caarapó',abre:'7h',hor:'Seg a sex · 7h–11h e 13h–18h · Sáb · 8h–12h',var:'DYALOG_CAARAPO'},
 itaquirai:{n:'Itaquiraí',abre:'7h',hor:'Seg a sex · 7h–11h e 13h–17h · Sáb · 8h–12h',var:'DYALOG_ITAQUIRAI'}};
// [data, arquivo, tema, hora, sticker, opcoes, fn(cidade)->texto]
const NA=[
 ['2026-11-09','placa-preferencia_ENQUETE','branco','12:30','Enquete','Opções: Parada obrigatória / Dê a preferência ✅(correta)',c=>({k:'Quiz de placa 🚦',h:'Qual é <em>essa placa</em>?',extra:r2})],
 ['2026-11-10','baliza_ENQUETE','preto','12:30','Enquete','Opções: Eu sabia / Não sabia',c=>({k:'Você sabia?',h:'A <em>baliza</em> saiu da prova prática.',sub:'Mas na rua você vai precisar. E a gente ensina. 🅿️'})],
 ['2026-11-11','mito-motor_ENQUETE','branco','12:30','Enquete','Opções: Mito / Verdade (a resposta sai amanhã 8h)',c=>({k:'Mito ou verdade?',h:'Deixou o carro <em>morrer</em> na prova, reprovou.'})],
 ['2026-11-12','1-resposta-motor','preto','08:00','Nenhum','',c=>({k:'Resposta de ontem',h:'Mito! ✅',sub:'Deixar o carro morrer <em>uma vez</em> não reprova. Se morrer duas vezes, aí reprova. Calma e embreagem no ponto. 😉'})],
 ['2026-11-12','2-duvida_CAIXINHA','branco','12:30','Caixinha de perguntas','Pergunta: Qual sua dúvida sobre a CNH?',c=>({k:'Responde aqui 👇',h:'Qual sua <em>dúvida</em> sobre a CNH?',sub:'A gente responde nos Stories.'})],
 ['2026-11-13','1-estrada_ENQUETE','preto','08:00','Enquete','Opções: Sim / Não',c=>({k:'Sem julgamentos',h:'Você tem <em>medo</em> de dirigir na estrada?'})],
 ['2026-11-13','2-whatsapp_LINK','branco','12:30','Link','Link: WhatsApp da unidade · Texto: Chamar no WhatsApp',c=>({k:`Nova Alvorada · ${CID[c].n}`,h:'Medo se perde <em>praticando</em>.',sub:'Chama no WhatsApp e começa no seu ritmo. 👇'})],
 ['2026-11-14','1-pontos_ENQUETE','branco','10:00','Enquete','Opções: 20 / 30 / 40 ✅(sem gravíssima) · resposta às 19h',c=>({k:'Quiz da CNH',h:'Quantos <em>pontos</em> você pode ter sem nenhuma gravíssima?'})],
 ['2026-11-14','2-pontos-resposta','preto','19:00','Nenhum','',c=>({k:'Resposta do quiz',h:'<em>40 pontos</em> ✅',sub:'Sem gravíssima: 40.<br>Com 1 gravíssima: 30.<br>Com 2 ou mais: 20.<br>Contados em 12 meses.'})],
 ['2026-11-15','memoria_CAIXINHA','preto','10:00','Caixinha de perguntas','Pergunta: Qual cuidado você nunca esquece ao volante? · dia sério, sem humor nem promoção',c=>({k:'15/11 · Dia Mundial em Memória das Vítimas de Trânsito',h:'Dirigir com atenção <em>salva vidas</em>. 🕯️'})]];
const ENGS=[
 ['2026-11-09','eng-1-terreno_ENQUETE','12:30','Enquete','Opções: Sim, tenho / Ainda não',{k:'Eng. Civil · CREA-MS 68001',h:'Você já tem um <em>terreno</em>?'}],
 ['2026-11-09','eng-2-terreno_LINK','13:00','Link','Link: seu WhatsApp · Texto: Meu terreno vira casa?',{k:'Terreno',h:'Quer saber se seu terreno pode <em>virar casa</em>?',sub:'Me chama no WhatsApp. 👇'}],
 ['2026-11-11','eng-1-alvara_ENQUETE','12:30','Enquete','Opções: Mito / Verdade (resposta às 19h)',{k:'Mito ou verdade?',h:'"Obra sem <em>alvará</em> não dá problema se a casa já está pronta."'}],
 ['2026-11-11','eng-2-alvara-resposta','19:00','Nenhum','',{k:'Resposta',h:'Mito.',sub:'Obra sem alvará pode gerar <em>multa</em> e travar venda, financiamento e regularização. Antes de construir, confira na prefeitura.'}],
 ['2026-11-13','eng-terreno_CAIXINHA','12:30','Caixinha de perguntas','Pergunta: Qual sua dúvida sobre terreno ou construção?',{k:'Pode perguntar',h:'Qual sua dúvida sobre <em>terreno</em> ou construção?',sub:'Respondo aqui nos Stories. 👇'}]];
const CIS=[
 ['2026-11-10','cfcint-tempo_ENQUETE','12:30','Enquete','Opções: Matrícula / Cobrança / Agenda / Detran · a de 03/11 não foi ao ar, repete',{k:'Dono de CFC',h:'O que mais toma seu <em>tempo</em> hoje?',sub:'Responde em 1 toque. 👇'}],
 ['2026-11-12','cfcint-cobranca_ENQUETE','08:00','Enquete','Opções: Sim / Não, cobro um a um / Quero fazer',{k:'Função da semana',h:'Cobrança e lembrete <em>no WhatsApp</em>.',sub:'Automático. Você já faz isso?'}],
 ['2026-11-14','cfcint-demo_LINK','10:00','Link','Link: www.cfcinteligente.com.br · Texto: Peça uma demonstração',{k:'CFC Inteligente',h:'Matrícula, cobrança e agenda <em>num lugar só</em>.',sub:'Quer ver funcionando no seu CFC? 👇'}]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 const shot=async(html,file)=>{fs.mkdirSync(path.dirname(file),{recursive:true});await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:file});};
 const ag={};const add=(d,key,nome,para,st)=>{ag[d]=ag[d]||{};ag[d][key]=ag[d][key]||{nome,para,stories:[]};ag[d][key].stories.push(st);};
 for(const [d,f,th,h,st,op,fn] of NA) for(const c of Object.keys(CID)){const rel=`artes/${d}/autoescola-${c}-${f}.png`;await shot(na(th,c,fn(c)),`${R}/${rel}`);
   add(d,`autoescola-${c}`,`Nova Alvorada ${CID[c].n}`,CID[c].var,{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of ENGS){const rel=`artes/${d}/${f}.png`;await shot(box(ENG,t),`${R}/${rel}`);add(d,'eng.aliff','@eng.aliff','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of CIS){const rel=`artes/${d}/${f}.png`;await shot(box(CI,t,ciLogo),`${R}/${rel}`);add(d,'cfcinteligente','@cfcinteligente','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 const obs={'2026-11-14':'Eldorado fechada hoje: o robô posta, respostas na segunda.','2026-11-15':'Domingo e Dia Mundial em Memória das Vítimas de Trânsito: tom sério, o robô posta.'};
 for(const [d,o] of Object.entries(ag)){for(const k of Object.keys(o)) if(k.startsWith('autoescola')&&obs[d]) o[k].obs=obs[d];
   // código de cada story para aprovar/ajustar pelo WhatsApp: DD/MM-A1 (autoescolas), -E1 (eng), -C1 (cfcinteligente)
   const dm=`${d.slice(8)}/${d.slice(5,7)}`;
   for(const [k,cfg] of Object.entries(o)){const pre=k.startsWith('autoescola')?'A':k==='eng.aliff'?'E':'C';cfg.stories.forEach((st,i)=>st.codigo=`${dm}-${pre}${i+1}`);}
   const arq=`${R}/agenda/${d}.json`; let aprovado=false;
   if(fs.existsSync(arq)){const v=JSON.parse(fs.readFileSync(arq,'utf8'));aprovado=!!v._aprovado;
     for(const k of Object.keys(o)) if(v[k]&&v[k].aprovado===false) o[k].aprovado=false;}  // preserva perfil pendente
   fs.mkdirSync(`${R}/agenda`,{recursive:true});fs.writeFileSync(arq,JSON.stringify({_aprovado:aprovado,...o},null,1));}
 await b.close();console.log(Object.keys(ag).join(' '));})();
