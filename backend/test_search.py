import urllib.request
import urllib.parse
import json

try:
    query = urllib.parse.quote("सिरदर्द – शोक के बाद")
    url = f'http://localhost:8000/homeopathy/doctor/rubrics/search/?query={query}'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)
