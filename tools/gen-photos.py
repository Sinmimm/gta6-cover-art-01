#!/usr/bin/env python3
"""TIDELINE PRESS — procedural demo-photo generator.

Screenshots tools/gen-photos.html once per scene with Playwright Chromium
and writes app/samples/<scene>.jpg (JPEG quality 85). Every scene is drawn
by the generator page from a seeded PRNG, so the photos are deterministic.

Usage: python3 tools/gen-photos.py
"""
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent
OUT = REPO / "app" / "samples"

SCENES = [
    "hero-convertible",
    "fisherman",
    "portrait-man",
    "motorcycle",
    "gas-station",
    "coastal-road",
    "speedboat",
    "beach-palms",
    "bandana-woman",
    "surfer",
]


def main() -> int:
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    page_url = (REPO / "tools" / "gen-photos.html").as_uri()
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1200, "height": 800})
        for scene in SCENES:
            page.goto(f"{page_url}?scene={scene}")
            page.wait_for_function("window.__genReady === true", timeout=30000)
            out = OUT / f"{scene}.jpg"
            page.locator("#c").screenshot(path=str(out), type="jpeg", quality=85)
            print(f"{scene}.jpg: {out.stat().st_size} bytes")
        browser.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
