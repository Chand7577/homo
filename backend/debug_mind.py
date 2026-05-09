import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
sys.stdout.reconfigure(encoding='utf-8', errors='replace')
django.setup()

from homeopathy.models import Rubric
from django.db.models import Q

# Mind chapter children
mind = Rubric.objects.get(id=12876)
children = list(Rubric.objects.filter(parent=mind, is_active=True).order_by('name')[:50])
print(f"MIND children ({len(children)} shown):")
for r in children:
    print(f"  {r.id}  '{r.name}'  hindi='{r.name_hindi}'")

# Emotion chapter children
emotion = Rubric.objects.filter(id=15917).first()
if emotion:
    echildren = list(Rubric.objects.filter(parent=emotion, is_active=True).order_by('name')[:50])
    print(f"\nEMOTION children ({len(echildren)} shown):")
    for r in echildren:
        print(f"  {r.id}  '{r.name}'  hindi='{r.name_hindi}'")

# Global search for sadness-related rubrics
print("\nGLOBAL SEARCH sadness/grief/depression/sad:")
hits = Rubric.objects.filter(
    Q(name__icontains='sadness') | Q(name__icontains='grief') |
    Q(name__icontains='depression') | Q(name__icontains='melancholy') |
    Q(name__icontains='gloom') | Q(name__icontains='sorrow') |
    Q(name__icontains='weeping') | Q(name__icontains='despond'),
    is_active=True
)[:30]
for r in hits:
    parent = r.parent.name if r.parent else 'ROOT'
    print(f"  ID={r.id}  name='{r.name}'  level={r.level}  parent='{parent}'")
