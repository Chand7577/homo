import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

try:
    query = urllib.parse.quote("Nausea during fasting")
    url = f'http://localhost:8000/homeopathy/doctor/rubrics/search/?query={query}'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        print("total:", data.get('total'))
        print("identified_chapter:", data.get('identified_chapter'))
        for r in data.get('rubrics', []):
            print(f"  - [{r['id']}] {r['full_path']}")
except Exception as e:
    print("Error:", e)
