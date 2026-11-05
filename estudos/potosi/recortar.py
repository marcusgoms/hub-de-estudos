"""Recorta o fundo de algumas imagens usando rembg."""
import os
import sys

sys.stdout.reconfigure(encoding='utf8')

from rembg import remove, new_session

# Só as imagens que fazem sentido recortar: pessoa, objeto, quadro
RECORTAR = [
    'virgem_cerro.jpg',
    'tupac_katari.jpg',
    'tio_mina.jpg',
    'real_de_a_ocho.jpg',
]

dir_imgs = os.path.dirname(os.path.abspath(__file__))
dir_imgs = os.path.join(dir_imgs, 'imagens')

print('Carregando modelo...')
session = new_session('u2net')

for arquivo in RECORTAR:
    origem = os.path.join(dir_imgs, arquivo)
    if not os.path.exists(origem):
        print(f'  Pulando (nao existe): {arquivo}')
        continue

    nome_base = os.path.splitext(arquivo)[0]
    destino = os.path.join(dir_imgs, f'{nome_base}_recorte.png')

    if os.path.exists(destino):
        print(f'  JA EXISTE: {nome_base}_recorte.png')
        continue

    print(f'  Processando {arquivo}...')
    with open(origem, 'rb') as f:
        entrada = f.read()

    saida = remove(entrada, session=session)

    with open(destino, 'wb') as f:
        f.write(saida)

    print(f'  OK: {nome_base}_recorte.png ({len(saida)//1024} KB)')

print('Pronto.')
