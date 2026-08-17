import os
import django
import sys
sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()
from homeopathy.views import intelligent_rubric_search
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware
factory = RequestFactory()
request = factory.get('/api/search?query=Diarrhoea - after vaccination')
middleware = SessionMiddleware(lambda r: None)
middleware.process_request(request)
request.session.save()
request.session['doctor_id'] = 1
response = intelligent_rubric_search(request)
import json
data = json.loads(response.content)
for idx, r in enumerate(data.get('rubrics', [])[:5]):
    print(f"{idx+1}. ID: {r['id']}, Name: {r['name']}, Score: {r.get('score')}")
