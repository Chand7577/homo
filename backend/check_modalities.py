import os, django, sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
sys.stdout.reconfigure(encoding='utf-8')
from homeopathy.models import Modality

print("=== Modality model fields ===")
for f in Modality._meta.get_fields():
    print(f"  {f.name}")

print()
print("=== SAMPLE MODALITIES (25) ===")
mods = Modality.objects.select_related('rubric').values(
    'id','name','name_hindi','modality_type','rubric__name'
)[:25]
for m in mods:
    print(f"  type={m['modality_type']} | EN: {m['name']} | HI: {m['name_hindi']} | Rubric: {m['rubric__name']}")

print()
total = Modality.objects.count()
with_hindi = Modality.objects.exclude(name_hindi='').count()
print(f"Total: {total}, with Hindi: {with_hindi}")
types = list(Modality.objects.values_list('modality_type',flat=True).distinct())
print(f"Types: {types}")
