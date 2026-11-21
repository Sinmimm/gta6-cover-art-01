#!/usr/bin/env python3
"""TIDELINE PRESS — screenshot runner.

Serves app/ with the repo's serve.ts, screenshots the four shots from
shots.json with Playwright Chromium, and writes screenshots/<name>.
Each shot is retried at JPEG quality 82, 70, 60, 50 until it fits the
256 KiB gate (MAX_BYTES); the quality used is printed per shot.

Usage: python3 tools/shots.py [--port 8123]
"""
import json
import subprocess
import sys
import time
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
MAX_BYTES = 262144
PORT = 8123


def main() -> int:
    from playwright.sync_api import sync_playwright

    port = PORT
    if "--port" in sys.argv:
        port = int(sys.argv[sys.argv.index("--port") + 1])
    shots = json.loads((REPO / "shots.json").read_text())
    server = subprocess.Popen(
        ["node", "serve.ts", "--port", str(port)],
        cwd=REPO,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    try:
        for _ in range(50):
            try:
                import urllib.request

                urllib.request.urlopen(f"http://localhost:{port}/", timeout=1)
                break
            except Exception:
                time.sleep(0.2)
        with sync_playwright() as p:
            browser = p.chromium.launch()
            for shot in shots:
                page = browser.new_page(viewport={"width": shot["w"], "height": shot["h"]})
                page.goto(f"http://localhost:{port}/{shot['query']}")
                page.wait_for_function("window.__shotReady === true", timeout=30000)
                out = REPO / "screenshots" / shot["name"]
                data = None
                used_q = None
                for q in (82, 70, 60, 50):
                    data = page.screenshot(type="jpeg", quality=q)
                    used_q = q
                    if len(data) <= MAX_BYTES:
                        break
                out.write_bytes(data)
                size = len(data)
                flag = "OK " if size <= MAX_BYTES else "OVER"
                print(f"{shot['name']}: {shot['w']}x{shot['h']} q{used_q} {size} bytes {flag}")
                page.close()
            browser.close()
    finally:
        server.terminate()
        server.wait(timeout=10)
    return 0


if __name__ == "__main__":
    sys.exit(main())
