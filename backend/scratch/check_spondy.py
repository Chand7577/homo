import os
import django
import sys

sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric

print("Searching for exactly 'Cervical spondylosis'...")
rubrics = Rubric.objects.filter(name__iexact='Cervical spondylosis')
for r in rubrics:
    print(f"ID: {r.id}, Name: {r.name}, Full Path: {r.get_full_path()}")

print("\nSearching for any containing 'cervical'...")
rubrics = Rubric.objects.filter(name__icontains='cervical')[:10]
for r in rubrics:
    print(f"ID: {r.id}, Name: {r.name}, Full Path: {r.get_full_path()}")
