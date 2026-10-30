"""Manda para quem posta em cada unidade as artes e instruções dos Stories do dia.

Lê conteudo/agenda/AAAA-MM-DD.json (data de hoje em MS, ou a passada como argumento).
Formato: {"_aprovado": true, "autoescola-eldorado": {"para": "DYALOG_ELDORADO", "stories": [
           {"hora": "08:00", "arte": "conteudo/artes/2026-10-31/....png",
            "sticker": "Caixinha de perguntas", "opcoes": "..."}]}, ...}
Uso: python3 scripts/enviar_stories_do_dia.py [AAAA-MM-DD]
"""
import json, os, sys, time
from datetime import datetime, timedelta, timezone
sys.path.insert(0, os.path.dirname(__file__))
from avisar_whatsapp import enviar
import ler_aprovacoes

RAIZ = os.path.join(os.path.dirname(__file__), "..")
DIAS = ["segunda", "terça", "quarta", "quinta", "sexta", "sábado", "domingo"]


def main():
    hoje = sys.argv[1] if len(sys.argv) > 1 else datetime.now(timezone(timedelta(hours=-4))).strftime("%Y-%m-%d")
    caminho = os.path.join(RAIZ, "conteudo", "agenda", f"{hoje}.json")
    if not os.path.exists(caminho):
        print(f"Sem agenda para {hoje}.")
        return
    try:
        ler_aprovacoes.main()  # aplica APROVO/AJUSTE recebidos pelo WhatsApp antes de decidir
    except Exception as e:
        print("não consegui ler aprovações:", e)
    agenda = json.load(open(caminho, encoding="utf-8"))
    dia = DIAS[datetime.strptime(hoje, "%Y-%m-%d").weekday()]
    if not agenda.get("_aprovado"):
        enviar(f"⏸️ Os Stories de hoje ({hoje[8:]}/{hoje[5:7]}) não foram aprovados, então não enviei para as unidades.",
               "DYALOG_NUMERO")
        print(f"Agenda de {hoje} não aprovada; nada enviado às unidades.")
        return
    for perfil, cfg in agenda.items():
        if perfil.startswith("_"):
            continue
        stories = cfg["stories"]
        resumo = [f"📲 *Stories de hoje ({dia}, {hoje[8:]}/{hoje[5:7]}) — {cfg.get('nome', perfil)}*",
                  f"São {len(stories)} stories. As artes vêm logo abaixo, na ordem."]
        resumo += [f"{i}. {s['hora']} · sticker: {s['sticker']}" for i, s in enumerate(stories, 1)]
        if cfg.get("obs"):
            resumo.append(f"⚠️ {cfg['obs']}")
        if enviar("\n".join(resumo), cfg["para"]) is None:
            continue
        for i, s in enumerate(stories, 1):
            legenda = f"*{i}. Postar às {s['hora']}*\nSticker: *{s['sticker']}*"
            if s.get("opcoes"):
                legenda += f"\n{s['opcoes']}"
            enviar(legenda, cfg["para"], os.path.join(RAIZ, s["arte"]))
            time.sleep(2)


if __name__ == "__main__":
    main()
