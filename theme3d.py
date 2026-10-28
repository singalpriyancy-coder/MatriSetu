# ─────────────────────────────────────────────────────────────────
# MatriSetu — 3D visual theme (UI only)
# Adds a CSS + JS layer to the dashboard HTML pages after they are
# rendered. It does not change any route, form, query or data.
# To switch the theme off, set THEME_3D_ENABLED = False.
# ─────────────────────────────────────────────────────────────────
from flask import request

THEME_3D_ENABLED = True
THEME_PATHS = ("/dashboard", "/supervisor", "/bmo", "/admin", "/login")
MARK = "matrisetu3d.css"
TAGS = (
    '<link rel="stylesheet" href="/static/matrisetu3d.css?v=1">'
    '<script defer src="/static/matrisetu3d.js?v=1"></script>'
)


def apply_theme(resp):
    try:
        if not THEME_3D_ENABLED:
            return resp
        if resp.status_code != 200 or resp.mimetype != "text/html":
            return resp
        if resp.direct_passthrough or not request.path.startswith(THEME_PATHS):
            return resp
        html = resp.get_data(as_text=True)
        if MARK in html or "</body>" not in html:
            return resp
        i = html.rfind("</body>")
        resp.set_data(html[:i] + TAGS + html[i:])
    except Exception:
        pass  # never break a page because of styling
    return resp
