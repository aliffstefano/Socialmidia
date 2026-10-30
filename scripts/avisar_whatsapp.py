"""Envia um texto pelo WhatsApp usando a API Dyalog Connect.

Variáveis de ambiente:
  DYALOG_TOKEN   token da instância (header X-Access-Token)
  DYALOG_NUMERO  número de destino só com dígitos, com DDI e DDD (ex.: 5567999999999)
Uso: python3 scripts/avisar_whatsapp.py "texto"   (ou o texto pela entrada padrão)
Sem as variáveis configuradas, apenas avisa e sai sem erro.
"""
import json, os, sys, urllib.error, urllib.request

URL = "https://connect.dyalog.com.br/batepapo/enviar/texto"


def enviar(texto):
    token, numero = os.environ.get("DYALOG_TOKEN"), os.environ.get("DYALOG_NUMERO")
    if not token or not numero:
        print("WhatsApp não configurado (faltam DYALOG_TOKEN/DYALOG_NUMERO); aviso não enviado.")
        return False
    corpo = json.dumps({"numero": numero, "mensagem": texto}).encode()
    req = urllib.request.Request(URL, data=corpo, method="POST",
                                 headers={"X-Access-Token": token, "Content-Type": "application/json"})
    try:
        resp = json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as e:
        resp = json.load(e)
    print("enviado" if resp.get("sucesso") else f"falhou: {resp.get('erro')} {resp.get('mensagem')}")
    return bool(resp.get("sucesso"))


if __name__ == "__main__":
    texto = " ".join(sys.argv[1:]) or sys.stdin.read()
    sys.exit(0 if enviar(texto.strip()) or not os.environ.get("DYALOG_TOKEN") else 1)
