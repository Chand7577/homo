import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')
from homeopathy.models import Rubric
chapters = Rubric.objects.filter(level=0, is_active=True).values('id', 'name', 'name_hindi')
for c in chapters:
    name_en = c['name'].lower()
    name_hi = (c['name_hindi'] or '').lower()
    if 'hair' in name_en or 'सिर' in name_hi or 'बाल' in name_hi:
        print(f"[{c['id']}] EN: {c['name']} | HI: {c['name_hindi']}")
