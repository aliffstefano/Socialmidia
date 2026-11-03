"""Robô de Stories: publica no horário, com sticker, pelo serviço do Android (STORY_API_URL).

Roda várias vezes por dia (rotina). A cada execução, publica os stories de hoje (agenda aprovada)
cujo horário já chegou e que ainda não saíram. Sticker de cada arte: conteudo/agenda/_stickers_robo.json.
Estado (não duplicar): conteudo/agenda/_publicados.json.
Se falhar: manda a arte e a instrução para quem posta à mão (regras de expediente) e avisa o Aliff.
Uso: python3 scripts/postar_robo.py [--agora HH:MM] [--data AAAA-MM-DD]
"""
import json, os, re, sys, time, urllib.error, urllib.request
from datetime import datetime, timedelta, timezone
sys.path.insert(0, os.path.dirname(__file__))
from avisar_whatsapp import enviar
from coletar_insights import CONTAS, get
from expediente import ajustar
from espaco_livre import faixa

RAIZ = os.path.join(os.path.dirname(__file__), "..")
AG = os.path.join(RAIZ, "conteudo", "agenda")
RAW = "https://raw.githubusercontent.com/aliffstefano/Socialmidia/claude/compassionate-heisenberg-7z04ko/"
MS = timezone(timedelta(hours=-4))
ATRASO_MAX = 4 * 60  # min: depois disso não publica mais (story fora de hora)
CFG = json.load(open(os.path.join(os.path.dirname(__file__), "contas_robo.json"), encoding="utf-8"))
UA = {"User-Agent": "socialmidia-agente/1.0"}


def _m(h):
    return int(h[:2]) * 60 + int(h[3:5])


def ler(nome, padrao):
    p = os.path.join(AG, nome)
    return json.load(open(p, encoding="utf-8")) if os.path.exists(p) else padrao


def stickers_de(perfil, arte):
    nome = re.sub(r"^autoescola-[a-z]+-", "", os.path.basename(arte))
    specs = ler("_stickers_robo.json", {}).get(nome)
    if specs is None:
        return None
    out = []
    for s in specs:
        s = dict(s)
        if s.get("url") == "WHATSAPP":
            s["url"] = CFG[perfil]["whatsapp"]
            if not s["url"]:
                return None
        out.append(s)
    return out


# Altura real de cada sticker (fração da tela), medida pelo "boxes" do dry_run em 03/11/2026. Enquete sem pergunta.
ALTURA = {"slider": 0.244, "question": 0.272, "link": 0.056, "mention": 0.06, "hashtag": 0.06}
ALTURA_POLL = {2: 0.212, 3: 0.30, 4: 0.387}


def altura(st):
    return ALTURA_POLL.get(len(st.get("options", [])), 0.387) if st["type"] == "poll" else ALTURA.get(st["type"], 0.3)


def posicionar(arte, stickers):
    """Põe o sticker no centro da maior faixa vazia da arte. Devolve None se não couber (não publica)."""
    a, b = faixa(os.path.join(RAIZ, arte))
    precisa = sum(altura(s) for s in stickers)
    if precisa > (b - a) + 0.01:
        return None
    topo = (a + b) / 2 - precisa / 2
    for s in stickers:
        s["y"] = round(topo + altura(s) / 2, 3)
        topo += altura(s)
    return stickers


def robo_cuida(perfil, cfg):
    """True se o robô consegue postar todos os stories deste bloco (tem token e sticker definido)."""
    return (perfil in CFG and bool(os.environ.get(CFG[perfil]["token_env"])) and bool(os.environ.get("STORY_API_URL"))
            and all(stickers_de(perfil, s["arte"]) is not None for s in cfg["stories"]))


def chamar(caminho, corpo=None, token=None, timeout=300):
    h = dict(UA, **({"Authorization": "Bearer " + token} if token else {}))
    if corpo is not None:
        h["Content-Type"] = "application/json"
    req = urllib.request.Request(os.environ["STORY_API_URL"] + caminho, method="POST" if corpo is not None else "GET",
                                 data=json.dumps(corpo).encode() if corpo is not None else None, headers=h)
    try:
        return json.load(urllib.request.urlopen(req, timeout=timeout))
    except urllib.error.HTTPError as e:
        try:
            return json.load(e)
        except Exception:
            return {"ok": False, "error": f"HTTP {e.code}"}
    except Exception as e:  # conexão caiu (o pedido pode ter sido processado mesmo assim)
        return {"ok": False, "error": str(e), "conexao": True}


def no_ar(ig):
    return len(get(f"{CONTAS[ig]}/stories", fields="timestamp").get("data", []))


def esperar_livre():
    for _ in range(30):  # um celular só: espera ficar livre
        if not chamar("/health").get("busy"):
            return
        time.sleep(10)


