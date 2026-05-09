import os
import django
import sys

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'myproject.settings') # Adjust if settings name is different
django.setup()

from homeopathy.models import Rubric

def debug_rubric_search(query):
    from django.db.models import Q, Count
    import re
    
    filler_words = {
        'i', 'have', 'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'am', 'was', 'were', 'been', 
        'my', 'mine', 'me', 'he', 'she', 'it', 'they', 'them', 'their', 'we', 'us', 'our', 
        'in', 'on', 'at', 'to', 'for', 'with', 'about', 'of', 'from', 'by', 'as', 'that', 'this', 
        'these', 'those', 'doctor', 'please', 'help', 'sir', 'madam', 'suffering', 'since', 
        'days', 'months', 'years', 'feeling', 'feel', 'when', 'what', 'where', 'why', 'how', 'who',
        'can', 'could', 'would', 'should', 'will', 'very', 'much', 'too', 'lot', 'getting', 'got'
    }
    
    tokens = re.findall(r'\b\w+\b', query.lower())
    search_words = [w for w in tokens if len(w) > 2 and w not in filler_words]
    
    print(f"Query: {query}")
    print(f"Search words: {search_words}")
    
    q_obj = Q()
    for word in search_words:
        word_q = (
            Q(name__icontains=word) |
            Q(name_hindi__icontains=word) |
            Q(description__icontains=word) |
            Q(description_hindi__icontains=word) |
            Q(synonyms__synonym__icontains=word) |
            Q(modalities__name__icontains=word) |
            Q(modalities__name_hindi__icontains=word)
        )
        if not q_obj:
            q_obj = word_q
        else:
            q_obj &= word_q
            
    rubrics = Rubric.objects.filter(
        Q(is_active=True) & q_obj
    ).distinct().select_related('parent')[:5]
    
    print(f"Found {len(rubrics)} rubrics:")
    for r in rubrics:
        try:
            print(f"\nID: {r.id}")
            print(f"Name: {r.name}")
            print(f"Parent: {r.parent.name if r.parent else 'None'}")
            print(f"Hindi: {r.name_hindi.encode('ascii', 'ignore').decode('ascii')}")
            print(f"Description: {r.description.encode('ascii', 'ignore').decode('ascii')}")
            
            # Check why it matched each word
            for word in search_words:
                matches = []
                if r.name and word in r.name.lower(): matches.append("name")
                if r.name_hindi and word in r.name_hindi.lower(): matches.append("name_hindi")
                if r.description and word in r.description.lower(): matches.append("description")
                
                syns = r.synonyms.filter(synonym__icontains=word)
                if syns.exists(): matches.append(f"synonym({[s.synonym for s in syns]})")
                
                mods = r.modalities.filter(Q(name__icontains=word) | Q(name_hindi__icontains=word))
                if mods.exists(): matches.append(f"modality({[m.name for m in mods]})")
                
                print(f"  Word '{word}' matches in: {', '.join(matches)}")
        except Exception as e:
            print(f"Error printing rubric {r.id}: {e}")

if __name__ == "__main__":
    debug_rubric_search("pain in the head")
