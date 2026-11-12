# Carrossel visual: roteiro em JSON → PNGs prontos pro Instagram

Gera slides **1080×1350 (4:5)** com a identidade de cada perfil. Usado pelo comando `/carrossel-visual`.
Ideia tirada do [growthOS](https://github.com/melgarafael/growthOS) (MIT), reescrita para os nossos 4 perfis.

## Instalar (uma vez, no seu computador)

```bash
cd ferramentas/carrossel
npm install
npx playwright install chromium
```

As fontes já estão em `fontes/` (Google Fonts, licença OFL), então funciona offline.

## Usar

```bash
node ferramentas/carrossel/render.mjs conteudo/autoescolas/2026-11-12-erros-baliza/carrossel.json
```

Saída na mesma pasta: `slide-01.png`, `slide-02.png`… e `previa.png` (todos lado a lado, para revisar).
Opções: `--out <pasta>` muda o destino. `--html` salva também o HTML (para depurar).

## Formato do JSON

```json
{
  "perfil": "autoescolas | cfc-inteligente | engenheiro | pessoal",
  "unidade": "itaquirai | eldorado | caarapo | todas",
  "handle": "@opcional (sobrescreve o padrão do tema)",
  "slides": [ ... ]
}
```

`unidade` é **obrigatória só para autoescolas** (define o @ no rodapé; `todas` serve para post em collab).

| `tipo` | Campos | Uso |
|---|---|---|
| `capa` | `titulo`, `rotulo`?, `subtitulo`?, `imagem`?, `arrasta`? | 1º slide. `imagem` = caminho de foto relativo ao JSON (vira fundo com degradê). `arrasta` = texto opcional tipo "Arrasta →" (por padrão não aparece) |
| `conteudo` | `titulo`, `numero`?, `texto`?, `itens`? (lista), `nota`? | Slides do meio, 1 ideia por slide |
| `destaque` | `texto`, `autor`? | Frase de impacto com cores invertidas (quebra o ritmo) |
| `cta` | `titulo`, `texto`?, `botao`?, `extra`? | Último slide: salvar/compartilhar/WhatsApp |

- `**palavra**` destaca com a cor do perfil (no tema autoescolas vira marca-texto amarelo).
- `\n` quebra linha.
- Se o texto não couber, o script reduz a fonte até 70% e **avisa**. Aviso = enxugar o texto.
- No máximo 20 slides (limite do Instagram). O ideal é 6 a 10.

## Paletas (em `temas.json`)

| Perfil | Conceito | Fundo | Texto | Acento | Fontes |
|---|---|---|---|---|---|
| Autoescolas | Placa de trânsito + nascer do sol | `#FFF7E8` creme | `#12233F` marinho | `#FFB703` amarelo sinalização | Poppins + Nunito |
| CFC Inteligente | Painel de tecnologia, escuro | `#0D1117` grafite | `#EEF2F6` | `#22E07A` verde "sinal aberto" | Space Grotesk + Inter + Plex Mono |
| Engenheiro | Prancha técnica com grade | `#F3F1EC` papel | `#1B2A3A` azul-petróleo | `#D9480F` laranja de obra | Archivo + IBM Plex |
| Pessoal | Editorial de revista | `#F6F1EA` creme | `#231C18` | `#B5472A` terracota | Fraunces + Inter |

Para mudar cores ou fontes, edite `temas.json`. Fonte nova: baixe o `.woff2` para `fontes/` e aponte em `arquivo`.
O @ do CFC Inteligente ainda está como `[PREENCHER @]`. Troque em `temas.json` quando definir.

`paletas.png` mostra os 4 temas lado a lado.
