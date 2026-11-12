---
name: carrossel-visual
description: Cria um carrossel de Instagram completo e já em imagem — escreve os slides, aplica a identidade visual do perfil e gera os PNGs 1080×1350 prontos para postar, com legenda. Use quando o usuário pedir um carrossel "pronto", "em imagem", "para postar" ou "visual".
---
# Carrossel Visual

Entrega final: **pasta com os PNGs + legenda**, não só texto.

## Passos

1. **Perfil.** Confirme o perfil (autoescolas → pergunte também a unidade: itaquirai, eldorado,
   caarapo ou todas para collab). Leia `perfis/<perfil>.md`, `conhecimento/regras-nicho.md` e
   `conhecimento/anti-cliches.md`.
2. **Estrutura.** Escolha uma e diga qual escolheu em 1 linha:

   | Estrutura | Melhor para | Slides |
   |---|---|---|
   | Erros / lista | "X erros que…", "X coisas que…" (alto salvamento) | capa + 1 por item + cta |
   | Passo a passo | Processo (tirar CNH, aprovar projeto na prefeitura) | capa + 1 por passo + cta |
   | Mito × verdade | Quebrar crença comum do nicho | capa + pares + cta |
   | Antes × depois | Obra, aluno com medo → dirigindo, bastidor (só com caso real) | capa + antes + o que mudou + depois + cta |
   | História | Perfil pessoal: decisão, erro, aprendizado | capa + 4–6 cenas + lição + cta |

3. **Copy dos slides** (regras do nicho e anti-clichês valem aqui):
   - Capa: promessa clara em **até 7 palavras** no título, sem CTA na capa. Use `**palavra**` para destacar 1 termo.
   - 1 ideia por slide. Título até ~8 palavras; texto até ~30 palavras; no máximo 4 itens de até 12 palavras.
   - Use 1 slide `destaque` no meio quando o carrossel tiver 6+ slides, para quebrar o ritmo.
   - Último slide `cta`: **uma** ação principal (salvar, comentar palavra-chave, WhatsApp).
   - Total ideal: 6 a 10 slides.
   - Dado que falta (preço, nome do instrutor, @) → `[PREENCHER]`. Nunca invente número, aprovação ou depoimento.
4. **Gravar** em `conteudo/<perfil>/AAAA-MM-DD-<tema>/carrossel.json` no formato de
   `ferramentas/carrossel/README.md` (exemplo: `ferramentas/carrossel/exemplo.json`).
   Se o usuário mandou foto para a capa, salve na mesma pasta e use `"imagem": "arquivo.jpg"`.
5. **Renderizar:**
   ```bash
   node ferramentas/carrossel/render.mjs conteudo/<perfil>/AAAA-MM-DD-<tema>/carrossel.json
   ```
   Se o Playwright faltar, instale conforme o README da ferramenta.
6. **Revisar de verdade.** Abra `previa.png` (e qualquer slide com aviso) e confira: texto cortado,
   destaque no lugar certo, nada genérico. Se o script avisou "texto reduzido", **enxugue o texto e
   renderize de novo**. Não entregue com "TEXTO NÃO CABE".
7. **Legenda** em `legenda.md` na mesma pasta: 1ª linha = gancho, 3–6 linhas curtas, CTA final,
   3–5 hashtags do nicho/cidade. Para volume (várias variações), use o agente `legendas`.
8. **Entregar:** mostre a prévia, a legenda pronta para copiar e a lista de `[PREENCHER]`.
   Lembre: postar os PNGs **na ordem** (slide-01 primeiro).

## Identidade por perfil (já aplicada pelo tema)
- **Autoescolas:** creme + marinho + amarelo de placa; números em losango de sinalização.
- **CFC Inteligente:** grafite escuro + verde "sinal aberto"; estilo painel tech. (@ ainda `[PREENCHER]`.)
- **Engenheiro:** papel com grade técnica + laranja de obra; rodapé com CREA-MS 68001 sempre.
- **Pessoal:** editorial com serifa + terracota; tom de primeira pessoa.

Não altere cores/fontes por carrossel. Mudança de identidade é feita em `ferramentas/carrossel/temas.json`.
