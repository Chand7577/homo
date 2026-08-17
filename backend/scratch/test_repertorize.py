import os
import django
import sys
import json
sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
from homeopathy.views import doctor_rubric_repertorize
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
factory = RequestFactory()
request = factory.post('/api/doctor/rubrics/repertorize/', data=json.dumps({'symptoms': ['Diarrhoea - after vaccination'], 'top_n': 10}), content_type='application/json')
middleware = SessionMiddleware(lambda r: None)
middleware.process_request(request)
request.session.save()
request.session['doctor_id'] = 1
response = doctor_rubric_repertorize(request)
data = json.loads(response.content)
top_rubrics = data.get('top_rubrics', [])
for r in top_rubrics:
    print(f"ID: {r.get('id')}, Path: {r.get('full_path')}, Score: {r.get('score')}")
