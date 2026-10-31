"""Coleta métricas dos Stories ativos e dos posts recentes das 5 contas e grava em dados/.

Stories só ficam na API por 24h, então este script precisa rodar pelo menos 2x por dia.
Cada execução atualiza a linha do mesmo post/story (fica sempre o valor mais recente).
Uso: META_SYSTEM_TOKEN=... python3 scripts/coletar_insights.py
"""
import csv, json, os, time, urllib.error, urllib.parse, urllib.request
from datetime import datetime, timedelta, timezone

TOKEN = os.environ["META_SYSTEM_TOKEN"]
GRAPH = "https://graph.facebook.com/v21.0"
MS = timezone(timedelta(hours=-4))  # Mato Grosso do Sul (sem horário de verão)
CONTAS = {
    "eldorado": "17841404471870362",
    "itaquirai": "17841446344564360",
    "caarapo": "17841464009406383",
    "cfcinteligente": "17841416427423096",
    "eng.aliff": "17841422261384672",
}
RAIZ = os.path.join(os.path.dirname(__file__), "..", "dados")
CAMPOS_STORY = ["id", "conta", "postado_ms", "dia_semana", "hora", "tipo", "alcance", "views",
                "respostas", "compartilhamentos", "interacoes", "toques_frente", "toques_tras",
                "saidas", "proximo_story", "link", "coletado_ms"]
CAMPOS_POST = ["id", "conta", "postado_ms", "dia_semana", "hora", "formato", "alcance", "views",
               "curtidas", "comentarios", "salvos", "compartilhamentos", "legenda", "link", "coletado_ms"]
DIAS = ["seg", "ter", "qua", "qui", "sex", "sab", "dom"]


def get(path, **q):
    url = f"{GRAPH}/{path}?{urllib.parse.urlencode(q)}"
    req = urllib.request.Request(url, headers={"Authorization": "Bearer " + TOKEN})
    try:
        return json.load(urllib.request.urlopen(req, timeout=30))
    except urllib.error.HTTPError as e:
        return {"error": json.load(e).get("error", {}).get("message")}


def quando(ts):
    dt = datetime.strptime(ts, "%Y-%m-%dT%H:%M:%S%z").astimezone(MS)
    return dt.strftime("%Y-%m-%d %H:%M"), DIAS[dt.weekday()], dt.hour


def metricas(media_id, nomes, breakdown=None):
    q = {"metric": ",".join(nomes)}
    if breakdown:
        q["breakdown"] = breakdown
    d = get(f"{media_id}/insights", **q)
    out = {}
    for m in d.get("data", []):
        if "total_value" in m:
            tv = m["total_value"]
            out[m["name"]] = tv.get("value")
            for b in tv.get("breakdowns", []):
                for r in b.get("results", []):
                    out[r["dimension_values"][0]] = r["value"]
        else:
            out[m["name"]] = m["values"][0]["value"]
    return out


def gravar(arquivo, campos, novas):
    caminho = os.path.join(RAIZ, arquivo)
    linhas = {}
    if os.path.exists(caminho):
        with open(caminho, newline="", encoding="utf-8") as f:
            linhas = {r["id"]: r for r in csv.DictReader(f)}
    for r in novas:
        linhas[r["id"]] = r
    with open(caminho, "w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=campos)
        w.writeheader()
        for r in sorted(linhas.values(), key=lambda r: r["postado_ms"]):
            w.writerow(r)
    return len(novas)


def main():
    agora = datetime.now(MS).strftime("%Y-%m-%d %H:%M")
    stories, posts = [], []
    for conta, ig in CONTAS.items():
        for s in get(f"{ig}/stories", fields="id,media_type,timestamp,permalink").get("data", []):
            m = metricas(s["id"], ["reach", "views", "replies", "shares", "total_interactions"])
            # navigation exige breakdown próprio; misturar com as outras métricas faz a API recusar tudo
            m.update({k.upper(): v for k, v in metricas(s["id"], ["navigation"],
                                                         breakdown="story_navigation_action_type").items()})
            postado, dia, hora = quando(s["timestamp"])
            stories.append({"id": s["id"], "conta": conta, "postado_ms": postado, "dia_semana": dia, "hora": hora,
                            "tipo": s.get("media_type"), "alcance": m.get("reach"), "views": m.get("views"),
                            "respostas": m.get("replies"), "compartilhamentos": m.get("shares"),
                            "interacoes": m.get("total_interactions"), "toques_frente": m.get("TAP_FORWARD"),
                            "toques_tras": m.get("TAP_BACK"), "saidas": m.get("TAP_EXIT"),
                            "proximo_story": m.get("SWIPE_FORWARD"), "link": s.get("permalink"), "coletado_ms": agora})
        midia = get(f"{ig}/media", limit=20,
                    fields="id,media_product_type,media_type,timestamp,like_count,comments_count,caption,permalink")
        for p in midia.get("data", []):
            m = metricas(p["id"], ["reach", "views", "saved", "shares"])
            postado, dia, hora = quando(p["timestamp"])
            formato = "REELS" if p.get("media_product_type") == "REELS" else p.get("media_type")
            posts.append({"id": p["id"], "conta": conta, "postado_ms": postado, "dia_semana": dia, "hora": hora,
                          "formato": formato, "alcance": m.get("reach"), "views": m.get("views"),
                          "curtidas": p.get("like_count"), "comentarios": p.get("comments_count"),
                          "salvos": m.get("saved"), "compartilhamentos": m.get("shares"),
                          "legenda": (p.get("caption") or "").split("\n")[0][:80], "link": p.get("permalink"),
                          "coletado_ms": agora})
        time.sleep(0.5)
    os.makedirs(RAIZ, exist_ok=True)
    print(f"{agora} · stories ativos: {gravar('stories.csv', CAMPOS_STORY, stories)} · "
          f"posts: {gravar('posts.csv', CAMPOS_POST, posts)}")


if __name__ == "__main__":
    main()
