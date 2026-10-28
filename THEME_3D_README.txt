MatriSetu 3D theme - UI only (no routes, forms, queries or logic are changed)

1. Copy into your project folder:
     theme3d.py                    -> MatriSetu/theme3d.py
     static/matrisetu3d.css        -> MatriSetu/static/matrisetu3d.css
     static/matrisetu3d.js         -> MatriSetu/static/matrisetu3d.js

2. In app.py, right after these two existing lines:
     app = Flask(__name__)
     app.secret_key = os.environ.get("SECRET_KEY", "matrisetu2026secret")
   add:
     from theme3d import apply_theme

     @app.after_request
     def _apply_3d_theme(resp):
         return apply_theme(resp)

3. Run the app and open any dashboard (/dashboard/..., /supervisor/..., /bmo/..., /admin..., /login).

Turn it off any time: set THEME_3D_ENABLED = False in theme3d.py.
CSV, PDF, ZIP, JSON and the WhatsApp webhook are never touched (only HTML pages).
