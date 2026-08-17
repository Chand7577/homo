import urllib.request, urllib.parse, json

def fetch(q):
    url = 'http://127.0.0.1:8000/homeopathy/doctor/rubrics/search/?query=' + urllib.parse.quote(q)
    try:
        with urllib.request.urlopen(url) as r:
            d = json.loads(r.read().decode('utf-8'))
            chapters = d.get('chapters', [])
            if chapters:
                rubrics = chapters[0]['rubrics']
                names = [rb['name'] for rb in rubrics[:5]]
                return str(len(chapters)) + ' chapter(s), rubrics: ' + str(names)
            return 'No results'
    except Exception as e:
        return 'Error: ' + str(e)

r1 = fetch('urination involuntary during laughter')
r2 = fetch('urination involuntary during laugh')
r3 = fetch('urination involuntary during laughi')

with open('scratch/laughter_test.txt', 'w', encoding='utf-8') as f:
    f.write('Full (laughter): ' + r1 + '\n')
    f.write('Half (laugh): ' + r2 + '\n')
    f.write('laughi: ' + r3 + '\n')

print('Done')
