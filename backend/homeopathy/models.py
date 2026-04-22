
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
from django.core.validators import RegexValidator, validate_email
from django.core.exceptions import ValidationError
from cloudinary.models import CloudinaryField
import secrets
import binascii
import os

class CustomUser(AbstractUser):
    """Extended user model with role-based access"""
    
    USER_TYPE_CHOICES = [
        ('admin', 'Admin'),
        ('doctor', 'Doctor'),
        ('patient', 'Patient'),
    ]
    
    user_type = models.CharField(max_length=10, choices=USER_TYPE_CHOICES)
    phone_validator = RegexValidator(
        regex=r'^\+?1?\d{9,15}$',
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed."
    )
    phone = models.CharField(max_length=15, validators=[phone_validator], blank=True, null=True)
    created_by = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='created_users')
    is_email_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['user_type']),
            models.Index(fields=['is_active']),
        ]
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.user_type})"

class Doctor(models.Model):
    """Doctor profile extension"""
    
    DOCTOR_CLASS_CHOICES = [
        ('doctor_jp_nautiyal', 'Doctor JP Nautiyal'),
        ('core_team', 'Core Team'),
        ('individual', 'Individual'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='doctor_profile')
    specialization = models.CharField(max_length=100)
    qualification = models.TextField()
    registration_number = models.CharField(max_length=50, unique=True)
    experience_years = models.IntegerField(default=0)
    
    # NEW FIELDS
    doctor_class = models.CharField(
        max_length=20, 
        choices=DOCTOR_CLASS_CHOICES,
        help_text="Classification of doctor"
    )
    aadhar_number = models.CharField(
        max_length=12, 
        unique=True,
        help_text="12-digit Aadhar card number"
    )
    pan_number = models.CharField(
        max_length=10, 
        unique=True,
        help_text="10-character PAN card number"
    )
    license_number = models.CharField(
        max_length=50, 
        unique=True,
        help_text="Medical license number"
    )
    
    profile_image = CloudinaryField('image', null=True, blank=True)
    bio = models.TextField(blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Doctor'
        verbose_name_plural = 'Doctors'
        indexes = [
            models.Index(fields=['registration_number']),
            models.Index(fields=['is_active']),
            models.Index(fields=['doctor_class']),  # NEW INDEX
            models.Index(fields=['aadhar_number']),  # NEW INDEX
            models.Index(fields=['pan_number']),  # NEW INDEX
            models.Index(fields=['license_number']),  # NEW INDEX
        ]
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()}"
    
    def get_total_cases(self):
        return self.cases.count()
    
    def get_active_cases(self):
        return self.cases.filter(status='active').count()


        
class Patient(models.Model):
    """Patient profile extension"""
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    BLOOD_GROUP_CHOICES = [
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    ]
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='patient_profile')
    date_of_birth = models.DateField(null=True, blank=True)
    blood_group = models.CharField(max_length=5, choices=BLOOD_GROUP_CHOICES, blank=True)
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    address = models.TextField(blank=True)
    emergency_contact = models.CharField(max_length=15, blank=True)
    medical_history = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    assigned_doctor = models.ForeignKey(Doctor, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_patients')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Patient'
        verbose_name_plural = 'Patients'
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['assigned_doctor']),
        ]
    
    def __str__(self):
        return self.user.get_full_name()
    
    def get_age(self):
        if self.date_of_birth:
            today = timezone.now().date()
            return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
        return None


class AdminSession(models.Model):
    """Track admin login sessions"""
    
    email = models.EmailField()
    admin_name = models.CharField(max_length=255)
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)
    last_activity = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'admin_sessions'
        ordering = ['-login_time']
        verbose_name = 'Admin Session'
        verbose_name_plural = 'Admin Sessions'

    def __str__(self):
        return f"{self.admin_name} ({self.email}) - {self.login_time}"


