import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric
from django.db.models import Q

r = Rubric.objects.get(id=15677)
print(f"Rubric: {r.name} (Parent: {r.parent.name})")

for word in ['pain', 'head', 'eyes', 'throat']:
    match = Rubric.objects.filter(id=r.id).filter(
        Q(name__icontains=word) |
        Q(name_hindi__icontains=word) |
        Q(parent__name__icontains=word) |
        Q(parent__name_hindi__icontains=word) |
        Q(description__icontains=word) |
        Q(description_hindi__icontains=word) |
        Q(synonyms__synonym__icontains=word) |
        Q(modalities__name__icontains=word) |
        Q(modalities__name_hindi__icontains=word)
    ).exists()
    print(f"Matches '{word}'? {match}")
