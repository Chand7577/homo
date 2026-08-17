from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Doctor, Patient, Rubric, RubricSynonym, 
    Modality, Medicine, RubricMedicineGrade, Case, 
    CaseRubric, Repertorization, RepertorizationResult, 
    ImportHistory, Message
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'user_type', 'is_staff', 'is_active')
    list_filter = ('user_type', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'is_email_verified')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Additional Info', {'fields': ('user_type', 'phone', 'email')}),
    )

@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display = ('user', 'registration_number', 'doctor_class', 'specialization', 'is_active')
    search_fields = ('user__username', 'user__email', 'registration_number', 'license_number')
    list_filter = ('doctor_class', 'is_active')

@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('user', 'gender', 'blood_group', 'assigned_doctor', 'is_active')
    search_fields = ('user__username', 'user__email')

@admin.register(Rubric)
class RubricAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent', 'level', 'order', 'is_active')
    search_fields = ('name', 'name_hindi')
    list_filter = ('level', 'is_active')

@admin.register(Medicine)
class MedicineAdmin(admin.ModelAdmin):
    list_display = ('name', 'latin_name', 'usage_count', 'is_active')
    search_fields = ('name', 'latin_name', 'common_name')
    list_filter = ('is_active',)

@admin.register(RubricMedicineGrade)
class RubricMedicineGradeAdmin(admin.ModelAdmin):
    list_display = ('rubric', 'medicine', 'grade')
    search_fields = ('rubric__name', 'medicine__name')
    list_filter = ('grade',)

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('case_number', 'title', 'doctor', 'patient_name', 'status', 'created_at')
    search_fields = ('case_number', 'title', 'patient_name')
    list_filter = ('status', 'created_at')

@admin.register(ImportHistory)
class ImportHistoryAdmin(admin.ModelAdmin):
    list_display = ('import_type', 'file_name', 'records_added', 'status', 'created_at')
    list_filter = ('import_type', 'status')

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'doctor', 'message_type', 'status', 'created_at')
    list_filter = ('message_type', 'status', 'is_read')
    search_fields = ('subject', 'message', 'sender__username')

# Optionally register others if needed
admin.site.register(RubricSynonym)
admin.site.register(Modality)
admin.site.register(CaseRubric)
admin.site.register(Repertorization)
admin.site.register(RepertorizationResult)
