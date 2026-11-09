"""Cobra o Aliff no WhatsApp quando a próxima semana de Stories não está pronta.

Pronta = os 7 dias (seg a dom) têm conteudo/agenda/AAAA-MM-DD.json com "_aprovado": true.
Roda qui, sex e dom à tarde (olha a semana que começa na próxima segunda) e na segunda
de manhã (olha a semana atual). Uso: python3 scripts/cobrar_semana.py [AAAA-MM-DD] [--teste]
"""
import json, os, sys
from datetime import date, datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(__file__))
from avisar_whatsapp import enviar

AGENDA = os.path.join(os.path.dirname(__file__), "..", "conteudo", "agenda")
args = [a for a in sys.argv[1:] if not a.startswith("--")]
hoje = date.fromisoformat(args[0]) if args else datetime.now(timezone(timedelta(hours=-4))).date()
seg = hoje if hoje.weekday() == 0 else hoje + timedelta(days=7 - hoje.weekday())
dias = [seg + timedelta(days=i) for i in range(7)]

faltam, sem_ok = [], []
for d in dias:
    arq = os.path.join(AGENDA, f"{d.isoformat()}.json")
    if not os.path.exists(arq):
        faltam.append(d)
    elif not json.load(open(arq, encoding="utf-8")).get("_aprovado"):
        sem_ok.append(d)

fmt = lambda ds: ", ".join(d.strftime("%d/%m") for d in ds)
rotulo = f"{dias[0]:%d/%m} a {dias[-1]:%d/%m}"
if not faltam and not sem_ok:
    print(f"Semana {rotulo} pronta e aprovada. Nada a cobrar.")
    sys.exit(0)

urgente = hoje == seg or hoje.weekday() == 6
msg = [f"{'🚨' if urgente else '⏰'} *Stories da semana {rotulo}*"]
if faltam:
    msg.append(f"Ainda *não foram feitos*: {fmt(faltam)}.")
if sem_ok:
    msg.append(f"Feitos, mas *sem aprovação*: {fmt(sem_ok)}. Responda APROVO na prévia.")
msg.append("Sem agenda aprovada o robô não posta nada. Abre a conversa do Claude e pede: "
           "*\"vamos fazer a semana\"*." if faltam else "Sem aprovação o robô não posta esses dias.")
texto = "\n".join(msg)
print(texto)
if "--teste" not in sys.argv:
    enviar(texto, "DYALOG_NUMERO")
