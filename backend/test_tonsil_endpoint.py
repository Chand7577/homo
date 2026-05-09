import os
import django
import sys
import json
from django.http import HttpRequest
from importlib import import_module
from django.conf import settings

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.views import doctor_rubric_repertorize
from homeopathy.models import Rubric

sys.stdout.reconfigure(encoding='utf-8')

request = HttpRequest()
request.method = 'POST'
request.content_type = 'application/json'

SessionStore = import_module(settings.SESSION_ENGINE).SessionStore
request.session = SessionStore()
request.session['doctor_id'] = 1

r = Rubric.objects.filter(name='Ears', level=0).first()
if r:
    request._body = json.dumps({'symptoms': ['टॉन्सिल से कान दर्द'], 'chapter_id': str(r.id)}).encode('utf-8')

response = doctor_rubric_repertorize(request)
try:
    data = json.loads(response.content.decode('utf-8'))
    for sym_data in data.get('symptoms_breakdown', []):
        for rb in sym_data.get('rubrics', []):
            rubric = rb.get('rubric', {})
            print(f"MATCHED: {rubric.get('name')} | score: {sym_data.get('score')} | exact: {sym_data.get('exact_match')}")
except Exception as e:
    print("Error:", e)
