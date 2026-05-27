import os
import django
import sys

sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.views import intelligent_rubric_search
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware

def test_search(query):
    factory = RequestFactory()
    request = factory.get(f'/api/search?query={query}')
    
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    request.session['doctor_id'] = 1

    response = intelligent_rubric_search(request)
    import json
    data = json.loads(response.content)
    print(f"\nQuery: {query}")
    print(f"Total results: {data.get('total')}")


if __name__ == "__main__":
    test_search("cervical")
    test_search("Pain cervical")
    test_search("Cervical pain")
    test_search("Cervical spondylosis")
