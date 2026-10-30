// Gera as artes e agendas de 02 a 08/11/2026. Para ajustar uma arte: edite o texto no array NA/ENGS/CIS e rode
// `node scripts/artes/gerar_semana_2026-11-02.js` (preserva o _aprovado de cada dia).
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
const r19=`<svg width="420" height="420" viewBox="0 0 420 420" style="margin-top:70px"><circle cx="210" cy="210" r="185" fill="#fff" stroke="#d0161c" stroke-width="44"/><text x="210" y="235" text-anchor="middle" font-family="Arial Black,Arial" font-weight="900" font-size="150" fill="#111">40</text><text x="210" y="310" text-anchor="middle" font-family="Arial" font-weight="700" font-size="44" fill="#111">km/h</text></svg>`;

const CID={eldorado:{n:'Eldorado',abre:'8h',hor:'Seg a sex · 8h–11h30 e 13h–18h',var:'DYALOG_ELDORADO'},
 caarapo:{n:'Caarapó',abre:'7h',hor:'Seg a sex · 7h–11h e 13h–18h · Sáb · 8h–12h',var:'DYALOG_CAARAPO'},
 itaquirai:{n:'Itaquiraí',abre:'7h',hor:'Seg a sex · 7h–11h e 13h–17h · Sáb · 8h–12h',var:'DYALOG_ITAQUIRAI'}};
// [data, arquivo, tema, hora, sticker, opcoes, fn(cidade)->[tema,texto]]
const NA=[
 ['2026-11-02','finados','preto','09:00','Link do WhatsApp da unidade (opcional)','Texto do link: Deixe sua mensagem',c=>({k:'02/11 · Finados',h:'Hoje estamos <em>fechados</em>.',sub:`Voltamos amanhã (terça) às ${CID[c].abre}.<br>Um dia de respeito e lembrança. 🕊️`})],
 ['2026-11-03','bastidor_SLIDER','preto','12:30','Emoji slider 😬','Pergunta: Quão ansioso você está pra sua 1ª aula?',c=>({k:`Bastidor · ${CID[c].n}`,h:'O carro já está pronto pra sua <em>primeira aula</em>. 🚗'})],
 ['2026-11-04','mito_ENQUETE','branco','19:00','Enquete','Opções: Mito / Verdade (a resposta sai amanhã)',c=>({k:'Mito ou verdade?',h:'Precisa ter <em>carro próprio</em> pra tirar a CNH?'})],
 ['2026-11-05','1-resposta','branco','08:00','Nenhum (se quiser, repost do resultado da enquete de ontem)','',c=>({k:'Resposta de ontem',h:'Mito! ✅',sub:'Você aprende e faz a prova no <em>carro da autoescola</em>. Não precisa ter carro.'})],
 ['2026-11-05','2-duvida_CAIXINHA','preto','19:00','Caixinha de perguntas','Pergunta: Qual sua dúvida sobre a CNH?',c=>({k:'Pode perguntar',h:'Qual sua <em>dúvida</em> sobre a CNH?',sub:'A gente responde aqui nos Stories. 👇'})],
 ['2026-11-06','1-medo_SLIDER','preto','12:30','Emoji slider 😨','Pergunta: Quanto medo você tem de dirigir no trânsito?',c=>({k:'Sem julgamentos',h:'Quanto <em>medo</em> você tem de dirigir no trânsito?'})],
 ['2026-11-06','2-whatsapp_LINK','branco','19:00','Link','Link: WhatsApp da unidade (wa.me/55DDDNÚMERO) · Texto: Chamar no WhatsApp',c=>({k:`Nova Alvorada · ${CID[c].n}`,h:'Quer começar? Chama no <em>WhatsApp</em>.',sub:CID[c].hor.replace(' · Sáb',' <br>Sáb')})],
 ['2026-11-07','placa_QUIZ','branco','09:00','Quiz','Opções: Velocidade máxima 40 km/h ✅(correta) / Velocidade mínima 40 km/h / Distância mínima 40 m / Peso máximo 40 t',c=>({k:'Quiz de placa',h:'Você sabe o que essa placa quer <em>dizer</em>?',extra:r19})],
 ['2026-11-08','cidade_ENQUETE','preto','10:00','Enquete','Opções: Centro / Bairro / Estrada / Ainda não dirijo',c=>({k:'Domingo',h:`Qual o melhor lugar de <em>${CID[c].n}</em> pra dirigir? 🚗`})]];
