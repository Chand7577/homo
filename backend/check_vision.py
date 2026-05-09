import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')
from homeopathy.models import Rubric
from django.db.models import Q

toks = ["दिन", "कम", "दिखना"]
q = Q()
for t in toks:
    q |= Q(name_hindi__icontains=t) | Q(synonyms__synonym_hindi__icontains=t)

qs = Rubric.objects.filter(q).distinct()
for r in qs[:50]:
    score = 0
    matches = []
    hi = (r.name_hindi or '').lower()
    for t in toks:
        if t in hi:
            score += 1
            matches.append(t)
    path = r.parent.name if r.parent else r.name
    if r.parent and r.parent.parent:
        path = r.parent.parent.name
    print(f"[{score}] {path} -> {r.name_hindi} (Matched: {matches})")
