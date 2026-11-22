// Gera as artes e agendas de 23 a 29/11/2026. Para ajustar uma arte: edite o texto no array NA/ENGS/CIS e rode
// `node scripts/artes/gerar_semana_2026-11-23.js` (preserva o _aprovado de cada dia).
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
// Placa R-3 (Proibido virar à esquerda): círculo branco, borda vermelha, seta preta para a esquerda, faixa vermelha
const r3=`<svg width="300" height="300" viewBox="0 0 420 420" style="margin-top:40px"><circle cx="210" cy="210" r="185" fill="#fff" stroke="${RED}" stroke-width="44"/><path d="M250 330 V200 Q250 160 210 160 H170" fill="none" stroke="#111" stroke-width="40"/><path d="M180 105 L110 160 L180 215 Z" fill="#111"/><line x1="88" y1="88" x2="332" y2="332" stroke="${RED}" stroke-width="40"/></svg>`;
const volante=`<svg width="300" height="300" viewBox="0 0 300 300" style="margin-top:40px"><circle cx="150" cy="150" r="120" fill="none" stroke="currentColor" stroke-width="26"/><circle cx="150" cy="150" r="26" fill="currentColor"/><path d="M40 160 H124 M176 160 H260 M150 176 V262" stroke="currentColor" stroke-width="22"/></svg>`;

const CID={eldorado:{n:'Eldorado',hor:'Seg a sex · 8h–11h30 e 13h–18h',var:'DYALOG_ELDORADO'},
 caarapo:{n:'Caarapó',hor:'Seg a sex · 7h–11h e 13h–18h<br>Sáb · 8h–12h',var:'DYALOG_CAARAPO'},
 itaquirai:{n:'Itaquiraí',hor:'Seg a sex · 7h–11h e 13h–17h<br>Sáb · 8h–12h',var:'DYALOG_ITAQUIRAI'}};
const NA=[
 ['2026-11-23','placa-esquerda_ENQUETE','branco','12:30','Enquete','Opções: Proibido virar à esquerda ✅ / Proibido virar à direita',c=>({k:'Quiz de placa 🚦',h:'Qual é <em>essa placa</em>?',extra:r3})],
 ['2026-11-24','maos_ENQUETE','preto','08:00','Enquete','Opções: 9h15 / 10h10 (resposta amanhã 8h)',c=>({k:`Bastidor · ${CID[c].n}`,h:'Qual a posição certa das <em>mãos</em> no volante?',extra:volante})],
 ['2026-11-25','1-resposta-maos','branco','08:00','Nenhum','',c=>({k:'Resposta de ontem',h:'<em>9h15</em> ✅',sub:'Mãos nas laterais do volante, como os ponteiros às 9h15. É a posição que o instrutor ensina na aula.'})],
 ['2026-11-25','2-mito-faixa_ENQUETE','preto','12:30','Enquete','Opções: Mito / Verdade (resposta amanhã 8h: Mito)',c=>({k:'Mito ou verdade?',h:'Parar na <em>faixa de pedestres</em> rapidinho pode.'})],
 ['2026-11-26','1-resposta-faixa','branco','08:00','Nenhum','',c=>({k:'Resposta de ontem',h:'Mito! ❌',sub:'Parar ou estacionar na faixa é <em>infração</em>, mesmo que seja por um minuto. A faixa é de quem atravessa.'})],
 ['2026-11-26','2-duvida_CAIXINHA','preto','12:30','Caixinha de perguntas','Pergunta: Qual sua dúvida sobre a CNH?',c=>({k:'Responde aqui 👇',h:'Qual sua <em>dúvida</em> sobre a CNH?',sub:'A gente responde nos Stories.'})],
 ['2026-11-27','1-frio_ENQUETE','branco','08:00','Enquete','Opções: Sim / Não',c=>({k:'Sem julgamentos',h:'Você sente <em>frio na barriga</em> antes da prova?'})],
 ['2026-11-27','2-whatsapp_LINK','preto','12:30','Link','Link: WhatsApp da unidade · Texto: Chamar no WhatsApp',c=>({k:`Nova Alvorada · ${CID[c].n}`,h:'Frio na barriga passa com <em>treino</em>.',sub:'Chama no WhatsApp e começa no seu ritmo. 👇'})],
 ['2026-11-28','1-cor-placa_ENQUETE','branco','10:00','Enquete','Opções: Amarela ✅ / Vermelha (resposta às 19h)',c=>({k:'Quiz da CNH',h:'Qual a cor das placas de <em>advertência</em>?'})],
 ['2026-11-28','2-cor-placa-resposta','preto','19:00','Nenhum','',c=>({k:'Resposta do quiz',h:'<em>Amarela</em> ✅',sub:'Placa amarela avisa um perigo à frente: curva, lombada, escola. Viu amarela, redobra a atenção.'})],
 ['2026-11-29','viagem_ENQUETE','preto','10:00','Enquete','Opções: Sim / Não / Ainda não sei',c=>({k:'Domingo',h:'Vai viajar de <em>carro</em> no fim do ano? 🛣️',sub:'Em dezembro tem dica de estrada aqui.'})]];
