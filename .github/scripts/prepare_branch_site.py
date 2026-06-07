#!/usr/bin/env python3
"""Copy a branch's content into a preview folder. If the branch has no
index.html at its root (branches don't share a common site layout), this
either redirects straight to the single site found in a subfolder, or
lists every HTML page so the right one can be picked manually."""
import os
import shutil
import sys

EXCLUDE = {'.git', '.github', '.claude', '.agents', '_site', 'node_modules'}

REDIRECT_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta http-equiv="refresh" content="0; url={target}">
<link rel="canonical" href="{target}">
<title>Redirection…</title>
</head>
<body>
<p>Redirection vers <a href="{target}">{target}</a>…</p>
</body>
</html>
"""

LANDING_TEMPLATE = """<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Aperçu de branche</title>
<style>
  body {{ font-family: -apple-system, system-ui, sans-serif; background:#0f1619; color:#fff; margin:0; padding:48px 24px; }}
  h1 {{ margin: 0 0 24px; }}
  ul {{ list-style:none; padding:0; max-width:640px; margin:0 auto; }}
  li {{ margin: 10px 0; }}
  a {{ display:block; padding:14px 18px; border-radius:10px; background:#172227; color:#fff; text-decoration:none; border:1px solid rgba(255,255,255,.08); transition: border-color .2s, transform .2s; }}
  a:hover {{ border-color:#e0a341; transform: translateX(4px); }}
</style>
</head>
<body>
<h1>Pages disponibles sur cette branche</h1>
<ul>{items}</ul>
</body>
</html>
"""


def copy_branch(src, dest):
    if os.path.exists(dest):
        shutil.rmtree(dest)
    os.makedirs(dest)
    for item in os.listdir(src):
        if item in EXCLUDE or item.startswith('.'):
            continue
        s = os.path.join(src, item)
        d = os.path.join(dest, item)
        if os.path.isdir(s):
            shutil.copytree(s, d)
        else:
            shutil.copy2(s, d)


def ensure_landing_page(dest):
    if os.path.exists(os.path.join(dest, 'index.html')):
        return

    # Look for index.html files in subfolders (sites are often nested,
    # e.g. depeyte-site/index.html). If exactly one such folder exists,
    # redirect straight to it instead of showing an extra page list.
    nested_index_dirs = []
    for root, dirs, files in os.walk(dest):
        if root != dest and 'index.html' in files:
            nested_index_dirs.append(os.path.relpath(root, dest))

    if len(nested_index_dirs) == 1:
        target = nested_index_dirs[0].replace(os.sep, '/') + '/'
        with open(os.path.join(dest, 'index.html'), 'w', encoding='utf-8') as f:
            f.write(REDIRECT_TEMPLATE.format(target=target))
        return

    pages = []
    for root, dirs, files in os.walk(dest):
        for f in files:
            if f.endswith('.html'):
                rel = os.path.relpath(os.path.join(root, f), dest)
                pages.append(rel)
    pages.sort()
    if pages:
        items = ''.join(f'<li><a href="{p}">{p}</a></li>' for p in pages)
    else:
        items = '<li>Aucune page HTML trouvée sur cette branche pour le moment.</li>'
    with open(os.path.join(dest, 'index.html'), 'w', encoding='utf-8') as f:
        f.write(LANDING_TEMPLATE.format(items=items))


def main():
    src, dest = sys.argv[1], sys.argv[2]
    copy_branch(src, dest)
    ensure_landing_page(dest)


if __name__ == '__main__':
    main()
