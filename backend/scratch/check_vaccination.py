import os
import django
import sys

# Set up Django environment
sys.path.append('c:\\Users\\2 - Grandeur Net\\Desktop\\clients\\homo\\backend')
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric

def search_vaccination():
    print("Searching for rubrics with 'vaccination'...")
    rubrics = Rubric.objects.filter(name__icontains='vaccination')
    for r in rubrics:
        print(f"ID: {r.id}, Name: {r.name}, Parent: {r.parent.name if r.parent else 'None'}, Full Path: {r.get_full_path()}")

    print("\nSearching for rubrics with 'diarrhoea' and 'vaccination'...")
    rubrics = Rubric.objects.filter(name__icontains='diarrhoea').filter(name__icontains='vaccination')
    for r in rubrics:
        print(f"ID: {r.id}, Name: {r.name}, Parent: {r.parent.name if r.parent else 'None'}, Full Path: {r.get_full_path()}")

    print("\nSearching for 'vaccination' in modalities or synonyms...")
    from homeopathy.models import Modality, Synonym
    mods = Modality.objects.filter(name__icontains='vaccination')
    for m in mods:
        print(f"Modality: {m.name}, Rubric: {m.rubric.name}, Rubric Parent: {m.rubric.parent.name if m.rubric.parent else 'None'}")
    
    syns = Synonym.objects.filter(synonym__icontains='vaccination')
    for s in syns:
        print(f"Synonym: {s.synonym}, Rubric: {s.rubric.name}")

if __name__ == "__main__":
    search_vaccination()
