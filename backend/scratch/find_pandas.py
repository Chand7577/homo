import os

backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
views_path = os.path.join(backend_dir, 'homeopathy', 'views.py')

print(f"Searching {views_path}...")
with open(views_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines, 1):
    if 'pandas' in line or 'pd.' in line or 'pd ' in line or 'import pandas' in line:
        print(f"Line {i:4d}: {line.strip()}")
