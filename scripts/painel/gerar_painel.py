"""Gera o painel de programação (HTML + miniaturas) a partir de conteudo/agenda/*.json.

Uso: python3 scripts/painel/gerar_painel.py <pasta_saida>
Depois publique <pasta_saida>/index.html como Artifact, com as miniaturas em `files`
(URL do painel em conteudo/agenda/_painel_url.txt).
"""
import json, glob, os, sys, datetime
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from expediente import ajustar

RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SAIDA = os.path.abspath(sys.argv[1])
os.makedirs(os.path.join(SAIDA, "thumbs"), exist_ok=True)

PERFIS = {
    "autoescola-eldorado": ("auto", "Eldorado"),
    "autoescola-caarapo": ("auto", "Caarapó"),
    "autoescola-itaquirai": ("auto", "Itaquiraí"),
    "eng.aliff": ("eng", "@eng.aliff"),
    "cfcinteligente": ("cfc", "@cfcinteligente"),
}

# Conteúdo além dos Stories (atualizar à mão quando o status mudar)
OUTROS = [
    {"perfil": "Autoescolas", "item": "Reels: Golpe da CNH sem prova", "status": "roteiro",
     "falta": "Instrutor gravar falando (carro parado ao fundo)", "onde": "conteudo/autoescolas/2026-10-30-roteiros-regra.md"},
    {"perfil": "Autoescolas", "item": "Reels: Pontuação 20/30/40", "status": "roteiro",
     "falta": "Instrutor gravar falando", "onde": "conteudo/autoescolas/2026-10-30-roteiros-regra.md"},
    {"perfil": "Autoescolas", "item": "Reels: Passo a passo da CNH", "status": "conferir",
     "falta": "Confirmar a ordem das etapas no Detran-MS, depois gravar", "onde": "conteudo/autoescolas/2026-10-30-roteiros-regra.md"},
    {"perfil": "Autoescolas", "item": "Reels: Baliza em 4 passos", "status": "roteiro",
     "falta": "Gravar no pátio com 2 câmeras (sem fala ao vivo)", "onde": "conteudo/autoescolas/2026-10-30-roteiros-baliza-e-pov.md"},
    {"perfil": "Autoescolas", "item": "Reels: POV 1ª aula", "status": "roteiro",
     "falta": "Gravar em cada cidade + autorização de quem aparece", "onde": "conteudo/autoescolas/2026-10-30-roteiros-baliza-e-pov.md"},
    {"perfil": "@eng.aliff + @cfcinteligente", "item": "Dia de gravação (1h, vários Reels)", "status": "data",
     "falta": "Aliff marcar o dia", "onde": "conteudo/2026-11-dia-de-gravacao.md"},
    {"perfil": "Todos", "item": "Black Friday (27/11)", "status": "decidir",
     "falta": "Definir a oferta real de cada negócio até 15/11", "onde": "conteudo/2026-11-black-friday.md"},
    {"perfil": "Todos", "item": "Posts de feed / carrosséis", "status": "afazer",
     "falta": "Ainda não feitos. O Claude pode montar sem ninguém gravar", "onde": "-"},
]

dias = []
for f in sorted(glob.glob(os.path.join(RAIZ, "conteudo/agenda/20*.json"))):
    data = os.path.basename(f)[:-5]
    ag = json.load(open(f, encoding="utf-8"))
    itens = []
    for chave, bloco in ag.items():
        if chave.startswith("_") or chave not in PERFIS:
            continue
        grupo, rotulo = PERFIS[chave]
        bloco = ajustar(data, chave, bloco)
        quem = "robo" if bloco.get("auto") else ("aliff" if bloco.get("para") == "DYALOG_NUMERO" and grupo == "auto" else "")
        for s in bloco.get("stories", []):
            arte = os.path.join(RAIZ, s["arte"])
            thumb = None
            if os.path.exists(arte):
                nome = f"{data}_{os.path.basename(arte).rsplit('.', 1)[0]}.jpg"
                destino = os.path.join(SAIDA, "thumbs", nome)
                im = Image.open(arte).convert("RGB")
                im.thumbnail((540, 960))
                im.save(destino, "JPEG", quality=78, optimize=True)
                thumb = "thumbs/" + nome
            itens.append({
                "grupo": grupo, "perfil": rotulo, "hora": s.get("hora", ""),
                "sticker": s.get("sticker", ""), "opcoes": s.get("opcoes", ""),
                "codigo": s.get("codigo", ""), "thumb": thumb, "quem": quem, "obs": bloco.get("obs", ""),
            })
    itens.sort(key=lambda i: (i["hora"], i["grupo"]))
    dias.append({"data": data, "aprovado": bool(ag.get("_aprovado")), "itens": itens})

agora = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=-4)))
dados = {"gerado": agora.strftime("%d/%m às %H:%M"), "dias": dias, "outros": OUTROS}

modelo = open(os.path.join(os.path.dirname(__file__), "modelo.html"), encoding="utf-8").read()
html = modelo.replace("/*__DADOS__*/null", json.dumps(dados, ensure_ascii=False))
open(os.path.join(SAIDA, "index.html"), "w", encoding="utf-8").write(html)
print(SAIDA, len(dias), "dias", sum(len(d["itens"]) for d in dias), "stories")