const ENGS=[
 ['2026-11-03','eng-1-aluguel_ENQUETE','19:30','Enquete','Opções: Sim / Não',{k:'Eng. Civil · CREA-MS 68001',h:'Você paga <em>aluguel</em> hoje?'}],
 ['2026-11-03','eng-2-chama_LINK','19:35','Link','Link: seu WhatsApp · Texto: Quero sair do aluguel',{k:'Casa própria',h:'Quer saber se você consegue <em>sair do aluguel</em>?',sub:'Me chama no WhatsApp. 👇'}],
 ['2026-11-04','eng-1-art_ENQUETE','19:30','Enquete','Opções: Mito / Verdade',{k:'Mito ou verdade?',h:'"ART é só <em>papelada</em> sem importância."'}],
 ['2026-11-04','eng-2-resposta','21:00','Nenhum','',{k:'Resposta',h:'Mito.',sub:'A ART registra quem é o <em>responsável técnico</em> pela obra e protege quem constrói.'}],
 ['2026-11-06','eng-projeto_CAIXINHA','19:30','Caixinha de perguntas','Pergunta: Qual sua dúvida sobre construir sua casa? · Se tiver foto de planta/obra (sem endereço), pode usar no lugar desta arte',{k:'Bastidor',h:'Toda casa começa assim: <em>um projeto no papel</em>.',sub:'Manda sua dúvida que eu respondo. 👇'}]];
const CIS=[
 ['2026-11-03','cfcint-tempo_ENQUETE','08:00','Enquete','Opções: Matrícula / Cobrança / Agenda / Detran · anote o resultado',{k:'Dono de CFC',h:'O que mais toma seu <em>tempo</em> hoje?',sub:'Responde em 1 toque. 👇'}],
 ['2026-11-05','cfcint-matricula_ENQUETE','08:00','Enquete','Opções: Sim / Não, digito tudo / Uso planilha · melhor ainda: grave 10s da tela lendo a CNH e poste antes desta',{k:'Função da semana',h:'Matrícula sem digitar: o sistema <em>lê a CNH</em>.',sub:'Você já faz isso no seu CFC?'}],
 ['2026-11-07','cfcint-3autoescolas_LINK','08:00','Link','Link: www.cfcinteligente.com.br · Texto: Peça uma demonstração · ideal: poste antes um print do painel (sem dados de alunos)',{k:'Bastidor',h:'Tenho <em>3 autoescolas</em>. Gerencio tudo pelo celular.',sub:'Quer ver no seu CFC? Peça uma demonstração.'}]];
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
 const shot=async(html,file)=>{fs.mkdirSync(path.dirname(file),{recursive:true});await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:file});};
 const ag={};const add=(d,key,nome,para,st)=>{ag[d]=ag[d]||{};ag[d][key]=ag[d][key]||{nome,para,stories:[]};ag[d][key].stories.push(st);};
 for(const [d,f,th,h,st,op,fn] of NA) for(const c of Object.keys(CID)){const rel=`artes/${d}/autoescola-${c}-${f}.png`;await shot(na(th,c,fn(c)),`${R}/${rel}`);
   add(d,`autoescola-${c}`,`Nova Alvorada ${CID[c].n}`,CID[c].var,{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of ENGS){const rel=`artes/${d}/${f}.png`;await shot(box(ENG,t),`${R}/${rel}`);add(d,'eng.aliff','@eng.aliff','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 for(const [d,f,h,st,op,t] of CIS){const rel=`artes/${d}/${f}.png`;await shot(box(CI,t,ciLogo),`${R}/${rel}`);add(d,'cfcinteligente','@cfcinteligente','DYALOG_NUMERO',{hora:h,arte:`conteudo/${rel}`,sticker:st,opcoes:op});}
 const obs={'2026-11-02':'Feriado: só 1 story, respeitoso. Mensagens de hoje serão respondidas amanhã.','2026-11-03':'Se der, troque esta arte por uma FOTO real do carro da autoescola com o mesmo texto.','2026-11-07':'Eldorado fechada hoje: tudo bem postar, respostas na segunda.'};
 for(const [d,o] of Object.entries(ag)){for(const k of Object.keys(o)) if(k.startsWith('autoescola')&&obs[d]) o[k].obs=obs[d];
   // código de cada story para aprovar/ajustar pelo WhatsApp: DD/MM-A1 (autoescolas), -E1 (eng), -C1 (cfcinteligente)
   const dm=`${d.slice(8)}/${d.slice(5,7)}`;
   for(const [k,cfg] of Object.entries(o)){const pre=k.startsWith('autoescola')?'A':k==='eng.aliff'?'E':'C';cfg.stories.forEach((st,i)=>st.codigo=`${dm}-${pre}${i+1}`);}
   const arq=`${R}/agenda/${d}.json`; let aprovado=false;
   if(fs.existsSync(arq)) aprovado=!!JSON.parse(fs.readFileSync(arq,'utf8'))._aprovado;
   fs.mkdirSync(`${R}/agenda`,{recursive:true});fs.writeFileSync(arq,JSON.stringify({_aprovado:aprovado,...o},null,1));}
 await b.close();console.log(Object.keys(ag).join(' '));})();
