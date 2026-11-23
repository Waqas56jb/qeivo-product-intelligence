"""Dev helper: screenshot a route and report console errors + horizontal overflow.
Usage: python scripts/screenshot.py <url> <out.png> [width=1440] [light|dark] [full|fold]
"""
import sys
from playwright.sync_api import sync_playwright
url, out = sys.argv[1], sys.argv[2]
w = int(sys.argv[3]) if len(sys.argv) > 3 else 1440
dark = len(sys.argv) > 4 and sys.argv[4] == "dark"
full = not (len(sys.argv) > 5 and sys.argv[5] == "fold")
with sync_playwright() as p:
    b = p.chromium.launch()
    ctx = b.new_context(viewport={"width": w, "height": 900}, color_scheme="dark" if dark else "light")
    pg = ctx.new_page(); errs = []
    pg.on("console", lambda m: errs.append(m.text[:300]) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)[:300]))
    if dark: pg.add_init_script("localStorage.setItem('qeivo-theme','dark')")
    pg.goto(url, wait_until="networkidle", timeout=240000)
    pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(1000)
    pg.evaluate("window.scrollTo(0,0)"); pg.wait_for_timeout(600)
    pg.screenshot(path=out, full_page=full)
    ow = pg.evaluate("document.documentElement.scrollWidth - window.innerWidth")
    print(f"overflow-x px: {ow} | errors: {errs[:8]}")
    b.close()
