"""Lê as respostas do Aliff no WhatsApp (via webhook -> planilha) e aplica aprovações nas agendas.

Comandos aceitos (mensagem do número DYALOG_NUMERO, maiúsculas ou minúsculas):
  APROVO                 aprova as agendas pendentes dos 8 dias seguintes à mensagem (a prévia da semana)
  APROVO 03/11           aprova só esse dia (pode listar vários: APROVO 03/11 04/11)
  AJUSTE 05/11: ...      registra o pedido em conteudo/agenda/ajustes.md (e não aprova o dia)
Variável: WEBHOOK_URL (URL do Apps Script com ?chave=...). Sem ela, não faz nada.
Uso: python3 scripts/ler_aprovacoes.py   → imprime o que mudou
"""
import glob, json, os, re, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

RAIZ = os.path.join(os.path.dirname(__file__), "..")
AGENDA = os.path.join(RAIZ, "conteudo", "agenda")
MS = timezone(timedelta(hours=-4))


def mensagens(desde):
    url = os.environ.get("WEBHOOK_URL")
    if not url:
        print("WEBHOOK_URL não configurada; aprovações pelo WhatsApp desligadas.")
        return []
    sep = "&" if "?" in url else "?"
    req = urllib.request.Request(f"{url}{sep}desde={urllib.parse.quote(desde)}",
                                 headers={"User-Agent": "socialmidia-agente/1.0"})
    return json.load(urllib.request.urlopen(req, timeout=60))


def main():
    estado_p = os.path.join(AGENDA, "_aprovacoes_lidas.txt")
    desde = open(estado_p).read().strip() if os.path.exists(estado_p) else "2026-10-30"
    numero = os.environ.get("DYALOG_NUMERO", "")
    hoje = datetime.now(MS).strftime("%Y-%m-%d")
    ultimo = desde
    for m in mensagens(desde):
        ultimo = max(ultimo, str(m["recebido_em"]))
        try:
            dados = json.loads(m.get("bruto") or "{}").get("dados", {})
        except ValueError:
            dados = {}
        # O Dyalog manda remetente/chat_jid como LID; o número real vem em remetente_numero / autor.numero.
        quem = " ".join(str(x) for x in (dados.get("remetente_numero"), (dados.get("autor") or {}).get("numero"),
                                          m["remetente"], m["chat_jid"]) if x)
        if numero[-8:] not in quem or dados.get("grupo") or dados.get("enviado_por_mim") or m["chat_jid"].endswith("@g.us"):
            continue
        texto = m["texto"].strip()
        cmd = texto.upper()
        datas = [f"2026-{mm}-{dd}" for dd, mm in re.findall(r"(\d{2})/(\d{2})", texto)]
        if cmd.startswith("APROVO"):
            dia_msg = str(m["recebido_em"])[:10]
            limite = (datetime.strptime(dia_msg, "%Y-%m-%d") + timedelta(days=8)).strftime("%Y-%m-%d")
            alvos = [f"{AGENDA}/{d}.json" for d in datas] or \
                    [f for f in glob.glob(f"{AGENDA}/2*.json") if max(hoje, dia_msg) <= os.path.basename(f)[:10] <= limite]
            for f in alvos:
                if os.path.exists(f):
                    ag = json.load(open(f, encoding="utf-8"))
                    if not ag.get("_aprovado"):
                        ag["_aprovado"] = True
                        json.dump(ag, open(f, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
                        print("aprovado:", os.path.basename(f)[:10])
        elif cmd.startswith("AJUSTE"):
            with open(os.path.join(AGENDA, "ajustes.md"), "a", encoding="utf-8") as f:
                f.write(f"- [ ] {m['recebido_em']}: {texto}\n")
            print("ajuste registrado:", texto[:80])
    open(estado_p, "w").write(ultimo)


if __name__ == "__main__":
    main()
