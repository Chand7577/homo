from django.urls import path
from . import views    

urlpatterns = [
    path('admin/send-otp/', views.admin_send_otp, name='admin_send_otp'),
    path('admin/verify-otp/', views.admin_verify_otp, name='admin_verify_otp'),
    path('admin/check-auth/', views.admin_check_auth, name='admin_check_auth'),
    path('admin/logout/', views.admin_logout, name='admin_logout'),
    
    path('admin/doctors/create/', views.create_doctor, name='create_doctor'),
    path('admin/doctors/', views.get_doctors, name='get_doctors'),
    path('admin/doctors/<int:doctor_id>/', views.get_doctor, name='get_doctor'),
    path('admin/doctors/<int:doctor_id>/update/', views.update_doctor, name='update_doctor'),
    path('admin/doctors/<int:doctor_id>/delete/', views.delete_doctor, name='delete_doctor'),
    
    path('admin/patients/create/', views.create_patient, name='create_patient'),
    path('admin/patients/', views.get_patients, name='get_patients'),
    path('admin/patients/<int:patient_id>/', views.get_patient, name='get_patient'),
    path('admin/patients/<int:patient_id>/update/', views.update_patient, name='update_patient'),
    path('admin/patients/<int:patient_id>/delete/', views.delete_patient, name='delete_patient'),

    path('admin/rubrics/create/', views.create_rubric, name='create_rubric'),
    path('admin/rubrics/', views.get_rubrics, name='get_rubrics'),
    path('admin/rubrics/tree/', views.get_rubric_tree, name='get_rubric_tree'),
    path('admin/rubrics/<int:rubric_id>/', views.get_rubric, name='get_rubric'),
    path('admin/rubrics/<int:rubric_id>/update/', views.update_rubric, name='update_rubric'),
    path('admin/rubrics/<int:rubric_id>/delete/', views.delete_rubric, name='delete_rubric'),


    
    path('admin/medicines/create/', views.create_medicine, name='create_medicine'),
    path('admin/medicines/', views.get_medicines, name='get_medicines'),
    path('admin/medicines/<int:medicine_id>/', views.get_medicine, name='get_medicine'),
    path('admin/medicines/<int:medicine_id>/update/', views.update_medicine, name='update_medicine'),
    path('admin/medicines/<int:medicine_id>/delete/', views.delete_medicine, name='delete_medicine'),
    
    path('admin/grades/create/', views.create_grade, name='create_grade'),
    path('admin/grades/', views.get_grades, name='get_grades'),
    path('admin/grades/rubric/<int:rubric_id>/', views.get_rubric_grades, name='get_rubric_grades'),
    path('admin/grades/<int:grade_id>/update/', views.update_grade, name='update_grade'),
    path('admin/grades/<int:grade_id>/delete/', views.delete_grade, name='delete_grade'),
    
    path('admin/synonyms/create/', views.create_synonym, name='create_synonym'),
    path('admin/synonyms/rubric/<int:rubric_id>/', views.get_rubric_synonyms, name='get_rubric_synonyms'),
    path('admin/synonyms/<int:synonym_id>/delete/', views.delete_synonym, name='delete_synonym'),
    
    path('admin/import/medicines/', views.import_medicines, name='import_medicines'),
    path('admin/import/rubrics/', views.import_rubrics, name='import_rubrics'),
    path('admin/import/grades/', views.import_grades, name='import_grades'),
    path('admin/import/synonyms/', views.import_synonyms, name='import_synonyms'),
    path('admin/import/mastersheet/', views.upload_mastersheet, name='upload_mastersheet'),
    path('admin/import/status/', views.get_import_status, name='get_import_status'),
    path('admin/import/history/', views.get_import_history, name='get_import_history'),
    path('admin/import/history/<int:history_id>/delete/', views.delete_import_history, name='delete_import_history'),
    path('admin/import/templates/<str:template_type>/', views.download_template, name='download_template'),
    
    path('admin/backup/create/', views.create_backup, name='create_backup'),
    path('admin/backup/list/', views.get_backups, name='get_backups'),
    path('admin/backup/<int:backup_id>/restore/', views.restore_backup, name='restore_backup'),
    path('admin/backup/<int:backup_id>/download/', views.download_backup, name='download_backup'),
    
    path('admin/stats/dashboard/', views.get_admin_dashboard_stats, name='admin_dashboard_stats'),
    path('admin/stats/doctors/', views.get_doctors_stats, name='doctors_stats'),
    path('admin/stats/patients/', views.get_patients_stats, name='patients_stats'),
    path('admin/stats/rubrics/', views.get_rubrics_stats, name='rubrics_stats'),
    path('admin/stats/medicines/', views.get_medicines_stats, name='medicines_stats'),
    path('admin/logs/', views.get_system_logs, name='get_system_logs'),
    
    path('doctor/login/', views.doctor_login, name='doctor_login'),
    path('doctor/logout/', views.doctor_logout, name='doctor_logout'),
    path('doctor/check-auth/', views.doctor_check_auth, name='doctor_check_auth'),
    path('doctor/profile/', views.doctor_get_profile, name='doctor_get_profile'),
    path('doctor/profile/update/', views.doctor_update_profile, name='doctor_update_profile'),
    path('doctor/change-password/', views.doctor_change_password, name='doctor_change_password'),

    path('doctor/send-otp/', views.doctor_send_otp, name='doctor_send_otp'),
    path('doctor/verify-otp/', views.doctor_verify_otp, name='doctor_verify_otp'),
    path('doctor/login/', views.doctor_login, name='doctor_login'), 
    path('doctor/logout/', views.doctor_logout, name='doctor_logout'),
    path('doctor/check-auth/', views.doctor_check_auth, name='doctor_check_auth'),
    
    path('doctor/cases/create/', views.create_case, name='create_case'),
    path('doctor/cases/', views.get_cases, name='get_cases'),
    path('doctor/cases/<int:case_id>/', views.get_case, name='get_case'),
    path('doctor/cases/<int:case_id>/update/', views.update_case, name='update_case'),
    path('doctor/cases/<int:case_id>/delete/', views.delete_case, name='delete_case'),
    path('doctor/cases/<int:case_id>/add-rubric/', views.add_case_rubric, name='add_case_rubric'),
    path('doctor/cases/<int:case_id>/remove-rubric/<int:rubric_id>/', views.remove_case_rubric, name='remove_case_rubric'),
    
    path('doctor/rubrics/chapters/', views.get_chapters, name='get_chapters'),
    path('doctor/rubrics/tree/', views.get_rubric_tree, name='get_rubric_tree_doctor'),
    path('doctor/rubrics/search/', views.intelligent_rubric_search, name='rubric_search'),
    path('doctor/rubrics/', views.get_rubrics, name='get_rubrics_doctor_list'),
    path('doctor/rubrics/<int:rubric_id>/', views.get_rubric_detail, name='get_rubric_detail'),
    path('doctor/rubrics/<int:rubric_id>/medicines/', views.get_rubric_medicines, name='get_rubric_medicines'),
    
    path('doctor/cases/<int:case_id>/repertorize/', views.perform_repertorization, name='perform_repertorization'),
    path('doctor/repertorizations/', views.get_repertorizations, name='get_repertorizations'),
    path('doctor/repertorizations/<int:rep_id>/', views.get_repertorization_detail, name='get_repertorization_detail'),
    path('doctor/repertorizations/<int:rep_id>/pdf/', views.generate_repertorization_pdf, name='generate_repertorization_pdf'),
    
    path('doctor/stats/dashboard/', views.get_doctor_dashboard_stats, name='doctor_dashboard_stats'),
    path('doctor/stats/cases/', views.get_doctor_cases_stats, name='doctor_cases_stats'),
    path('doctor/stats/popular-medicines/', views.get_doctor_popular_medicines, name='doctor_popular_medicines'),
    
    path('patient/login/', views.patient_login, name='patient_login'),
    path('patient/logout/', views.patient_logout, name='patient_logout'),
    path('patient/check-auth/', views.patient_check_auth, name='patient_check_auth'),
    path('patient/profile/', views.patient_get_profile, name='patient_get_profile'),
    path('patient/profile/update/', views.patient_update_profile, name='patient_update_profile'),
    path('patient/change-password/', views.patient_change_password, name='patient_change_password'),
    
    path('patient/analyze-symptoms/', views.analyze_symptoms, name='analyze_symptoms'),
    path('patient/searches/', views.get_searches, name='get_searches'),
    path('patient/searches/<int:search_id>/', views.get_search_detail, name='get_search_detail'),
    path('patient/searches/<int:search_id>/save/', views.save_search, name='save_search'),
    path('patient/searches/<int:search_id>/pdf/', views.generate_search_pdf, name='generate_search_pdf'),
    
    path('patient/stats/dashboard/', views.get_patient_dashboard_stats, name='patient_dashboard_stats'),
    path('patient/stats/searches/', views.get_patient_searches_stats, name='patient_searches_stats'),

    path('patient/send-otp/', views.patient_send_otp, name='patient_send_otp'),
    path('patient/verify-otp/', views.patient_verify_otp, name='patient_verify_otp'),

    path('admin/dashboard/stats/', views.get_admin_dashboard_stats, name='admin_dashboard_stats'),

    path('admin/backup/create/', views.create_backup, name='create_backup'),
    path('admin/backup/download/<str:filename>/', views.download_backup, name='download_backup'),
    path('admin/backup/restore/', views.restore_backup, name='restore_backup'),
    path('admin/backup/stats/', views.get_backup_stats, name='backup_stats'),

    path('doctor/send-otp/', views.doctor_send_otp, name='doctor_send_otp'),
    path('doctor/verify-otp/', views.doctor_verify_otp, name='doctor_verify_otp'),
    path('doctor/check-auth/', views.doctor_check_auth, name='doctor_check_auth'),
    path('doctor/logout/', views.doctor_logout, name='doctor_logout'),
    path('doctor/login/', views.doctor_send_otp, name='doctor_login'),

    path('doctor/profile/', views.doctor_get_profile, name='doctor_get_profile'),
    path('doctor/profile/update/', views.doctor_update_profile, name='doctor_update_profile'),
    path('doctor/change-password/', views.doctor_change_password, name='doctor_change_password'),

    path('doctor/stats/dashboard/', views.get_doctor_dashboard_stats, name='doctor_dashboard_stats'),
    path('doctor/stats/cases/', views.get_doctor_cases_stats, name='doctor_cases_stats'),
    path('doctor/stats/popular-medicines/', views.get_doctor_popular_medicines, name='doctor_popular_medicines'),

    path('doctor/cases/', views.get_cases, name='get_cases'),
    path('doctor/cases/create/', views.create_case, name='create_case'),
    path('doctor/cases/<int:case_id>/', views.get_case, name='get_case'),
    path('doctor/cases/<int:case_id>/update/', views.update_case, name='update_case'),
    path('doctor/cases/<int:case_id>/delete/', views.delete_case, name='delete_case'),
    path('doctor/cases/<int:case_id>/add-rubric/', views.add_case_rubric, name='add_case_rubric'),
    path('doctor/cases/<int:case_id>/remove-rubric/<int:rubric_id>/', views.remove_case_rubric, name='remove_case_rubric'),
    path('doctor/cases/<int:case_id>/repertorize/', views.perform_repertorization, name='perform_repertorization'),

    path('doctor/rubrics/search/', views.intelligent_rubric_search, name='rubric_search'),
    path('doctor/rubrics/<int:rubric_id>/', views.get_rubric_detail, name='get_rubric_detail'),
    path('doctor/rubrics/<int:rubric_id>/medicines/', views.get_rubric_medicines, name='get_rubric_medicines'),

    path('doctor/repertorizations/', views.get_repertorizations, name='get_repertorizations'),
    path('doctor/repertorizations/<int:rep_id>/', views.get_repertorization_detail, name='get_repertorization_detail'),
    path('doctor/repertorizations/<int:rep_id>/pdf/', views.generate_repertorization_pdf, name='generate_repertorization_pdf'),

    path('doctor/rubrics/search/', views.intelligent_rubric_search, name='rubric_search'),
    path('doctor/rubrics/<int:rubric_id>/', views.get_rubric_detail, name='get_rubric_detail'),
    path('doctor/rubrics/<int:rubric_id>/medicines/', views.get_rubric_medicines, name='get_rubric_medicines'),
    
    path('doctor/repertorize/', views.perform_repertorization, name='perform_repertorization_standalone'),
    
    path('doctor/cases/<int:case_id>/repertorize/', views.perform_repertorization, name='perform_repertorization_case'),
    path('doctor/cases/<int:case_id>/save-repertorization/', views.save_repertorization_to_case, name='save_repertorization_to_case'),
    
    path('doctor/repertorizations/', views.get_repertorizations, name='get_repertorizations'),
    path('doctor/repertorizations/<int:rep_id>/', views.get_repertorization_detail, name='get_repertorization_detail'),
    
    path('doctor/cases/<int:case_id>/add-rubric/', views.add_case_rubric, name='add_case_rubric'),
    path('doctor/cases/<int:case_id>/remove-rubric/<int:rubric_id>/', views.remove_case_rubric, name='remove_case_rubric'),

    path('doctor/medicines/', views.get_all_medicines, name='doctor-get-medicines'),   
    path('doctor/medicines/all/', views.get_medicines, name='doctor-get-medicines-all'),   
    path('doctor/medicines/<int:medicine_id>/', views.get_medicine_detail, name='doctor-get-medicine-detail'),
    path('doctor/medicines/create/', views.create_medicine, name='doctor-create-medicine'),
    path('doctor/medicines/<int:medicine_id>/update/', views.update_medicine, name='doctor-update-medicine'),
    path('doctor/medicines/<int:medicine_id>/delete/', views.delete_medicine, name='doctor-delete-medicine'),

    path('doctor/rubric-medicine-grades/', views.get_rubric_medicine_grades, name='doctor-get-grades'),
    path('doctor/rubric-medicine-grades/create/', views.create_rubric_medicine_grade, name='doctor-create-grade'),
    path('doctor/rubric-medicine-grades/<int:mapping_id>/update/', views.update_rubric_medicine_grade, name='doctor-update-grade'),
    path('doctor/rubric-medicine-grades/<int:mapping_id>/delete/', views.delete_rubric_medicine_grade, name='doctor-delete-grade'),

    path('patient/send-otp/', views.patient_send_otp, name='patient_send_otp'),
    path('patient/verify-otp/', views.patient_verify_otp, name='patient_verify_otp'),
    path('patient/check-auth/', views.patient_check_auth, name='patient_check_auth'),
    path('patient/logout/', views.patient_logout, name='patient_logout'),
    path('patient/profile/', views.patient_get_profile, name='patient_get_profile'),
    path('patient/profile/update/', views.patient_update_profile, name='patient_update_profile'),
    path('patient/change-password/', views.patient_change_password, name='patient_change_password'),

    path('patient/stats/dashboard/', views.get_patient_dashboard_stats, name='patient_dashboard_stats'),
    path('patient/analyze-symptoms/', views.analyze_symptoms, name='analyze_symptoms'),
    path('patient/searches/', views.get_searches, name='get_searches'),
    path('patient/searches/<int:search_id>/', views.get_search_detail, name='get_search_detail'),
    path('patient/searches/<int:search_id>/save/', views.save_search, name='save_search'),
    path('patient/register/', views.patient_self_register, name='patient_self_register'), 
    path('admin/rubrics/bulk-upload/', views.bulk_upload_rubrics, name='bulk_upload_rubrics'),
    path('admin/rubrics/download-template/', views.download_rubric_template, name='download_rubric_template'),





    path('public/doctors/', views.get_public_doctors, name='get_public_doctors'),
    path('public/doctors/<int:doctor_id>/', views.get_doctor_public_profile, name='get_doctor_public_profile'),
    path('public/specializations/', views.get_doctor_specializations, name='get_doctor_specializations'),
    
    # Doctor messaging
    path('doctor/<int:doctor_id>/send-message/', views.send_doctor_message, name='send_doctor_message'),

    path('doctor/profile/upload-image/', views.doctor_upload_profile_image, name='doctor_upload_profile_image'),



    path('messages/send/', views.send_message_to_doctor, name='send_message_to_doctor'),
    path('patient/inbox/', views.get_patient_inbox, name='get_patient_inbox'),
    path('messages/<int:message_id>/thread/', views.get_message_thread, name='get_message_thread'),
    path('messages/<int:message_id>/mark-read/', views.mark_message_as_read, name='mark_message_as_read'),
    path('messages/<int:message_id>/reply/', views.patient_reply_to_message, name='patient_reply_to_message'),
    
    # Doctor messaging
    path('doctor/inbox/', views.get_doctor_inbox, name='get_doctor_inbox'),
    path('doctor/messages/<int:message_id>/reply/', views.doctor_reply_to_message, name='doctor_reply_to_message'),

    # Rubric Repertorization (symptom → rubric → medicine chart)
    path('doctor/rubrics/repertorize/', views.doctor_rubric_repertorize, name='doctor_rubric_repertorize'),
]