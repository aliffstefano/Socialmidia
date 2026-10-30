"""Manda ao Aliff (DYALOG_NUMERO) a prévia dos Stories para aprovação.

Para as autoescolas manda só a versão de Eldorado (Caarapó e Itaquiraí são iguais, trocando a cidade).
Uso: python3 scripts/enviar_previa.py 2026-11-02 2026-11-03 ...
"""
import json, os, sys, time
sys.path.insert(0, os.path.dirname(__file__))
from avisar_whatsapp import enviar

RAIZ = os.path.join(os.path.dirname(__file__), "..")
NOMES = {"autoescola-eldorado": "Autoescolas (versão Eldorado; as outras 2 trocam só a cidade)",
         "eng.aliff": "@eng.aliff", "cfcinteligente": "@cfcinteligente"}

for data in sys.argv[1:]:
    agenda = json.load(open(os.path.join(RAIZ, "conteudo", "agenda", f"{data}.json"), encoding="utf-8"))
    rotulo = f"{data[8:]}/{data[5:7]}"
    enviar(f"🗓️ *Prévia dos Stories de {rotulo}* — para aprovar", "DYALOG_NUMERO")
    for chave, nome in NOMES.items():
        for i, s in enumerate(agenda.get(chave, {}).get("stories", []), 1):
            legenda = f"*{rotulo} · {nome}*\n{i}. {s['hora']} · sticker: {s['sticker']}"
            if s.get("opcoes"):
                legenda += f"\n{s['opcoes']}"
            enviar(legenda, "DYALOG_NUMERO", os.path.join(RAIZ, s["arte"]))
            time.sleep(2)
enviar("✅ Fim da prévia. Para aprovar, responda ao Claude: *APROVO* (tudo) ou *APROVO 03/11*; "
       "para mudar algo: *AJUSTE 05/11: ...*", "DYALOG_NUMERO")