class Rubric(models.Model):
    """Main symptom hierarchy (Rubric → Sub-rubric → Sub-sub-rubric)"""
    
    name = models.CharField(max_length=500)
    name_hindi = models.CharField(max_length=500, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.CASCADE, null=True, blank=True, related_name='children'
    )
    level = models.IntegerField(default=0)
    description = models.TextField(blank=True)
    description_hindi = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='rubrics')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    search_vector = models.TextField(blank=True)
    
    class Meta:
        ordering = ['level', 'order', 'name']
        unique_together = ['name', 'parent']  # Keep this
        verbose_name = 'Rubric'
        verbose_name_plural = 'Rubrics'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['parent', 'level']),
            models.Index(fields=['is_active']),
            models.Index(fields=['order']),
        ]
    
    def __str__(self):
        if self.parent:
            return f"{self.parent.name} - {self.name}"
        return self.name
    
    def get_full_path(self):
        """Get the full hierarchical path of the rubric"""
        if self.parent:
            return f"{self.parent.get_full_path()} > {self.name}"
        return self.name



class RubricSynonym(models.Model):
    """Cross-references and synonyms for rubrics"""
    
    rubric = models.ForeignKey(Rubric, on_delete=models.CASCADE, related_name='synonyms')
    synonym = models.CharField(max_length=500)
    synonym_hindi = models.CharField(max_length=500, blank=True)
    is_primary = models.BooleanField(default=False)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='synonyms')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-is_primary', 'synonym']
        verbose_name = 'Rubric Synonym'
        verbose_name_plural = 'Rubric Synonyms'
        indexes = [
            models.Index(fields=['synonym']),
            models.Index(fields=['rubric']),
            models.Index(fields=['is_primary']),
        ]
    
    def __str__(self):
        return f"{self.synonym} → {self.rubric.name}"


class Modality(models.Model):
    """Aggravation/Amelioration factors"""
    
    MODALITY_TYPE_CHOICES = [
        ('aggravation', 'Aggravation'),
        ('amelioration', 'Amelioration'),
    ]
    
    rubric = models.ForeignKey(Rubric, on_delete=models.CASCADE, related_name='modalities')
    modality_type = models.CharField(max_length=15, choices=MODALITY_TYPE_CHOICES)
    name = models.CharField(max_length=500)
    name_hindi = models.CharField(max_length=500, blank=True)
    description = models.TextField(blank=True)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='modalities')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['modality_type', 'name']
        verbose_name = 'Modality'
        verbose_name_plural = 'Modalities'
        indexes = [
            models.Index(fields=['rubric', 'modality_type']),
        ]
    
    def __str__(self):
        return f"{self.rubric.name} - {self.get_modality_type_display()}: {self.name}"




class Medicine(models.Model):
    """Homeopathic medicines/remedies"""

    name = models.CharField(max_length=200, unique=True)
    latin_name = models.CharField(max_length=200)
    name_hindi = models.CharField(max_length=200, blank=True)
    common_name = models.CharField(max_length=200, blank=True)
    family = models.CharField(max_length=200, blank=True)

    description = models.TextField(blank=True)
    description_hindi = models.TextField(blank=True)

    potencies = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Comma-separated potencies like 6C, 30C, 200C"
    )
    indications = models.TextField(
        blank=True,
        default="",
        help_text="Conditions this medicine is indicated for"
    )
    contraindications = models.TextField(
        blank=True,
        default="",
        help_text="When this medicine should not be used"
    )
    source = models.CharField(
        max_length=255,
        blank=True,
        default="",
        help_text="Source material (plant, mineral, animal, etc.)"
    )

    usage_count = models.IntegerField(default=0)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0)

    is_active = models.BooleanField(default=True)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='medicines')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']
        verbose_name = 'Medicine'
        verbose_name_plural = 'Medicines'
        indexes = [
            models.Index(fields=['name']),
            models.Index(fields=['latin_name']),
            models.Index(fields=['is_active']),
            models.Index(fields=['-usage_count']),
        ]

    def __str__(self):
        return f"{self.name} ({self.latin_name})"

    def increment_usage(self):
        self.usage_count += 1
        self.save(update_fields=['usage_count'])





