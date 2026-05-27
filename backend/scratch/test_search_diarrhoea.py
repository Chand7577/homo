import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.views import intelligent_rubric_search
from django.test import RequestFactory
from django.contrib.sessions.middleware import SessionMiddleware

def test_search():
    factory = RequestFactory()
    request = factory.get('/api/search?query=Diarrhoea – after vaccination')
    
    # Mock session
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    request.session['doctor_id'] = 1

    response = intelligent_rubric_search(request)
    import json
    data = json.loads(response.content)
    print("Test with hyphen:")
    print(f"Total results: {data.get('total')}")
    for idx, r in enumerate(data.get('rubrics', [])[:5]):
        print(f"{idx+1}. ID: {r['id']}, Name: {r['name']}, Score: {r.get('score')}")

    print("\nTest without hyphen:")
    request2 = factory.get('/api/search?query=Diarrhoea after vaccination')
    middleware.process_request(request2)
    request2.session.save()
    request2.session['doctor_id'] = 1

    response2 = intelligent_rubric_search(request2)
    data2 = json.loads(response2.content)
    print(f"Total results: {data2.get('total')}")
    for idx, r in enumerate(data2.get('rubrics', [])[:5]):
        print(f"{idx+1}. ID: {r['id']}, Name: {r['name']}, Score: {r.get('score')}")

if __name__ == "__main__":
    test_search()
