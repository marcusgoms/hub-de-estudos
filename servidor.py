"""Servidor local do hub de estudos."""
import functools
import os
import sys
import threading
import webbrowser
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PASTA = os.path.dirname(os.path.abspath(__file__))
args = [a for a in sys.argv[1:] if a != '--abrir']
PORTA = int(args[0]) if args else 8800
ABRIR = '--abrir' in sys.argv
ENDERECO = f'http://localhost:{PORTA}/'


class Silencioso(SimpleHTTPRequestHandler):
    # Sem log: uma saida fechada derrubava as respostas do servidor
    def log_message(self, *a):
        pass

    # Sem isto o navegador guarda CSS e JS antigos e esconde as alteracoes
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()


class Servidor(ThreadingHTTPServer):
    # No Windows, o padrao deixa dois servidores dividirem a mesma porta
    allow_reuse_address = False


if __name__ == '__main__':
    manipulador = functools.partial(Silencioso, directory=PASTA)
    try:
        servidor = Servidor(('127.0.0.1', PORTA), manipulador)
    except OSError:
        print(f'O hub ja esta rodando em {ENDERECO}')
        if ABRIR:
            webbrowser.open(ENDERECO)
        sys.exit(0)

    with servidor:
        print(f'Hub de Estudos em {ENDERECO}')
        print('Deixe esta janela aberta. Para parar, feche a janela.')
        if ABRIR:
            threading.Timer(0.3, webbrowser.open, [ENDERECO]).start()
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            pass