class RubricMedicineGrade(models.Model):
    """Medicine-Rubric mapping with grade (1-5 scale)"""
    
    GRADE_CHOICES = [
        (1, 'Grade 1 - Mild'),
        (2, 'Grade 2 - Moderate'),
        (3, 'Grade 3 - Strong'),
        (4, 'Grade 4 - Very Strong'),
        (5, 'Grade 5 - Specific/Keynote'),
    ]
    
    rubric = models.ForeignKey(Rubric, on_delete=models.CASCADE, related_name='medicine_grades')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE, related_name='rubric_grades')
    grade = models.IntegerField(choices=GRADE_CHOICES)
    notes = models.TextField(blank=True)
    source = models.CharField(max_length=200, blank=True)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='rubric_medicine_grades')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['rubric', 'medicine']
        ordering = ['-grade', 'medicine__name']
        verbose_name = 'Rubric-Medicine Grade'
        verbose_name_plural = 'Rubric-Medicine Grades'
        indexes = [
            models.Index(fields=['rubric', 'medicine']),
            models.Index(fields=['grade']),
        ]
    
    def __str__(self):
        return f"{self.medicine.name} - {self.rubric.name} (Grade {self.grade})"




class Case(models.Model):
    """Doctor's patient case"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('follow_up', 'Follow-up'),
        ('cancelled', 'Cancelled'),
    ]
    
    case_number = models.CharField(max_length=50, unique=True, db_index=True)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='cases')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='cases', null=True, blank=True)
    
    title = models.CharField(max_length=200)
    chief_complaint = models.TextField()
    symptoms = models.TextField()
    duration = models.CharField(max_length=100)
    
    patient_name = models.CharField(max_length=200, blank=True)
    patient_age = models.IntegerField(null=True, blank=True)
    patient_gender = models.CharField(max_length=10, blank=True)
    patient_phone = models.CharField(max_length=15, blank=True)
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    

    prescribed_medicine = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, blank=True, related_name='prescribed_cases')
    prescribed_potency = models.CharField(max_length=20, blank=True)
    dosage_instructions = models.TextField(blank=True)
    

    doctor_notes = models.TextField(blank=True)
    follow_up_date = models.DateField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Case'
        verbose_name_plural = 'Cases'
        indexes = [
            models.Index(fields=['case_number']),
            models.Index(fields=['doctor', 'status']),
            models.Index(fields=['patient']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.case_number} - {self.title}"
    
    def save(self, *args, **kwargs):
        if not self.case_number:
            self.case_number = self.generate_case_number()
        super().save(*args, **kwargs)
    
    def generate_case_number(self):
        """Generate unique case number"""
        from django.utils import timezone
        import random
        import string
        
        today = timezone.now().strftime('%Y%m%d')
        random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        case_number = f"CASE-{today}-{random_suffix}"
        
        while Case.objects.filter(case_number=case_number).exists():
            random_suffix = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
            case_number = f"CASE-{today}-{random_suffix}"
        
        return case_number
    
    def get_patient_name(self):
        """Get patient name from registered patient or manual entry"""
        if self.patient:
            return self.patient.user.get_full_name()
        return self.patient_name or "Unknown Patient"



class CaseRubric(models.Model):
    """Rubrics selected for a case"""
    
    INTENSITY_CHOICES = [
        (1, 'Mild'),
        (2, 'Moderate'),
        (3, 'Severe'),
    ]
    
    case = models.ForeignKey(Case, on_delete=models.CASCADE, related_name='selected_rubrics')
    rubric = models.ForeignKey(Rubric, on_delete=models.CASCADE)
    intensity = models.IntegerField(choices=INTENSITY_CHOICES, default=1)
    notes = models.TextField(blank=True)
    source_import = models.ForeignKey('ImportHistory', on_delete=models.CASCADE, null=True, blank=True, related_name='case_rubrics')
    added_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['added_at']
        verbose_name = 'Case Rubric'
        verbose_name_plural = 'Case Rubrics'
        indexes = [
            models.Index(fields=['case']),
        ]
    
    def __str__(self):
        return f"{self.case.case_number} - {self.rubric.name} (Intensity: {self.intensity})"



class Repertorization(models.Model):
    """Analysis result for a case"""

    case = models.ForeignKey(
        Case,
        on_delete=models.CASCADE,
        related_name='repertorizations',
        null=True,          # ✅ UPDATED
        blank=True          # ✅ UPDATED
    )

    doctor = models.ForeignKey(
        Doctor,
        on_delete=models.CASCADE,
        related_name='repertorizations'
    )

    method = models.CharField(max_length=50, default='weighted_sum')

    total_rubrics = models.IntegerField()
    total_medicines_analyzed = models.IntegerField()

    pdf_file = CloudinaryField(
        'document',
        null=True,
        blank=True,
        resource_type='raw'
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Repertorization'
        verbose_name_plural = 'Repertorizations'
        indexes = [
            models.Index(fields=['case']),
            models.Index(fields=['doctor']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"Repertorization for {self.case.case_number if self.case else 'No Case'}"



class RepertorizationResult(models.Model):
    """Ranked medicines from repertorization"""
    
    repertorization = models.ForeignKey(Repertorization, on_delete=models.CASCADE, related_name='results')
    medicine = models.ForeignKey(Medicine, on_delete=models.CASCADE)
    rank = models.IntegerField()
    total_score = models.DecimalField(max_digits=10, decimal_places=2)
    coverage_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    rubrics_covered = models.IntegerField()
    
    grade_1_count = models.IntegerField(default=0)
    grade_2_count = models.IntegerField(default=0)
    grade_3_count = models.IntegerField(default=0)
    grade_4_count = models.IntegerField(default=0)
    grade_5_count = models.IntegerField(default=0)
    
    class Meta:
        ordering = ['rank']
        verbose_name = 'Repertorization Result'
        verbose_name_plural = 'Repertorization Results'
        indexes = [
            models.Index(fields=['repertorization', 'rank']),
        ]
    
    def __str__(self):
        return f"#{self.rank} {self.medicine.name} - Score: {self.total_score}"



class PatientSearch(models.Model):
    """Symptom analysis by patient"""
    
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='searches')
    search_text = models.TextField() 
    matched_rubrics = models.ManyToManyField(Rubric, related_name='patient_searches')
    

    top_medicine_1 = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, related_name='+')
    top_medicine_1_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    top_medicine_2 = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, related_name='+')
    top_medicine_2_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    top_medicine_3 = models.ForeignKey(Medicine, on_delete=models.SET_NULL, null=True, related_name='+')
    top_medicine_3_score = models.DecimalField(max_digits=5, decimal_places=2, null=True)
    
    is_saved = models.BooleanField(default=False)
    pdf_report = CloudinaryField('document', null=True, blank=True, resource_type='raw')
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Patient Search'
        verbose_name_plural = 'Patient Searches'
        indexes = [
            models.Index(fields=['patient', '-created_at']),
            models.Index(fields=['is_saved']),
        ]
    
    def __str__(self):
        return f"{self.patient.user.get_full_name()} - {self.search_text[:50]}"




class ImportHistory(models.Model):
    """Track data imports"""
    
    IMPORT_TYPE_CHOICES = [
        ('rubrics', 'Rubrics'),
        ('medicines', 'Medicines'),
        ('grades', 'Grade Mappings'),
        ('synonyms', 'Synonyms'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('partial', 'Partial Success'),
        ('failed', 'Failed'),
    ]
    
    import_type = models.CharField(max_length=20, choices=IMPORT_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    
    records_total = models.IntegerField()
    records_added = models.IntegerField()
    records_failed = models.IntegerField()
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    message = models.TextField(blank=True)
    error_log = models.TextField(blank=True)
    
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Import History'
        verbose_name_plural = 'Import Histories'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['import_type']),
        ]
    
    def __str__(self):
        return f"{self.get_import_type_display()} - {self.file_name} ({self.status})"


class SystemBackup(models.Model):
    """System backup records"""
    
    BACKUP_TYPE_CHOICES = [
        ('full', 'Full Database'),
        ('rubrics', 'Rubrics Only'),
        ('medicines', 'Medicines & Grades'),
        ('users', 'Users & Cases'),
    ]
    
    STATUS_CHOICES = [
        ('success', 'Success'),
        ('failed', 'Failed'),
    ]
    
    backup_type = models.CharField(max_length=20, choices=BACKUP_TYPE_CHOICES)
    file_name = models.CharField(max_length=255)
    file_size = models.BigIntegerField()
    
    backup_file = CloudinaryField('document', resource_type='raw')
    
    records_count = models.IntegerField()
    duration_seconds = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'System Backup'
        verbose_name_plural = 'System Backups'
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['backup_type']),
        ]
    
    def __str__(self):
        return f"{self.get_backup_type_display()} - {self.file_name} ({self.status})"



from django.db import models
from django.utils import timezone
from .models import CustomUser, Doctor, Patient


class Message(models.Model):
    """Messages between patients and doctors"""
    
    MESSAGE_TYPE_CHOICES = [
        ('appointment_request', 'Appointment Request'),
        ('follow_up', 'Follow Up'),
        ('question', 'Question'),
        ('reply', 'Reply'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('read', 'Read'),
        ('replied', 'Replied'),
        ('cancelled', 'Cancelled'),
    ]
    
    # Participants
    sender = models.ForeignKey(
        CustomUser, 
        on_delete=models.CASCADE, 
        related_name='sent_messages'
    )
    doctor = models.ForeignKey(
        Doctor, 
        on_delete=models.CASCADE, 
        related_name='doctor_messages'
    )
    
    # Message details
    message_type = models.CharField(
        max_length=20, 
        choices=MESSAGE_TYPE_CHOICES,
        default='appointment_request'
    )
    subject = models.CharField(max_length=200, blank=True)
    message = models.TextField()
    
    # Appointment details (if message_type is appointment_request)
    patient_name = models.CharField(max_length=200, blank=True)
    patient_phone = models.CharField(max_length=15, blank=True)
    appointment_date = models.DateField(null=True, blank=True)
    appointment_time = models.CharField(max_length=20, blank=True)
    appointment_type = models.CharField(max_length=20, blank=True)  # online/offline
    city = models.CharField(max_length=100, blank=True)
    specialty = models.CharField(max_length=200, blank=True)
    sub_specialty = models.CharField(max_length=200, blank=True)
    problem_description = models.TextField(blank=True)
    
    # NEW: Rubrics extracted from problem_description
    matched_rubrics = models.ManyToManyField(Rubric, related_name='messages', blank=True)
    
    # Reply chain
    parent_message = models.ForeignKey(
        'self', 
        on_delete=models.CASCADE, 
        null=True, 
        blank=True,
        related_name='replies'
    )
    
    # Status tracking
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES,
        default='pending'
    )
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Message'
        verbose_name_plural = 'Messages'
        indexes = [
            models.Index(fields=['doctor', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['status']),
            models.Index(fields=['is_read']),
        ]
    
    def __str__(self):
        return f"Message from {self.sender.get_full_name()} to Dr. {self.doctor.user.get_full_name()}"
    
    def mark_as_read(self):
        """Mark message as read"""
        if not self.is_read:
            self.is_read = True
            self.read_at = timezone.now()
            if self.status == 'pending':
                self.status = 'read'
            self.save(update_fields=['is_read', 'read_at', 'status'])
    
    def get_thread(self):
        """Get all messages in this thread"""
        if self.parent_message:
            # This is a reply, get the original message's thread
            return Message.objects.filter(
                models.Q(id=self.parent_message.id) | 
                models.Q(parent_message=self.parent_message)
            ).order_by('created_at')
        else:
            # This is the original message, get all its replies
            return Message.objects.filter(
                models.Q(id=self.id) | 
                models.Q(parent_message=self)
            ).order_by('created_at')


class MessageAttachment(models.Model):
    """Attachments for messages (images, PDFs, etc.)"""
    
    message = models.ForeignKey(
        Message, 
        on_delete=models.CASCADE, 
        related_name='attachments'
    )
    file = models.FileField(upload_to='message_attachments/%Y/%m/%d/')
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=50)
    file_size = models.BigIntegerField()  # in bytes
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['uploaded_at']
        verbose_name = 'Message Attachment'
        verbose_name_plural = 'Message Attachments'
    
    def __str__(self):
        return f"{self.file_name} - {self.message}"