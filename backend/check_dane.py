import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')
from homeopathy.models import Rubric
qs = Rubric.objects.filter(name_hindi__icontains='दाने')
for r in qs[:20]:
    path = r.parent.name if r.parent else r.name
    print(f"[{r.id}] {path} -> {r.name_hindi}")
