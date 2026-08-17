import os
import re
import pandas as pd
from django.core.management.base import BaseCommand
from django.db import transaction
from homeopathy.models import Rubric, Medicine, RubricMedicineGrade, RubricSynonym, Modality, ImportHistory


def clean(val):
    """Strip and return empty string for NaN/None."""
    if val is None:
        return ''
    s = str(val).strip()
    return '' if s.lower() == 'nan' else s


def parse_bilingual(text, sep=None):
    """
    Split a bilingual cell into (english, hindi) pairs.
    Handles multiple separators like ; and , automatically.
    """
    if not text:
        return []
        
    import re
    if sep is None:
        parts = re.split(r'[;,\n]', str(text))
    else:
        parts = text.split(sep)
        
    results = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        eng, hin = part, ''
        for s in ['–', '-', ':', '>', '—']:
            if s in part:
                bits = part.split(s, 1)
                eng, hin = bits[0].strip(), bits[1].strip()
                break
        if eng:
            results.append((eng, hin))
    return results


class Command(BaseCommand):
    help = 'Imports ALL sheets from mastersheet final.xlsx into the database using bulk operations'

    def handle(self, *args, **options):
        file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
            'static', 'sheets', 'mastersheet final.xlsx'
        )

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading: {file_path}'))

        all_sheets_raw = pd.read_excel(file_path, sheet_name=None, header=None)
        self.stdout.write(f'Found {len(all_sheets_raw)} sheets. Processing in memory...')

        history = ImportHistory.objects.create(
            import_type='rubrics',
            file_name=os.path.basename(file_path),
            file_size=os.path.getsize(file_path),
            records_total=0,
            records_added=0,
            records_failed=0,
            status='partial',
            message="Processing in memory..."
        )

        chapters_to_create = {}
        medicines_to_create = {}
        parsed_rows = []

        # Phase 1: In-memory parsing
        for sheet_name, df in all_sheets_raw.items():
            chapter_name = sheet_name.strip().lower()
            if any(k in chapter_name for k in ['instruction', 'index', 'template', 'summary']):
                continue
            if df.empty or len(df) < 2:
                continue
            
            df = df.fillna('')
            ch_name_title = sheet_name.strip().title()
            
            if ch_name_title not in chapters_to_create:
                chapters_to_create[ch_name_title] = True

            for idx, row in df.iterrows():
                try:
                    col1_val = clean(row.iloc[1]) if len(row) > 1 else ''
                    if not col1_val or col1_val.lower().startswith('rubric'):
                        continue
                    if any(col1_val.lower().startswith(k) for k in ['chapter', 'symptom', 'sr.', 's.no', 'note', 'section']):
                        continue

                    rubric_name  = col1_val
                    rubric_hindi = clean(row.iloc[2]) if len(row) > 2 else ''
                    sub_rubric   = clean(row.iloc[3]) if len(row) > 3 else ''
                    syn_text     = clean(row.iloc[4]) if len(row) > 4 else ''
                    agg_text     = clean(row.iloc[5]) if len(row) > 5 else ''
                    amel_text    = clean(row.iloc[6]) if len(row) > 6 else ''
                    med_text     = clean(row.iloc[7]) if len(row) > 7 else ''

                    parsed_medicines = []
                    if med_text:
                        for med_item in med_text.split(';'):
                            med_item = med_item.strip()
                            if not med_item: continue

                            grade = 3
                            med_name = med_item
                            
                            match = re.search(r'[\(\[\{](\d+)[\)\]\}]', med_item)
                            if match:
                                grade = int(match.group(1))
                                med_name = re.sub(r'[\(\[\{]\d+[\)\]\}]', '', med_item).strip()
                            else:
                                match = re.search(r'\b(\d+)\s*$', med_item)
                                if match:
                                    grade = int(match.group(1))
                                    med_name = re.sub(r'\b\d+\s*$', '', med_item).strip()
                            
                            if med_name:
                                parsed_medicines.append({'name': med_name, 'grade': grade})
                                medicines_to_create[med_name] = True

                    parsed_rows.append({
                        'chapter': ch_name_title,
                        'rubric': rubric_name,
                        'rubric_hindi': rubric_hindi,
                        'sub_rubric': sub_rubric,
                        'syn_text': syn_text,
                        'agg_text': agg_text,
                        'amel_text': amel_text,
                        'medicines': parsed_medicines
                    })

                except Exception as e:
                    continue

        self.stdout.write(f'Parsed {len(parsed_rows)} valid rows. Starting Bulk Inserts...')

        with transaction.atomic():
            # Create Chapters
            existing_chapters = {c.name: c for c in Rubric.objects.filter(level=0, name__in=chapters_to_create.keys())}
            new_chapter_objs = []
            for ch in chapters_to_create:
                if ch not in existing_chapters:
                    new_chapter_objs.append(Rubric(name=ch, level=0, is_active=True, source_import=history))
            if new_chapter_objs:
                Rubric.objects.bulk_create(new_chapter_objs, batch_size=5000, ignore_conflicts=True)
            
            chapter_dict = {c.name: c for c in Rubric.objects.filter(level=0, name__in=chapters_to_create.keys())}

            # Create Medicines
            existing_meds = {m.name: m for m in Medicine.objects.filter(name__in=medicines_to_create.keys())}
            new_med_objs = []
            for med in medicines_to_create:
                if med not in existing_meds:
                    new_med_objs.append(Medicine(name=med, latin_name=med, source_import=history))
            if new_med_objs:
                Medicine.objects.bulk_create(new_med_objs, batch_size=5000, ignore_conflicts=True)
            
            medicine_dict = {m.name: m.id for m in Medicine.objects.filter(name__in=medicines_to_create.keys())}

            # Prepare and Create Rubrics
            rubrics_to_create = {}
            for row in parsed_rows:
                parent = chapter_dict.get(row['chapter'])
                if not parent: continue
                key = (row['rubric'], parent.id)
                if key not in rubrics_to_create:
                    rubrics_to_create[key] = {
                        'name_hindi': row['rubric_hindi'],
                        'description': row['sub_rubric']
                    }

            existing_rubrics = {}
            for r in Rubric.objects.filter(level=1).values('id', 'name', 'parent_id'):
                existing_rubrics[(r['name'], r['parent_id'])] = r['id']
            
            new_rubric_objs = []
            for (name, parent_id), data in rubrics_to_create.items():
                if (name, parent_id) not in existing_rubrics:
                    new_rubric_objs.append(
                        Rubric(
                            name=name, 
                            parent_id=parent_id, 
                            level=1, 
                            name_hindi=data['name_hindi'], 
                            description=data['description'], 
                            is_active=True, 
                            source_import=history
                        )
                    )
            
            if new_rubric_objs:
                Rubric.objects.bulk_create(new_rubric_objs, batch_size=5000, ignore_conflicts=True)
            
            rubric_dict = {}
            for r in Rubric.objects.filter(level=1).values('id', 'name', 'parent_id'):
                rubric_dict[(r['name'], r['parent_id'])] = r['id']

            # Prepare Relationships
            synonym_objs = []
            agg_objs = []
            amel_objs = []
            grade_dict = {}

            for row in parsed_rows:
                parent = chapter_dict.get(row['chapter'])
                if not parent: continue
                rubric_id = rubric_dict.get((row['rubric'], parent.id))
                if not rubric_id: continue

                if row['syn_text']:
                    for eng, hin in parse_bilingual(row['syn_text']):
                        synonym_objs.append(RubricSynonym(rubric_id=rubric_id, synonym=eng, synonym_hindi=hin, source_import=history))

                if row['agg_text']:
                    for eng, hin in parse_bilingual(row['agg_text']):
                        agg_objs.append(Modality(rubric_id=rubric_id, modality_type='aggravation', name=eng, name_hindi=hin, source_import=history))

                if row['amel_text']:
                    for eng, hin in parse_bilingual(row['amel_text']):
                        amel_objs.append(Modality(rubric_id=rubric_id, modality_type='amelioration', name=eng, name_hindi=hin, source_import=history))

                for med in row['medicines']:
                    med_id = medicine_dict.get(med['name'])
                    if med_id:
                        grade_dict[(rubric_id, med_id)] = RubricMedicineGrade(
                            rubric_id=rubric_id, medicine_id=med_id, grade=med['grade'], source_import=history
                        )

            # Bulk Insert Relationships
            if synonym_objs:
                RubricSynonym.objects.bulk_create(synonym_objs, batch_size=10000, ignore_conflicts=True)
            if agg_objs:
                Modality.objects.bulk_create(agg_objs, batch_size=10000, ignore_conflicts=True)
            if amel_objs:
                Modality.objects.bulk_create(amel_objs, batch_size=10000, ignore_conflicts=True)
            if grade_dict:
                RubricMedicineGrade.objects.bulk_create(grade_dict.values(), batch_size=10000, ignore_conflicts=True)

        history.records_total = len(parsed_rows)
        history.records_added = len(parsed_rows)
        history.status = 'success'
        history.message = f"Imported {len(parsed_rows)} rubrics successfully."
        history.save()

        self.stdout.write(self.style.SUCCESS(
            f'\n=== Done! Successfully bulk imported {len(parsed_rows)} rubrics. ==='
        ))
