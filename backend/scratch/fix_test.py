import urllib.request, urllib.parse, json, time
time.sleep(2)

def fetch(q):
    url = 'http://127.0.0.1:8000/homeopathy/doctor/rubrics/search/?query=' + urllib.parse.quote(q)
    try:
        with urllib.request.urlopen(url) as r:
            d = json.loads(r.read().decode('utf-8'))
            chapters = d.get('chapters', [])
            if chapters:
                top = chapters[0]['rubrics'][0]['name']
                return str(len(chapters)) + ' chapter(s), top rubric: ' + top
            return 'No results'
    except Exception as e:
        return 'Error: ' + str(e)

r1 = fetch('दस्त के बाद बार-बार मल की झूठी इच्छा होती है')
r2 = fetch('दस्त के बाद बार-बार मल की झूठी इच्छा होती ह')
r3 = fetch('रात में अनियंत्रित मल निकल जाता है')

with open('scratch/fix_test_result.txt', 'w', encoding='utf-8') as f:
    f.write('Full sentence (hai): ' + r1 + '\n')
    f.write('Truncated (ha): ' + r2 + '\n')
    f.write('Involuntary stool at night: ' + r3 + '\n')

print('Done')
