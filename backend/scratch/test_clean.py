import os
import django
import sys

sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric
import re

def clean_for_match(text):
    if not text: return ""
    t = re.sub(r'[^\w\s\u0900-\u097F]', ' ', str(text).lower())
    return " ".join(t.split())

r = Rubric.objects.get(id=20868)
full_query = "cervical"
c_fq = clean_for_match(full_query)
c_rname = clean_for_match(r.name)

print(f"c_fq: {repr(c_fq)}")
print(f"c_rname: {repr(c_rname)}")
print(f"c_fq == c_rname: {c_fq == c_rname}")
