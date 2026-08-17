import os
import django
import sys

sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric

r = Rubric.objects.get(id=20868)
print(f"ID: {r.id}")
print(f"Name: {repr(r.name)}")
print(f"Name Hindi: {repr(r.name_hindi)}")
