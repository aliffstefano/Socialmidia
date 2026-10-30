"""Regras de expediente das unidades: quem posta e em que horário.

Os stories das autoescolas são postados pela equipe da unidade, então só podem cair
no horário em que ela está aberta. Aplicado no envio (enviar_stories_do_dia.py) e no painel.
- Fora do expediente: o horário vai para o slot livre mais próximo do dia (story fica 24h no ar).
- Unidade fechada (feriado, domingo, sábado de Eldorado): vai para o Aliff (DYALOG_NUMERO).
- Dia em AUTO: o robô publica sozinho (só stories sem sticker, scripts/publicar_story.py).
"""
from datetime import datetime

FERIADOS = {"2026-11-02", "2026-11-15", "2026-11-20", "2026-12-25"}
AUTO = {"2026-11-02"}  # dias em que o robô publica sozinho (artes sem sticker)

# Janelas (início, fim) por tipo de dia; slots = horários bons para postar dentro delas
UNIDADES = {
    "autoescola-eldorado": {
        "util": ([("08:00", "11:30"), ("13:00", "18:00")], ["08:00", "10:30", "13:30", "17:00"]),
        "sab": None,
    },
    "autoescola-caarapo": {
        "util": ([("07:00", "11:00"), ("13:00", "18:00")], ["07:30", "10:00", "13:30", "17:00"]),
        "sab": ([("08:00", "12:00")], ["08:00", "09:30", "10:30", "11:30"]),
    },
    "autoescola-itaquirai": {
        "util": ([("07:00", "11:00"), ("13:00", "17:00")], ["07:30", "10:00", "13:30", "16:30"]),
        "sab": ([("08:00", "12:00")], ["08:00", "09:30", "10:30", "11:30"]),
    },
}


def _m(h):
    a, b = h.split(":")
    return int(a) * 60 + int(b)


def _dentro(h, janelas):
    return any(_m(i) <= _m(h) <= _m(f) - 30 for i, f in janelas)


def _encaixar(horas, slots):
    """Leva cada horário ao slot mais próximo, mantendo a ordem e sem repetir slot."""
    out, ini = [], 0
    for k, h in enumerate(horas):
        fim = len(slots) - (len(horas) - k)  # deixa slots para os próximos
        j = min(range(ini, fim + 1), key=lambda x: abs(_m(slots[x]) - _m(h)))
        out.append(slots[j])
        ini = j + 1
    return out


def ajustar(data, chave, cfg):
    """Devolve uma cópia do bloco da agenda com horário/destino ajustados ao expediente."""
    if chave not in UNIDADES:
        return cfg
    cfg = {**cfg, "stories": [dict(s) for s in cfg["stories"]]}
    if data in AUTO:
        cfg["auto"] = True
        return cfg
    dia = datetime.strptime(data, "%Y-%m-%d").weekday()
    tipo = None if (data in FERIADOS or dia == 6) else ("sab" if dia == 5 else "util")
    regra = UNIDADES[chave].get(tipo) if tipo else None
    if regra is None:
        cfg["para"] = "DYALOG_NUMERO"
        cfg["obs"] = "Unidade fechada hoje: estes stories ficam com o Aliff." + (" " + cfg["obs"] if cfg.get("obs") else "")
        return cfg
    janelas, slots = regra
    fora = [s for s in cfg["stories"] if not _dentro(s["hora"], janelas)]
    ok = [s["hora"] for s in cfg["stories"] if s not in fora]
    livres = [h for h in slots if h not in ok and (not ok or _m(h) > _m(max(ok, key=_m)))]
    if fora and len(fora) <= len(livres):
        for s, h in zip(fora, _encaixar([s["hora"] for s in fora], livres)):
            s["hora"] = h
    return cfg
