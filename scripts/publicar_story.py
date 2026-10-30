"""Publica um story SEM sticker direto pela API oficial do Instagram.

A Meta baixa a imagem por URL pública: usamos o link raw do GitHub deste repositório
(a arte precisa estar commitada e enviada). A API só aceita JPEG.

Uso:
  python3 scripts/publicar_story.py <conta> <caminho/arte.jpg>            # publica
  python3 scripts/publicar_story.py <conta> <caminho/arte.jpg> --testar   # só cria o container, não publica
Contas: eldorado, caarapo, itaquirai, cfcinteligente, eng.aliff
"""
import json, os, sys, time, urllib.error, urllib.parse, urllib.request

sys.path.insert(0, os.path.dirname(__file__))
from coletar_insights import CONTAS, GRAPH, TOKEN

RAW = "https://raw.githubusercontent.com/aliffstefano/Socialmidia/claude/compassionate-heisenberg-7z04ko/"


def chamar(metodo, caminho, **q):
    url = f"{GRAPH}/{caminho}"
    dados = urllib.parse.urlencode(q).encode() if metodo == "POST" else None
    if metodo == "GET":
        url += "?" + urllib.parse.urlencode(q)
    req = urllib.request.Request(url, data=dados, method=metodo, headers={"Authorization": "Bearer " + TOKEN})
    try:
        return json.load(urllib.request.urlopen(req, timeout=60))
    except urllib.error.HTTPError as e:
        return {"error": json.load(e).get("error", {})}


def publicar(conta, arte, testar=False):
    ig = CONTAS[conta]
    url = RAW + arte.replace(os.sep, "/")
    c = chamar("POST", f"{ig}/media", image_url=url, media_type="STORIES")
    if "id" not in c:
        return {"ok": False, "etapa": "container", "erro": c.get("error")}
    for _ in range(20):
        st = chamar("GET", c["id"], fields="status_code,status")
        if st.get("status_code") == "FINISHED":
            break
        if st.get("status_code") == "ERROR":
            return {"ok": False, "etapa": "processamento", "erro": st.get("status")}
        time.sleep(5)
    else:
        return {"ok": False, "etapa": "processamento", "erro": "demorou demais"}
    if testar:
        return {"ok": True, "testado": True, "container": c["id"]}
    p = chamar("POST", f"{ig}/media_publish", creation_id=c["id"])
    if "id" not in p:
        return {"ok": False, "etapa": "publicar", "erro": p.get("error")}
    return {"ok": True, "media_id": p["id"]}


if __name__ == "__main__":
    r = publicar(sys.argv[1], sys.argv[2], "--testar" in sys.argv)
    print(json.dumps(r, ensure_ascii=False))
    sys.exit(0 if r["ok"] else 1)
