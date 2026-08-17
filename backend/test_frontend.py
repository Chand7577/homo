import sys
sys.stdout.reconfigure(encoding='utf-8')

KEYWORD_INDEX = {
  "anger":"Mind", "anxiety":"Mind", "fear":"Mind", "grief":"Mind", "sad":"Mind", "sadness":"Mind", "depressed":"Mind", "depression":"Mind",
  "irritab":"Mind", "mental":"Mind", "worry":"Mind",
  "confusion":"Mind", "memory":"Mind", "delusion":"Mind", "insanity":"Mind",
  "weeping":"Mind", "jealous":"Mind", "indifference":"Mind", "restless":"Mind",
  "contradiction":"Mind", "forgetful":"Mind", "aversion":"Mind", "mania":"Mind",
  "morose":"Mind", "sensitive":"Mind", "timid":"Mind", "suspicious":"Mind",
  "मन":"Mind", "डर":"Mind", "गुस्सा":"Mind", "दुख":"Mind", "चिंता":"Mind",
  "भय":"Mind", "क्रोध":"Mind", "उदासी":"Mind", "निराशा":"Mind",
  "दुखी":"Mind", "निराश":"Mind", "रोना":"Mind", "रोता":"Mind", "रोती":"Mind",
  "अकेलापन":"Mind", "उदास":"Mind", "हताश":"Mind", "विषाद":"Mind",
  "बेचैनी":"Mind", "भ्रम":"Mind", "याददाश्त":"Mind", "एकाग्रता":"Mind", "ध्यान":"Mind", "पढ़ते":"Mind",
  "headache":"Head", "head":"Head", "migraine":"Head", "scalp":"Head",
  "forehead":"Head", "temple":"Head", "occiput":"Head", "vertex":"Head",
  "सिर":"Head", "माथा":"Head", "सिरदर्द":"Head", "आधाशीशी":"Head",
  "शिर":"Head", "सिर में":"Head",
  "eye":"Eyes", "eyes":"Eyes", "cornea":"Eyes", "conjunctiv":"Eyes",
  "lachrymation":"Eyes", "photophobia":"Eyes", "lids":"Eyes", "lid":"Eyes",
  "eyelid":"Eyes", "pupil":"Eyes", "retina":"Eyes", "optic":"Eyes",
  "आँख":"Eyes", "आंख":"Eyes", "आँखों":"Eyes", "आंखों":"Eyes",
  "पलक":"Eyes", "आँसू":"Eyes",
  "ear":"Ears", "ears":"Ears", "tinnitus":"Ears", "deafness":"Ears",
  "otitis":"Ears", "discharge":"Ears", "cerumen":"Ears", "wax":"Ears",
  "कान":"Ears", "कानों":"Ears", "कान में":"Ears",
  "nose":"Nose", "nasal":"Nose", "sneezing":"Nose", "rhinitis":"Nose",
  "coryza":"Nose", "nostril":"Nose", "bleeding":"Nose", "polyp":"Nose",
  "नाक":"Nose", "नाक से":"Nose", "छींक":"Nose", "जुकाम":"Nose",
  "throat":"Throat", "tonsil":"Throat", "swallow":"Throat", "pharynx":"Throat", "hoarse":"Throat",
  "गला":"Throat", "गले":"Throat", "टॉन्सिल":"Throat",
}

symptom = "गले में गाँठ जैसा एहसास"
import re
tokens = [t for t in re.split(r'[\s,।|.:;!?]+', symptom) if len(t) >= 3]

scores = {}
for token in tokens:
    if token in KEYWORD_INDEX:
        weight = 5 if KEYWORD_INDEX[token] == "GENERALITIES" else 10
        scores[KEYWORD_INDEX[token]] = scores.get(KEYWORD_INDEX[token], 0) + weight
        continue
    
    for kw, chName in KEYWORD_INDEX.items():
        if kw in token or token in kw:
            weight = 3 if chName == "GENERALITIES" else 6
            scores[chName] = scores.get(chName, 0) + weight
            print(f"Match: token='{token}' matches kw='{kw}' -> {chName}")

print("Tokens:", tokens)
print("Scores:", scores)
