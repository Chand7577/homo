import urllib.request
import json

try:
    url = 'http://localhost:8000/homeopathy/doctor/rubrics/chapters/'
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode('utf-8'))
        head_chapter = next((c for c in data.get('chapters', []) if c['name'] == 'Head'), None)
        if head_chapter:
            head_id = head_chapter['id']
            print("Head chapter ID:", head_id)
            
            url2 = 'http://localhost:8000/homeopathy/doctor/rubrics/repertorize/'
            data2 = json.dumps({"chapter_id": head_id, "symptoms": ["सिरदर्द – शोक के बाद"], "top_n": 3}).encode('utf-8')
            req2 = urllib.request.Request(url2, data=data2, headers={'Content-Type': 'application/json'})
            with urllib.request.urlopen(req2) as res2:
                print(res2.read().decode('utf-8'))
        else:
            print("Head chapter not found.")
except Exception as e:
    print("Error:", e)
