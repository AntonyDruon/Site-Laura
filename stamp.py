"""Ajoute motion.css / motion.js aux pages et met à jour les numéros de version (cache)."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).parent
PAGES = ["index.html", "accompagnement.html", "tarifs.html", "contact.html"]
ASSETS = ["style.css", "motion.css", "main.js", "motion.js"]


def version(name):
    return hashlib.md5((ROOT / name).read_bytes()).hexdigest()[:8]


for page in PAGES:
    path = ROOT / page
    html = path.read_text(encoding="utf-8")
    if "motion.css" not in html:
        html = re.sub(r'(<link rel="stylesheet" href="style\.css[^"]*">)',
                      r'\1\n    <link rel="stylesheet" href="motion.css">', html)
    if "motion.js" not in html:
        html = re.sub(r'(<script src="main\.js[^"]*"></script>)',
                      r'\1\n    <script src="motion.js"></script>', html)
    for asset in ASSETS:
        html = re.sub(rf'{re.escape(asset)}(\?v=[a-f0-9]+)?"', f'{asset}?v={version(asset)}"', html)
    path.write_text(html, encoding="utf-8")
    print(page, "ok")
