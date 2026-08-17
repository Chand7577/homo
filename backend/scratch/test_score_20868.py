import os
import django
import sys

sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.views import intelligent_rubric_search
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware

def test_score():
    factory = RequestFactory()
    request = factory.get(f'/api/search?query=cervical')
    
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    request.session['doctor_id'] = 1

    response = intelligent_rubric_search(request)
    import json
    data = json.loads(response.content)
    for r in data.get('rubrics', []):
        if r['id'] == 20868:
            print(f"Score for Cervical (ID: 20868): {r['score']}")

test_score()
