/**
 * Webhook do Dyalog Connect -> planilha Google. Cole este código em script.google.com.
 *
 * 1. Crie uma planilha (ex.: "Webhook WhatsApp Social Media").
 * 2. Na planilha: Extensões > Apps Script. Apague o código e cole este arquivo.
 * 3. Configurações do projeto (engrenagem) > Propriedades do script > adicione
 *    CHAVE = uma senha longa e aleatória (ex.: gere em https://www.uuidgenerator.net/).
 * 4. Implantar > Nova implantação > tipo "App da Web" > Executar como: Eu >
 *    Quem pode acessar: Qualquer pessoa > Implantar. Copie a URL (termina em /exec).
 * 5. No painel do Dyalog, webhook de mensagens recebidas:  <URL>?chave=<CHAVE>
 * 6. No ambiente do Claude, variável WEBHOOK_URL = <URL>?chave=<CHAVE>
 */
function chaveOk_(e) {
  return e && e.parameter && e.parameter.chave === PropertiesService.getScriptProperties().getProperty('CHAVE');
}

function aba_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName('mensagens');
  if (!sh) {
    sh = ss.insertSheet('mensagens');
    sh.appendRow(['recebido_em', 'remetente', 'chat_jid', 'texto', 'bruto']);
  }
  return sh;
}

// Dyalog -> aqui (POST com JSON da mensagem recebida)
function doPost(e) {
  if (!chaveOk_(e)) return ContentService.createTextOutput('negado');
  const bruto = (e.postData && e.postData.contents) || '';
  let m = {};
  try { m = JSON.parse(bruto); } catch (err) {}
  const d = m.dados || m.data || m.mensagem || m;   // aceita payload direto ou embrulhado
  const texto = d.conteudo || d.texto || d.mensagem || d.body || (d.message && (d.message.conversation || d.message.text)) || '';
  aba_().appendRow([new Date().toISOString(), d.remetente || d.from || d.numero || '', d.chat_jid || d.jid || '', String(texto), bruto.slice(0, 2000)]);
  return ContentService.createTextOutput('ok');
}

// Agente -> aqui (GET ?chave=...&desde=ISO) devolve as mensagens em JSON
function doGet(e) {
  if (!chaveOk_(e)) return ContentService.createTextOutput('negado');
  const desde = e.parameter.desde || '1970-01-01';
  const linhas = aba_().getDataRange().getValues().slice(1)
    .filter(r => String(r[0]) >= desde)
    .map(r => ({ recebido_em: r[0], remetente: String(r[1]), chat_jid: String(r[2]), texto: String(r[3]), bruto: String(r[4]) }));
  return ContentService.createTextOutput(JSON.stringify(linhas)).setMimeType(ContentService.MimeType.JSON);
}
