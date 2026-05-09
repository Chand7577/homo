import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings')
django.setup()

from homeopathy.models import Rubric, Chapter

def check_chapter(name):
    print(f"\n--- Checking Chapter: {name} ---")
    chapters = Chapter.objects.filter(name__iexact=name)
    if not chapters.exists():
        print(f"Chapter {name} not found!")
        # Try finding it in Rubric if it's stored there
        chapters = Rubric.objects.filter(name__iexact=name, level=0)
        if not chapters.exists():
             print("No top-level rubric found either.")
             return
    
    chapter = chapters.first()
    print(f"Found Chapter: {chapter.name} (ID: {chapter.id})")
    
    rubrics = Rubric.objects.filter(parent=chapter)[:20]
    print(f"Top 20 rubrics under {chapter.name}:")
    for r in rubrics:
        print(f" - {r.name} | {r.name_hindi}")

check_chapter('MIND')
check_chapter('STOMACH')
check_chapter('HEAD')
