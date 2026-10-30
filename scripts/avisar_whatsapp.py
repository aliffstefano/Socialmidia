"""Envia texto (e opcionalmente uma imagem) pelo WhatsApp usando a API Dyalog Connect.

Variáveis de ambiente:
  DYALOG_TOKEN            token da instância (header X-Access-Token)
  Destinos (número com DDI+DDD só dígitos, ou JID de grupo terminado em @g.us):
  DYALOG_NUMERO           Aliff: alertas de destaque + resumo semanal
  DYALOG_GRUPO_MARKETING  grupo do marketing: relatório semanal
  DYALOG_ELDORADO / DYALOG_CAARAPO / DYALOG_ITAQUIRAI   quem posta os Stories de cada unidade
Uso:
  python3 scripts/avisar_whatsapp.py "texto"                      (vai para DYALOG_NUMERO)
  python3 scripts/avisar_whatsapp.py --para DYALOG_ELDORADO --imagem arte.png "legenda"
Destino não configurado: apenas avisa e sai sem erro.
"""
import argparse, base64, json, os, sys, urllib.error, urllib.request

BASE = "https://connect.dyalog.com.br/api/v1/batepapo/enviar"


def enviar(texto, para="DYALOG_NUMERO", imagem=None):
    token, destino = os.environ.get("DYALOG_TOKEN"), os.environ.get(para)
    if not token or not destino:
        print(f"WhatsApp não configurado (falta DYALOG_TOKEN ou {para}); não enviado.")
        return None
    corpo = {"chat_jid": destino, "grupo": True} if destino.endswith("@g.us") else {"numero": destino}
    if imagem:
        with open(imagem, "rb") as f:
            corpo.update(arquivo_base64="data:image/png;base64," + base64.b64encode(f.read()).decode(),
                         legenda=texto, nome_arquivo=os.path.basename(imagem))
        url = f"{BASE}/imagem"
    else:
        corpo["mensagem"] = texto
        url = f"{BASE}/texto"
    req = urllib.request.Request(url, data=json.dumps(corpo).encode(), method="POST",
                                 headers={"X-Access-Token": token, "Content-Type": "application/json",
                                          "User-Agent": "socialmidia-agente/1.0"})  # Cloudflare bloqueia o UA padrão do urllib (erro 1010)
    try:
        resp = json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        bruto = e.read().decode(errors="replace")
        try:
            resp = json.loads(bruto)
        except ValueError:
            resp = {"erro": f"HTTP {e.code}", "mensagem": bruto[:200]}
    ok = bool(resp.get("sucesso"))
    print(f"{para}: " + ("enviado" if ok else f"falhou: {resp.get('erro')} {resp.get('mensagem')}"))
    return ok


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--para", default="DYALOG_NUMERO")
    ap.add_argument("--imagem")
    ap.add_argument("texto", nargs="*")
    a = ap.parse_args()
    sys.exit(0 if enviar(" ".join(a.texto) or sys.stdin.read().strip(), a.para, a.imagem) is not False else 1)
