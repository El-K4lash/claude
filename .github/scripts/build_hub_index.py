#!/usr/bin/env python3
"""Generate the hub index.html listing every claude/* branch and a link
to its deployed preview folder under /sites/<safe-branch-name>/."""
import json
import os
import sys
import urllib.request

HUB_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sites par branche — claude</title>
<style>
  * {{ box-sizing: border-box; }}
  body {{ font-family: -apple-system, system-ui, sans-serif; margin:0; background:#0f1619; color:#fff; }}
  header {{ padding: 56px 24px 28px; text-align:center; }}
  header h1 {{ margin:0 0 10px; font-size:1.8rem; }}
  header p {{ color:#9aa7ab; max-width:560px; margin:0 auto; }}
  .grid {{ display:grid; grid-template-columns: repeat(auto-fill, minmax(260px,1fr)); gap:18px; max-width:1100px; margin:0 auto; padding: 0 24px 64px; }}
  .card {{ display:block; padding:22px; border-radius:12px; background:#172227; color:#fff; text-decoration:none; border:1px solid rgba(255,255,255,.08); transition: transform .2s ease, border-color .2s ease; }}
  .card:hover {{ transform: translateY(-4px); border-color:#e0a341; }}
  .card h2 {{ margin:0 0 6px; font-size:1rem; word-break:break-all; }}
  .card p {{ margin:0; color:#e0a341; font-size:.78rem; text-transform:uppercase; letter-spacing:.08em; }}
  .empty {{ grid-column: 1 / -1; text-align:center; color:#9aa7ab; }}
</style>
</head>
<body>
<header>
  <h1>Sites de branches</h1>
  <p>Chaque branche du dépôt peut héberger son propre site. Choisis une branche pour voir son site en direct.</p>
</header>
<div class="grid">{cards}</div>
</body>
</html>
"""

CARD_TEMPLATE = """    <a class="card" href="sites/{safe}/">
      <h2>{name}</h2>
      <p>Voir le site</p>
    </a>"""


def fetch_branches(repo):
    token = os.environ.get('GITHUB_TOKEN')
    headers = {'Accept': 'application/vnd.github+json'}
    if token:
        headers['Authorization'] = f'Bearer {token}'
    branches = []
    page = 1
    while True:
        req = urllib.request.Request(
            f'https://api.github.com/repos/{repo}/branches?per_page=100&page={page}',
            headers=headers,
        )
        with urllib.request.urlopen(req) as resp:
            batch = json.load(resp)
        if not batch:
            break
        branches.extend(b['name'] for b in batch)
        if len(batch) < 100:
            break
        page += 1
    return branches


def main():
    repo, out_dir = sys.argv[1], sys.argv[2]
    branches = sorted(b for b in fetch_branches(repo) if b.startswith('claude/'))

    if branches:
        cards = '\n'.join(
            CARD_TEMPLATE.format(name=name, safe=name.replace('/', '-'))
            for name in branches
        )
    else:
        cards = '<p class="empty">Aucune branche claude/* trouvée pour le moment.</p>'

    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(HUB_TEMPLATE.format(cards=cards))


if __name__ == '__main__':
    main()
