#!/usr/bin/env python3
"""Servidor estatico que lista automaticamente as musicas em songs/.

A ordem vem de songs/index.txt; qualquer outro songs/*.txt (exceto os que
comecam com "_") e adicionado ao final em ordem alfabetica.
Uso: python3 serve.py [porta]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = os.path.dirname(os.path.abspath(__file__))
SONGS = os.path.join(ROOT, "songs")


def song_list():
    with open(os.path.join(SONGS, "index.txt"), encoding="utf-8") as f:
        slugs = [s.strip() for s in f if s.strip()]
    on_disk = sorted(
        n[:-4] for n in os.listdir(SONGS)
        if n.endswith(".txt") and n != "index.txt" and not n.startswith("_")
    )
    slugs = [s for s in slugs if s in on_disk]
    return slugs + [s for s in on_disk if s not in slugs]


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def do_GET(self):
        if self.path.split("?")[0] == "/songs/index.txt":
            body = "\n".join(song_list()).encode("utf-8")
            self.send_response(200)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return
        super().do_GET()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"http://localhost:{port}")
    ThreadingHTTPServer(("", port), Handler).serve_forever()
