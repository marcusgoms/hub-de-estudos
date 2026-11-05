"""Redimensiona imagens grandes para web."""
import os
import sys

sys.stdout.reconfigure(encoding='utf8')

from PIL import Image

dir_imgs = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'imagens')

# Limite: 1920px na dimensao maior
LIMITE = 1920

for arquivo in os.listdir(dir_imgs):
    if not arquivo.lower().endswith(('.jpg', '.jpeg', '.png')):
        continue
    origem = os.path.join(dir_imgs, arquivo)
    tamanho_kb = os.path.getsize(origem) // 1024

    try:
        img = Image.open(origem)
    except Exception as e:
        print(f'  ERRO {arquivo}: {e}')
        continue

    w, h = img.size
    maior = max(w, h)

    if maior <= LIMITE and tamanho_kb <= 800:
        print(f'  OK ja esta: {arquivo} ({w}x{h}, {tamanho_kb}KB)')
        continue

    # Redimensiona mantendo proporcao
    if maior > LIMITE:
        fator = LIMITE / maior
        novo_w = int(w * fator)
        novo_h = int(h * fator)
        img = img.resize((novo_w, novo_h), Image.LANCZOS)
    else:
        novo_w, novo_h = w, h

    # Salva otimizado
    if arquivo.lower().endswith('.png'):
        img.save(origem, 'PNG', optimize=True)
    else:
        # Converte para RGB se necessario
        if img.mode != 'RGB':
            img = img.convert('RGB')
        img.save(origem, 'JPEG', quality=85, optimize=True, progressive=True)

    novo_tamanho = os.path.getsize(origem) // 1024
    print(f'  {arquivo}: {w}x{h} {tamanho_kb}KB -> {novo_w}x{novo_h} {novo_tamanho}KB')

print('Pronto.')
