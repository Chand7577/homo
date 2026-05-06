import os
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
    e.g. 'Dread – bhiti; Terror – aatank'  →  [('Dread','bhiti'), ('Terror','aatank')]
    """
    if not text:
        return []
        
    import re
    # If no separator provided, try to split by common ones
    if sep is None:
        # Split by semicolon then comma then newline
        parts = re.split(r'[;,\n]', str(text))
    else:
        parts = text.split(sep)
        
    results = []
    for part in parts:
        part = part.strip()
        if not part:
            continue
        eng, hin = part, ''
        # Common separators for English/Hindi pairs
        for s in ['–', '-', ':', '>', '—']:
            if s in part:
                bits = part.split(s, 1)
                eng, hin = bits[0].strip(), bits[1].strip()
                break
        if eng:
            results.append((eng, hin))
    return results


def import_rubric_row(chapter_name, rubric_name, rubric_hindi, sub_rubric,
                       syn_text, agg_text, amel_text, med_text, history=None, caches=None):
    """Create/update a single rubric row with all related data."""
    if caches is None:
        caches = {'chapters': {}, 'medicines': {}}
    if not rubric_name:
        return False

    # 1. Chapter (level 0)
    ch_name = chapter_name.strip().title()
    if ch_name in caches['chapters']:
        chapter = caches['chapters'][ch_name]
    else:
        chapter, _ = Rubric.objects.get_or_create(
            name=ch_name,
            level=0,
            defaults={'is_active': True, 'source_import': history}
        )
        caches['chapters'][ch_name] = chapter

    # 2. Main Rubric (level 1)
    rubric, created = Rubric.objects.get_or_create(
        name=rubric_name,
        parent=chapter,
        level=1,
        defaults={'name_hindi': rubric_hindi, 'is_active': True, 'source_import': history}
    )
    if not created and rubric_hindi:
        rubric.name_hindi = rubric_hindi
    if sub_rubric:
        rubric.description = sub_rubric
    
    # Update source_import if not set
    if not rubric.source_import and history:
        rubric.source_import = history
        
    rubric.save()

    # 3. Synonyms
    if syn_text:
        for eng, hin in parse_bilingual(syn_text, sep=None):
            RubricSynonym.objects.get_or_create(
                rubric=rubric, synonym=eng,
                defaults={'synonym_hindi': hin, 'source_import': history}
            )

    # 4. Aggravation
    if agg_text:
        for eng, hin in parse_bilingual(agg_text, sep=None):
            Modality.objects.get_or_create(
                rubric=rubric, modality_type='aggravation', name=eng,
                defaults={'name_hindi': hin, 'source_import': history}
            )

    # 5. Amelioration
    if amel_text:
        for eng, hin in parse_bilingual(amel_text, sep=None):
            Modality.objects.get_or_create(
                rubric=rubric, modality_type='amelioration', name=eng,
                defaults={'name_hindi': hin, 'source_import': history}
            )

    # 6. Medicines (separated by ;)
    med_count = 0
    if med_text:
        import re
        for med_item in med_text.split(';'):
            med_item = med_item.strip()
            if not med_item:
                continue

            grade = 3
            med_name = med_item
            
            # Look for explicit grade like (3), [2], {1}
            match = re.search(r'[\(\[\{](\d+)[\)\]\}]', med_item)
            if match:
                grade = int(match.group(1))
                med_name = re.sub(r'[\(\[\{]\d+[\)\]\}]', '', med_item).strip()
            else:
                # Look for grade at the very end like "Ars 2"
                match = re.search(r'\b(\d+)\s*$', med_item)
                if match:
                    grade = int(match.group(1))
                    med_name = re.sub(r'\b\d+\s*$', '', med_item).strip()
            
            if not med_name:
                continue

            if med_name in caches['medicines']:
                medicine = caches['medicines'][med_name]
            else:
                medicine, _ = Medicine.objects.get_or_create(
                    name=med_name,
                    defaults={'latin_name': med_name, 'source_import': history}
                )
                caches['medicines'][med_name] = medicine

            RubricMedicineGrade.objects.get_or_create(
                rubric=rubric, medicine=medicine,
                defaults={'grade': grade, 'source_import': history}
            )
            med_count += 1

    return med_count


class Command(BaseCommand):
    help = 'Imports ALL sheets from mastersheet final.xlsx into the database'

    def handle(self, *args, **options):
        file_path = os.path.join(
            os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))),
            'static', 'sheets', 'mastersheet final.xlsx'
        )

        if not os.path.exists(file_path):
            self.stdout.write(self.style.ERROR(f'File not found: {file_path}'))
            return

        self.stdout.write(self.style.SUCCESS(f'Reading: {file_path}'))

        # Read ALL sheets with no header so row 0 is always data
        all_sheets_raw = pd.read_excel(file_path, sheet_name=None, header=None)
        self.stdout.write(f'Found {len(all_sheets_raw)} sheets.')

        total_rubrics = 0
        total_medicines = 0
        
        # Create history record
        history = ImportHistory.objects.create(
            import_type='rubrics',
            file_name=os.path.basename(file_path),
            file_size=os.path.getsize(file_path),
            records_total=0,
            records_added=0,
            records_failed=0,
            status='partial',
            message="Processing..."
        )

        for sheet_name, df in all_sheets_raw.items():
            chapter_name = sheet_name.strip().lower()
            
            # Init caches once per script run to speed up drastically
            if not hasattr(self, 'import_caches'):
                self.import_caches = {'chapters': {}, 'medicines': {}}
            
            # Skip non-rubric sheets
            if any(k in chapter_name for k in ['instruction', 'index', 'template', 'summary']):
                continue
            
            # Skip empty sheets
            if df.empty or len(df) < 2:
                continue
            
            df = df.fillna('')
            chapter_name_title = sheet_name.strip().title()

            sheet_rubrics = 0
            sheet_medicines = 0

            with transaction.atomic():
                for idx, row in df.iterrows():
                    # Column positions:
                    # 0 = chapter (sometimes), 1 = rubric EN, 2 = rubric HI,
                    # 3 = sub-rubric, 4 = synonyms, 5 = aggravation,
                    # 6 = amelioration, 7 = medicines

                    try:
                        # Skip pure header/label rows
                        col1_val = clean(row.iloc[1]) if len(row) > 1 else ''
                        if not col1_val or col1_val.lower().startswith('rubric'):
                            continue

                        # Skip rows where col1 is clearly a label
                        if any(col1_val.lower().startswith(k) for k in [
                            'chapter', 'symptom', 'sr.', 's.no', 'note', 'section'
                        ]):
                            continue

                        # Determine chapter: Always use the sheet name for chapter instead of S.No column 0
                        ch = chapter_name_title

                        rubric_name  = col1_val
                        rubric_hindi = clean(row.iloc[2]) if len(row) > 2 else ''
                        sub_rubric   = clean(row.iloc[3]) if len(row) > 3 else ''
                        syn_text     = clean(row.iloc[4]) if len(row) > 4 else ''
                        agg_text     = clean(row.iloc[5]) if len(row) > 5 else ''
                        amel_text    = clean(row.iloc[6]) if len(row) > 6 else ''
                        med_text     = clean(row.iloc[7]) if len(row) > 7 else ''

                        med_count = import_rubric_row(
                            ch, rubric_name, rubric_hindi, sub_rubric,
                            syn_text, agg_text, amel_text, med_text, history=history, caches=self.import_caches
                        )
                        if med_count is not False:
                            sheet_rubrics += 1
                            sheet_medicines += (med_count or 0)

                    except Exception as e:
                        self.stdout.write(self.style.WARNING(f'  Row {idx} error: {e}'))
                        continue

            total_rubrics += sheet_rubrics
            total_medicines += sheet_medicines
            self.stdout.write(
                f'  OK "{sheet_name}": {sheet_rubrics} rubrics, {sheet_medicines} medicine links'
            )

        # Update history record
        history.records_total = total_rubrics
        history.records_added = total_rubrics
        history.status = 'success'
        history.message = f"Imported {total_rubrics} rubrics successfully."
        history.save()

        self.stdout.write(self.style.SUCCESS(
            f'\n=== Done! {total_rubrics} rubrics and {total_medicines} medicine links across all sheets. ==='
        ))