const ENGS=[
 ['2026-11-23','eng-1-trava_ENQUETE','12:30','Enquete','Opções: Medo de estourar o orçamento / Burocracia na prefeitura',{k:'Eng. Civil · CREA-MS 68001',h:'O que mais te <em>trava</em> de construir?'}],
 ['2026-11-23','eng-2-trava_LINK','13:00','Link','Link: seu WhatsApp · Texto: Quero sair do aluguel',{k:'Casa própria',h:'Quer saber se você consegue <em>sair do aluguel</em>?',sub:'Me chama no WhatsApp. 👇'}],
 ['2026-11-25','eng-1-obra-grande_ENQUETE','12:30','Enquete','Opções: Mito / Verdade (resposta às 19h)',{k:'Mito ou verdade?',h:'"Só precisa de <em>engenheiro</em> quando a obra é grande."'}],
 ['2026-11-25','eng-2-obra-grande-resposta','19:00','Nenhum','',{k:'Resposta',h:'Mito.',sub:'Quase toda obra precisa de um <em>responsável técnico</em> com ART. A regra exata é da sua prefeitura.'}],
 ['2026-11-27','eng-1-terreno-checar_ENQUETE','12:30','Enquete','Opções: Documentação do terreno ✅ / Se a vista é bonita',{k:'Vai comprar terreno?',h:'O que você checa <em>primeiro</em>?'}],
 ['2026-11-27','eng-2-terreno-checar_LINK','13:00','Link','Link: seu WhatsApp · Texto: Vou comprar terreno',{k:'Resposta',h:'A <em>documentação</em>.',sub:'Situação na prefeitura e no cartório, antes de fechar. Me chama que eu te ajudo. 👇'}]];
const CIS=[
 ['2026-11-24','cfcint-financeiro_ENQUETE','08:00','Enquete','Opções: Sim, em tempo real / Mais ou menos / Só no fim do mês',{k:'Dono de CFC',h:'Você sabe quanto seu CFC <em>lucrou</em> esse mês?',sub:'Seu financeiro está em dia?'}],
 ['2026-11-26','cfcint-faltas_ENQUETE','08:00','Enquete','Opções: Sim, muito / Às vezes / Quase nunca',{k:'Dono de CFC',h:'Aluno <em>falta</em> na aula marcada?',sub:'Lembrete automático no WhatsApp ajuda.'}],
 ['2026-11-28','cfcint-demo2_LINK','10:00','Link','Link: www.cfcinteligente.com.br · Texto: Peça uma demonstração',{k:'CFC Inteligente',h:'Matrícula, agenda, cobrança e financeiro <em>num lugar só</em>.',sub:'Quer ver no seu CFC? 👇'}]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 const shot=async(html,file)=>{fs.mkdirSync(path.dirname(file),{recursive:true});await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:file});};
 const ag={};const add=(d,key,nome,para,st)=>{ag[d]=ag[d]||{};ag[d][key]=ag[d][key]||{nome,para,stories:[]};ag[d][key].stories.push(st);};
 for(const [d,f,th,h,st,op,fn] of NA) for(const c of Object.keys(CID)){const rel=`artes/${d}/autoescola-${c}-${f}.png`;await shot(na(th,c,fn(c)),`${R}/${rel}`);
   add(d,`autoescola-${c}`,`Nova Alvorada ${CID[c].n}`,CID[c].var,{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of ENGS){const rel=`artes/${d}/${f}.png`;await shot(box(ENG,t),`${R}/${rel}`);add(d,'eng.aliff','@eng.aliff','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of CIS){const rel=`artes/${d}/${f}.png`;await shot(box(CI,t,ciLogo),`${R}/${rel}`);add(d,'cfcinteligente','@cfcinteligente','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 const obs={'2026-11-28':'Eldorado fechada hoje: o robô posta, respostas na segunda.'};
 for(const [d,o] of Object.entries(ag)){for(const k of Object.keys(o)) if(k.startsWith('autoescola')&&obs[d]) o[k].obs=obs[d];
   // código de cada story para aprovar/ajustar pelo WhatsApp: DD/MM-A1 (autoescolas), -E1 (eng), -C1 (cfcinteligente)
   const dm=`${d.slice(8)}/${d.slice(5,7)}`;
   for(const [k,cfg] of Object.entries(o)){const pre=k.startsWith('autoescola')?'A':k==='eng.aliff'?'E':'C';cfg.stories.forEach((st,i)=>st.codigo=`${dm}-${pre}${i+1}`);}
   const arq=`${R}/agenda/${d}.json`; let aprovado=false;
   if(fs.existsSync(arq)){const v=JSON.parse(fs.readFileSync(arq,'utf8'));aprovado=!!v._aprovado;
     for(const k of Object.keys(o)) if(v[k]&&v[k].aprovado===false) o[k].aprovado=false;}  // preserva perfil pendente
   fs.mkdirSync(`${R}/agenda`,{recursive:true});fs.writeFileSync(arq,JSON.stringify({_aprovado:aprovado,...o},null,1));}
 await b.close();console.log(Object.keys(ag).join(' '));})();
