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
    # Test with hyphen but bypassing the hyphen logic by replacing it with space
    request = factory.get('/api/search?query=Mind Anger')
    
    # Mock session
    middleware = SessionMiddleware(lambda r: None)
    middleware.process_request(request)
    request.session.save()
    request.session['doctor_id'] = 1

    response = intelligent_rubric_search(request)
    import json
    data = json.loads(response.content)
    print("Test Mind Anger:")
    for idx, r in enumerate(data.get('rubrics', [])[:3]):
        print(f"{idx+1}. ID: {r['id']}, Name: {r['name']}, Score: {r.get('score')}")

if __name__ == "__main__":
    test_search()
