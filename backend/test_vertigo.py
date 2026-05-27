import urllib.request
import urllib.parse
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# Test 1: Global search
query = urllib.parse.quote("Vertigo with headache")
url = f'http://localhost:8000/homeopathy/doctor/rubrics/search/?query={query}'
req = urllib.request.Request(url)
with urllib.request.urlopen(req) as response:
    data = json.loads(response.read().decode('utf-8'))
    print("=== GLOBAL SEARCH: 'Vertigo with headache' ===")
    print("identified_chapter:", data.get('identified_chapter'))
    print("total:", data.get('total'))
    for i, r in enumerate(data.get('rubrics', [])):
        print(f"  {i+1}. [{r['id']}] {r['full_path']} (score: {r.get('score', 'N/A')})")

print()

# Test 2: Find all rubrics containing "vertigo" AND "headache"
url2 = f'http://localhost:8000/homeopathy/doctor/rubrics/chapters/'
req2 = urllib.request.Request(url2)
with urllib.request.urlopen(req2) as res2:
    chapters = json.loads(res2.read().decode('utf-8'))
    head_ch = next((c for c in chapters.get('chapters', []) if c['name'] == 'Head'), None)
    if head_ch:
        print(f"Head chapter ID: {head_ch['id']}")
        url3 = 'http://localhost:8000/homeopathy/doctor/rubrics/repertorize/'
        data3 = json.dumps({"chapter_id": head_ch['id'], "symptoms": ["Vertigo with headache"], "top_n": 5}).encode('utf-8')
        req3 = urllib.request.Request(url3, data=data3, headers={'Content-Type': 'application/json'})
        with urllib.request.urlopen(req3) as res3:
            result = json.loads(res3.read().decode('utf-8'))
            print("=== REPERTORIZE in Head: 'Vertigo with headache' ===")
            print("total_matched:", result.get('total_matched'))
            for rubric in result.get('top_rubrics', []):
                print(f"  - {rubric['full_path']}  (score: {rubric['score']}) matched_fields: {rubric.get('matched_fields', [])}")
