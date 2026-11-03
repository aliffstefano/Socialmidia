"""Mede a maior faixa vazia de uma arte de story (para posicionar o sticker sem tampar nada).

Considera só a área útil do story: de 15% (abaixo da barra do topo) a 85% (acima do "Enviar mensagem").
Detalhes decorativos de baixo contraste (ex.: a gota vermelha a 18%) contam como vazio.
Uso: python3 scripts/espaco_livre.py arte.png [...]
"""
import sys
from PIL import Image

TOPO, BASE, LIMIAR = 0.15, 0.85, 90


def faixa(caminho):
    im = Image.open(caminho).convert("RGB")
    w, h = im.size
    px, fundo = im.load(), im.getpixel((20, 20))
    vazio = [max(sum(abs(a - b) for a, b in zip(px[x, y], fundo)) for x in range(0, w, 6)) < LIMIAR for y in range(h)]
    ini, fim, melhor, y = int(h * TOPO), int(h * BASE), (0, 0), int(h * TOPO)
    while y < fim:
        if vazio[y]:
            z = y
            while z < fim and vazio[z]:
                z += 1
            if z - y > melhor[1] - melhor[0]:
                melhor = (y, z)
            y = z
        else:
            y += 1
    return melhor[0] / h, melhor[1] / h


if __name__ == "__main__":
    for c in sys.argv[1:]:
        a, b = faixa(c)
        print(f"{c}: livre {a:.2f}–{b:.2f} (altura {b - a:.2f}), centro {(a + b) / 2:.2f}")