def conferir(arte, stickers, token):
    """Monta em dry_run, lê onde cada sticker ficou (boxes) e ajusta o y até caber no espaço vazio.
    Devolve (stickers, erro). Não publica nada."""
    a, b = faixa(os.path.join(RAIZ, arte))
    for tentativa in range(2):
        esperar_livre()
        r = chamar("/story", {"image_url": RAW + arte, "stickers": stickers, "dry_run": True}, token)
        if r.get("conexao"):  # dry_run não publica: pode repetir
            esperar_livre()
            r = chamar("/story", {"image_url": RAW + arte, "stickers": stickers, "dry_run": True}, token)
        if not r.get("ok"):
            return None, r.get("error") or "dry_run falhou"
        caixas = r.get("boxes") or []
        if len(caixas) != len(stickers):
            return stickers, ""  # serviço sem boxes: segue com a posição calculada
        if all(c["top"] >= a - 0.01 and c["bottom"] <= b + 0.01 for c in caixas):
            return stickers, ""
        alturas = [c["bottom"] - c["top"] for c in caixas]
        if sum(alturas) > (b - a) + 0.01:
            return None, f"o sticker ocupa {sum(alturas):.0%} da tela e o espaço vazio da arte tem {b - a:.0%}"
        topo = (a + b) / 2 - sum(alturas) / 2
        for st, alt in zip(stickers, alturas):
            st["y"] = round(topo + alt / 2, 3)
            topo += alt
    return None, "não consegui posicionar o sticker sem tampar a arte"


def publicar(perfil, arte, stickers):
    ig, token = CFG[perfil]["ig"], os.environ.get(CFG[perfil]["token_env"])
    if not token:
        return False, "sem token"
    # Enquete vai sem pergunta: ela já está escrita na arte.
    stickers = [{k: v for k, v in st.items() if not (st["type"] == "poll" and k == "question")} for st in stickers]
    if stickers:
        stickers, erro = conferir(arte, stickers, token)
        if stickers is None:
            return False, erro
    esperar_livre()
    antes = no_ar(ig)
    r = chamar("/story", {"image_url": RAW + arte, "stickers": stickers}, token)
    if r.get("conexao"):  # nunca reenvia (risco de duplicar): espera o celular e confere na Meta
        esperar_livre()
    elif not r.get("ok"):
        return False, r.get("error") or "erro desconhecido"
    for _ in range(9):  # confirma na API da Meta
        time.sleep(15)
        if no_ar(ig) > antes:
            return True, ""
    return False, "o serviço disse ok, mas o story não apareceu na conta"


def plano_b(data, perfil, cfg, s, motivo):
    destino = ajustar(data, perfil, cfg)["para"]
    leg = f"⚠️ *O robô não conseguiu postar.* Poste agora, por favor.\nSticker: *{s['sticker']}*"
    if s.get("opcoes"):
        leg += f"\n{s['opcoes']}"
    enviar(leg, destino, os.path.join(RAIZ, s["arte"]))
    if destino != "DYALOG_NUMERO":
        enviar(f"⚠️ Robô falhou: {cfg.get('nome', perfil)} {s['hora']} ({motivo}). Mandei a arte para a equipe postar.", "DYALOG_NUMERO")


def main():
    args = dict(zip(sys.argv[1::2], sys.argv[2::2]))
    agora = datetime.now(MS)
    data = args.get("--data", agora.strftime("%Y-%m-%d"))
    minuto = _m(args.get("--agora", agora.strftime("%H:%M")))
    agenda = ler(f"{data}.json", None)
    if not agenda or not agenda.get("_aprovado"):
        print("sem agenda aprovada para", data)
        return
    feitos = ler("_publicados.json", {})
    fila = []
    for perfil, cfg in agenda.items():
        if perfil.startswith("_") or perfil not in CFG:
            continue
        for s in cfg["stories"]:
            chave = f"{data}|{perfil}|{s['arte']}"
            if chave in feitos or _m(s["hora"]) > minuto + 5:
                continue
            fila.append((s["hora"], perfil, cfg, s, chave))
    for hora, perfil, cfg, s, chave in sorted(fila, key=lambda x: x[0]):
        quando = datetime.now(MS).strftime("%Y-%m-%d %H:%M")
        if minuto - _m(hora) > ATRASO_MAX:
            feitos[chave] = {"status": "perdido", "quando": quando}
            enviar(f"⏭️ Robô não postou {cfg.get('nome', perfil)} das {hora}: passou do horário.", "DYALOG_NUMERO")
            continue
        stickers = stickers_de(perfil, s["arte"])
        if stickers is None:
            ok, motivo = False, "sticker desta arte não está em _stickers_robo.json"
        else:
            if stickers and posicionar(s["arte"], stickers) is None:
                ok, motivo = False, "o sticker não cabe no espaço vazio da arte sem tampar o texto"
            else:
                ok, motivo = publicar(perfil, s["arte"], stickers)
        feitos[chave] = {"status": "publicado" if ok else "falhou", "quando": quando, **({"motivo": motivo} if motivo else {})}
        print(chave, feitos[chave])
        if not ok:
            plano_b(data, perfil, cfg, s, motivo)
        json.dump(feitos, open(os.path.join(AG, "_publicados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    json.dump(feitos, open(os.path.join(AG, "_publicados.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
