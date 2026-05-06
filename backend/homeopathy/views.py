import json
import logging
import secrets
import string
import pandas as pd
import cloudinary.uploader
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.contrib.auth.hashers import make_password, check_password
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils import timezone
from django.conf import settings
from django.db import models, transaction
from django.db.models import Q, Count, Sum, Avg, F

from django.db import IntegrityError

  
from .models import (
    CustomUser, Doctor, Patient, AdminSession,
    Rubric, RubricSynonym, Modality, Medicine, RubricMedicineGrade,
    Case, CaseRubric, Repertorization, RepertorizationResult,
    PatientSearch, ImportHistory, SystemBackup
)

logger = logging.getLogger(__name__)

from django.views.generic import TemplateView










import os
import json
from datetime import datetime
from django.http import JsonResponse, FileResponse, HttpResponse
from django.core import serializers
from django.db.models import Count, Sum, Avg
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
import logging
import tempfile

logger = logging.getLogger(__name__)











import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
from django.db.models import Q, Count, Prefetch

logger = logging.getLogger(__name__)

import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db.models import Q, Count, Case, When, Value
from .models import CustomUser, Doctor, Patient, Message, MessageAttachment

from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.conf import settings

logger = logging.getLogger(__name__)


import pandas as pd
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from .models import Rubric, RubricSynonym, RubricMedicineGrade, Medicine, Modality

logger = logging.getLogger(__name__)

def normalize(text):
    if text is None:
        return ''
    return ' '.join(str(text).strip().split()).title()

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import transaction
from django.views.decorators.http import require_http_methods
import tempfile, os, pandas as pd, logging
from homeopathy.models import Rubric, Medicine, RubricMedicineGrade

logger = logging.getLogger(__name__)

import signal
from contextlib import contextmanager
import json
import logging
from decimal import Decimal
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.db.models import Q, Count, Sum, Case as DjangoCase, When, F, DecimalField
from django.utils import timezone

from .models import (
    Doctor, Case, CaseRubric, Rubric, Medicine, 
    RubricMedicineGrade, Repertorization, RepertorizationResult
)

logger = logging.getLogger(__name__)
import json
import logging
from datetime import timedelta
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.db import transaction
from django.db.models import Q, Count

from .models import Doctor, Case, CaseRubric, Repertorization, Medicine, Patient

logger = logging.getLogger(__name__)



class HomeView(TemplateView):
    template_name = "home.html"

def get_client_ip(request):
    """Extract client IP address from request"""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def generate_secure_password(length=12):
    """Generate secure random password"""
    alphabet = string.ascii_letters + string.digits + string.punctuation
    password = ''.join(secrets.choice(alphabet) for i in range(length))
    return password


def send_email_notification(to_email, subject, html_content):
    """Send email using SendGrid"""
    text_content = strip_tags(html_content)
    
    try:
        email_message = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[to_email],
        )
        email_message.attach_alternative(html_content, "text/html")
        email_message.send(fail_silently=False)
        logger.info(f"Email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return False


def send_doctor_account_email(doctor, password):
    """Send account creation email to doctor"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Welcome to Homeopathy Portal</h2>
        <p>Dear Dr. {doctor.user.get_full_name()},</p>
        <p>Your doctor account has been created.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
            <p><strong>Email:</strong> {doctor.user.email}</p>
            <p><strong>Password:</strong> {password}</p>
            <p><strong>Login:</strong> <a href="{settings.SITE_URL}">{settings.SITE_URL}</a></p>
        </div>
        <p>Please change your password after first login.</p>
    </body>
    </html>
    """
    
    return send_email_notification(
        doctor.user.email,
        "Your Doctor Account - Homeopathy Portal",
        html_content
    )


def send_patient_account_email(patient, password):
    """Send account creation email to patient"""
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Welcome to Homeopathy Portal</h2>
        <p>Dear {patient.user.get_full_name()},</p>
        <p>Your patient account has been created.</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
            <p><strong>Email:</strong> {patient.user.email}</p>
            <p><strong>Password:</strong> {password}</p>
            <p><strong>Login:</strong> <a href="{settings.SITE_URL}">{settings.SITE_URL}</a></p>
        </div>
    </body>
    </html>
    """
    
    return send_email_notification(
        patient.user.email,
        "Your Patient Account - Homeopathy Portal",
        html_content
    )



def require_admin(view_func):
    """Decorator to check if user is authenticated admin"""
    def wrapper(request, *args, **kwargs):
        # Bypass admin check
        return view_func(request, *args, **kwargs)
    return wrapper


def require_doctor(view_func):
    """Decorator to check if user is authenticated doctor"""
    def wrapper(request, *args, **kwargs):
        # Bypass doctor check
        if not request.session.get('is_doctor'):
            doctor = Doctor.objects.first()
            if doctor:
                request.session['is_doctor'] = True
                request.session['doctor_id'] = doctor.id
        return view_func(request, *args, **kwargs)
    return wrapper


def require_patient(view_func):
    """Decorator to check if user is authenticated patient"""
    def wrapper(request, *args, **kwargs):
        # Bypass patient check
        if not request.session.get('is_patient'):
            patient = Patient.objects.first()
            if patient:
                request.session['is_patient'] = True
                request.session['patient_id'] = patient.id
        return view_func(request, *args, **kwargs)
    return wrapper


def require_admin_or_doctor(view_func):
    """Decorator to check if user is admin or doctor"""
    def wrapper(request, *args, **kwargs):
        # Bypass admin or doctor check
        return view_func(request, *args, **kwargs)
    return wrapper



@csrf_exempt
def admin_send_otp(request):
    """Send OTP to admin email for login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    # Check credentials
    print(f"DEBUG: Received login request - Email: '{email}', Password: '{password}'")
    admin_found = None
    for key, admin_data in settings.ADMIN_CREDENTIALS.items():
        print(f"DEBUG: Comparing with - Key: {key}, Config Email: '{admin_data['email']}', Config Password: '{admin_data['password']}'")
        if admin_data['email'] == email and admin_data['password'] == password:
            admin_found = admin_data
            break

    if not admin_found:
        print("DEBUG: No matching admin credentials found!")
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    # Generate 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store OTP in session
    if not request.session.session_key:
        request.session.create()
    
    request.session['admin_otp'] = otp
    request.session['admin_email_pending'] = email
    request.session['admin_name_pending'] = admin_found['name']
    request.session['otp_timestamp'] = timezone.now().isoformat()
    request.session.save()

    # Send OTP email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Admin Login OTP</h2>
        <p>Dear {admin_found['name']},</p>
        <p>Your OTP for admin login is:</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">{otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </body>
    </html>
    """
    
    send_email_notification(email, "Admin Login OTP - Homeopathy Portal", html_content)

    return JsonResponse({
        'success': True,
        'message': 'OTP sent to your email',
        'email': email
    })


@csrf_exempt
def admin_verify_otp(request):
    """Verify OTP and complete admin login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    otp = data.get('otp', '').strip()

    if not email or not otp:
        return JsonResponse({'error': 'Email and OTP are required'}, status=400)

    # Verify OTP from session
    print(f"DEBUG: Verifying OTP - Session ID: {request.session.session_key}")
    stored_otp = request.session.get('admin_otp')
    stored_email = request.session.get('admin_email_pending')
    otp_timestamp_str = request.session.get('otp_timestamp')
    print(f"DEBUG: Stored Data - OTP: {stored_otp}, Email: {stored_email}, Timestamp: {otp_timestamp_str}")

    if not stored_otp or not stored_email or not otp_timestamp_str:
        print("DEBUG: Session data missing or expired!")
        return JsonResponse({'error': 'No OTP found. Please request a new one.'}, status=400)

    # Check if OTP expired (10 minutes)
    otp_timestamp = timezone.datetime.fromisoformat(otp_timestamp_str)
    if timezone.now() - otp_timestamp > timedelta(minutes=10):
        return JsonResponse({'error': 'OTP expired. Please request a new one.'}, status=400)

    # Verify email and OTP match
    if stored_email != email or stored_otp != otp:
        return JsonResponse({'error': 'Invalid OTP'}, status=401)

    # Get admin details
    admin_name = request.session.get('admin_name_pending')

    # Clear OTP data
    del request.session['admin_otp']
    del request.session['admin_email_pending']
    del request.session['admin_name_pending']
    del request.session['otp_timestamp']

    # Set admin session
    request.session['is_admin'] = True
    request.session['admin_email'] = email
    request.session['admin_name'] = admin_name
    request.session.save()

    # Log session
    ip_address = get_client_ip(request)
    AdminSession.objects.filter(email=email, is_active=True).update(is_active=False)
    AdminSession.objects.create(
        session_key=request.session.session_key,
        email=email,
        admin_name=admin_name,
        ip_address=ip_address,
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        is_active=True
    )

    return JsonResponse({
        'success': True,
        'message': 'Login successful',
        'admin': {'email': email, 'name': admin_name, 'role': 'admin'}
    })


@csrf_exempt
def admin_check_auth(request):
    """Check if admin is authenticated (Bypassed)"""
    return JsonResponse({
        'authenticated': True,
        'admin': {
            'email': request.session.get('admin_email', 'admin@example.com'),
            'name': request.session.get('admin_name', 'Admin User'),
            'role': 'admin'
        }
    })


@csrf_exempt
def admin_logout(request):
    """Admin logout endpoint"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if request.session.get('is_admin'):
        session_key = request.session.session_key
        if session_key:
            AdminSession.objects.filter(session_key=session_key).update(is_active=False)
        request.session.flush()
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    
    return JsonResponse({'error': 'No admin logged in'}, status=400)



from django.db import transaction, IntegrityError
from django.core.exceptions import ValidationError
from django.core.validators import validate_email

@csrf_exempt
@require_admin
def create_doctor(request):
    """Create a new doctor account"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    required_fields = [
        'first_name',
        'last_name',
        'email',
        'specialization',
        'qualification',
        'registration_number',
        'doctor_class',  # NEW
        'aadhar_number',  # NEW
        'pan_number',  # NEW
        'license_number'  # NEW
    ]

    # Required field validation
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field.replace("_", " ").title()} is required'

    # Doctor class validation
    doctor_class = data.get('doctor_class', '').strip()
    valid_classes = ['doctor_jp_nautiyal', 'core_team', 'individual']
    if doctor_class and doctor_class not in valid_classes:
        errors['doctor_class'] = 'Invalid doctor class'

    # Aadhar number validation (12 digits)
    aadhar = data.get('aadhar_number', '').strip()
    if aadhar:
        if not aadhar.replace(' ', '').isdigit() or len(aadhar.replace(' ', '')) != 12:
            errors['aadhar_number'] = 'Aadhar number must be 12 digits'
        elif Doctor.objects.filter(aadhar_number=aadhar.replace(' ', ''), is_active=True).exists():
            errors['aadhar_number'] = 'This Aadhar number is already registered'

    # PAN number validation (10 characters: 5 letters, 4 digits, 1 letter)
    pan = data.get('pan_number', '').strip().upper()
    if pan:
        import re
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan):
            errors['pan_number'] = 'Invalid PAN format (e.g., ABCDE1234F)'
        elif Doctor.objects.filter(pan_number=pan, is_active=True).exists():
            errors['pan_number'] = 'This PAN number is already registered'

    # License number validation
    license_no = data.get('license_number', '').strip()
    if license_no and Doctor.objects.filter(license_number=license_no, is_active=True).exists():
        errors['license_number'] = 'This license number is already registered'

    # Email validation - exclude inactive users
    email = data.get('email', '').strip()
    if email:
        try:
            validate_email(email)
            # Only check for ACTIVE users
            if CustomUser.objects.filter(email=email, is_active=True).exists():
                errors['email'] = 'Email already registered'
        except ValidationError:
            errors['email'] = 'Invalid email format'

    # Registration number uniqueness - exclude inactive doctors
    reg_no = data.get('registration_number', '').strip()
    if reg_no and Doctor.objects.filter(registration_number=reg_no, is_active=True).exists():
        errors['registration_number'] = 'This registration number is already registered'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    # password = generate_secure_password()
    password = "doctor"

    try:
        with transaction.atomic():
            # Check if there's an inactive user with this email
            existing_user = CustomUser.objects.filter(email=email, is_active=False).first()
            
            if existing_user:
                # Reactivate and update existing user
                existing_user.username = email
                existing_user.first_name = data['first_name']
                existing_user.last_name = data['last_name']
                existing_user.user_type = 'doctor'
                existing_user.phone = data.get('phone', '')
                existing_user.password = make_password(password)
                existing_user.is_active = True
                existing_user.save()
                user = existing_user
                
                # Check if there's an inactive doctor profile
                existing_doctor = Doctor.objects.filter(user=user, is_active=False).first()
                if existing_doctor:
                    # Reactivate and update existing doctor
                    existing_doctor.specialization = data['specialization']
                    existing_doctor.qualification = data['qualification']
                    existing_doctor.registration_number = reg_no
                    existing_doctor.experience_years = int(data.get('experience_years', 0))
                    existing_doctor.doctor_class = doctor_class
                    existing_doctor.aadhar_number = aadhar.replace(' ', '')
                    existing_doctor.pan_number = pan
                    existing_doctor.license_number = license_no
                    existing_doctor.is_active = True
                    existing_doctor.save()
                    doctor = existing_doctor
                else:
                    # Create new doctor profile
                    doctor = Doctor.objects.create(
                        user=user,
                        specialization=data['specialization'],
                        qualification=data['qualification'],
                        registration_number=reg_no,
                        experience_years=int(data.get('experience_years', 0)),
                        doctor_class=doctor_class,
                        aadhar_number=aadhar.replace(' ', ''),
                        pan_number=pan,
                        license_number=license_no,
                    )
            else:
                # Create completely new user and doctor
                user = CustomUser.objects.create(
                    username=email,
                    email=email,
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    user_type='doctor',
                    phone=data.get('phone', ''),
                    password=make_password(password),
                )

                doctor = Doctor.objects.create(
                    user=user,
                    specialization=data['specialization'],
                    qualification=data['qualification'],
                    registration_number=reg_no,
                    experience_years=int(data.get('experience_years', 0)),
                    doctor_class=doctor_class,
                    aadhar_number=aadhar.replace(' ', ''),
                    pan_number=pan,
                    license_number=license_no,
                )

            send_doctor_account_email(doctor, password)

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Doctor created successfully',
                    'doctor': {
                        'id': doctor.id,
                        'name': user.get_full_name(),
                        'email': user.email,
                        'doctor_class': doctor.doctor_class,
                    }
                },
                status=201
            )

    except IntegrityError as e:
        logger.error(f"Integrity error creating doctor: {str(e)}")
        return JsonResponse(
            {
                'error': 'Validation failed',
                'errors': {
                    'registration_number': 'This registration number is already in use'
                }
            },
            status=400
        )



    except Exception as e:
        logger.error(f"Error creating doctor: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create doctor'},
            status=500
        )

@csrf_exempt
@require_admin
def get_doctor(request, doctor_id):
    """Get single doctor details"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
        
        doctor_data = {
            'id': doctor.id,
            'name': doctor.user.get_full_name(),
            'email': doctor.user.email,
            'phone': doctor.user.phone,
            'specialization': doctor.specialization,
            'qualification': doctor.qualification,
            'registration_number': doctor.registration_number,
            'experience_years': doctor.experience_years,
            'doctor_class': doctor.doctor_class,  # NEW
            'aadhar_number': doctor.aadhar_number,  # NEW
            'pan_number': doctor.pan_number,  # NEW
            'license_number': doctor.license_number,  # NEW
            'created_at': doctor.created_at.strftime('%Y-%m-%d'),
        }
        
        return JsonResponse({'success': True, 'doctor': doctor_data})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching doctor: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def update_doctor(request, doctor_id):
    """Update doctor information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    
    errors = {}
    
    # Email validation
    if 'email' in data and data['email'] != doctor.user.email:
        try:
            validate_email(data['email'])
            if CustomUser.objects.filter(email=data['email'], is_active=True).exclude(id=doctor.user.id).exists():
                errors['email'] = 'Email already registered'
        except ValidationError:
            errors['email'] = 'Invalid email format'
    
    # Doctor class validation
    if 'doctor_class' in data:
        valid_classes = ['doctor_jp_nautiyal', 'core_team', 'individual']
        if data['doctor_class'] not in valid_classes:
            errors['doctor_class'] = 'Invalid doctor class'
    
    # Aadhar number validation
    if 'aadhar_number' in data and data['aadhar_number'] != doctor.aadhar_number:
        aadhar = data['aadhar_number'].replace(' ', '').strip()
        if not aadhar.isdigit() or len(aadhar) != 12:
            errors['aadhar_number'] = 'Aadhar number must be 12 digits'
        elif Doctor.objects.filter(aadhar_number=aadhar, is_active=True).exclude(id=doctor.id).exists():
            errors['aadhar_number'] = 'This Aadhar number is already registered'
    
    # PAN number validation
    if 'pan_number' in data and data['pan_number'] != doctor.pan_number:
        import re
        pan = data['pan_number'].strip().upper()
        if not re.match(r'^[A-Z]{5}[0-9]{4}[A-Z]{1}$', pan):
            errors['pan_number'] = 'Invalid PAN format (e.g., ABCDE1234F)'
        elif Doctor.objects.filter(pan_number=pan, is_active=True).exclude(id=doctor.id).exists():
            errors['pan_number'] = 'This PAN number is already registered'
    
    # License number validation
    if 'license_number' in data and data['license_number'] != doctor.license_number:
        license_no = data['license_number'].strip()
        if Doctor.objects.filter(license_number=license_no, is_active=True).exclude(id=doctor.id).exists():
            errors['license_number'] = 'This license number is already registered'
    
    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
    
    try:
        with transaction.atomic():
            # Update user fields
            user = doctor.user
            if data.get('first_name'):
                user.first_name = data['first_name']
            if data.get('last_name'):
                user.last_name = data['last_name']
            if data.get('email'):
                user.email = data['email']
                user.username = data['email']
            if 'phone' in data:
                user.phone = data.get('phone', '')
            user.save()
            
            # Update doctor fields
            if data.get('specialization'):
                doctor.specialization = data['specialization']
            if data.get('qualification'):
                doctor.qualification = data['qualification']
            if data.get('registration_number'):
                doctor.registration_number = data['registration_number']
            if 'experience_years' in data:
                doctor.experience_years = int(data.get('experience_years', 0))
            
            # Update new fields
            if 'doctor_class' in data:
                doctor.doctor_class = data['doctor_class']
            if 'aadhar_number' in data:
                doctor.aadhar_number = data['aadhar_number'].replace(' ', '').strip()
            if 'pan_number' in data:
                doctor.pan_number = data['pan_number'].strip().upper()
            if 'license_number' in data:
                doctor.license_number = data['license_number'].strip()
            
            doctor.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Doctor updated successfully',
                'doctor': {
                    'id': doctor.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                }
            })
    
    except Exception as e:
        logger.error(f"Error updating doctor: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_admin
def delete_doctor(request, doctor_id):
    """Soft delete doctor (set is_active to False)"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            doctor.is_active = False
            doctor.save()
            
            # Also deactivate the user
            doctor.user.is_active = False
            doctor.user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Doctor deleted successfully'
            })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting doctor: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_admin
def get_doctors(request, doctor_id=None):
    if request.method != "GET":
        return JsonResponse(
            {"error": "GET method required"},
            status=405
        )

    try:
        doctors = (
            Doctor.objects
            .select_related("user")
            .filter(is_active=True)
            .order_by("-created_at")
        )

        doctor_list = []
        for doctor in doctors:
            doctor_list.append({
                "id": doctor.id,
                "name": doctor.user.get_full_name(),
                "email": doctor.user.email,
                "phone": doctor.user.phone,
                "specialization": doctor.specialization,
                "qualification": doctor.qualification,
                "registration_number": doctor.registration_number,
                "experience_years": doctor.experience_years,
                "doctor_class": doctor.doctor_class,
                "aadhar_number": doctor.aadhar_number,
                "pan_number": doctor.pan_number,
                "license_number": doctor.license_number,
                "created_at": doctor.created_at.isoformat(),
            })

        return JsonResponse(
            {"doctors": doctor_list},
            status=200
        )

    except Exception as e:
        logger.error(f"Error fetching doctors: {str(e)}")
        return JsonResponse(
            {"error": "Failed to fetch doctors"},
            status=500
        )


@csrf_exempt
def doctor_send_otp(request):
    """Send OTP to doctor email for login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    # Check if doctor exists and verify password
    logger.debug(f"DEBUG: Login attempt for Doctor Email: {email}")
    try:
        # First check if user exists at all
        user = CustomUser.objects.filter(email=email, is_active=True).first()
        if not user:
            logger.warning(f"DEBUG: Login failed - No active user found with email: {email}")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Check user type
        if user.user_type != 'doctor':
            logger.warning(f"DEBUG: Login failed - User {email} is a {user.user_type}, not a doctor")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        # Verify password (allow 'doctor' as default fallback)
        if not check_password(password, user.password) and password != "doctor":
            logger.warning(f"DEBUG: Login failed - Password mismatch for email: {email}")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
        
        # Get doctor profile
        doctor = Doctor.objects.filter(user=user, is_active=True).first()
        if not doctor:
            logger.warning(f"DEBUG: Login failed - Active Doctor profile missing for user: {email}")
            return JsonResponse({'error': 'Invalid credentials'}, status=401)
            
    except Exception as e:
        logger.error(f"DEBUG: Unexpected error during doctor login check: {str(e)}")
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    # Generate 6-digit OTP
    otp = ''.join([str(secrets.randbelow(10)) for _ in range(6)])
    
    # Store OTP in session
    if not request.session.session_key:
        request.session.create()
    
    request.session['doctor_otp'] = otp
    request.session['doctor_email_pending'] = email
    request.session['doctor_id_pending'] = doctor.id
    request.session['otp_timestamp'] = timezone.now().isoformat()
    request.session.save()

    # Send OTP email
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Doctor Login OTP</h2>
        <p>Dear Dr. {user.get_full_name()},</p>
        <p>Your OTP for login is:</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">{otp}</h1>
        </div>
        <p><strong>Note:</strong> Your default password is: <b>doctor</b></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
    </body>
    </html>
    """
    
    send_email_notification(email, "Doctor Login OTP - Homeopathy Portal", html_content)

    # Also log OTP to console for development
    logger.info(f"Doctor OTP for {email}: {otp}")

    return JsonResponse({
        'success': True,
        'message': 'OTP sent to your email',
        'email': email
    })



@csrf_exempt
def doctor_verify_otp(request):
    """Verify OTP and complete doctor login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    otp = data.get('otp', '').strip()

    if not email or not otp:
        return JsonResponse({'error': 'Email and OTP are required'}, status=400)

    # Verify OTP from session
    stored_otp = request.session.get('doctor_otp')
    stored_email = request.session.get('doctor_email_pending')
    doctor_id = request.session.get('doctor_id_pending')
    otp_timestamp_str = request.session.get('otp_timestamp')

    if not stored_otp or not stored_email or not otp_timestamp_str:
        return JsonResponse({'error': 'No OTP found. Please request a new one.'}, status=400)

    # Check if OTP expired (10 minutes)
    otp_timestamp = timezone.datetime.fromisoformat(otp_timestamp_str)
    if timezone.now() - otp_timestamp > timedelta(minutes=10):
        return JsonResponse({'error': 'OTP expired. Please request a new one.'}, status=400)

    # Verify email and OTP match
    if stored_email != email or stored_otp != otp:
        return JsonResponse({'error': 'Invalid OTP'}, status=401)

    # Get doctor details
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor account not found'}, status=404)

    # Clear OTP data
    del request.session['doctor_otp']
    del request.session['doctor_email_pending']
    del request.session['doctor_id_pending']
    del request.session['otp_timestamp']

    # Set doctor session
    request.session['is_doctor'] = True
    request.session['doctor_id'] = doctor.id
    request.session['doctor_email'] = email
    request.session['doctor_name'] = doctor.user.get_full_name()
    request.session.save()

    return JsonResponse({
        'success': True,
        'message': 'Login successful',
        'doctor': {
            'id': doctor.id,
            'email': email,
            'name': doctor.user.get_full_name(),
            'specialization': doctor.specialization,
            'role': 'doctor'
        }
    })


@csrf_exempt
def doctor_check_auth(request):
    """Check if doctor is authenticated (Bypassed)"""
    doctor = Doctor.objects.select_related('user').filter(is_active=True).first()
    if doctor:
        return JsonResponse({
            'authenticated': True,
            'doctor': {
                'id': doctor.id,
                'email': doctor.user.email,
                'name': doctor.user.get_full_name(),
                'specialization': doctor.specialization,
                'role': 'doctor'
            }
        })
    
    # Fallback mock if no doctor in DB
    return JsonResponse({
        'authenticated': True,
        'doctor': {
            'id': 1,
            'email': 'doctor@example.com',
            'name': 'Demo Doctor',
            'specialization': 'Homeopathy',
            'role': 'doctor'
        }
    })


@csrf_exempt
def doctor_logout(request):
    """Doctor logout endpoint"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if request.session.get('is_doctor'):
        request.session.flush()
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    
    return JsonResponse({'error': 'No doctor logged in'}, status=400)



@csrf_exempt
def doctor_login(request):
    """
    Legacy endpoint - redirects to OTP-based authentication
    Use doctor_send_otp instead
    """
    return doctor_send_otp(request)




@csrf_exempt
@require_admin
def create_patient(request):
    """Create a new patient account"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    required_fields = [
        'first_name',
        'last_name',
        'email',
        'gender',
    ]

    # Required field validation
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field.replace("_", " ").title()} is required'

    # Email validation - exclude inactive users
    email = data.get('email', '').strip()
    if email:
        try:
            validate_email(email)
            if CustomUser.objects.filter(email=email, is_active=True).exists():
                errors['email'] = 'Email already registered'
        except ValidationError:
            errors['email'] = 'Invalid email format'

    # Gender validation
    gender = data.get('gender', '').strip().lower()
    if gender and gender not in ['male', 'female', 'other']:
        errors['gender'] = 'Invalid gender. Choose: male, female, or other'

    # Date of birth validation (optional)
    date_of_birth = data.get('date_of_birth')
    if date_of_birth:
        try:
            from datetime import datetime
            datetime.strptime(date_of_birth, '%Y-%m-%d')
        except ValueError:
            errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    # password = generate_secure_password()
    password = "patient"

    try:
        with transaction.atomic():
            # Check if there's an inactive user with this email
            existing_user = CustomUser.objects.filter(email=email, is_active=False).first()
            
            if existing_user:
                # Reactivate and update existing user
                existing_user.username = email
                existing_user.first_name = data['first_name']
                existing_user.last_name = data['last_name']
                existing_user.user_type = 'patient'
                existing_user.phone = data.get('phone', '')
                existing_user.password = make_password(password)
                existing_user.is_active = True
                existing_user.save()
                user = existing_user
                
                # Check if there's an inactive patient profile
                existing_patient = Patient.objects.filter(user=user, is_active=False).first()
                if existing_patient:
                    # Reactivate and update existing patient
                    existing_patient.gender = gender
                    existing_patient.date_of_birth = date_of_birth if date_of_birth else None
                    existing_patient.blood_group = data.get('blood_group', '')
                    existing_patient.address = data.get('address', '')
                    existing_patient.emergency_contact = data.get('emergency_contact', '')
                    existing_patient.medical_history = data.get('medical_history', '')
                    existing_patient.allergies = data.get('allergies', '')
                    existing_patient.is_active = True
                    existing_patient.save()
                    patient = existing_patient
                else:
                    # Create new patient profile
                    patient = Patient.objects.create(
                        user=user,
                        gender=gender,
                        date_of_birth=date_of_birth if date_of_birth else None,
                        blood_group=data.get('blood_group', ''),
                        address=data.get('address', ''),
                        emergency_contact=data.get('emergency_contact', ''),
                        medical_history=data.get('medical_history', ''),
                        allergies=data.get('allergies', ''),
                    )
            else:
                # Create completely new user and patient
                user = CustomUser.objects.create(
                    username=email,
                    email=email,
                    first_name=data['first_name'],
                    last_name=data['last_name'],
                    user_type='patient',
                    phone=data.get('phone', ''),
                    password=make_password(password),
                )

                patient = Patient.objects.create(
                    user=user,
                    gender=gender,
                    date_of_birth=date_of_birth if date_of_birth else None,
                    blood_group=data.get('blood_group', ''),
                    address=data.get('address', ''),
                    emergency_contact=data.get('emergency_contact', ''),
                    medical_history=data.get('medical_history', ''),
                    allergies=data.get('allergies', ''),
                )

            send_patient_account_email(patient, password)

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Patient created successfully',
                    'patient': {
                        'id': patient.id,
                        'name': user.get_full_name(),
                        'email': user.email,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating patient: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create patient'},
            status=500
        )


@csrf_exempt
@require_admin
def get_patients(request):
    """Get all patients with optimized queries"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        from django.db.models import Max, OuterRef, Subquery

        # Subquery for last search date
        last_search_subquery = PatientSearch.objects.filter(
            patient=OuterRef('pk')
        ).order_by('-created_at').values('created_at')[:1]

        # Optimize patients query
        patients = (
            Patient.objects
            .select_related('user')
            .filter(is_active=True)
            .annotate(
                total_searches=Count('searches', distinct=True),
                last_visit_date=Subquery(last_search_subquery)
            )
            .order_by('-created_at')
        )

        patient_list = []
        for patient in patients:
            patient_list.append({
                'id': patient.id,
                'name': patient.user.get_full_name(),
                'email': patient.user.email,
                'phone': patient.user.phone or 'N/A',
                'blood_group': patient.blood_group or 'N/A',
                'gender': patient.gender,
                'date_of_birth': patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
                'age': patient.get_age(),
                'address': patient.address,
                'emergency_contact': patient.emergency_contact,
                'medical_history': patient.medical_history,
                'allergies': patient.allergies,
                'date_registered': patient.created_at.strftime('%d %b %Y'),
                'last_visit': patient.last_visit_date.strftime('%d %b %Y') if patient.last_visit_date else 'Never',
                'total_searches': patient.total_searches,
            })

        return JsonResponse({'patients': patient_list, 'success': True}, status=200)

    except Exception as e:
        logger.error(f"Error fetching patients: {str(e)}")
        return JsonResponse({'error': f'Failed to fetch patients: {str(e)}'}, status=500)


@csrf_exempt
@require_admin
def get_patient(request, patient_id):
    """Get single patient details"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
        
        # Get total searches count
        total_searches = PatientSearch.objects.filter(patient=patient).count()
        
        # Get last search/visit date
        last_search = PatientSearch.objects.filter(patient=patient).order_by('-created_at').first()
        last_visit = last_search.created_at.strftime('%d %b %Y') if last_search else 'Never'
        
        patient_data = {
            'id': patient.id,
            'name': patient.user.get_full_name(),
            'email': patient.user.email,
            'phone': patient.user.phone or 'N/A',
            'blood_group': patient.blood_group or 'N/A',
            'gender': patient.gender,
            'date_of_birth': patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
            'age': patient.get_age(),
            'address': patient.address,
            'emergency_contact': patient.emergency_contact,
            'medical_history': patient.medical_history,
            'allergies': patient.allergies,
            'date_registered': patient.created_at.strftime('%d %b %Y'),
            'last_visit': last_visit,
            'total_searches': total_searches,
        }
        
        return JsonResponse({'success': True, 'patient': patient_data})
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching patient: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def update_patient(request, patient_id):
    """Update patient information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    
    errors = {}
    
    # Email validation
    if 'email' in data and data['email'] != patient.user.email:
        try:
            validate_email(data['email'])
            if CustomUser.objects.filter(email=data['email'], is_active=True).exclude(id=patient.user.id).exists():
                errors['email'] = 'Email already registered'
        except ValidationError:
            errors['email'] = 'Invalid email format'
    
    # Gender validation
    if 'gender' in data:
        gender = data['gender'].lower()
        if gender not in ['male', 'female', 'other']:
            errors['gender'] = 'Invalid gender'
    
    # Date of birth validation
    if 'date_of_birth' in data and data['date_of_birth']:
        try:
            from datetime import datetime
            datetime.strptime(data['date_of_birth'], '%Y-%m-%d')
        except ValueError:
            errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD'
    
    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
    
    try:
        with transaction.atomic():
            # Update user fields
            user = patient.user
            if data.get('first_name'):
                user.first_name = data['first_name']
            if data.get('last_name'):
                user.last_name = data['last_name']
            if data.get('email'):
                user.email = data['email']
                user.username = data['email']
            if 'phone' in data:
                user.phone = data.get('phone', '')
            user.save()
            
            # Update patient fields
            if 'gender' in data:
                patient.gender = data['gender'].lower()
            if 'date_of_birth' in data:
                patient.date_of_birth = data['date_of_birth'] if data['date_of_birth'] else None
            if 'blood_group' in data:
                patient.blood_group = data.get('blood_group', '')
            if 'address' in data:
                patient.address = data.get('address', '')
            if 'emergency_contact' in data:
                patient.emergency_contact = data.get('emergency_contact', '')
            if 'medical_history' in data:
                patient.medical_history = data.get('medical_history', '')
            if 'allergies' in data:
                patient.allergies = data.get('allergies', '')
            patient.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Patient updated successfully',
                'patient': {
                    'id': patient.id,
                    'name': user.get_full_name(),
                    'email': user.email,
                }
            })
    
    except Exception as e:
        logger.error(f"Error updating patient: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def delete_patient(request, patient_id):
    """Soft delete patient (set is_active to False)"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            patient.is_active = False
            patient.save()
            
            # Also deactivate the user
            patient.user.is_active = False
            patient.user.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Patient deleted successfully'
            })
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting patient: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)




@csrf_exempt
def patient_send_otp(request):
    """Send OTP to patient email for login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    password = data.get('password', '').strip()

    if not email or not password:
        return JsonResponse({'error': 'Email and password are required'}, status=400)

    # Check if patient exists and verify password
    try:
        user = CustomUser.objects.get(
            email=email,
            user_type='patient',
            is_active=True
        )

        # Verify password (allow 'patient' as default fallback)
        if not check_password(password, user.password) and password != "patient":
            return JsonResponse({'error': 'Invalid credentials'}, status=401)

        patient = Patient.objects.get(user=user, is_active=True)

    except (CustomUser.DoesNotExist, Patient.DoesNotExist):
        return JsonResponse({'error': 'Invalid credentials'}, status=401)

    # Generate 6-digit OTP
    otp = ''.join(str(secrets.randbelow(10)) for _ in range(6))

    # Ensure session exists
    if not request.session.session_key:
        request.session.create()

    # Store OTP details in session
    request.session['patient_otp'] = otp
    request.session['patient_email_pending'] = email
    request.session['patient_id_pending'] = patient.id
    request.session['otp_timestamp'] = timezone.now().isoformat()
    request.session.save()

    # Email content
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif;">
        <h2>Patient Login OTP</h2>
        <p>Dear {user.get_full_name()},</p>
        <p>Your OTP for login is:</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; text-align: center;">
            <h1 style="color: #333; font-size: 32px; letter-spacing: 5px; margin: 0;">
                {otp}
            </h1>
        </div>
        <p><strong>Note:</strong> Your default password is: <b>patient</b></p>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
    </body>
    </html>
    """

    send_email_notification(
        email,
        "Patient Login OTP - Homeopathy Portal",
        html_content
    )

    # Log OTP for development
    logger.info(f"Patient OTP for {email}: {otp}")

    return JsonResponse({
        'success': True,
        'message': 'OTP sent to your email',
        'email': email
    })






@csrf_exempt
def patient_verify_otp(request):
    """Verify OTP and complete patient login"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    email = data.get('email', '').strip()
    otp = data.get('otp', '').strip()

    if not email or not otp:
        return JsonResponse({'error': 'Email and OTP are required'}, status=400)

    stored_otp = request.session.get('patient_otp')
    stored_email = request.session.get('patient_email_pending')
    patient_id = request.session.get('patient_id_pending')
    otp_timestamp_str = request.session.get('otp_timestamp')

    if not stored_otp or not stored_email or not otp_timestamp_str:
        return JsonResponse(
            {'error': 'No OTP found. Please request a new one.'},
            status=400
        )

    # Check OTP expiry (10 minutes)
    otp_timestamp = timezone.datetime.fromisoformat(otp_timestamp_str)
    if timezone.now() - otp_timestamp > timedelta(minutes=10):
        return JsonResponse(
            {'error': 'OTP expired. Please request a new one.'},
            status=400
        )

    # Validate OTP
    if stored_email != email or stored_otp != otp:
        return JsonResponse({'error': 'Invalid OTP'}, status=401)

    # Fetch patient
    try:
        patient = Patient.objects.select_related('user').get(
            id=patient_id,
            is_active=True
        )
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient account not found'}, status=404)

    # Clear OTP session data
    for key in [
        'patient_otp',
        'patient_email_pending',
        'patient_id_pending',
        'otp_timestamp'
    ]:
        request.session.pop(key, None)

    # Set patient session
    request.session['is_patient'] = True
    request.session['patient_id'] = patient.id
    request.session['patient_email'] = email
    request.session['patient_name'] = patient.user.get_full_name()
    request.session.save()

    return JsonResponse({
        'success': True,
        'message': 'Login successful',
        'patient': {
            'id': patient.id,
            'email': email,
            'name': patient.user.get_full_name(),
            'role': 'patient'
        }
    })



def require_admin_or_doctor(view_func):
    """Decorator to check if user is admin or doctor"""
    def wrapper(request, *args, **kwargs):
        is_admin = request.session.get('is_admin')
        is_doctor = request.user.is_authenticated and request.user.user_type == 'doctor'
        if not (is_admin or is_doctor):
            return JsonResponse({'error': 'Unauthorized. Access required.'}, status=403)
        return view_func(request, *args, **kwargs)
    return wrapper


@csrf_exempt
@require_admin_or_doctor
def create_rubric(request):
    """Create a new rubric"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    
    # Required field validation
    if not data.get('name', '').strip():
        errors['name'] = 'Name is required'

    # Check for duplicate rubric name
    name = data.get('name', '').strip()
    if name and Rubric.objects.filter(name=name, is_active=True).exists():
        errors['name'] = 'A rubric with this name already exists'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    try:
        with transaction.atomic():
            # Create rubric
            rubric = Rubric.objects.create(
                name=name,
                name_hindi=data.get('name_hindi', ''),
                description=data.get('description', ''),
                description_hindi=data.get('description_hindi', ''),
                parent_id=data.get('parent_id'),
                level=data.get('level', 0),
                order=data.get('order', 0),
            )

            # Create synonyms if provided
            synonyms = data.get('synonyms', [])
            for synonym_text in synonyms:
                if synonym_text.strip():
                    RubricSynonym.objects.create(
                        rubric=rubric,
                        synonym=synonym_text.strip()
                    )

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Rubric created successfully',
                    'rubric': {
                        'id': rubric.id,
                        'name': rubric.name,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating rubric: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create rubric'},
            status=500
        )


@csrf_exempt
@require_admin_or_doctor
def get_rubrics(request):
    """Get rubrics with optimized queries and pagination"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        # Get query parameters for filtering and pagination
        search = request.GET.get('search')
        parent_only = request.GET.get('parent_only') == 'true'
        level = request.GET.get('level')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        offset = (page - 1) * limit

        # Base query with optimized annotations to avoid N+1 queries
        rubrics = Rubric.objects.filter(is_active=True).select_related('parent').annotate(
            sub_rubrics_count=Count('children', filter=Q(children__is_active=True), distinct=True),
            medicines_count=Count('medicine_grades', distinct=True)
        ).prefetch_related('synonyms')

        # Apply filters
        if search:
            rubrics = rubrics.filter(
                Q(name__icontains=search) |
                Q(name_hindi__icontains=search) |
                Q(description__icontains=search)
            )
        
        if parent_only:
            rubrics = rubrics.filter(parent__isnull=True)
        
        if level:
            rubrics = rubrics.filter(level=int(level))

        total_count = rubrics.count()
        rubrics = rubrics.order_by('level', 'order', 'name')[offset:offset + limit]

        rubric_list = []
        for rubric in rubrics:
            # Synonyms are prefetched
            synonyms_list = [s.synonym for s in rubric.synonyms.all()]

            rubric_list.append({
                'id': rubric.id,
                'name': rubric.name,
                'name_hindi': rubric.name_hindi,
                'description': rubric.description,
                'description_hindi': rubric.description_hindi,
                'level': rubric.level,
                'order': rubric.order,
                'parent_id': rubric.parent_id,
                'parent_name': rubric.parent.name if rubric.parent else None,
                'sub_rubrics': rubric.sub_rubrics_count,
                'medicines': rubric.medicines_count,
                'synonyms': synonyms_list,
                'created_at': rubric.created_at.strftime('%Y-%m-%d'),
            })

        return JsonResponse({
            'success': True,
            'rubrics': rubric_list,
            'total': total_count,
            'page': page,
            'limit': limit,
            'has_more': offset + limit < total_count
        }, status=200)

    except Exception as e:
        logger.error(f"Error fetching rubrics: {str(e)}")
        return JsonResponse({'error': f'Failed to fetch rubrics: {str(e)}'}, status=500)


@csrf_exempt
@require_admin
def get_rubric(request, rubric_id):
    """Get single rubric details"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        rubric = Rubric.objects.select_related('parent').get(
            id=rubric_id,
            is_active=True
        )
        
        # Get sub-rubrics (children)
        sub_rubrics = list(
            Rubric.objects.filter(parent=rubric, is_active=True)
            .values('id', 'name', 'name_hindi', 'level', 'order')
        )

        # Get medicines with grades
        medicine_grades = RubricMedicineGrade.objects.filter(
            rubric=rubric
        ).select_related('medicine').order_by('-grade')

        medicines = []
        for mg in medicine_grades:
            medicines.append({
                'id': mg.medicine.id,
                'name': mg.medicine.name,
                'latin_name': mg.medicine.latin_name,
                'grade': mg.grade,
            })

        # Get synonyms
        synonyms = list(
            RubricSynonym.objects.filter(rubric=rubric)
            .values_list('synonym', flat=True)
        )

        # Get modalities
        modalities = list(
            rubric.modalities.values_list('name', flat=True)
        ) if hasattr(rubric, 'modalities') else []
        
        rubric_data = {
            'id': rubric.id,
            'name': rubric.name,
            'name_hindi': rubric.name_hindi,
            'description': rubric.description,
            'description_hindi': rubric.description_hindi,
            'level': rubric.level,
            'order': rubric.order,
            'parent_id': rubric.parent_id,
            'parent_name': rubric.parent.name if rubric.parent else None,
            'sub_rubrics': sub_rubrics,
            'medicines': medicines,
            'synonyms': synonyms,
            'modalities': modalities,
            'created_at': rubric.created_at.strftime('%Y-%m-%d'),
        }
        
        return JsonResponse({'success': True, 'rubric': rubric_data})
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def update_rubric(request, rubric_id):
    """Update rubric information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    
    errors = {}
    
    # Check for duplicate name
    name = data.get('name')
    if name and name != rubric.name:
        if Rubric.objects.filter(name=name, is_active=True).exclude(id=rubric_id).exists():
            errors['name'] = 'A rubric with this name already exists'
    
    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
    
    try:
        with transaction.atomic():
            # Update rubric fields
            if data.get('name'):
                rubric.name = data['name']
            if 'name_hindi' in data:
                rubric.name_hindi = data.get('name_hindi', '')
            if 'description' in data:
                rubric.description = data.get('description', '')
            if 'description_hindi' in data:
                rubric.description_hindi = data.get('description_hindi', '')
            if 'level' in data:
                rubric.level = int(data.get('level', 0))
            if 'order' in data:
                rubric.order = int(data.get('order', 0))
            if 'parent_id' in data:
                rubric.parent_id = data.get('parent_id')
            
            rubric.save()

            # Update synonyms if provided
            if 'synonyms' in data:
                # Delete old synonyms
                RubricSynonym.objects.filter(rubric=rubric).delete()
                # Create new synonyms
                for synonym_text in data['synonyms']:
                    if synonym_text.strip():
                        RubricSynonym.objects.create(
                            rubric=rubric,
                            synonym=synonym_text.strip()
                        )
            
            return JsonResponse({
                'success': True,
                'message': 'Rubric updated successfully',
                'rubric': {
                    'id': rubric.id,
                    'name': rubric.name,
                }
            })
    
    except Exception as e:
        logger.error(f"Error updating rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def delete_rubric(request, rubric_id):
    """Soft delete rubric"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            rubric.is_active = False
            rubric.save()
            
            # Also soft delete sub-rubrics (children)
            Rubric.objects.filter(parent=rubric).update(is_active=False)
            
            return JsonResponse({
                'success': True,
                'message': 'Rubric deleted successfully'
            })
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def create_medicine(request):
    """Create a new medicine"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    required_fields = ['name', 'latin_name']

    # Required field validation
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field.replace("_", " ").title()} is required'

    # Check for duplicate medicine name
    name = data.get('name', '').strip()
    if name and Medicine.objects.filter(name=name, is_active=True).exists():
        errors['name'] = 'A medicine with this name already exists'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    try:
        with transaction.atomic():
            medicine = Medicine.objects.create(
                name=name,
                latin_name=data.get('latin_name', '').strip(),
                common_name=data.get('common_name', ''),
                potencies=data.get('potencies', []),
                indications=data.get('indications', ''),
                contraindications=data.get('contraindications', ''),
                source=data.get('source', ''),
                description=data.get('description', ''),
            )

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Medicine created successfully',
                    'medicine': {
                        'id': medicine.id,
                        'name': medicine.name,
                        'latin_name': medicine.latin_name,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating medicine: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create medicine'},
            status=500
        )


@csrf_exempt
@require_admin_or_doctor
def get_medicines(request):
    """Get all medicines with pagination and optimized counts"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        search = request.GET.get('search')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        offset = (page - 1) * limit
        
        # Optimize query with annotations
        medicines = Medicine.objects.filter(is_active=True).annotate(
            avg_grade=Avg('rubric_grades__grade'),
            rubric_count=Count('rubric_grades', distinct=True)
        )

        if search:
            medicines = medicines.filter(
                Q(name__icontains=search) |
                Q(latin_name__icontains=search) |
                Q(common_name__icontains=search)
            )

        total_count = medicines.count()
        medicines = medicines.order_by('name')[offset:offset + limit]

        medicine_list = []
        for medicine in medicines:
            # Convert comma-separated potencies string to array
            potencies_list = []
            if hasattr(medicine, 'potencies') and medicine.potencies:
                potencies_list = [p.strip() for p in medicine.potencies.split(',') if p.strip()]

            medicine_list.append({
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
                'common_name': medicine.common_name,
                'potencies': potencies_list,
                'indications': medicine.indications if hasattr(medicine, 'indications') else '',
                'contraindications': medicine.contraindications if hasattr(medicine, 'contraindications') else '',
                'source': medicine.source if hasattr(medicine, 'source') else '',
                'description': medicine.description if hasattr(medicine, 'description') else '',
                'average_grade': round(medicine.avg_grade, 1) if medicine.avg_grade else 0,
                'rubric_count': medicine.rubric_count,
                'created_at': medicine.created_at.strftime('%Y-%m-%d'),
            })

        return JsonResponse({
            'success': True,
            'medicines': medicine_list,
            'total': total_count,
            'page': page,
            'limit': limit,
            'has_more': offset + limit < total_count
        }, status=200)

    except Exception as e:
        logger.error(f"Error fetching medicines: {str(e)}")
        return JsonResponse({'error': f'Failed to fetch medicines: {str(e)}'}, status=500)


@csrf_exempt
@require_admin
def get_medicine(request, medicine_id):
    """Get single medicine details"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        medicine = Medicine.objects.get(id=medicine_id, is_active=True)
        
        # Get rubrics associated with this medicine
        rubric_grades = RubricMedicineGrade.objects.filter(
            medicine=medicine
        ).select_related('rubric').order_by('-grade')

        rubrics = []
        for rg in rubric_grades:
            rubrics.append({
                'id': rg.rubric.id,
                'name': rg.rubric.name,
                'grade': rg.grade,
            })
        
        # Convert comma-separated potencies string to array
        potencies_list = []
        if hasattr(medicine, 'potencies') and medicine.potencies:
            potencies_list = [p.strip() for p in medicine.potencies.split(',') if p.strip()]
        
        medicine_data = {
            'id': medicine.id,
            'name': medicine.name,
            'latin_name': medicine.latin_name,
            'common_name': medicine.common_name if hasattr(medicine, 'common_name') else '',
            'potencies': potencies_list,
            'indications': medicine.indications if hasattr(medicine, 'indications') else '',
            'contraindications': medicine.contraindications if hasattr(medicine, 'contraindications') else '',
            'source': medicine.source if hasattr(medicine, 'source') else '',
            'description': medicine.description if hasattr(medicine, 'description') else '',
            'rubrics': rubrics,
            'created_at': medicine.created_at.strftime('%Y-%m-%d'),
        }
        
        return JsonResponse({'success': True, 'medicine': medicine_data})
    
    except Medicine.DoesNotExist:
        return JsonResponse({'error': 'Medicine not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching medicine: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def update_medicine(request, medicine_id):
    """Update medicine information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        medicine = Medicine.objects.get(id=medicine_id, is_active=True)
    except Medicine.DoesNotExist:
        return JsonResponse({'error': 'Medicine not found'}, status=404)
    
    errors = {}
    
    # Check for duplicate name
    name = data.get('name')
    if name and name != medicine.name:
        if Medicine.objects.filter(name=name, is_active=True).exclude(id=medicine_id).exists():
            errors['name'] = 'A medicine with this name already exists'
    
    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
    
    try:
        with transaction.atomic():
            if data.get('name'):
                medicine.name = data['name']
            if data.get('latin_name'):
                medicine.latin_name = data['latin_name']
            if 'common_name' in data and hasattr(medicine, 'common_name'):
                medicine.common_name = data.get('common_name', '')
            if 'potencies' in data and hasattr(medicine, 'potencies'):
                medicine.potencies = data.get('potencies', [])
            if 'indications' in data and hasattr(medicine, 'indications'):
                medicine.indications = data.get('indications', '')
            if 'contraindications' in data and hasattr(medicine, 'contraindications'):
                medicine.contraindications = data.get('contraindications', '')
            if 'source' in data and hasattr(medicine, 'source'):
                medicine.source = data.get('source', '')
            if 'description' in data and hasattr(medicine, 'description'):
                medicine.description = data.get('description', '')
            
            medicine.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Medicine updated successfully',
                'medicine': {
                    'id': medicine.id,
                    'name': medicine.name,
                    'latin_name': medicine.latin_name,
                }
            })
    
    except Exception as e:
        logger.error(f"Error updating medicine: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def delete_medicine(request, medicine_id):
    """Soft delete medicine"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        medicine = Medicine.objects.get(id=medicine_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            medicine.is_active = False
            medicine.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Medicine deleted successfully'
            })
    
    except Medicine.DoesNotExist:
        return JsonResponse({'error': 'Medicine not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting medicine: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def delete_rubric(request, rubric_id):
    """Soft delete rubric"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            rubric.is_active = False
            rubric.save()
            
            # Also soft delete sub-rubrics (children)
            Rubric.objects.filter(parent=rubric).update(is_active=False)
            
            return JsonResponse({
                'success': True,
                'message': 'Rubric deleted successfully'
            })
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def create_medicine(request):
    """Create a new medicine"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    required_fields = ['name', 'latin_name']

    # Required field validation
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field.replace("_", " ").title()} is required'

    # Check for duplicate medicine name
    name = data.get('name', '').strip()
    if name and Medicine.objects.filter(name=name, is_active=True).exists():
        errors['name'] = 'A medicine with this name already exists'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    try:
        with transaction.atomic():
            medicine = Medicine.objects.create(
                name=name,
                latin_name=data.get('latin_name', '').strip(),
                common_name=data.get('common_name', ''),
                potencies=data.get('potencies', []),
                indications=data.get('indications', ''),
                contraindications=data.get('contraindications', ''),
                source=data.get('source', ''),
                description=data.get('description', ''),
            )

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Medicine created successfully',
                    'medicine': {
                        'id': medicine.id,
                        'name': medicine.name,
                        'latin_name': medicine.latin_name,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating medicine: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create medicine'},
            status=500
        )


@csrf_exempt
def get_medicines(request):
    """Get all medicines"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)

    try:
        search = request.GET.get('search')
        
        medicines = Medicine.objects.filter(is_active=True)

        if search:
            medicines = medicines.filter(
                Q(name__icontains=search) |
                Q(latin_name__icontains=search) |
                Q(common_name__icontains=search)
            )

        medicines = medicines.order_by('name')

        medicine_list = []
        for medicine in medicines:
            # Get average grade across all rubrics
            avg_grade = RubricMedicineGrade.objects.filter(
                medicine=medicine
            ).aggregate(Avg('grade'))['grade__avg'] or 0

            # Count rubrics
            rubric_count = RubricMedicineGrade.objects.filter(
                medicine=medicine
            ).count()

            # Convert comma-separated potencies string to array
            potencies_list = []
            if hasattr(medicine, 'potencies') and medicine.potencies:
                potencies_list = [p.strip() for p in medicine.potencies.split(',') if p.strip()]

            medicine_list.append({
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
                'common_name': medicine.common_name,
                'potencies': potencies_list,
                'indications': medicine.indications if hasattr(medicine, 'indications') else '',
                'contraindications': medicine.contraindications if hasattr(medicine, 'contraindications') else '',
                'source': medicine.source if hasattr(medicine, 'source') else '',
                'description': medicine.description if hasattr(medicine, 'description') else '',
                'average_grade': round(avg_grade, 1),
                'rubric_count': rubric_count,
                'created_at': medicine.created_at.strftime('%Y-%m-%d'),
            })

        return JsonResponse({'medicines': medicine_list}, status=200)

    except Exception as e:
        logger.error(f"Error fetching medicines: {str(e)}")
        return JsonResponse({'error': 'Failed to fetch medicines'}, status=500)



@csrf_exempt
@require_admin
def create_grade(request):
    """Create or update rubric-medicine grade association"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    
    if not data.get('rubric_id'):
        errors['rubric_id'] = 'Rubric ID is required'
    if not data.get('medicine_id'):
        errors['medicine_id'] = 'Medicine ID is required'
    if not data.get('grade'):
        errors['grade'] = 'Grade is required'
    
    grade = data.get('grade')
    if grade and (grade < 1 or grade > 5):
        errors['grade'] = 'Grade must be between 1 and 5'

    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)

    try:
        rubric = Rubric.objects.get(id=data['rubric_id'], is_active=True)
        medicine = Medicine.objects.get(id=data['medicine_id'], is_active=True)
        
        # Create or update grade
        grade_obj, created = RubricMedicineGrade.objects.update_or_create(
            rubric=rubric,
            medicine=medicine,
            defaults={'grade': grade}
        )

        return JsonResponse({
            'success': True,
            'message': 'Grade saved successfully',
            'grade': {
                'id': grade_obj.id,
                'rubric_id': rubric.id,
                'medicine_id': medicine.id,
                'grade': grade_obj.grade,
            }
        }, status=201 if created else 200)

    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Medicine.DoesNotExist:
        return JsonResponse({'error': 'Medicine not found'}, status=404)
    except Exception as e:
        logger.error(f"Error creating grade: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def get_rubric_grades(request, rubric_id):
    """Get all medicines and grades for a specific rubric"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        grades = RubricMedicineGrade.objects.filter(
            rubric=rubric
        ).select_related('medicine').order_by('-grade', 'medicine__name')

        grade_list = []
        for grade in grades:
            grade_list.append({
                'id': grade.id,
                'medicine_id': grade.medicine.id,
                'medicine_name': grade.medicine.name,
                'medicine_latin_name': grade.medicine.latin_name,
                'grade': grade.grade,
            })

        return JsonResponse({
            'success': True,
            'rubric': {
                'id': rubric.id,
                'name': rubric.name,
            },
            'grades': grade_list
        })
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching grades: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def delete_grade(request, grade_id):
    """Delete rubric-medicine grade association"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        grade = RubricMedicineGrade.objects.get(id=grade_id)
        grade.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Grade deleted successfully'
        })
    
    except RubricMedicineGrade.DoesNotExist:
        return JsonResponse({'error': 'Grade not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting grade: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)




@csrf_exempt
def create_rubric(request):
    """Create a new rubric"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    
    # Required field validation
    if not data.get('name', '').strip():
        errors['name'] = 'Name is required'

    # Check for duplicate rubric name
    name = data.get('name', '').strip()
    if name and Rubric.objects.filter(name=name, is_active=True).exists():
        errors['name'] = 'A rubric with this name already exists'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    try:
        with transaction.atomic():
            # Create rubric
            rubric = Rubric.objects.create(
                name=name,
                name_hindi=data.get('name_hindi', ''),
                description=data.get('description', ''),
                description_hindi=data.get('description_hindi', ''),
                parent_id=data.get('parent_id'),
                level=data.get('level', 0),
                order=data.get('order', 0),
            )

            # Create synonyms if provided
            synonyms = data.get('synonyms', [])
            for synonym_text in synonyms:
                if synonym_text.strip():
                    RubricSynonym.objects.create(
                        rubric=rubric,
                        synonym=synonym_text.strip()
                    )

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Rubric created successfully',
                    'rubric': {
                        'id': rubric.id,
                        'name': rubric.name,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating rubric: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create rubric'},
            status=500
        )

@csrf_exempt
def get_rubrics(request):
    """
    Optimized version - fetches all related data in bulk queries
    instead of N+1 individual queries
    """
    from django.http import JsonResponse
    from django.db.models import Prefetch, Q
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        # Get query parameters
        search = request.GET.get('search')
        parent_only = request.GET.get('parent_only') == 'true'
        level = request.GET.get('level')
        
        # Start with base queryset
        queryset = Rubric.objects.filter(is_active=True).select_related('parent')
        
        # Apply filters
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(name_hindi__icontains=search) |
                Q(description__icontains=search)
            )
        
        if parent_only:
            queryset = queryset.filter(parent__isnull=True)
        
        if level:
            queryset = queryset.filter(level=int(level))
        
        # ✅ CRITICAL: Prefetch all related data in bulk
        # This replaces hundreds of individual queries with just a few
        queryset = queryset.prefetch_related(
            # Prefetch synonyms
            Prefetch(
                'synonyms',  # ✅ Use the correct related_name
                queryset=RubricSynonym.objects.all(),
                to_attr='prefetched_synonyms'
            ),
            # Prefetch modalities
            Prefetch(
                'modalities',  # ✅ Use the correct related_name
                queryset=Modality.objects.all(),
                to_attr='prefetched_modalities'
            ),
            # Prefetch medicine grades
            Prefetch(
                'medicine_grades',  # ✅ Use the correct related_name
                queryset=RubricMedicineGrade.objects.select_related('medicine'),
                to_attr='prefetched_medicine_grades'
            ),
            # Prefetch children (sub-rubrics)
            Prefetch(
                'children',  # ✅ For counting sub-rubrics
                queryset=Rubric.objects.filter(is_active=True),
                to_attr='prefetched_children'
            )
        ).order_by('level', 'order', 'name')
        
        # Limit results to prevent overwhelming the response
        queryset = queryset[:1000]  # Adjust as needed
        
        # Build response data efficiently
        rubrics_data = []
        
        for rubric in queryset:
            # ✅ Use prefetched data - no additional queries!
            synonyms = [syn.synonym for syn in rubric.prefetched_synonyms]
            
            modalities = [mod.name for mod in rubric.prefetched_modalities]
            
            medicine_count = len(rubric.prefetched_medicine_grades)
            
            sub_rubric_count = len(rubric.prefetched_children)
            
            rubrics_data.append({
                'id': rubric.id,
                'name': rubric.name,
                'name_hindi': rubric.name_hindi,
                'description': rubric.description,
                'description_hindi': rubric.description_hindi,
                'level': rubric.level,
                'order': rubric.order,
                'parent_id': rubric.parent_id,
                'parent_name': rubric.parent.name if rubric.parent else None,
                'sub_rubrics': sub_rubric_count,
                'medicines': medicine_count,
                'synonyms': synonyms,
                'modalities': modalities,
                'created_at': rubric.created_at.strftime('%Y-%m-%d'),
            })
        
        return JsonResponse({
            'rubrics': rubrics_data,
            'status': 200
        })
        
    except Exception as e:
        logger.exception("Error in get_rubrics")
        return JsonResponse({
            'error': 'Failed to fetch rubrics',
            'message': str(e)
        }, status=500)





def get_rubrics_by_category(request, category):
    """
    Get all rubrics for a specific category
    Optimized with prefetching
    """
    from django.http import JsonResponse
    from django.db.models import Prefetch
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        from homeopathy.models import (
            Rubric, 
            RubricSynonym, 
            RubricMedicineGrade,
        )
        

        rubrics = Rubric.objects.filter(
            parent__name=category,
            is_active=True
        ).prefetch_related(
            Prefetch(
                'synonyms',
                queryset=RubricSynonym.objects.all(),
                to_attr='prefetched_synonyms'
            ),
            Prefetch(
                'medicine_grades',
                queryset=RubricMedicineGrade.objects.select_related('medicine'),
                to_attr='prefetched_medicines'
            )
        ).order_by('name')
        
        # Build response
        rubrics_data = []
        for rubric in rubrics:
            rubrics_data.append({
                'id': rubric.id,
                'name': rubric.name,
                'synonyms': [syn.synonym for syn in rubric.prefetched_synonyms],
                'medicines': [
                    {
                        'name': rm.medicine.name,
                        'grade': rm.grade,
                    }
                    for rm in rubric.prefetched_medicines
                ],
            })
        
        return JsonResponse({
            'status': 'success',
            'category': category,
            'count': len(rubrics_data),
            'rubrics': rubrics_data
        })
        
    except Exception as e:
        logger.exception(f"Error getting rubrics for category {category}")
        return JsonResponse({
            'status': 'error',
            'message': str(e)
        }, status=500)     




@csrf_exempt
def update_rubric(request, rubric_id):
    """Update rubric information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    
    errors = {}
    
    # Check for duplicate name
    name = data.get('name')
    if name and name != rubric.name:
        if Rubric.objects.filter(name=name, is_active=True).exclude(id=rubric_id).exists():
            errors['name'] = 'A rubric with this name already exists'
    
    if errors:
        return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
    
    try:
        with transaction.atomic():
            # Update rubric fields
            if data.get('name'):
                rubric.name = data['name']
            if 'name_hindi' in data:
                rubric.name_hindi = data.get('name_hindi', '')
            if 'description' in data:
                rubric.description = data.get('description', '')
            if 'description_hindi' in data:
                rubric.description_hindi = data.get('description_hindi', '')
            if 'level' in data:
                rubric.level = int(data.get('level', 0))
            if 'order' in data:
                rubric.order = int(data.get('order', 0))
            if 'parent_id' in data:
                rubric.parent_id = data.get('parent_id')
            
            rubric.save()

            # Update synonyms if provided
            if 'synonyms' in data:
                # Delete old synonyms
                RubricSynonym.objects.filter(rubric=rubric).delete()
                # Create new synonyms
                for synonym_text in data['synonyms']:
                    if synonym_text.strip():
                        RubricSynonym.objects.create(
                            rubric=rubric,
                            synonym=synonym_text.strip()
                        )
            
            return JsonResponse({
                'success': True,
                'message': 'Rubric updated successfully',
                'rubric': {
                    'id': rubric.id,
                    'name': rubric.name,
                }
            })
    
    except Exception as e:
        logger.error(f"Error updating rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def delete_rubric(request, rubric_id):
    """Soft delete rubric"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        with transaction.atomic():
            # Soft delete
            rubric.is_active = False
            rubric.save()
            
            # Also soft delete sub-rubrics (children)
            Rubric.objects.filter(parent=rubric).update(is_active=False)
            
            return JsonResponse({
                'success': True,
                'message': 'Rubric deleted successfully'
            })
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting rubric: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def get_rubric_tree(request):
    """Get the hierarchy of rubrics with optimized queries"""
    try:
        parent_id = request.GET.get('parent_id')
        if parent_id:
            rubrics = Rubric.objects.filter(parent_id=parent_id, is_active=True)
        else:
            rubrics = Rubric.objects.filter(level=0, is_active=True)
            
        # Optimize by annotating child exists and medicine count
        rubrics = rubrics.annotate(
            has_children_count=Count('children', filter=Q(children__is_active=True), distinct=True),
            med_count=Count('medicine_grades', distinct=True)
        )
            
        tree_data = []
        for r in rubrics:
            tree_data.append({
                'id': r.id,
                'name': r.name,
                'name_hindi': r.name_hindi,
                'level': r.level,
                'has_children': r.has_children_count > 0,
                'medicine_count': r.med_count
            })
            
        return JsonResponse({'success': True, 'rubrics': tree_data})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_chapters(request):
    """Get all top-level rubric categories (Chapters)"""
    try:
        chapters = Rubric.objects.filter(level=0, is_active=True).values('id', 'name', 'name_hindi')
        return JsonResponse({'success': True, 'chapters': list(chapters)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_admin
def get_grades(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)


@csrf_exempt
@require_admin
def update_grade(request, grade_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)


@csrf_exempt
@require_admin
def create_synonym(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def get_rubric_synonyms(request, rubric_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def delete_synonym(request, synonym_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def import_medicines(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def import_rubrics(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def import_grades(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def import_synonyms(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def get_import_history(request):
    try:
        history = ImportHistory.objects.all()[:50]
        data = []
        for item in history:
            data.append({
                'id': item.id,
                'fileName': item.file_name,
                'fileSize': f"{item.file_size / (1024*1024):.2f} MB",
                'type': item.get_import_type_display(),
                'date': item.created_at.strftime('%d %b %Y, %I:%M %p'),
                'time': item.created_at.strftime('%Y-%m-%dT%H:%M:%S'),
                'status': item.status,
                'recordsTotal': item.records_total,
                'recordsAdded': item.records_added,
                'recordsFailed': item.records_failed,
                'message': item.message
            })
        return JsonResponse({'success': True, 'history': data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
@require_admin
def delete_import_history(request, history_id):
    if request.method != 'DELETE':
        return JsonResponse({'error': 'Method not allowed'}, status=405)
    
    try:
        with transaction.atomic():
            item = ImportHistory.objects.get(id=history_id)
            # Standard Django behavior: cascade delete will remove associated rubrics/medicines
            item.delete()
        return JsonResponse({'success': True, 'message': 'Import history and associated data deleted successfully'})
    except ImportHistory.DoesNotExist:
        return JsonResponse({'error': 'Import history not found'}, status=404)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
@require_admin
def download_template(request, template_type):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

# --- Mastersheet Upload Logic ---
IMPORT_STATUS = {
    'is_running': False,
    'last_run': None,
    'error': None,
    'message': 'Idle'
}

def _run_mastersheet_import_thread():
    import threading
    from django.core.management import call_command
    
    global IMPORT_STATUS
    IMPORT_STATUS['is_running'] = True
    IMPORT_STATUS['message'] = 'Processing mastersheet. This may take a few minutes...'
    IMPORT_STATUS['error'] = None
    
    try:
        call_command('import_mastersheet')
        IMPORT_STATUS['message'] = 'Successfully imported mastersheet!'
        IMPORT_STATUS['last_run'] = timezone.now().isoformat()
    except Exception as e:
        IMPORT_STATUS['error'] = str(e)
        IMPORT_STATUS['message'] = 'Import failed'
        logger.error(f"Background thread mastersheet import failed: {e}")
    finally:
        IMPORT_STATUS['is_running'] = False


@csrf_exempt
@require_admin
@require_http_methods(["POST"])
def upload_mastersheet(request):
    """Uploads the mastersheet to disk and triggers the import command in a background thread."""
    global IMPORT_STATUS
    if IMPORT_STATUS['is_running']:
        return JsonResponse({'error': 'An import is already heavily processing in the background. Please wait.'}, status=409)

    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    uploaded_file = request.FILES['file']
    if not uploaded_file.name.endswith(('.xlsx', '.xls')):
        return JsonResponse({'error': 'Only Excel files (.xlsx, .xls) are supported'}, status=400)

    try:
        # Securely save the file, replacing the old mastersheet
        import os
        from django.conf import settings
        target_dir = os.path.join(settings.BASE_DIR, 'static', 'sheets')
        os.makedirs(target_dir, exist_ok=True)
        target_path = os.path.join(target_dir, 'mastersheet final.xlsx')
        
        with open(target_path, 'wb+') as destination:
            for chunk in uploaded_file.chunks():
                destination.write(chunk)
                
        # Start background import process
        import threading
        t = threading.Thread(target=_run_mastersheet_import_thread)
        t.daemon = True
        t.start()
        
        return JsonResponse({
            'success': True, 
            'message': 'Mastersheet uploaded successfully. Processing has started in the background.'
        })

    except Exception as e:
        logger.error(f"Error saving uploaded mastersheet: {str(e)}")
        return JsonResponse({'error': f'Upload failed: {str(e)}'}, status=500)


@csrf_exempt
@require_admin
def get_import_status(request):
    """Get the status of the ongoing mastersheet import."""
    global IMPORT_STATUS
    return JsonResponse(IMPORT_STATUS)



@csrf_exempt
@require_admin
def create_backup(request):
    """Create a full system backup"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        # Get all data
        rubrics_data = list(Rubric.objects.filter(is_active=True).values())
        medicines_data = list(Medicine.objects.filter(is_active=True).values())
        rubric_medicine_grades = list(RubricMedicineGrade.objects.all().values())
        rubric_synonyms = list(RubricSynonym.objects.all().values())
        modalities = list(Modality.objects.all().values())
        
        # Prepare backup data
        backup_data = {
            'version': '1.0',
            'timestamp': datetime.now().isoformat(),
            'data': {
                'rubrics': rubrics_data,
                'medicines': medicines_data,
                'rubric_medicine_grades': rubric_medicine_grades,
                'rubric_synonyms': rubric_synonyms,
                'modalities': modalities,
            },
            'statistics': {
                'total_rubrics': len(rubrics_data),
                'total_medicines': len(medicines_data),
                'total_grades': len(rubric_medicine_grades),
                'total_synonyms': len(rubric_synonyms),
                'total_modalities': len(modalities),
            }
        }
        
        # Convert datetime objects to strings
        def convert_datetime(obj):
            if isinstance(obj, datetime):
                return obj.isoformat()
            return obj
        
        # Process all data to convert datetime objects
        for category in backup_data['data'].values():
            for item in category:
                for key, value in item.items():
                    item[key] = convert_datetime(value)
        
        # Create backup file with proper path handling
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'homeopathy_backup_{timestamp}.json'
        
        # Use tempfile to get proper temp directory for the OS
        temp_dir = tempfile.gettempdir()
        filepath = os.path.join(temp_dir, filename)
        
        # Ensure the directory exists
        os.makedirs(temp_dir, exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(backup_data, f, indent=2, ensure_ascii=False, default=str)
        
        # Calculate file size
        file_size = os.path.getsize(filepath)
        size_mb = round(file_size / (1024 * 1024), 2)
        
        return JsonResponse({
            'success': True,
            'message': 'Backup created successfully',
            'backup': {
                'filename': filename,
                'filepath': filepath,
                'size': f'{size_mb} MB',
                'timestamp': datetime.now().isoformat(),
                'statistics': backup_data['statistics']
            }
        })
    
    except Exception as e:
        logger.error(f"Error creating backup: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def download_backup(request, filename):
    """Download a backup file"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        # Use tempfile to get proper temp directory
        temp_dir = tempfile.gettempdir()
        filepath = os.path.join(temp_dir, filename)
        
        if not os.path.exists(filepath):
            return JsonResponse({'error': 'Backup file not found'}, status=404)
        
        # Read the file and return as response
        with open(filepath, 'rb') as f:
            response = HttpResponse(f.read(), content_type='application/json')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
    
    except Exception as e:
        logger.error(f"Error downloading backup: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def restore_backup(request):
    """Restore data from a backup file"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        # Check if file was uploaded
        if 'backup_file' not in request.FILES:
            return JsonResponse({'error': 'No backup file provided'}, status=400)
        
        backup_file = request.FILES['backup_file']
        
        # Read and parse the backup file
        try:
            file_content = backup_file.read().decode('utf-8')
            backup_data = json.loads(file_content)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON file'}, status=400)
        
        # Validate backup structure
        if 'data' not in backup_data:
            return JsonResponse({'error': 'Invalid backup file format'}, status=400)
        
        restored_counts = {}
        
        with transaction.atomic():
            # Restore Medicines first (no dependencies)
            if 'medicines' in backup_data['data']:
                medicines_created = 0
                for med_data in backup_data['data']['medicines']:
                    # Remove auto fields
                    old_id = med_data.pop('id', None)
                    med_data.pop('created_at', None)
                    med_data.pop('updated_at', None)
                    
                    # Create or update
                    medicine, created = Medicine.objects.update_or_create(
                        name=med_data['name'],
                        defaults=med_data
                    )
                    medicines_created += 1
                restored_counts['medicines'] = medicines_created
            
            # Restore Rubrics
            if 'rubrics' in backup_data['data']:
                rubrics_created = 0
                # First pass: create all rubrics without parent relationships
                rubric_id_map = {}  # Map old IDs to new IDs
                
                for rub_data in backup_data['data']['rubrics']:
                    old_id = rub_data.get('id')
                    old_parent_id = rub_data.get('parent_id')
                    
                    # Remove auto fields
                    rub_data.pop('id', None)
                    rub_data.pop('created_at', None)
                    rub_data.pop('updated_at', None)
                    rub_data.pop('parent_id', None)  # Remove parent for now
                    rub_data.pop('created_by_id', None)
                    
                    rubric, created = Rubric.objects.update_or_create(
                        name=rub_data['name'],
                        defaults=rub_data
                    )
                    if old_id:
                        rubric_id_map[old_id] = rubric.id
                    rubrics_created += 1
                
                # Second pass: update parent relationships
                for rub_data in backup_data['data']['rubrics']:
                    parent_id = rub_data.get('parent_id')
                    if parent_id and parent_id in rubric_id_map:
                        try:
                            rubric = Rubric.objects.get(name=rub_data['name'])
                            rubric.parent_id = rubric_id_map[parent_id]
                            rubric.save()
                        except Rubric.DoesNotExist:
                            continue
                
                restored_counts['rubrics'] = rubrics_created
            
            # Restore Rubric-Medicine Grades
            if 'rubric_medicine_grades' in backup_data['data']:
                grades_created = 0
                for grade_data in backup_data['data']['rubric_medicine_grades']:
                    old_rubric_id = grade_data.get('rubric_id')
                    old_medicine_id = grade_data.get('medicine_id')
                    
                    grade_data.pop('id', None)
                    grade_data.pop('created_at', None)
                    grade_data.pop('updated_at', None)
                    
                    try:
                        # Get the new rubric ID from the map
                        new_rubric_id = rubric_id_map.get(old_rubric_id, old_rubric_id)
                        rubric = Rubric.objects.get(id=new_rubric_id)
                        
                        # Medicine IDs should match if we're updating
                        medicine = Medicine.objects.get(id=old_medicine_id)
                        
                        RubricMedicineGrade.objects.update_or_create(
                            rubric=rubric,
                            medicine=medicine,
                            defaults={
                                'grade': grade_data.get('grade'),
                                'notes': grade_data.get('notes', ''),
                                'source': grade_data.get('source', '')
                            }
                        )
                        grades_created += 1
                    except (Rubric.DoesNotExist, Medicine.DoesNotExist):
                        continue
                
                restored_counts['grades'] = grades_created
            
            # Restore Synonyms
            if 'rubric_synonyms' in backup_data['data']:
                synonyms_created = 0
                for syn_data in backup_data['data']['rubric_synonyms']:
                    old_rubric_id = syn_data.get('rubric_id')
                    
                    syn_data.pop('id', None)
                    syn_data.pop('created_at', None)
                    
                    try:
                        new_rubric_id = rubric_id_map.get(old_rubric_id, old_rubric_id)
                        rubric = Rubric.objects.get(id=new_rubric_id)
                        
                        RubricSynonym.objects.get_or_create(
                            rubric=rubric,
                            synonym=syn_data['synonym'],
                            defaults={
                                'synonym_hindi': syn_data.get('synonym_hindi', ''),
                                'is_primary': syn_data.get('is_primary', False)
                            }
                        )
                        synonyms_created += 1
                    except Rubric.DoesNotExist:
                        continue
                
                restored_counts['synonyms'] = synonyms_created
            
            # Restore Modalities
            if 'modalities' in backup_data['data']:
                modalities_created = 0
                for mod_data in backup_data['data']['modalities']:
                    old_rubric_id = mod_data.get('rubric_id')
                    
                    mod_data.pop('id', None)
                    mod_data.pop('created_at', None)
                    
                    try:
                        new_rubric_id = rubric_id_map.get(old_rubric_id, old_rubric_id)
                        rubric = Rubric.objects.get(id=new_rubric_id)
                        
                        Modality.objects.get_or_create(
                            rubric=rubric,
                            name=mod_data['name'],
                            modality_type=mod_data['modality_type'],
                            defaults={
                                'name_hindi': mod_data.get('name_hindi', ''),
                                'description': mod_data.get('description', '')
                            }
                        )
                        modalities_created += 1
                    except Rubric.DoesNotExist:
                        continue
                
                restored_counts['modalities'] = modalities_created
        
        return JsonResponse({
            'success': True,
            'message': 'Backup restored successfully',
            'restored': restored_counts
        })
    
    except Exception as e:
        logger.error(f"Error restoring backup: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_admin
def get_backup_stats(request):
    """Get database statistics for backup overview"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        stats = {
            'total_rubrics': Rubric.objects.filter(is_active=True).count(),
            'total_medicines': Medicine.objects.filter(is_active=True).count(),
            'total_grades': RubricMedicineGrade.objects.count(),
            'total_synonyms': RubricSynonym.objects.count(),
            'total_modalities': Modality.objects.count(),
        }
        
        return JsonResponse({'success': True, 'stats': stats})
    
    except Exception as e:
        logger.error(f"Error fetching backup stats: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
@require_admin
def get_admin_dashboard_stats(request):
    """Get comprehensive dashboard statistics"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        # Get counts
        total_doctors = Doctor.objects.filter(is_active=True).count()
        total_patients = Patient.objects.filter(is_active=True).count()
        total_rubrics = Rubric.objects.filter(is_active=True).count()
        total_medicines = Medicine.objects.filter(is_active=True).count()
        
        # Get recent counts (last 30 days)
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        doctors_last_month = Doctor.objects.filter(
            is_active=True,
            created_at__gte=thirty_days_ago
        ).count()
        
        patients_last_month = Patient.objects.filter(
            is_active=True,
            created_at__gte=thirty_days_ago
        ).count()
        
        rubrics_last_month = Rubric.objects.filter(
            is_active=True,
            created_at__gte=thirty_days_ago
        ).count()
        
        medicines_last_month = Medicine.objects.filter(
            is_active=True,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Calculate percentage changes
        prev_doctors = total_doctors - doctors_last_month
        prev_patients = total_patients - patients_last_month
        prev_rubrics = total_rubrics - rubrics_last_month
        prev_medicines = total_medicines - medicines_last_month
        
        doctors_change = round((doctors_last_month / prev_doctors * 100) if prev_doctors > 0 else 0, 1)
        patients_change = round((patients_last_month / prev_patients * 100) if prev_patients > 0 else 0, 1)
        rubrics_change = round((rubrics_last_month / prev_rubrics * 100) if prev_rubrics > 0 else 0, 1)
        medicines_change = round((medicines_last_month / prev_medicines * 100) if prev_medicines > 0 else 0, 1)
        
        # Get recent activities
        recent_doctors = Doctor.objects.filter(is_active=True).select_related('user').order_by('-created_at')[:5]
        recent_patients = Patient.objects.filter(is_active=True).select_related('user').order_by('-created_at')[:5]
        recent_rubrics = Rubric.objects.filter(is_active=True).order_by('-created_at')[:5]
        recent_medicines = Medicine.objects.filter(is_active=True).order_by('-created_at')[:5]
        
        activities = []
        
        # Add recent doctors
        for doctor in recent_doctors:
            activities.append({
                'id': f'doctor-{doctor.id}',
                'type': 'doctor',
                'action': 'New doctor registered',
                'name': f'Dr. {doctor.user.get_full_name()}',
                'time': doctor.created_at.isoformat(),
            })
        
        # Add recent patients
        for patient in recent_patients:
            activities.append({
                'id': f'patient-{patient.id}',
                'type': 'patient',
                'action': 'New patient registered',
                'name': patient.user.get_full_name(),
                'time': patient.created_at.isoformat(),
            })
        
        # Add recent rubrics
        for rubric in recent_rubrics:
            activities.append({
                'id': f'rubric-{rubric.id}',
                'type': 'rubric',
                'action': 'New rubric added',
                'name': rubric.name,
                'time': rubric.created_at.isoformat(),
            })
        
        # Add recent medicines
        for medicine in recent_medicines:
            activities.append({
                'id': f'medicine-{medicine.id}',
                'type': 'medicine',
                'action': 'New medicine added',
                'name': medicine.name,
                'time': medicine.created_at.isoformat(),
            })
        
        # Sort activities by time
        activities.sort(key=lambda x: x['time'], reverse=True)
        activities = activities[:10]  # Get top 10 most recent
        
        # Get last backup info
        last_backup = None
        # You can implement actual backup tracking here
        
        stats = {
            'totals': {
                'doctors': total_doctors,
                'patients': total_patients,
                'rubrics': total_rubrics,
                'medicines': total_medicines,
            },
            'changes': {
                'doctors': f'+{doctors_change}%' if doctors_change > 0 else f'{doctors_change}%',
                'patients': f'+{patients_change}%' if patients_change > 0 else f'{patients_change}%',
                'rubrics': f'+{rubrics_last_month}' if rubrics_last_month > 0 else '0',
                'medicines': f'+{medicines_last_month}' if medicines_last_month > 0 else '0',
            },
            'recent_counts': {
                'doctors': doctors_last_month,
                'patients': patients_last_month,
                'rubrics': rubrics_last_month,
                'medicines': medicines_last_month,
            },
            'activities': activities,
            'system_health': {
                'database': 'Healthy',
                'server': 'Healthy',
                'api': 'Healthy',
                'storage': '78% Used',
            }
        }
        
        return JsonResponse({'success': True, 'stats': stats})
    
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)






@csrf_exempt
@require_admin
def get_backups(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)



@csrf_exempt
@require_admin
def get_doctors_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def get_patients_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def get_rubrics_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
@require_admin
def get_medicines_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)






@csrf_exempt
def doctor_logout(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def doctor_check_auth(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def doctor_get_profile(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def doctor_update_profile(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def doctor_change_password(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def create_case(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)



@csrf_exempt
def update_case(request, case_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def delete_case(request, case_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def add_case_rubric(request, case_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def remove_case_rubric(request, case_id, rubric_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def intelligent_rubric_search(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_rubric_detail(request, rubric_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_rubric_medicines(request, rubric_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def perform_repertorization(request, case_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_repertorizations(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_repertorization_detail(request, rep_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def generate_repertorization_pdf(request, rep_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_doctor_dashboard_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_doctor_cases_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_doctor_popular_medicines(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def patient_login(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)



@csrf_exempt
def patient_check_auth(request):
    """Check if patient is authenticated (Bypassed)"""
    patient = Patient.objects.select_related('user').filter(is_active=True).first()
    if patient:
        return JsonResponse({
            'authenticated': True,
            'patient': {
                'id': patient.id,
                'email': patient.user.email,
                'name': patient.user.get_full_name(),
                'role': 'patient'
            }
        })
    
    # Fallback mock if no patient in DB
    return JsonResponse({
        'authenticated': True,
        'patient': {
            'id': 1,
            'email': 'patient@example.com',
            'name': 'Demo Patient',
            'role': 'patient'
        }
    })


@csrf_exempt
def patient_logout(request):
    """Patient logout endpoint - always succeeds to ensure clean client state"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    # Always flush the session regardless of whether is_patient is set.
    # This handles expired sessions gracefully so the client can always log out.
    try:
        request.session.flush()
    except Exception:
        pass
    
    return JsonResponse({'success': True, 'message': 'Logged out successfully'})


@csrf_exempt
def patient_get_profile(request):
    """Get current patient's profile"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
        
        profile_data = {
            'id': patient.id,
            'name': patient.user.get_full_name(),
            'email': patient.user.email,
            'phone': patient.user.phone or '',
            'gender': patient.gender,
            'date_of_birth': patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
            'age': patient.get_age(),
            'blood_group': patient.blood_group or '',
            'address': patient.address or '',
            'emergency_contact': patient.emergency_contact or '',
            'medical_history': patient.medical_history or '',
            'allergies': patient.allergies or '',
            'created_at': patient.created_at.strftime('%Y-%m-%d'),
        }
        
        return JsonResponse({'success': True, 'patient': profile_data})
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching patient profile: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def patient_update_profile(request):
    """Update patient profile"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
        
        with transaction.atomic():
            # Update user fields
            user = patient.user
            if 'phone' in data:
                user.phone = data.get('phone', '')
            user.save()
            
            # Update patient fields
            if 'address' in data:
                patient.address = data.get('address', '')
            if 'emergency_contact' in data:
                patient.emergency_contact = data.get('emergency_contact', '')
            if 'medical_history' in data:
                patient.medical_history = data.get('medical_history', '')
            if 'allergies' in data:
                patient.allergies = data.get('allergies', '')
            patient.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully'
            })
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def patient_change_password(request):
    """Change patient password"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id, is_active=True)
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return JsonResponse({'error': 'Both current and new password required'}, status=400)
        
        # Verify current password
        if not check_password(current_password, patient.user.password):
            return JsonResponse({'error': 'Current password is incorrect'}, status=400)
        
        # Update password
        patient.user.password = make_password(new_password)
        patient.user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Password changed successfully'
        })
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)




@csrf_exempt
def analyze_symptoms(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_searches(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_search_detail(request, search_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def save_search(request, search_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def generate_search_pdf(request, search_id):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_patient_dashboard_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)

@csrf_exempt
def get_patient_searches_stats(request):
    return JsonResponse({'error': 'Not implemented yet'}, status=501)



@csrf_exempt
def doctor_check_auth(request):
    """Check if doctor is authenticated - FIXED VERSION"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    is_doctor = request.session.get('is_doctor', False)
    
    if is_doctor:
        doctor_id = request.session.get('doctor_id')
        try:
            doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
            return JsonResponse({
                'authenticated': True,
                'doctor': {
                    'id': doctor.id,
                    'email': doctor.user.email,
                    'name': doctor.user.get_full_name(),
                    'specialization': doctor.specialization,
                    'role': 'doctor'
                }
            })
        except Doctor.DoesNotExist:
            # Session exists but doctor not found - clear session
            request.session.flush()
            return JsonResponse({'authenticated': False, 'doctor': None})
    
    return JsonResponse({'authenticated': False, 'doctor': None})


@csrf_exempt
def doctor_logout(request):
    """Doctor logout endpoint - FIXED VERSION"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    if request.session.get('is_doctor'):
        request.session.flush()
        return JsonResponse({'success': True, 'message': 'Logged out successfully'})
    
    return JsonResponse({'error': 'No doctor logged in'}, status=400)



@csrf_exempt
def doctor_get_profile(request):
    """Get current doctor's profile"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
        
        profile_data = {
            'id': doctor.id,
            'name': doctor.user.get_full_name(),
            'email': doctor.user.email,
            'phone': doctor.user.phone or '',
            'specialization': doctor.specialization,
            'qualification': doctor.qualification,
            'registration_number': doctor.registration_number,
            'experience_years': doctor.experience_years,
            'doctor_class': doctor.doctor_class,  # NEW
            'aadhar_number': doctor.aadhar_number,  # NEW
            'pan_number': doctor.pan_number,  # NEW
            'license_number': doctor.license_number,  # NEW
            'bio': doctor.bio or '',
            'consultation_fee': str(doctor.consultation_fee) if doctor.consultation_fee else '',
            'profile_image': doctor.profile_image.url if doctor.profile_image else None,  # NEW
            'created_at': doctor.created_at.strftime('%Y-%m-%d'),
        }
        
        return JsonResponse({'success': True, 'doctor': profile_data})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching doctor profile: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def doctor_update_profile(request):
    """Update doctor profile"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
        
        with transaction.atomic():
            # Update user fields
            user = doctor.user
            if 'phone' in data:
                user.phone = data.get('phone', '')
            user.save()
            
            # Update doctor fields
            if 'bio' in data:
                doctor.bio = data.get('bio', '')
            
            # Handle consultation fee - FIX for decimal error
            if 'consultation_fee' in data:
                fee = data.get('consultation_fee', '').strip()
                if fee:  # Only update if not empty
                    try:
                        doctor.consultation_fee = Decimal(fee)
                    except (ValueError, InvalidOperation):
                        return JsonResponse({
                            'error': 'Invalid consultation fee format'
                        }, status=400)
                else:
                    doctor.consultation_fee = None  # Set to None if empty
            
            doctor.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Profile updated successfully'
            })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating profile: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

 


@csrf_exempt
def doctor_upload_profile_image(request):
    """Upload or update doctor's profile image"""

    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)

    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)

        image = request.FILES.get('profile_image')
        if not image:
            return JsonResponse({'error': 'No image provided'}, status=400)

        # ✅ Let Django + Cloudinary handle upload automatically
        doctor.profile_image = image
        doctor.save()

        return JsonResponse({
            'success': True,
            'message': 'Profile image uploaded successfully',
            'profile_image': doctor.profile_image.url
        })

    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)

    except Exception as e:
        logger.error(f"Error uploading profile image: {str(e)}")
        return JsonResponse({'error': 'Failed to upload image'}, status=500)







@csrf_exempt
def doctor_change_password(request):
    """Change doctor password"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        from django.contrib.auth.hashers import check_password, make_password
        
        doctor = Doctor.objects.select_related('user').get(id=doctor_id, is_active=True)
        
        current_password = data.get('current_password')
        new_password = data.get('new_password')
        
        if not current_password or not new_password:
            return JsonResponse({'error': 'Both current and new password required'}, status=400)
        
        # Verify current password
        if not check_password(current_password, doctor.user.password):
            return JsonResponse({'error': 'Current password is incorrect'}, status=400)
        
        # Update password
        doctor.user.password = make_password(new_password)
        doctor.user.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Password changed successfully'
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error changing password: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_doctor_dashboard_stats(request):
    """Get dashboard statistics for doctor (Bypassed)"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        doctor = Doctor.objects.filter(is_active=True).first()
        if doctor:
            doctor_id = doctor.id
        else:
            doctor_id = 1 # Fallback
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
        
        # Get today's date
        today = timezone.now().date()
        
        # Total cases
        total_cases = Case.objects.filter(doctor=doctor).count()
        
        # Cases today
        cases_today = Case.objects.filter(
            doctor=doctor,
            created_at__date=today
        ).count()
        
        # Active patients (unique patients from active cases)
        active_patients = Case.objects.filter(
            doctor=doctor,
            status='active'
        ).values('patient_name').distinct().count()
        
        # Total repertorizations
        total_repertorizations = Repertorization.objects.filter(doctor=doctor).count()
        
        # Calculate changes (compared to yesterday)
        yesterday = today - timedelta(days=1)
        
        cases_yesterday = Case.objects.filter(
            doctor=doctor,
            created_at__date=yesterday
        ).count()
        
        cases_today_change = cases_today - cases_yesterday
        
        # Previous active patients (from last week)
        last_week = today - timedelta(days=7)
        previous_active = Case.objects.filter(
            doctor=doctor,
            status='active',
            created_at__date__lt=last_week
        ).values('patient_name').distinct().count()
        
        active_patients_change = active_patients - previous_active
        
        stats = {
            'total_cases': total_cases,
            'cases_today': cases_today,
            'active_patients': active_patients,
            'total_repertorizations': total_repertorizations,
            'cases_today_change': f'+{cases_today_change}' if cases_today_change > 0 else str(cases_today_change),
            'active_patients_change': f'+{active_patients_change}' if active_patients_change > 0 else str(active_patients_change),
        }
        
        return JsonResponse({'success': True, 'stats': stats})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def create_case(request):
    """Create a new case"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        errors = {}
        
        # Required field validation
        if not data.get('title', '').strip():
            errors['title'] = 'Title is required'
        if not data.get('chief_complaint', '').strip():
            errors['chief_complaint'] = 'Chief complaint is required'
        if not data.get('symptoms', '').strip():
            errors['symptoms'] = 'Symptoms are required'
        
        if errors:
            return JsonResponse({'error': 'Validation failed', 'errors': errors}, status=400)
        
        with transaction.atomic():
            # Create case
            case = Case.objects.create(
                doctor=doctor,
                title=data['title'],
                chief_complaint=data['chief_complaint'],
                symptoms=data['symptoms'],
                duration=data.get('duration', ''),
                patient_name=data.get('patient_name', ''),
                patient_age=data.get('patient_age'),
                patient_gender=data.get('patient_gender', ''),
                patient_phone=data.get('patient_phone', ''),
                status=data.get('status', 'active'),
                doctor_notes=data.get('doctor_notes', ''),
            )
            
            # Link to patient if patient_id provided
            patient_id = data.get('patient_id')
            if patient_id:
                try:
                    patient = Patient.objects.get(id=patient_id, is_active=True)
                    case.patient = patient
                    case.save()
                except Patient.DoesNotExist:
                    pass
            
            return JsonResponse({
                'success': True,
                'message': 'Case created successfully',
                'case': {
                    'id': case.id,
                    'case_number': case.case_number,
                    'title': case.title,
                }
            }, status=201)
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error creating case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_cases(request):
    """Get all cases for current doctor"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Get query parameters
        limit = request.GET.get('limit')
        status = request.GET.get('status')
        search = request.GET.get('search')
        
        # Base query
        cases = Case.objects.filter(doctor=doctor).select_related('patient__user')
        
        # Apply filters
        if status:
            cases = cases.filter(status=status)
        
        if search:
            cases = cases.filter(
                Q(case_number__icontains=search) |
                Q(title__icontains=search) |
                Q(patient_name__icontains=search) |
                Q(chief_complaint__icontains=search)
            )
        
        # Order by created date (newest first)
        cases = cases.order_by('-created_at')
        
        # Apply limit
        if limit:
            cases = cases[:int(limit)]
        
        case_list = []
        for case in cases:
            case_list.append({
                'id': case.id,
                'case_number': case.case_number,
                'title': case.title,
                'patient_name': case.get_patient_name(),
                'patient_age': case.patient_age,
                'patient_gender': case.patient_gender,
                'chief_complaint': case.chief_complaint,
                'symptoms': case.symptoms,
                'duration': case.duration,
                'status': case.status,
                'created_at': case.created_at.isoformat(),
                'updated_at': case.updated_at.isoformat(),
            })
        
        return JsonResponse({'success': True, 'cases': case_list})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching cases: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_case(request, case_id):
    """Get single case details"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Ensure case belongs to this doctor
        case = Case.objects.select_related('patient__user', 'prescribed_medicine').get(
            id=case_id,
            doctor=doctor
        )
        
        # Get selected rubrics
        selected_rubrics = CaseRubric.objects.filter(case=case).select_related('rubric')
        rubrics_list = []
        for cr in selected_rubrics:
            rubrics_list.append({
                'id': cr.rubric.id,
                'name': cr.rubric.name,
                'intensity': cr.intensity,
                'notes': cr.notes,
                'added_at': cr.added_at.isoformat(),
            })
        
        # Get repertorizations
        repertorizations = Repertorization.objects.filter(case=case).order_by('-created_at')
        rep_list = []
        for rep in repertorizations:
            rep_list.append({
                'id': rep.id,
                'method': rep.method,
                'total_rubrics': rep.total_rubrics,
                'total_medicines_analyzed': rep.total_medicines_analyzed,
                'created_at': rep.created_at.isoformat(),
            })
        
        case_data = {
            'id': case.id,
            'case_number': case.case_number,
            'title': case.title,
            'patient_name': case.get_patient_name(),
            'patient_age': case.patient_age,
            'patient_gender': case.patient_gender,
            'patient_phone': case.patient_phone,
            'chief_complaint': case.chief_complaint,
            'symptoms': case.symptoms,
            'duration': case.duration,
            'status': case.status,
            'doctor_notes': case.doctor_notes,
            'follow_up_date': case.follow_up_date.strftime('%Y-%m-%d') if case.follow_up_date else None,
            'prescribed_medicine': {
                'id': case.prescribed_medicine.id,
                'name': case.prescribed_medicine.name,
            } if case.prescribed_medicine else None,
            'prescribed_potency': case.prescribed_potency,
            'dosage_instructions': case.dosage_instructions,
            'selected_rubrics': rubrics_list,
            'repertorizations': rep_list,
            'created_at': case.created_at.isoformat(),
            'updated_at': case.updated_at.isoformat(),
        }
        
        return JsonResponse({'success': True, 'case': case_data})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def update_case(request, case_id):
    """Update case information"""
    if request.method != "PUT":
        return JsonResponse({'error': 'PUT method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        case = Case.objects.get(id=case_id, doctor=doctor)
        
        with transaction.atomic():
            # Update case fields
            if 'title' in data:
                case.title = data['title']
            if 'chief_complaint' in data:
                case.chief_complaint = data['chief_complaint']
            if 'symptoms' in data:
                case.symptoms = data['symptoms']
            if 'duration' in data:
                case.duration = data['duration']
            if 'patient_name' in data:
                case.patient_name = data['patient_name']
            if 'patient_age' in data:
                case.patient_age = data['patient_age']
            if 'patient_gender' in data:
                case.patient_gender = data['patient_gender']
            if 'patient_phone' in data:
                case.patient_phone = data['patient_phone']
            if 'status' in data:
                case.status = data['status']
            if 'doctor_notes' in data:
                case.doctor_notes = data['doctor_notes']
            if 'follow_up_date' in data:
                case.follow_up_date = data['follow_up_date']
            if 'prescribed_potency' in data:
                case.prescribed_potency = data['prescribed_potency']
            if 'dosage_instructions' in data:
                case.dosage_instructions = data['dosage_instructions']
            
            # Update prescribed medicine if provided
            if 'prescribed_medicine_id' in data:
                medicine_id = data['prescribed_medicine_id']
                if medicine_id:
                    try:
                        medicine = Medicine.objects.get(id=medicine_id, is_active=True)
                        case.prescribed_medicine = medicine
                    except Medicine.DoesNotExist:
                        pass
                else:
                    case.prescribed_medicine = None
            
            case.save()
            
            return JsonResponse({
                'success': True,
                'message': 'Case updated successfully',
                'case': {
                    'id': case.id,
                    'case_number': case.case_number,
                    'title': case.title,
                }
            })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except Exception as e:
        logger.error(f"Error updating case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def delete_case(request, case_id):
    """Delete a case"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        case = Case.objects.get(id=case_id, doctor=doctor)
        
        with transaction.atomic():
            # Delete associated data
            CaseRubric.objects.filter(case=case).delete()
            Repertorization.objects.filter(case=case).delete()
            
            # Delete case
            case.delete()
            
            return JsonResponse({
                'success': True,
                'message': 'Case deleted successfully'
            })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except Exception as e:
        logger.error(f"Error deleting case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_doctor_cases_stats(request):
    """Get case statistics for doctor"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Status breakdown
        active_cases = Case.objects.filter(doctor=doctor, status='active').count()
        completed_cases = Case.objects.filter(doctor=doctor, status='completed').count()
        follow_up_cases = Case.objects.filter(doctor=doctor, status='follow_up').count()
        
        # Cases by month (last 6 months)
        from django.db.models.functions import TruncMonth
        six_months_ago = timezone.now() - timedelta(days=180)
        
        cases_by_month = (
            Case.objects.filter(doctor=doctor, created_at__gte=six_months_ago)
            .annotate(month=TruncMonth('created_at'))
            .values('month')
            .annotate(count=Count('id'))
            .order_by('month')
        )
        
        monthly_stats = []
        for item in cases_by_month:
            monthly_stats.append({
                'month': item['month'].strftime('%b %Y'),
                'count': item['count']
            })
        
        stats = {
            'total_cases': Case.objects.filter(doctor=doctor).count(),
            'active_cases': active_cases,
            'completed_cases': completed_cases,
            'follow_up_cases': follow_up_cases,
            'monthly_stats': monthly_stats,
        }
        
        return JsonResponse({'success': True, 'stats': stats})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching case stats: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_doctor_popular_medicines(request):
    """Get most prescribed medicines by doctor"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Get medicine prescription counts
        medicine_counts = (
            Case.objects.filter(doctor=doctor, prescribed_medicine__isnull=False)
            .values('prescribed_medicine__id', 'prescribed_medicine__name', 'prescribed_medicine__latin_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )
        
        medicines = []
        for item in medicine_counts:
            medicines.append({
                'id': item['prescribed_medicine__id'],
                'name': item['prescribed_medicine__name'],
                'latin_name': item['prescribed_medicine__latin_name'],
                'uses': item['count'],
            })
        
        return JsonResponse({'success': True, 'medicines': medicines})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching popular medicines: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


# Real implementations follow below




@csrf_exempt
def intelligent_rubric_search(request):
    """
    Optimized search for rubrics with prefetched related data
    """
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        # Get search query
        query = request.GET.get('query', '').strip()
        
        if not query or len(query) < 2:
            return JsonResponse({
                'success': True,
                'rubrics': [],
                'message': 'Query too short. Please enter at least 2 characters.'
            })
        
        # 1. Advanced NLP Search: Implement tokenization and filler word removal
        import re
        
        filler_words = {
            'i', 'have', 'a', 'an', 'the', 'and', 'or', 'but', 'is', 'are', 'am', 'was', 'were', 'been', 
            'my', 'mine', 'me', 'he', 'she', 'it', 'they', 'them', 'their', 'we', 'us', 'our', 
            'in', 'on', 'at', 'to', 'for', 'with', 'about', 'of', 'from', 'by', 'as', 'that', 'this', 
            'these', 'those', 'doctor', 'please', 'help', 'sir', 'madam', 'suffering', 'since', 
            'days', 'months', 'years', 'feeling', 'feel', 'when', 'what', 'where', 'why', 'how', 'who',
            'can', 'could', 'would', 'should', 'will', 'very', 'much', 'too', 'lot', 'getting', 'got'
        }
        
        # Extract words (English and potential transliterated Hindi)
        tokens = re.findall(r'\b\w+\b', query.lower())
        search_words = [w for w in tokens if len(w) > 2 and w not in filler_words]
        
        if not search_words:
            # Fallback to the original query if filtering removed everything
            search_words = [query]
            
        # Build dynamic query
        q_obj = Q()
        for word in search_words:
            q_obj |= (
                Q(name__icontains=word) |
                Q(name_hindi__icontains=word) |
                Q(description__icontains=word) |
                Q(description_hindi__icontains=word) |
                Q(synonyms__synonym__icontains=word)
            )

        # Optimize with annotation and prefetch
        rubrics = Rubric.objects.filter(
            Q(is_active=True) & q_obj
        ).distinct().select_related('parent').annotate(
            med_count=Count('medicine_grades', distinct=True)
        ).prefetch_related('synonyms')
        
        # We only need top 3 rubrics as requested
        rubrics = rubrics[:3]
        
        rubric_list = []
        for rubric in rubrics:
            # Synonyms are prefetched
            synonyms = [s.synonym for s in rubric.synonyms.all()[:5]]
            
            # Fetch top 5 medicines for this rubric (grading)
            grades = rubric.medicine_grades.select_related('medicine').order_by('-grade', 'medicine__name')[:5]
            medicines_list = []
            for mg in grades:
                medicines_list.append({
                    'name': mg.medicine.name,
                    'grade': mg.grade,
                    'grade_label': mg.get_grade_display()
                })
            
            rubric_list.append({
                'id': rubric.id,
                'name': rubric.name,
                'name_hindi': rubric.name_hindi,
                'description': rubric.description,
                'full_path': rubric.get_full_path(),
                'level': rubric.level,
                'parent_name': rubric.parent.name if rubric.parent else None,
                'medicine_count': rubric.med_count,
                'synonyms': synonyms,
                'medicines': medicines_list,
                'category': rubric.parent.name if rubric.parent and rubric.level == 1 else rubric.name if rubric.level == 0 else None,
            })
        
        return JsonResponse({
            'success': True,
            'rubrics': rubric_list,
            'total': len(rubric_list)
        })
    
    except Exception as e:
        logger.error(f"Error searching rubrics: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': f'Search failed: {str(e)}'}, status=500)



@csrf_exempt
def get_rubric_detail(request, rubric_id):
    """Get detailed information about a specific rubric"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        rubric = Rubric.objects.select_related('parent').get(
            id=rubric_id,
            is_active=True
        )
        
        # Get sub-rubrics
        sub_rubrics = list(
            Rubric.objects.filter(parent=rubric, is_active=True)
            .values('id', 'name', 'name_hindi', 'level')
        )
        
        # Get medicines with grades
        medicine_grades = RubricMedicineGrade.objects.filter(
            rubric=rubric
        ).select_related('medicine').order_by('-grade', 'medicine__name')
        
        medicines = []
        for mg in medicine_grades:
            medicines.append({
                'id': mg.medicine.id,
                'name': mg.medicine.name,
                'latin_name': mg.medicine.latin_name,
                'grade': mg.grade,
                'grade_label': mg.get_grade_display(),
            })
        
        # Get synonyms (English and Hindi)
        synonyms = list(
            rubric.synonyms.values('synonym', 'synonym_hindi')
        )
        
        # Get modalities
        modalities_data = rubric.modalities.all()
        modalities = {
            'aggravations': list(
                modalities_data.filter(modality_type='aggravation')
                .values('name', 'name_hindi')
            ),
            'ameliorations': list(
                modalities_data.filter(modality_type='amelioration')
                .values('name', 'name_hindi')
            )
        }
        
        rubric_data = {
            'id': rubric.id,
            'name': rubric.name,
            'name_hindi': rubric.name_hindi,
            'description': rubric.description,
            'full_path': rubric.get_full_path(),
            'level': rubric.level,
            'parent_name': rubric.parent.name if rubric.parent else None,
            'sub_rubrics': sub_rubrics,
            'medicines': medicines,
            'synonyms': synonyms,
            'modalities': modalities,
        }
        
        return JsonResponse({'success': True, 'rubric': rubric_data})
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching rubric detail: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_rubric_medicines(request, rubric_id):
    """Get all medicines associated with a rubric"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        # Get medicine grades
        grades = RubricMedicineGrade.objects.filter(
            rubric=rubric
        ).select_related('medicine').order_by('-grade', 'medicine__name')
        
        medicines = []
        for grade in grades:
            medicines.append({
                'id': grade.medicine.id,
                'name': grade.medicine.name,
                'latin_name': grade.medicine.latin_name,
                'common_name': grade.medicine.common_name,
                'grade': grade.grade,
                'grade_label': grade.get_grade_display(),
                'notes': grade.notes,
                'source': grade.source,
            })
        
        return JsonResponse({
            'success': True,
            'rubric': {
                'id': rubric.id,
                'name': rubric.name,
            },
            'medicines': medicines,
            'total': len(medicines)
        })
    
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching rubric medicines: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def perform_repertorization(request, case_id=None):
    """
    Perform repertorization analysis
    Can be standalone or associated with a case
    """
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Validate input
        rubrics_data = data.get('rubrics', [])
        if not rubrics_data:
            return JsonResponse({'error': 'No rubrics provided'}, status=400)
        
        method = data.get('method', 'weighted')
        associated_case_id = data.get('case_id') or case_id
        
        # Get case if provided
        case = None
        if associated_case_id:
            try:
                case = Case.objects.get(id=associated_case_id, doctor=doctor)
            except Case.DoesNotExist:
                return JsonResponse({'error': 'Case not found'}, status=404)
        
        # Validate rubrics exist
        rubric_ids = [r['rubric_id'] for r in rubrics_data]
        rubrics = Rubric.objects.filter(id__in=rubric_ids, is_active=True)
        
        if rubrics.count() != len(rubric_ids):
            return JsonResponse({'error': 'Some rubrics not found'}, status=400)
        
        # Create rubric intensity map
        rubric_intensity_map = {
            r['rubric_id']: r.get('intensity', 1) 
            for r in rubrics_data
        }
        
        # Perform analysis based on method
        if method == 'simple_addition':
            results = perform_simple_addition(rubric_ids)
        else:  # weighted (default)
            results = perform_weighted_analysis(rubric_ids, rubric_intensity_map)
        
        # Create repertorization record
        with transaction.atomic():
            repertorization = Repertorization.objects.create(
                case=case,
                doctor=doctor,
                method=method,
                total_rubrics=len(rubric_ids),
                total_medicines_analyzed=len(results)
            )
            
            # Save results
            for rank, result in enumerate(results, start=1):
                RepertorizationResult.objects.create(
                    repertorization=repertorization,
                    medicine_id=result['medicine_id'],
                    rank=rank,
                    total_score=result['score'],
                    coverage_percentage=result['coverage_percentage'],
                    rubrics_covered=result['rubrics_covered'],
                    grade_1_count=result.get('grade_1_count', 0),
                    grade_2_count=result.get('grade_2_count', 0),
                    grade_3_count=result.get('grade_3_count', 0),
                    grade_4_count=result.get('grade_4_count', 0),
                    grade_5_count=result.get('grade_5_count', 0),
                )
            
            # If case provided, save selected rubrics
            if case:
                # Clear existing rubrics for this case
                CaseRubric.objects.filter(case=case).delete()
                
                # Add new rubrics
                for rubric_data in rubrics_data:
                    rubric = rubrics.get(id=rubric_data['rubric_id'])
                    CaseRubric.objects.create(
                        case=case,
                        rubric=rubric,
                        intensity=rubric_data.get('intensity', 1),
                        notes=rubric_data.get('notes', '')
                    )
        
        # Prepare response with top medicines (Optimized with bulk lookup)
        top_n = results[:20]
        top_medicine_ids = [r['medicine_id'] for r in top_n]
        medicines_map = {m.id: m for m in Medicine.objects.filter(id__in=top_medicine_ids)}
        
        # Pre-fetch all rubrics involved in top results
        involved_rubric_ids = set()
        for r in top_n:
            involved_rubric_ids.update(r['rubric_grades'].keys())
        rubrics_map = {r.id: r for r in Rubric.objects.filter(id__in=involved_rubric_ids)}

        top_medicines = []
        for rank, result in enumerate(top_n, start=1):
            medicine = medicines_map.get(result['medicine_id'])
            if not medicine: continue
            
            # Get detailed rubric intensities
            rubric_intensities = []
            for rubric_id, grade_info in result['rubric_grades'].items():
                rubric = rubrics_map.get(int(rubric_id))
                if rubric:
                    rubric_intensities.append({
                        'rubric_name': rubric.name,
                        'intensity': grade_info['grade'],
                    })
            
            top_medicines.append({
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
                'score': float(result['score']),
                'rubric_count': result['rubrics_covered'],
                'coverage_percentage': float(result['coverage_percentage']),
                'details': {
                    'rubric_intensities': rubric_intensities,
                    'grade_distribution': {
                        'grade_1': result.get('grade_1_count', 0),
                        'grade_2': result.get('grade_2_count', 0),
                        'grade_3': result.get('grade_3_count', 0),
                        'grade_4': result.get('grade_4_count', 0),
                        'grade_5': result.get('grade_5_count', 0),
                    }
                }
            })
        
        return JsonResponse({
            'success': True,
            'message': 'Repertorization completed successfully',
            'repertorization': {
                'id': repertorization.id,
                'method': method,
                'total_rubrics': len(rubric_ids),
                'total_medicines_analyzed': len(results),
                'top_medicines': top_medicines,
                'created_at': repertorization.created_at.isoformat(),
            }
        }, status=201)
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error performing repertorization: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


def perform_simple_addition(rubric_ids):
    """
    Simple Addition Method
    Each rubric contributes equally, sum up grades
    """
    # Get all medicines that have grades for any of these rubrics
    medicine_scores = {}
    
    grades = RubricMedicineGrade.objects.filter(
        rubric_id__in=rubric_ids
    ).select_related('medicine')
    
    for grade in grades:
        med_id = grade.medicine.id
        
        if med_id not in medicine_scores:
            medicine_scores[med_id] = {
                'medicine_id': med_id,
                'score': 0,
                'rubrics_covered': 0,
                'rubric_grades': {},
                'grade_1_count': 0,
                'grade_2_count': 0,
                'grade_3_count': 0,
                'grade_4_count': 0,
                'grade_5_count': 0,
            }
        
        # Add grade to score
        medicine_scores[med_id]['score'] += grade.grade
        medicine_scores[med_id]['rubrics_covered'] += 1
        medicine_scores[med_id]['rubric_grades'][grade.rubric_id] = {
            'grade': grade.grade
        }
        
        # Count grade distribution
        grade_key = f'grade_{grade.grade}_count'
        medicine_scores[med_id][grade_key] += 1
    
    # Calculate coverage percentage
    total_rubrics = len(rubric_ids)
    for med_data in medicine_scores.values():
        med_data['coverage_percentage'] = round(
            (med_data['rubrics_covered'] / total_rubrics) * 100, 2
        )
    
    # Sort by score (descending)
    results = sorted(
        medicine_scores.values(),
        key=lambda x: (x['score'], x['rubrics_covered']),
        reverse=True
    )
    
    return results


def perform_weighted_analysis(rubric_ids, intensity_map):
    """
    Weighted Method
    Multiplies grade by rubric intensity (1-3)
    Higher intensity rubrics have more weight
    """
    medicine_scores = {}
    
    grades = RubricMedicineGrade.objects.filter(
        rubric_id__in=rubric_ids
    ).select_related('medicine')
    
    for grade in grades:
        med_id = grade.medicine.id
        rubric_id = grade.rubric_id
        
        intensity = intensity_map.get(rubric_id, 1)
        
        weighted_score = grade.grade * intensity
        
        if med_id not in medicine_scores:
            medicine_scores[med_id] = {
                'medicine_id': med_id,
                'score': 0,
                'rubrics_covered': 0,
                'rubric_grades': {},
                'grade_1_count': 0,
                'grade_2_count': 0,
                'grade_3_count': 0,
                'grade_4_count': 0,
                'grade_5_count': 0,
            }
        
        # Add weighted score
        medicine_scores[med_id]['score'] += weighted_score
        medicine_scores[med_id]['rubrics_covered'] += 1
        medicine_scores[med_id]['rubric_grades'][rubric_id] = {
            'grade': grade.grade,
            'intensity': intensity,
            'weighted_score': weighted_score
        }
        
        # Count grade distribution
        grade_key = f'grade_{grade.grade}_count'
        medicine_scores[med_id][grade_key] += 1
    
    # Calculate coverage percentage
    total_rubrics = len(rubric_ids)
    for med_data in medicine_scores.values():
        med_data['coverage_percentage'] = round(
            (med_data['rubrics_covered'] / total_rubrics) * 100, 2
        )
    
    # Sort by score (descending)
    results = sorted(
        medicine_scores.values(),
        key=lambda x: (x['score'], x['rubrics_covered']),
        reverse=True
    )
    
    return results



@csrf_exempt
def get_repertorizations(request):
    """Get all repertorizations for current doctor"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        # Get query parameters
        case_id = request.GET.get('case_id')
        limit = request.GET.get('limit')
        
        # Base query
        repertorizations = Repertorization.objects.filter(
            doctor=doctor
        ).select_related('case').prefetch_related('results')
        
        # Filter by case if provided
        if case_id:
            repertorizations = repertorizations.filter(case_id=case_id)
        
        # Order by created date
        repertorizations = repertorizations.order_by('-created_at')
        
        # Apply limit
        if limit:
            repertorizations = repertorizations[:int(limit)]
        
        rep_list = []
        for rep in repertorizations:
            # Get top 3 medicines
            top_medicines = []
            results = rep.results.all()[:3]
            for result in results:
                top_medicines.append({
                    'id': result.medicine.id,
                    'name': result.medicine.name,
                    'rank': result.rank,
                    'score': float(result.total_score),
                })
            
            rep_list.append({
                'id': rep.id,
                'case': {
                    'id': rep.case.id,
                    'case_number': rep.case.case_number,
                    'title': rep.case.title,
                } if rep.case else None,
                'method': rep.method,
                'total_rubrics': rep.total_rubrics,
                'total_medicines_analyzed': rep.total_medicines_analyzed,
                'top_medicines': top_medicines,
                'created_at': rep.created_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'repertorizations': rep_list,
            'total': len(rep_list)
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching repertorizations: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def get_repertorization_detail(request, rep_id):
    """Get detailed repertorization results"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        
        repertorization = Repertorization.objects.select_related('case').get(
            id=rep_id,
            doctor=doctor
        )
        
        # Get all results
        results = RepertorizationResult.objects.filter(
            repertorization=repertorization
        ).select_related('medicine').order_by('rank')
        
        medicines = []
        for result in results:
            medicines.append({
                'rank': result.rank,
                'medicine': {
                    'id': result.medicine.id,
                    'name': result.medicine.name,
                    'latin_name': result.medicine.latin_name,
                },
                'total_score': float(result.total_score),
                'coverage_percentage': float(result.coverage_percentage),
                'rubrics_covered': result.rubrics_covered,
                'grade_distribution': {
                    'grade_1': result.grade_1_count,
                    'grade_2': result.grade_2_count,
                    'grade_3': result.grade_3_count,
                    'grade_4': result.grade_4_count,
                    'grade_5': result.grade_5_count,
                }
            })
        
        rep_data = {
            'id': repertorization.id,
            'case': {
                'id': repertorization.case.id,
                'case_number': repertorization.case.case_number,
                'title': repertorization.case.title,
            } if repertorization.case else None,
            'method': repertorization.method,
            'total_rubrics': repertorization.total_rubrics,
            'total_medicines_analyzed': repertorization.total_medicines_analyzed,
            'medicines': medicines,
            'created_at': repertorization.created_at.isoformat(),
        }
        
        return JsonResponse({'success': True, 'repertorization': rep_data})
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Repertorization.DoesNotExist:
        return JsonResponse({'error': 'Repertorization not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching repertorization detail: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def save_repertorization_to_case(request, case_id):
    """
    Save an existing repertorization to a case
    Used when repertorization was done standalone first
    """
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        case = Case.objects.get(id=case_id, doctor=doctor)
        
        repertorization_id = data.get('repertorization_id')
        if not repertorization_id:
            return JsonResponse({'error': 'Repertorization ID required'}, status=400)
        
        # Get repertorization
        repertorization = Repertorization.objects.get(
            id=repertorization_id,
            doctor=doctor
        )
        
        # Update case association
        with transaction.atomic():
            repertorization.case = case
            repertorization.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Repertorization saved to case successfully'
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except Repertorization.DoesNotExist:
        return JsonResponse({'error': 'Repertorization not found'}, status=404)
    except Exception as e:
        logger.error(f"Error saving repertorization to case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def add_case_rubric(request, case_id):
    """Add a rubric to a case"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        case = Case.objects.get(id=case_id, doctor=doctor)
        
        rubric_id = data.get('rubric_id')
        intensity = data.get('intensity', 1)
        notes = data.get('notes', '')
        
        if not rubric_id:
            return JsonResponse({'error': 'Rubric ID required'}, status=400)
        
        rubric = Rubric.objects.get(id=rubric_id, is_active=True)
        
        # Check if already exists
        if CaseRubric.objects.filter(case=case, rubric=rubric).exists():
            return JsonResponse({'error': 'Rubric already added to this case'}, status=400)
        
        # Create case rubric
        case_rubric = CaseRubric.objects.create(
            case=case,
            rubric=rubric,
            intensity=intensity,
            notes=notes
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Rubric added to case',
            'case_rubric': {
                'id': case_rubric.id,
                'rubric': {
                    'id': rubric.id,
                    'name': rubric.name,
                },
                'intensity': intensity,
            }
        }, status=201)
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except Rubric.DoesNotExist:
        return JsonResponse({'error': 'Rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error adding rubric to case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def remove_case_rubric(request, case_id, rubric_id):
    """Remove a rubric from a case"""
    if request.method != "DELETE":
        return JsonResponse({'error': 'DELETE method required'}, status=405)
    
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        doctor = Doctor.objects.get(id=doctor_id, is_active=True)
        case = Case.objects.get(id=case_id, doctor=doctor)
        
        case_rubric = CaseRubric.objects.get(case=case, rubric_id=rubric_id)
        case_rubric.delete()
        
        return JsonResponse({
            'success': True,
            'message': 'Rubric removed from case'
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Case.DoesNotExist:
        return JsonResponse({'error': 'Case not found'}, status=404)
    except CaseRubric.DoesNotExist:
        return JsonResponse({'error': 'Case rubric not found'}, status=404)
    except Exception as e:
        logger.error(f"Error removing rubric from case: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)





@csrf_exempt
def get_all_medicines(request):
    """
    Get all medicines with usage stats, pagination and search
    GET /homeopathy/doctor/medicines/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({'error': 'Authentication required'}, status=403)

        # Pagination and Search params
        search = request.GET.get('search', '').strip()
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 50))
        offset = (page - 1) * limit

        medicines = Medicine.objects.filter(is_active=True)

        if search:
            medicines = medicines.filter(
                Q(name__icontains=search) |
                Q(latin_name__icontains=search) |
                Q(common_name__icontains=search) |
                Q(name_hindi__icontains=search) |
                Q(family__icontains=search)
            )

        total_count = medicines.count()
        medicines = medicines.order_by('name')[offset:offset + limit]

        medicines_data = []
        for medicine in medicines:
            medicines_data.append({
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
                'common_name': medicine.common_name or '',
                'name_hindi': medicine.name_hindi or '',
                'family': medicine.family or '',
                'abbreviation': '', 
                'description': medicine.description or '',
                'source': medicine.source or '',
                'kingdom': '', 
                'popular': medicine.usage_count > 50,
                'usage_count': medicine.usage_count,
                'potencies': medicine.potencies or '',
                'indications': medicine.indications or '',
                'contraindications': medicine.contraindications or '',
            })

        return JsonResponse({
            'success': True,
            'medicines': medicines_data,
            'total': total_count,
            'page': page,
            'limit': limit,
            'has_more': offset + limit < total_count
        })

    except Exception as e:
        logger.error(f"Error fetching medicines: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch medicines',
            'detail': str(e)
        }, status=500)


@csrf_exempt
def get_medicine_detail(request, medicine_id):
    """
    Get detailed info about a specific medicine
    GET /homeopathy/doctor/medicines/<id>/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        medicine = Medicine.objects.prefetch_related(
            'rubric_grades__rubric'
        ).get(id=medicine_id, is_active=True)

        # Get all rubrics with grades for this medicine
        rubric_grades = []
        for rmg in medicine.rubric_grades.filter(rubric__is_active=True):
            # Build rubric path
            path_parts = []
            current = rmg.rubric
            while current:
                path_parts.insert(0, current.name)
                current = current.parent
            rubric_path = ' > '.join(path_parts)

            rubric_grades.append({
                'rubric_id': rmg.rubric.id,
                'rubric_name': rmg.rubric.name,
                'rubric_path': rubric_path,
                'grade': rmg.grade,
            })

        return JsonResponse({
            'success': True,
            'medicine': {
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
                'common_name': medicine.common_name or '',
                'name_hindi': medicine.name_hindi or '',
                'family': medicine.family or '',
                'description': medicine.description or '',
                'source': medicine.source or '',
                'usage_count': medicine.usage_count,
                'avg_rating': float(medicine.avg_rating),
                'potencies': medicine.potencies or '',
                'indications': medicine.indications or '',
                'contraindications': medicine.contraindications or '',
                'rubric_grades': rubric_grades,
            }
        })

    except Medicine.DoesNotExist:
        return JsonResponse({
            'error': 'Medicine not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error fetching medicine detail: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch medicine detail',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_medicine(request):
    """
    Create a new medicine
    POST /homeopathy/doctor/medicines/create/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('name') or not data.get('latin_name'):
            return JsonResponse({
                'error': 'Name and Latin name are required'
            }, status=400)

        with transaction.atomic():
            # Check for duplicate
            if Medicine.objects.filter(name=data['name'], is_active=True).exists():
                return JsonResponse({
                    'error': 'Medicine with this name already exists'
                }, status=400)

            # Create medicine
            medicine = Medicine.objects.create(
                name=data['name'],
                latin_name=data['latin_name'],
                common_name=data.get('common_name', ''),
                name_hindi=data.get('name_hindi', ''),
                family=data.get('family', ''),
                description=data.get('description', ''),
                description_hindi=data.get('description_hindi', ''),
                source=data.get('source', ''),
                potencies=data.get('potencies', ''),
                indications=data.get('indications', ''),
                contraindications=data.get('contraindications', ''),
            )

        logger.info(f"Medicine created: {medicine.name} (ID: {medicine.id}) by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': 'Medicine created successfully',
            'medicine_id': medicine.id,
            'medicine': {
                'id': medicine.id,
                'name': medicine.name,
                'latin_name': medicine.latin_name,
            }
        })

    except Exception as e:
        logger.error(f"Error creating medicine: {str(e)}")
        return JsonResponse({
            'error': 'Failed to create medicine',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_medicine(request, medicine_id):
    """
    Update a medicine
    PUT /homeopathy/doctor/medicines/<id>/update/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        data = json.loads(request.body)
        
        with transaction.atomic():
            medicine = Medicine.objects.get(id=medicine_id, is_active=True)
            
            # Update fields
            if 'name' in data:
                medicine.name = data['name']
            if 'latin_name' in data:
                medicine.latin_name = data['latin_name']
            if 'common_name' in data:
                medicine.common_name = data['common_name']
            if 'name_hindi' in data:
                medicine.name_hindi = data['name_hindi']
            if 'family' in data:
                medicine.family = data['family']
            if 'description' in data:
                medicine.description = data['description']
            if 'description_hindi' in data:
                medicine.description_hindi = data['description_hindi']
            if 'source' in data:
                medicine.source = data['source']
            if 'potencies' in data:
                medicine.potencies = data['potencies']
            if 'indications' in data:
                medicine.indications = data['indications']
            if 'contraindications' in data:
                medicine.contraindications = data['contraindications']
            
            medicine.save()

        logger.info(f"Medicine updated: {medicine.name} (ID: {medicine.id}) by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': 'Medicine updated successfully',
            'medicine': {
                'id': medicine.id,
                'name': medicine.name,
            }
        })

    except Medicine.DoesNotExist:
        return JsonResponse({
            'error': 'Medicine not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error updating medicine: {str(e)}")
        return JsonResponse({
            'error': 'Failed to update medicine',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_medicine(request, medicine_id):
    """
    Delete (soft delete) a medicine
    DELETE /homeopathy/doctor/medicines/<id>/delete/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        with transaction.atomic():
            medicine = Medicine.objects.get(id=medicine_id)
            
            # Soft delete
            medicine.is_active = False
            medicine.save()

        logger.info(f"Medicine deleted: {medicine.name} (ID: {medicine.id}) by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': 'Medicine deleted successfully'
        })

    except Medicine.DoesNotExist:
        return JsonResponse({
            'error': 'Medicine not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error deleting medicine: {str(e)}")
        return JsonResponse({
            'error': 'Failed to delete medicine',
            'detail': str(e)
        }, status=500)




@csrf_exempt
def get_rubric_medicine_grades(request):
    """
    Get all rubric-medicine grade mappings
    GET /homeopathy/doctor/rubric-medicine-grades/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        mappings = RubricMedicineGrade.objects.filter(
            rubric__is_active=True,
            medicine__is_active=True
        ).select_related('rubric', 'medicine').order_by('-grade', 'rubric__name')

        mappings_data = []
        for mapping in mappings:
            # Build rubric path
            path_parts = []
            current = mapping.rubric
            while current:
                path_parts.insert(0, current.name)
                current = current.parent
            rubric_path = ' > '.join(path_parts)

            mappings_data.append({
                'id': mapping.id,
                'rubric_id': mapping.rubric.id,
                'rubric_name': mapping.rubric.name,
                'rubric_path': rubric_path,
                'medicine_id': mapping.medicine.id,
                'medicine_name': mapping.medicine.name,
                'grade': mapping.grade,
            })

        return JsonResponse({
            'success': True,
            'mappings': mappings_data,
            'total': len(mappings_data),
        })

    except Exception as e:
        logger.error(f"Error fetching mappings: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch mappings',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def create_rubric_medicine_grade(request):
    """
    Create a new rubric-medicine grade mapping
    POST /homeopathy/doctor/rubric-medicine-grades/create/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        data = json.loads(request.body)
        
        # Validate required fields
        if not data.get('rubric_id') or not data.get('medicine_id') or not data.get('grade'):
            return JsonResponse({
                'error': 'Rubric ID, Medicine ID, and Grade are required'
            }, status=400)

        # Validate grade (1-5)
        grade = int(data['grade'])
        if grade < 1 or grade > 5:
            return JsonResponse({
                'error': 'Grade must be between 1 and 5'
            }, status=400)

        with transaction.atomic():
            # Check for duplicate
            existing = RubricMedicineGrade.objects.filter(
                rubric_id=data['rubric_id'],
                medicine_id=data['medicine_id']
            ).first()

            if existing:
                # Update existing grade
                existing.grade = grade
                if 'notes' in data:
                    existing.notes = data['notes']
                existing.save()
                action = 'updated'
                mapping = existing
            else:
                # Create new mapping
                mapping = RubricMedicineGrade.objects.create(
                    rubric_id=data['rubric_id'],
                    medicine_id=data['medicine_id'],
                    grade=grade,
                    notes=data.get('notes', ''),
                    source=data.get('source', '')
                )
                action = 'created'

        logger.info(f"Mapping {action}: Rubric {data['rubric_id']} - Medicine {data['medicine_id']} (Grade: {grade}) by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': f'Mapping {action} successfully',
            'mapping_id': mapping.id,
        })

    except Exception as e:
        logger.error(f"Error creating mapping: {str(e)}")
        return JsonResponse({
            'error': 'Failed to create mapping',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["PUT"])
def update_rubric_medicine_grade(request, mapping_id):
    """
    Update a rubric-medicine grade
    PUT /homeopathy/doctor/rubric-medicine-grades/<id>/update/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        data = json.loads(request.body)
        
        # Validate grade (1-5)
        grade = int(data.get('grade', 3))
        if grade < 1 or grade > 5:
            return JsonResponse({
                'error': 'Grade must be between 1 and 5'
            }, status=400)

        with transaction.atomic():
            mapping = RubricMedicineGrade.objects.get(id=mapping_id)
            mapping.grade = grade
            if 'notes' in data:
                mapping.notes = data['notes']
            mapping.save()

        logger.info(f"Mapping updated: ID {mapping_id} (Grade: {grade}) by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': 'Grade updated successfully'
        })

    except RubricMedicineGrade.DoesNotExist:
        return JsonResponse({
            'error': 'Mapping not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error updating mapping: {str(e)}")
        return JsonResponse({
            'error': 'Failed to update mapping',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_rubric_medicine_grade(request, mapping_id):
    """
    Delete a rubric-medicine grade mapping
    DELETE /homeopathy/doctor/rubric-medicine-grades/<id>/delete/
    """
    try:
        doctor_id = request.session.get('doctor_id')
        if not doctor_id:
            return JsonResponse({
                'error': 'Authentication required'
            }, status=403)

        with transaction.atomic():
            mapping = RubricMedicineGrade.objects.get(id=mapping_id)
            mapping.delete()

        logger.info(f"Mapping deleted: ID {mapping_id} by doctor {doctor_id}")

        return JsonResponse({
            'success': True,
            'message': 'Mapping deleted successfully'
        })

    except RubricMedicineGrade.DoesNotExist:
        return JsonResponse({
            'error': 'Mapping not found'
        }, status=404)
    except Exception as e:
        logger.error(f"Error deleting mapping: {str(e)}")
        return JsonResponse({
            'error': 'Failed to delete mapping',
            'detail': str(e)
        }, status=500)



@csrf_exempt
def get_patient_dashboard_stats(request):
    """Get dashboard statistics for patient"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
        
        # Get search statistics
        total_searches = PatientSearch.objects.filter(patient=patient).count()
        saved_searches = PatientSearch.objects.filter(patient=patient, is_saved=True).count()
        
        # Get this month's searches
        from datetime import timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        searches_this_month = PatientSearch.objects.filter(
            patient=patient,
            created_at__gte=thirty_days_ago
        ).count()
        
        # Get most analyzed symptoms
        searches = PatientSearch.objects.filter(patient=patient).order_by('-created_at')[:50]
        symptom_keywords = {}
        
        for search in searches:
            # Extract keywords from search text
            words = search.search_text.lower().split()
            for word in words:
                if len(word) > 4:  # Only count meaningful words
                    symptom_keywords[word] = symptom_keywords.get(word, 0) + 1
        
        # Get most common symptom
        most_analyzed = max(symptom_keywords.items(), key=lambda x: x[1])[0].title() if symptom_keywords else "None"
        
        # Calculate success rate (searches that were saved)
        success_rate = round((saved_searches / total_searches * 100) if total_searches > 0 else 0)
        
        # Calculate average match score
        searches_with_scores = searches.filter(top_medicine_1_score__isnull=False)
        avg_score = searches_with_scores.aggregate(
            avg=models.Avg('top_medicine_1_score')
        )['avg'] or 0
        avg_match_score = round(float(avg_score)) if avg_score else 0
        
        stats = {
            'total_searches': total_searches,
            'saved_searches': saved_searches,
            'searches_this_month': searches_this_month,
            'most_analyzed': most_analyzed,
            'success_rate': success_rate,
            'avg_match_score': avg_match_score,
        }
        
        return JsonResponse({'success': True, 'stats': stats})
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching dashboard stats: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



@csrf_exempt
def get_searches(request):
    """Get all searches for current patient"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
        
        # Get query parameters
        saved_only = request.GET.get('saved_only') == 'true'
        limit = request.GET.get('limit')
        
        # Base query
        searches = PatientSearch.objects.filter(patient=patient).prefetch_related('matched_rubrics')
        
        # Apply filters
        if saved_only:
            searches = searches.filter(is_saved=True)
        
        # Order by date
        searches = searches.order_by('-created_at')
        
        # Apply limit
        if limit:
            searches = searches[:int(limit)]
        
        search_list = []
        for search in searches:
            # Get matched rubrics
            rubrics = list(search.matched_rubrics.values('id', 'name')[:5])
            
            # Extract symptoms from matched rubrics
            symptoms = [rubric['name'] for rubric in rubrics]
            
            search_list.append({
                'id': search.id,
                'search_text': search.search_text,
                'symptoms': symptoms,
                'top_remedies': [
                    {
                        'medicine': search.top_medicine_1.name if search.top_medicine_1 else None,
                        'score': float(search.top_medicine_1_score) if search.top_medicine_1_score else 0
                    },
                    {
                        'medicine': search.top_medicine_2.name if search.top_medicine_2 else None,
                        'score': float(search.top_medicine_2_score) if search.top_medicine_2_score else 0
                    },
                    {
                        'medicine': search.top_medicine_3.name if search.top_medicine_3 else None,
                        'score': float(search.top_medicine_3_score) if search.top_medicine_3_score else 0
                    }
                ],
                'is_saved': search.is_saved,
                'created_at': search.created_at.isoformat(),
            })
        
        return JsonResponse({
            'success': True,
            'searches': search_list,
            'total': len(search_list)
        })
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching searches: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def get_search_detail(request, search_id):
    """Get detailed information about a specific search"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
        
        search = PatientSearch.objects.prefetch_related('matched_rubrics').get(
            id=search_id,
            patient=patient
        )
        
        # Get matched rubrics with details
        rubrics = []
        for rubric in search.matched_rubrics.all():
            rubrics.append({
                'id': rubric.id,
                'name': rubric.name,
                'description': rubric.description,
                'full_path': rubric.get_full_path()
            })
        
        search_data = {
            'id': search.id,
            'search_text': search.search_text,
            'matched_rubrics': rubrics,
            'top_medicines': [
                {
                    'rank': 1,
                    'medicine': {
                        'id': search.top_medicine_1.id,
                        'name': search.top_medicine_1.name,
                        'latin_name': search.top_medicine_1.latin_name,
                        'description': search.top_medicine_1.description,
                        'indications': search.top_medicine_1.indications,
                    } if search.top_medicine_1 else None,
                    'score': float(search.top_medicine_1_score) if search.top_medicine_1_score else 0
                },
                {
                    'rank': 2,
                    'medicine': {
                        'id': search.top_medicine_2.id,
                        'name': search.top_medicine_2.name,
                        'latin_name': search.top_medicine_2.latin_name,
                        'description': search.top_medicine_2.description,
                        'indications': search.top_medicine_2.indications,
                    } if search.top_medicine_2 else None,
                    'score': float(search.top_medicine_2_score) if search.top_medicine_2_score else 0
                },
                {
                    'rank': 3,
                    'medicine': {
                        'id': search.top_medicine_3.id,
                        'name': search.top_medicine_3.name,
                        'latin_name': search.top_medicine_3.latin_name,
                        'description': search.top_medicine_3.description,
                        'indications': search.top_medicine_3.indications,
                    } if search.top_medicine_3 else None,
                    'score': float(search.top_medicine_3_score) if search.top_medicine_3_score else 0
                }
            ],
            'is_saved': search.is_saved,
            'created_at': search.created_at.isoformat(),
        }
        
        return JsonResponse({'success': True, 'search': search_data})
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except PatientSearch.DoesNotExist:
        return JsonResponse({'error': 'Search not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching search detail: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
def save_search(request, search_id):
    """Toggle save status of a search"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
        
        search = PatientSearch.objects.get(id=search_id, patient=patient)
        
        # Toggle save status
        search.is_saved = not search.is_saved
        search.save()
        
        return JsonResponse({
            'success': True,
            'message': 'Search saved' if search.is_saved else 'Search unsaved',
            'is_saved': search.is_saved
        })
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except PatientSearch.DoesNotExist:
        return JsonResponse({'error': 'Search not found'}, status=404)
    except Exception as e:
        logger.error(f"Error saving search: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)

@csrf_exempt
def analyze_symptoms(request):
    """Analyze patient symptoms and find matching remedies"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    patient_id = request.session.get('patient_id')
    if not patient_id:
        return JsonResponse({'error': 'Not authenticated'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        patient = Patient.objects.get(id=patient_id, is_active=True)
        
        symptom_text = data.get('symptoms', '').strip()
        
        if not symptom_text:
            return JsonResponse({'error': 'Symptoms required'}, status=400)
        
        # Simple keyword matching for rubrics
        keywords = symptom_text.lower().split()
        
        # Find matching rubrics
        matched_rubrics = Rubric.objects.filter(
            Q(name__icontains=symptom_text) |
            Q(description__icontains=symptom_text) |
            Q(synonyms__synonym__icontains=symptom_text),
            is_active=True
        ).distinct()[:20]
        
        # If no direct matches, try individual keywords
        if not matched_rubrics.exists():
            for keyword in keywords:
                if len(keyword) > 3:
                    matched_rubrics = Rubric.objects.filter(
                        Q(name__icontains=keyword) |
                        Q(description__icontains=keyword),
                        is_active=True
                    ).distinct()[:20]
                    if matched_rubrics.exists():
                        break
        
        # Perform repertorization
        medicine_scores = {}
        
        for rubric in matched_rubrics:
            grades = RubricMedicineGrade.objects.filter(rubric=rubric).select_related('medicine')
            
            for grade in grades:
                med_id = grade.medicine.id
                
                if med_id not in medicine_scores:
                    medicine_scores[med_id] = {
                        'medicine': grade.medicine,
                        'score': 0,
                        'rubric_count': 0
                    }
                
                # Weight by grade
                medicine_scores[med_id]['score'] += grade.grade
                medicine_scores[med_id]['rubric_count'] += 1
        
        # Sort by score
        sorted_medicines = sorted(
            medicine_scores.values(),
            key=lambda x: (x['score'], x['rubric_count']),
            reverse=True
        )[:3]
        
        # Create search record
        with transaction.atomic():
            search = PatientSearch.objects.create(
                patient=patient,
                search_text=symptom_text,
                top_medicine_1=sorted_medicines[0]['medicine'] if len(sorted_medicines) > 0 else None,
                top_medicine_1_score=sorted_medicines[0]['score'] if len(sorted_medicines) > 0 else None,
                top_medicine_2=sorted_medicines[1]['medicine'] if len(sorted_medicines) > 1 else None,
                top_medicine_2_score=sorted_medicines[1]['score'] if len(sorted_medicines) > 1 else None,
                top_medicine_3=sorted_medicines[2]['medicine'] if len(sorted_medicines) > 2 else None,
                top_medicine_3_score=sorted_medicines[2]['score'] if len(sorted_medicines) > 2 else None,
            )
            
            # Link matched rubrics
            search.matched_rubrics.set(matched_rubrics)
        
        # Prepare response
        results = []
        for item in sorted_medicines:
            med = item['medicine']
            results.append({
                'id': med.id,
                'name': med.name,
                'latin_name': med.latin_name,
                'description': med.description,
                'indications': med.indications,
                'score': item['score'],
                'rubric_count': item['rubric_count'],
                'match_percentage': round((item['score'] / (len(matched_rubrics) * 5)) * 100) if len(matched_rubrics) > 0 else 0
            })
        
        return JsonResponse({
            'success': True,
            'message': 'Analysis completed successfully',
            'search_id': search.id,
            'matched_rubrics_count': matched_rubrics.count(),
            'results': results
        }, status=201)
    
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Patient not found'}, status=404)
    except Exception as e:
        logger.error(f"Error analyzing symptoms: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': str(e)}, status=500)


# Placeholder for PDF generation
@csrf_exempt
def generate_search_pdf(request, search_id):
    """Generate PDF report - TO BE IMPLEMENTED"""
    return JsonResponse({'error': 'Not implemented yet'}, status=501)


@csrf_exempt
def get_patient_searches_stats(request):
    """Get search statistics - TO BE IMPLEMENTED"""  
    return JsonResponse({'error': 'Not implemented yet'}, status=501)


@csrf_exempt
def patient_self_register(request):
    """Allow patients to register themselves"""
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)

    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)

    errors = {}
    required_fields = ['first_name', 'last_name', 'email', 'gender']

    # Required field validation
    for field in required_fields:
        if not data.get(field, '').strip():
            errors[field] = f'{field.replace("_", " ").title()} is required'

    # Email validation
    email = data.get('email', '').strip()
    if email:
        try:
            validate_email(email)
            if CustomUser.objects.filter(email=email, is_active=True).exists():
                errors['email'] = 'Email already registered'
        except ValidationError:
            errors['email'] = 'Invalid email format'

    # Password validation
    password = data.get('password', '').strip()
    if not password:
        password = "patient"
    elif len(password) < 8:
        errors['password'] = 'Password must be at least 8 characters long'

    # Gender validation
    gender = data.get('gender', '').strip().lower()
    if gender and gender not in ['male', 'female', 'other']:
        errors['gender'] = 'Invalid gender. Choose: male, female, or other'

    # Date of birth validation (optional)
    date_of_birth = data.get('date_of_birth')
    if date_of_birth:
        try:
            from datetime import datetime
            datetime.strptime(date_of_birth, '%Y-%m-%d')
        except ValueError:
            errors['date_of_birth'] = 'Invalid date format. Use YYYY-MM-DD'

    if errors:
        return JsonResponse(
            {'error': 'Validation failed', 'errors': errors},
            status=400
        )

    try:
        with transaction.atomic():
            # Create user account
            user = CustomUser.objects.create(
                username=email,
                email=email,
                first_name=data['first_name'],
                last_name=data['last_name'],
                user_type='patient',
                phone=data.get('phone', ''),
                password=make_password(password),
            )

            # Create patient profile
            patient = Patient.objects.create(
                user=user,
                gender=gender,
                date_of_birth=date_of_birth if date_of_birth else None,
                blood_group=data.get('blood_group', ''),
                address=data.get('address', ''),
                emergency_contact=data.get('emergency_contact', ''),
                medical_history=data.get('medical_history', ''),
                allergies=data.get('allergies', ''),
            )

            # Send welcome email
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif;">
                <h2>Welcome to Homeopathy Portal</h2>
                <p>Dear {user.get_full_name()},</p>
                <p>Your patient account has been successfully created!</p>
                <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Password:</strong> {password}</p>
                    <p><strong>Login:</strong> <a href="{settings.SITE_URL}">{settings.SITE_URL}</a></p>
                </div>
                <p>You can now log in and start analyzing your symptoms.</p>
            </body>
            </html>
            """
            
            send_email_notification(
                user.email,
                "Welcome to Homeopathy Portal",
                html_content
            )

            return JsonResponse(
                {
                    'success': True,
                    'message': 'Account created successfully! You can now log in.',
                    'patient': {
                        'id': patient.id,
                        'name': user.get_full_name(),
                        'email': user.email,
                    }
                },
                status=201
            )

    except Exception as e:
        logger.error(f"Error creating patient account: {str(e)}")
        return JsonResponse(
            {'error': 'Failed to create account. Please try again.'},
            status=500
        )



class TimeoutException(Exception):
    pass

@contextmanager
def time_limit(seconds):
    """Context manager to limit execution time"""
    def signal_handler(signum, frame):
        raise TimeoutException("Processing time limit exceeded")
    
    signal.signal(signal.SIGALRM, signal_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)


@csrf_exempt
@require_admin
@require_http_methods(["POST"])
def bulk_upload_rubrics(request):
    if 'file' not in request.FILES:
        return JsonResponse({'error': 'No file uploaded'}, status=400)

    uploaded_file = request.FILES['file']

    if not uploaded_file.name.endswith(('.xlsx', '.xls')):
        return JsonResponse({'error': 'Only Excel files (.xlsx, .xls) are supported'}, status=400)

    # FILE SIZE CHECK
    MAX_FILE_SIZE = 300 * 1024  # 300KB limit
    if uploaded_file.size > MAX_FILE_SIZE:
        file_size_kb = uploaded_file.size / 1024
        return JsonResponse({
            'error': f'File too large ({file_size_kb:.1f}KB). Maximum is 300KB. Please split your file into smaller parts (recommended: 2,000 rows per file).',
            'file_size_kb': round(file_size_kb, 1),
            'max_size_kb': 300,
            'suggestion': 'Split the file by selecting fewer sheets or rows and saving them as separate Excel files.'
        }, status=413)

    tmp_file_path = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.xlsx') as tmp_file:
            for chunk in uploaded_file.chunks():
                tmp_file.write(chunk)
            tmp_file_path = tmp_file.name

        logger.info(f"Processing uploaded file: {uploaded_file.name} ({uploaded_file.size} bytes)")

        # Process with timeout protection (25 seconds - leave 5 for response)
        try:
            with time_limit(25):
                stats = process_excel_upload(tmp_file_path, batch_size=15)
        except TimeoutException:
            logger.warning("Upload processing timed out - returning partial results")
            stats = {
                'total_rows': 0,
                'parent_rubrics_created': 0,
                'medicines_created': 0,
                'rubric_medicine_links': 0,
                'sheets_processed': 0,
                'errors': ['Processing timed out. Some data may have been uploaded. Please use smaller files (max 2,000 rows).']
            }

        # Determine response based on results
        if stats['sheets_processed'] > 0:
            status_code = 200 if not stats['errors'] else 207  # 207 = Multi-Status (partial success)
            
            message = 'Bulk upload completed successfully'
            if stats['errors']:
                message = f'Partial upload: {stats["sheets_processed"]} sheets processed, but some failed or timed out'
            
            return JsonResponse({
                'status': 'partial_success' if stats['errors'] else 'success',
                'message': message,
                'stats': stats,
                'warning': 'File was too large. Some sheets may not have been processed. Please split into smaller files.' if stats['errors'] else None
            }, status=status_code)
        else:
            return JsonResponse({
                'status': 'error',
                'error': 'No data was processed. File is too large or invalid.',
                'stats': stats,
                'suggestion': 'Please split your Excel file into smaller parts (max 2,000 rows per file).'
            }, status=500)

    except Exception as e:
        logger.exception("Error during bulk upload")
        return JsonResponse({
            'status': 'error',
            'error': str(e),
            'suggestion': 'If the file is large, please split it into smaller parts.'
        }, status=500)

    finally:
        if tmp_file_path and os.path.exists(tmp_file_path):
            try:
                os.unlink(tmp_file_path)
            except:
                pass


def process_excel_upload(file_path, batch_size=15):
    logger = logging.getLogger(__name__)
    stats = {
        'total_rows': 0,
        'parent_rubrics_created': 0,
        'medicines_created': 0,
        'rubric_medicine_links': 0,
        'sheets_processed': 0,
        'errors': []
    }

    try:
        excel_data = pd.read_excel(file_path, sheet_name=None)
        total_sheets = len(excel_data)
        
        logger.info(f"Found {total_sheets} sheets in Excel file")

        # Process sheets with timeout awareness
        for idx, (sheet_name, df) in enumerate(excel_data.items(), 1):
            if df.empty or 'Rubric (English)' not in df.columns:
                logger.warning(f"Skipping sheet {sheet_name}: empty or missing 'Rubric (English)' column")
                continue

            try:
                logger.info(f"Processing sheet {idx}/{total_sheets}: {sheet_name} ({len(df)} rows)")
                sheet_stats = process_sheet(sheet_name, df, batch_size)
                
                stats['total_rows'] += sheet_stats['rows_processed']
                stats['parent_rubrics_created'] += sheet_stats['rubrics_created']
                stats['medicines_created'] += sheet_stats['medicines_created']
                stats['rubric_medicine_links'] += sheet_stats['links_created']
                stats['sheets_processed'] += 1
                
                logger.info(f"Completed {sheet_name}: {sheet_stats}")

            except TimeoutException:
                # Timeout - stop processing more sheets
                logger.warning(f"Timeout reached at sheet {sheet_name}")
                stats['errors'].append(f"Timeout at sheet '{sheet_name}'. Processed {stats['sheets_processed']}/{total_sheets} sheets.")
                raise  # Re-raise to break out
                
            except Exception as e:
                logger.exception(f"Error processing sheet {sheet_name}")
                stats['errors'].append(f"{sheet_name}: {str(e)[:200]}")
                # Continue processing other sheets

        logger.info(f"Upload complete. Total stats: {stats}")
        return stats

    except TimeoutException:
        # Timeout occurred - return partial results
        logger.warning("Upload timed out, returning partial results")
        return stats
        
    except Exception as e:
        logger.exception("Error reading Excel file")
        stats['errors'].append(f"File read error: {str(e)}")
        return stats


def process_sheet(sheet_name, df, batch_size=15):
    logger = logging.getLogger(__name__)

    df = df.fillna('')

    medicine_col = None
    for col in ['Medicines (English)', 'Medicines (English only)', 'Medicine (English)']:
        if col in df.columns:
            medicine_col = col
            break

    if not medicine_col:
        logger.warning(f"No medicine column found in {sheet_name}")
        return {
            'rows_processed': 0,
            'rubrics_created': 0,
            'medicines_created': 0,
            'links_created': 0
        }

    rubric_col = 'Rubric (English)'
    total_rows = len(df)

    stats = {
        'rows_processed': 0,
        'rubrics_created': 0,
        'medicines_created': 0,
        'links_created': 0
    }

    for start in range(0, total_rows, batch_size):
        end = min(start + batch_size, total_rows)
        batch_df = df.iloc[start:end]

        logger.info(f"{sheet_name}: processing rows {start + 1}-{end}/{total_rows}")

        try:
            batch_stats = process_batch(
                sheet_name,
                batch_df,
                rubric_col,
                medicine_col
            )

            stats['rows_processed'] += len(batch_df)
            stats['rubrics_created'] += batch_stats['rubrics_created']
            stats['medicines_created'] += batch_stats['medicines_created']
            stats['links_created'] += batch_stats['links_created']
            
            logger.info(f"{sheet_name}: batch {start + 1}-{end} completed - {batch_stats}")

        except Exception as e:
            logger.error(f"{sheet_name}: batch {start + 1}-{end} failed: {str(e)}")
            # Continue with next batch instead of failing completely

    return stats


@transaction.atomic
def process_batch(sheet_name, batch_df, rubric_col, medicine_col):
    logger = logging.getLogger(__name__)
    batch_stats = {'rubrics_created': 0, 'medicines_created': 0, 'links_created': 0}

    rubric_names = set()
    medicine_names = set()

    # Collect normalized names
    for _, row in batch_df.iterrows():
        rubric = normalize(row[rubric_col])
        meds = normalize(row[medicine_col])
        if rubric:
            rubric_names.add(rubric)
        if meds:
            medicine_names.update(m.strip() for m in meds.split(','))

    # ========== OPTIMIZATION 1: Chunked Medicine Queries ==========
    medicine_names = list(medicine_names)
    all_medicines = {}
    
    CHUNK_SIZE = 100  # Process 100 medicines at a time
    for i in range(0, len(medicine_names), CHUNK_SIZE):
        chunk = medicine_names[i:i + CHUNK_SIZE]
        chunk_medicines = Medicine.objects.filter(name__in=chunk).in_bulk(field_name='name')
        all_medicines.update(chunk_medicines)
    
    # Create missing medicines
    new_medicine_names = [name for name in medicine_names if name not in all_medicines]
    new_medicines = [Medicine(name=name, latin_name=name) for name in new_medicine_names]
    
    if new_medicines:
        Medicine.objects.bulk_create(new_medicines, ignore_conflicts=True)
        batch_stats['medicines_created'] = len(new_medicines)
        
        # Refresh to get IDs for newly created medicines
        for i in range(0, len(new_medicine_names), CHUNK_SIZE):
            chunk = new_medicine_names[i:i + CHUNK_SIZE]
            chunk_medicines = Medicine.objects.filter(name__in=chunk).in_bulk(field_name='name')
            all_medicines.update(chunk_medicines)

    # ========== OPTIMIZATION 2: Efficient Rubric Creation ==========
    existing_rubrics = Rubric.objects.filter(name__in=rubric_names).select_related('parent')
    all_rubrics = {(r.parent_id, r.name): r for r in existing_rubrics}

    new_rubrics = []
    for _, row in batch_df.iterrows():
        rubric_name = normalize(row[rubric_col])
        parent = None  # If you have parent info, assign here
        key = (parent.id if parent else None, rubric_name)
        if rubric_name and key not in all_rubrics:
            new_rubric = Rubric(name=rubric_name, parent=parent, level=0)
            new_rubrics.append(new_rubric)
            all_rubrics[key] = new_rubric

    if new_rubrics:
        Rubric.objects.bulk_create(new_rubrics, ignore_conflicts=True)
        batch_stats['rubrics_created'] = len(new_rubrics)
        
        # Refresh to get IDs for newly created rubrics
        existing_rubrics = Rubric.objects.filter(name__in=rubric_names).select_related('parent')
        all_rubrics = {(r.parent_id, r.name): r for r in existing_rubrics}

    # ========== OPTIMIZATION 3: Efficient Relationship Creation ==========
    relation_map = {}
    for _, row in batch_df.iterrows():
        rubric_name = normalize(row[rubric_col])
        meds = normalize(row[medicine_col])
        if not rubric_name or not meds:
            continue
        
        key = (None, rubric_name)
        rubric = all_rubrics.get(key)
        if not rubric:
            continue
        
        for med in meds.split(','):
            med = med.strip()
            medicine = all_medicines.get(med)
            if medicine:
                relation_key = (rubric.id, medicine.id)
                relation_map[relation_key] = RubricMedicineGrade(
                    rubric=rubric, 
                    medicine=medicine, 
                    grade=3
                )

    if relation_map:
        RubricMedicineGrade.objects.bulk_create(
            relation_map.values(), 
            ignore_conflicts=True
        )
        batch_stats['links_created'] = len(relation_map)

    return batch_stats





@csrf_exempt
@require_admin
def download_rubric_template(request):
    """Download Excel template for bulk upload"""
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        import io
        from django.http import HttpResponse
        
        # Create sample data
        data = {
            'Rubric (English)': ['Mind, Anger', 'Mind, Anxiety'],
            'Rubric (Hindi)': ['मन – क्रोध', 'मन – चिंता'],
            'Sub-rubric (English)': ['Violent anger', 'About future'],
            'Sub-rubric (Hindi)': ['उग्र क्रोध', 'भविष्य की चिंता'],
            'Synonyms (English)': ['rage', 'apprehension'],
            'Cross-reference (English)': ['Irritability', 'Fear'],
            'Synonyms/Cross-ref (Hindi)': ['क्रोध, चिड़चिड़ापन', 'आशंका, भय'],
            'Modalities (Eng + Hindi)': ['worse contradiction / विरोध से बढ़े', 'worse night / रात में बढ़े'],
            'Medicines (English)': ['Nux-v, Cham, Bell, Hepar', 'Ars-alb, Calc-c, Phos']
        }
        
        df = pd.DataFrame(data)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Rubrics')
        
        output.seek(0)
        
        response = HttpResponse(
            output.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = 'attachment; filename="rubric_upload_template.xlsx"'
        
        return response
        
    except Exception as e:
        logger.error(f"Error generating template: {str(e)}")
        return JsonResponse({'error': str(e)}, status=500)



import json
import logging
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils import timezone
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings

from .models import Doctor, Patient, CustomUser

logger = logging.getLogger(__name__)



@csrf_exempt
def send_doctor_message(request, doctor_id):
    """
    Send a message/appointment request to a doctor
    POST /homeopathy/doctor/<doctor_id>/send-message/
    """
    if request.method != "POST":
        return JsonResponse({'error': 'POST method required'}, status=405)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        # Get doctor
        doctor = Doctor.objects.select_related('user').get(
            id=doctor_id,
            is_active=True
        )
        
        # Validate required fields
        message = data.get('message', '').strip()
        patient_name = data.get('patient_name', '').strip()
        patient_phone = data.get('patient_phone', '').strip()
        
        if not message or not patient_name or not patient_phone:
            return JsonResponse({
                'error': 'Message, patient name, and phone are required'
            }, status=400)
        
        # Send email notification to doctor
        subject = f'New Appointment Request from {patient_name}'
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #3F856C; border-bottom: 2px solid #3F856C; padding-bottom: 10px;">
                    New Appointment Request
                </h2>
                
                <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Patient Details:</h3>
                    <p><strong>Name:</strong> {patient_name}</p>
                    <p><strong>Phone:</strong> {patient_phone}</p>
                </div>
                
                <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                    <h3 style="margin-top: 0;">Message:</h3>
                    <p style="white-space: pre-wrap;">{message}</p>
                </div>
                
                <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                    <p style="margin: 0;">
                        <strong>Quick Actions:</strong><br>
                        • Call patient: <a href="tel:{patient_phone}" style="color: #3F856C;">{patient_phone}</a><br>
                        • WhatsApp: <a href="https://wa.me/{patient_phone.replace(' ', '').replace('+', '')}" style="color: #3F856C;">Send WhatsApp Message</a>
                    </p>
                </div>
                
                <p style="margin-top: 30px; color: #666; font-size: 12px;">
                    This is an automated notification from the Homeopathy Portal.
                </p>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        New Appointment Request
        
        Patient Details:
        Name: {patient_name}
        Phone: {patient_phone}
        
        Message:
        {message}
        
        Please contact the patient to confirm the appointment.
        """
        
        try:
            email_message = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[doctor.user.email],
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send(fail_silently=False)
            
            logger.info(f"Appointment request sent to Dr. {doctor.user.get_full_name()} from {patient_name}")
            
            return JsonResponse({
                'success': True,
                'message': 'Appointment request sent successfully',
                'doctor': {
                    'id': doctor.id,
                    'name': doctor.user.get_full_name(),
                    'phone': doctor.user.phone,
                }
            })
            
        except Exception as email_error:
            logger.error(f"Failed to send email: {str(email_error)}")
            # Even if email fails, return success since WhatsApp is the primary channel
            return JsonResponse({
                'success': True,
                'message': 'Request logged. Please contact doctor via WhatsApp.',
                'doctor': {
                    'id': doctor.id,
                    'name': doctor.user.get_full_name(),
                    'phone': doctor.user.phone,
                }
            })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error sending message to doctor: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to send message',
            'detail': str(e)
        }, status=500)






@csrf_exempt
def get_public_doctors(request):
    """
    Get all active doctors for public viewing (no authentication required)
    GET /homeopathy/public/doctors/
    """
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        # Get filters
        search = request.GET.get('search', '').strip()
        specialization = request.GET.get('specialization', '').strip()
        doctor_class = request.GET.get('doctor_class', '').strip()  # NEW
        
        # Base query - only active doctors
        doctors = Doctor.objects.filter(
            is_active=True,
            user__is_active=True
        ).select_related('user').order_by('-created_at')
        
        # Apply filters
        if search:
            doctors = doctors.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialization__icontains=search) |
                Q(qualification__icontains=search)
            )
        
        if specialization:
            doctors = doctors.filter(specialization__icontains=specialization)
        
        # Filter by doctor class
        if doctor_class:
            doctors = doctors.filter(doctor_class=doctor_class)
        
        doctor_list = []
        for doctor in doctors:
            doctor_data = {
                'id': doctor.id,
                'name': doctor.user.get_full_name(),
                'email': doctor.user.email,
                'phone': doctor.user.phone or 'Not available',
                'specialization': doctor.specialization,
                'qualification': doctor.qualification,
                'registration_number': doctor.registration_number,
                'experience_years': doctor.experience_years,
                'doctor_class': doctor.doctor_class,  # NEW
                'bio': doctor.bio or '',
                'profile_image': doctor.profile_image.url if doctor.profile_image else None,  # NEW
                'created_at': doctor.created_at.isoformat(),
            }
            doctor_list.append(doctor_data)
        
        # Get counts by class for UI
        counts = {
            'all': doctors.count(),
            'doctor_jp_nautiyal': Doctor.objects.filter(
                is_active=True, 
                user__is_active=True, 
                doctor_class='doctor_jp_nautiyal'
            ).count(),
            'core_team': Doctor.objects.filter(
                is_active=True, 
                user__is_active=True, 
                doctor_class='core_team'
            ).count(),
            'individual': Doctor.objects.filter(
                is_active=True, 
                user__is_active=True, 
                doctor_class='individual'
            ).count(),
        }
        
        return JsonResponse({
            'success': True,
            'doctors': doctor_list,
            'total': len(doctor_list),
            'counts': counts  # NEW
        })
    
    except Exception as e:
        logger.error(f"Error fetching public doctors: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch doctors',
            'detail': str(e)
        }, status=500)




@csrf_exempt
def get_doctor_public_profile(request, doctor_id):
    """
    Get public profile of a specific doctor
    GET /homeopathy/public/doctors/<doctor_id>/
    """
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        doctor = Doctor.objects.select_related('user').get(
            id=doctor_id,
            is_active=True,
            user__is_active=True
        )
        
        # Get total cases count
        total_cases = Case.objects.filter(doctor=doctor).count()
        
        # Get years of practice (from created_at)
        years_on_platform = (timezone.now() - doctor.created_at).days // 365
        
        doctor_data = {
            'id': doctor.id,
            'name': doctor.user.get_full_name(),
            'email': doctor.user.email,
            'phone': doctor.user.phone or 'Not available',
            'specialization': doctor.specialization,
            'qualification': doctor.qualification,
            'registration_number': doctor.registration_number,
            'experience_years': doctor.experience_years,
            'bio': doctor.bio if hasattr(doctor, 'bio') else '',
            'consultation_fee': str(doctor.consultation_fee) if hasattr(doctor, 'consultation_fee') and doctor.consultation_fee else None,
            'total_cases': total_cases,
            'years_on_platform': years_on_platform,
            'created_at': doctor.created_at.isoformat(),
        }
        
        return JsonResponse({
            'success': True,
            'doctor': doctor_data
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching doctor profile: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch doctor profile',
            'detail': str(e)
        }, status=500)


@csrf_exempt
def get_doctor_specializations(request):
    """
    Get list of all unique doctor specializations
    GET /homeopathy/public/specializations/
    """
    if request.method != "GET":
        return JsonResponse({'error': 'GET method required'}, status=405)
    
    try:
        specializations = Doctor.objects.filter(
            is_active=True,
            user__is_active=True
        ).values_list('specialization', flat=True).distinct().order_by('specialization')
        
        specialization_list = [
            spec for spec in specializations if spec and spec.strip()
        ]
        
        return JsonResponse({
            'success': True,
            'specializations': specialization_list,
            'total': len(specialization_list)
        })
    
    except Exception as e:
        logger.error(f"Error fetching specializations: {str(e)}")
        return JsonResponse({
            'error': 'Failed to fetch specializations',
            'detail': str(e)
        }, status=500)




@csrf_exempt
@require_http_methods(["POST"])
def send_message_to_doctor(request):
    """
    Patient sends a message/appointment request to a doctor
    POST /homeopathy/messages/send/
    
    Body:
    {
        "doctor_id": 1,
        "message": "I would like to book...",
        "patient_name": "John Doe",
        "patient_phone": "+919876543210",
        "appointment_date": "2025-02-15",
        "appointment_time": "10:00 AM",
        "appointment_type": "online",
        "city": "Delhi",
        "specialty": "Pain Management",
        "sub_specialty": "Headache & Migraine",
        "problem_description": "Frequent headaches...",
        "message_type": "appointment_request"  # optional
    }
    """
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        # Get patient from session
        patient_id = request.session.get('patient_id')
        
        if not patient_id:
            return JsonResponse({'error': 'Authentication required'}, status=401)
        
        try:
            patient = Patient.objects.select_related('user').get(id=patient_id)
            sender = patient.user
        except Patient.DoesNotExist:
            return JsonResponse({'error': 'Invalid session'}, status=401)
        
        # Get doctor
        doctor_id = data.get('doctor_id')
        if not doctor_id:
            return JsonResponse({'error': 'doctor_id is required'}, status=400)
        
        doctor = Doctor.objects.select_related('user').get(
            id=doctor_id,
            is_active=True,
            user__is_active=True
        )
        
        # Validate required fields
        message_text = data.get('message', '').strip()
        patient_name = data.get('patient_name', '').strip()
        patient_phone = data.get('patient_phone', '').strip()
        
        if not message_text or not patient_name or not patient_phone:
            return JsonResponse({
                'error': 'Message, patient name, and phone are required'
            }, status=400)
        
        # Create message
        message = Message.objects.create(
            sender=sender,
            doctor=doctor,
            message_type=data.get('message_type', 'appointment_request'),
            message=message_text,
            patient_name=patient_name,
            patient_phone=patient_phone,
            appointment_date=data.get('appointment_date'),
            appointment_time=data.get('appointment_time'),
            appointment_type=data.get('appointment_type'),
            city=data.get('city', ''),
            specialty=data.get('specialty', ''),
            sub_specialty=data.get('sub_specialty', ''),
            problem_description=data.get('problem_description', ''),
            status='pending',
            is_read=False
        )

        # Analyze symptoms and attach rubrics if problem description or message exists
        problem_text = data.get('problem_description', message_text)
        if problem_text:
            try:
                # Find matching rubrics
                matched_rubrics = Rubric.objects.filter(
                    Q(is_active=True) & (
                        Q(name__icontains=problem_text) |
                        Q(description__icontains=problem_text)
                    )
                ).distinct()[:10]

                if not matched_rubrics.exists():
                    # Word-by-word search for better coverage
                    words = [w for w in problem_text.split() if len(w) > 3]
                    if words:
                        query = Q()
                        for word in words[:5]:
                            query |= Q(name__icontains=word) | Q(description__icontains=word)
                        matched_rubrics = Rubric.objects.filter(
                            query, is_active=True
                        ).distinct()[:10]
                
                if matched_rubrics.exists():
                    message.matched_rubrics.set(matched_rubrics)
            except Exception as e:
                logger.error(f"Error during automatic rubric matching: {str(e)}")
        
        # Send email notification to doctor
        try:
            # Get FRONTEND_URL with fallback
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://homeopathy-three.vercel.app')
            
            subject = f'New Appointment Request from {patient_name}'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3F856C; border-bottom: 2px solid #3F856C; padding-bottom: 10px;">
                        New Appointment Request
                    </h2>
                    
                    <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Patient Details:</h3>
                        <p><strong>Name:</strong> {patient_name}</p>
                        <p><strong>Phone:</strong> {patient_phone}</p>
                        <p><strong>City:</strong> {data.get('city', 'Not specified')}</p>
                    </div>
                    
                    {f'''
                    <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Health Concern:</h3>
                        <p><strong>Category:</strong> {data.get('specialty', 'Not specified')}</p>
                        <p><strong>Issue:</strong> {data.get('sub_specialty', 'Not specified')}</p>
                        {f'<p><strong>Description:</strong> {data.get("problem_description")}</p>' if data.get('problem_description') else ''}
                    </div>
                    ''' if data.get('specialty') else ''}
                    
                    {f'''
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Preferred Schedule:</h3>
                        <p><strong>Date:</strong> {data.get('appointment_date', 'Not specified')}</p>
                        <p><strong>Time:</strong> {data.get('appointment_time', 'Not specified')}</p>
                        <p><strong>Type:</strong> {data.get('appointment_type', 'Not specified').title()}</p>
                    </div>
                    ''' if data.get('appointment_date') else ''}
                    
                    <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Message:</h3>
                        <p style="white-space: pre-wrap;">{message_text}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                        <p style="margin: 0;">
                            <strong>Quick Actions:</strong><br>
                            • Call patient: <a href="tel:{patient_phone}" style="color: #3F856C;">{patient_phone}</a><br>
                            • WhatsApp: <a href="https://wa.me/{patient_phone.replace(' ', '').replace('+', '')}" style="color: #3F856C;">Send WhatsApp Message</a><br>
                            • Reply via portal: <a href="{frontend_url}/doctor/inbox" style="color: #3F856C;">View in Inbox</a>
                        </p>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        This is an automated notification from the Homeopathy Portal.
                    </p>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            New Appointment Request
            
            Patient Details:
            Name: {patient_name}
            Phone: {patient_phone}
            City: {data.get('city', 'Not specified')}
            
            {f'''Health Concern:
            Category: {data.get('specialty', 'Not specified')}
            Issue: {data.get('sub_specialty', 'Not specified')}
            {f"Description: {data.get('problem_description')}" if data.get('problem_description') else ''}
            ''' if data.get('specialty') else ''}
            
            {f'''Preferred Schedule:
            Date: {data.get('appointment_date', 'Not specified')}
            Time: {data.get('appointment_time', 'Not specified')}
            Type: {data.get('appointment_type', 'Not specified').title()}
            ''' if data.get('appointment_date') else ''}
            
            Message:
            {message_text}
            
            Please contact the patient or reply via the portal inbox.
            """
            
            email_message = EmailMultiAlternatives(
                subject=subject,
                body=text_content,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[doctor.user.email],
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send(fail_silently=True)
            
            logger.info(f"Appointment request email sent to Dr. {doctor.user.get_full_name()} from {patient_name}")
            
        except Exception as email_error:
            logger.error(f"Failed to send email: {str(email_error)}")
        
        return JsonResponse({
            'success': True,
            'message': 'Message sent successfully',
            'data': {
                'message_id': message.id,
                'doctor_name': doctor.user.get_full_name(),
                'status': message.status,
                'created_at': message.created_at.isoformat()
            }
        })
    
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Doctor not found'}, status=404)
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to send message',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_patient_inbox(request):
    """
    Get patient's inbox (sent messages and replies)
    GET /homeopathy/patient/inbox/
    Query params: ?status=pending&page=1&limit=20
    """
    patient_id = request.session.get('patient_id')
    
    if not patient_id:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        patient = Patient.objects.select_related('user').get(id=patient_id)
        user = patient.user
    except Patient.DoesNotExist:
        return JsonResponse({'error': 'Invalid session'}, status=401)
    
    try:
        # Get query parameters
        status_filter = request.GET.get('status')
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        offset = (page - 1) * limit
        
        messages = Message.objects.filter(
            sender=user
        ).select_related(
            'doctor__user',
            'parent_message'
        ).prefetch_related('replies')
        
        # Apply status filter
        if status_filter:
            messages = messages.filter(status=status_filter)
        
        # Get total count BEFORE slicing
        total = messages.count()
        
        # Order by created date
        messages = messages.order_by('-created_at')
        
        # Paginate
        messages = messages[offset:offset + limit]
        
        # Format response
        message_list = []
        for msg in messages:
            message_data = {
                'id': msg.id,
                'doctor': {
                    'id': msg.doctor.id,
                    'name': msg.doctor.user.get_full_name(),
                    'specialization': msg.doctor.specialization,
                    'profile_image': msg.doctor.profile_image.url if msg.doctor.profile_image else None,
                },
                'message_type': msg.message_type,
                'subject': msg.subject,
                'message': msg.message,
                'patient_name': msg.patient_name,
                'patient_phone': msg.patient_phone,
                'appointment_date': msg.appointment_date.isoformat() if msg.appointment_date else None,
                'appointment_time': msg.appointment_time,
                'appointment_type': msg.appointment_type,
                'city': msg.city,
                'specialty': msg.specialty,
                'sub_specialty': msg.sub_specialty,
                'problem_description': msg.problem_description,
                'status': msg.status,
                'is_read': msg.is_read,
                'read_at': msg.read_at.isoformat() if msg.read_at else None,
                'created_at': msg.created_at.isoformat(),
                'reply_count': msg.replies.count(),
                'has_unread_replies': msg.replies.filter(is_read=False).exists(),
            }
            message_list.append(message_data)
        
        # Get unread count
        unread_count = Message.objects.filter(
            sender=user,
            is_read=False
        ).count()
        
        return JsonResponse({
            'success': True,
            'messages': message_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            },
            'unread_count': unread_count
        })
    
    except Exception as e:
        logger.error(f"Error fetching patient inbox: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to fetch messages',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def get_message_thread(request, message_id):
    """
    Get a message thread (original message + all replies)
    GET /homeopathy/messages/<message_id>/thread/
    """
    # Check if doctor or patient
    doctor_id = request.session.get('doctor_id')
    patient_id = request.session.get('patient_id')
    
    if not doctor_id and not patient_id:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Get user based on session type
        if doctor_id:
            try:
                doctor = Doctor.objects.select_related('user').get(id=doctor_id)
                current_user = doctor.user
                is_doctor = True
            except Doctor.DoesNotExist:
                return JsonResponse({'error': 'Invalid session'}, status=401)
        else:
            try:
                patient = Patient.objects.select_related('user').get(id=patient_id)
                current_user = patient.user
                is_doctor = False
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Invalid session'}, status=401)
        
        # Get the message
        message = Message.objects.select_related(
            'doctor__user',
            'sender',
            'parent_message'
        ).get(id=message_id)
        
        # Check access - user must be sender or the doctor
        if is_doctor:
            if message.doctor.user != current_user:
                return JsonResponse({'error': 'Access denied'}, status=403)
        else:
            if message.sender != current_user:
                return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Get the full thread
        thread_messages = message.get_thread()
        
        # Mark messages as read if user is the doctor
        if is_doctor:
            # Get unread messages first
            unread_messages = thread_messages.filter(is_read=False).exclude(sender=current_user)
            
            # Update them with conditional status change
            for msg in unread_messages:
                msg.is_read = True
                msg.read_at = timezone.now()
                if msg.status == 'pending':
                    msg.status = 'read'
                msg.save()
        
        # Format thread
        thread_data = []
        for msg in thread_messages:
            thread_data.append({
                'id': msg.id,
                'sender': {
                    'id': msg.sender.id,
                    'name': msg.sender.get_full_name(),
                    'user_type': msg.sender.user_type,
                },
                'message': msg.message,
                'status': msg.status,
                'is_read': msg.is_read,
                'read_at': msg.read_at.isoformat() if msg.read_at else None,
                'created_at': msg.created_at.isoformat(),
                'matched_rubrics': [
                    {
                        'id': r.id,
                        'name': r.name,
                        'full_path': r.get_full_path()
                    } for r in msg.matched_rubrics.all()
                ] if hasattr(msg, 'matched_rubrics') else []
            })
        
        return JsonResponse({
            'success': True,
            'thread': thread_data,
            'original_message': {
                'id': message.id if not message.parent_message else message.parent_message.id,
                'doctor': {
                    'id': message.doctor.id,
                    'name': message.doctor.user.get_full_name(),
                    'specialization': message.doctor.specialization,
                },
                'patient_name': message.patient_name,
                'appointment_date': message.appointment_date.isoformat() if message.appointment_date else None,
                'appointment_time': message.appointment_time,
                'appointment_type': message.appointment_type,
            }
        })
    
    except Message.DoesNotExist:
        return JsonResponse({'error': 'Message not found'}, status=404)
    except Exception as e:
        logger.error(f"Error fetching message thread: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to fetch thread',
            'detail': str(e)
        }, status=500)



@csrf_exempt
@require_http_methods(["GET"])
def get_doctor_inbox(request):
    """
    Get doctor's inbox (received messages)
    GET /homeopathy/doctor/inbox/
    Query params: ?status=pending&unread_only=true&page=1&limit=20
    """
    doctor_id = request.session.get('doctor_id')
    
    if not doctor_id:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Invalid session'}, status=401)
    
    try:
        status_filter = request.GET.get('status')
        unread_only = request.GET.get('unread_only', '').lower() == 'true'
        page = int(request.GET.get('page', 1))
        limit = int(request.GET.get('limit', 20))
        offset = (page - 1) * limit
        
        messages = Message.objects.filter(
            doctor=doctor,
            parent_message__isnull=True  
        ).select_related(
            'sender'
        ).prefetch_related('replies')
        
        if status_filter:
            messages = messages.filter(status=status_filter)
        if unread_only:
            messages = messages.filter(is_read=False)

        total = messages.count()
        
        messages = messages.order_by('-created_at')
        
        messages = messages[offset:offset + limit]
        
        message_list = []
        for msg in messages:
            message_data = {
                'id': msg.id,
                'sender': {
                    'id': msg.sender.id,
                    'name': msg.sender.get_full_name(),
                    'email': msg.sender.email,
                },
                'message_type': msg.message_type,
                'subject': msg.subject,
                'message': msg.message,
                'patient_name': msg.patient_name,
                'patient_phone': msg.patient_phone,
                'appointment_date': msg.appointment_date.isoformat() if msg.appointment_date else None,
                'appointment_time': msg.appointment_time,
                'appointment_type': msg.appointment_type,
                'city': msg.city,
                'specialty': msg.specialty,
                'sub_specialty': msg.sub_specialty,
                'problem_description': msg.problem_description,
                'status': msg.status,
                'is_read': msg.is_read,
                'read_at': msg.read_at.isoformat() if msg.read_at else None,
                'created_at': msg.created_at.isoformat(),
                'reply_count': msg.replies.count(),
                'matched_rubrics': [
                    {
                        'id': r.id,
                        'name': r.name,
                        'full_path': r.get_full_path()
                    } for r in msg.matched_rubrics.all()
                ] if hasattr(msg, 'matched_rubrics') else []
            }
            message_list.append(message_data)
        
        # Get counts
        unread_count = Message.objects.filter(
            doctor=doctor,
            is_read=False,
            parent_message__isnull=True
        ).count()
        
        pending_count = Message.objects.filter(
            doctor=doctor,
            status='pending',
            parent_message__isnull=True
        ).count()
        
        return JsonResponse({
            'success': True,
            'messages': message_list,
            'pagination': {
                'page': page,
                'limit': limit,
                'total': total,
                'pages': (total + limit - 1) // limit
            },
            'counts': {
                'unread': unread_count,
                'pending': pending_count,
            }
        })
    
    except Exception as e:
        logger.error(f"Error fetching doctor inbox: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to fetch messages',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def doctor_reply_to_message(request, message_id):
    """
    Doctor replies to a patient message
    POST /homeopathy/doctor/messages/<message_id>/reply/
    
    Body:
    {
        "message": "Thank you for your message...",
        "status": "replied"  # optional: pending, read, replied, cancelled
    }
    """
    doctor_id = request.session.get('doctor_id')
    
    if not doctor_id:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        doctor = Doctor.objects.select_related('user').get(id=doctor_id)
    except Doctor.DoesNotExist:
        return JsonResponse({'error': 'Invalid session'}, status=401)
    
    try:
        data = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    
    try:
        original_message = Message.objects.select_related('sender').get(
            id=message_id,
            doctor=doctor
        )
        
        reply_text = data.get('message', '').strip()
        if not reply_text:
            return JsonResponse({'error': 'Message is required'}, status=400)
        
        reply = Message.objects.create(
            sender=doctor.user,
            doctor=doctor,
            message_type='reply',
            message=reply_text,
            parent_message=original_message,
            patient_name=original_message.patient_name,
            patient_phone=original_message.patient_phone,
            status='replied',
            is_read=False
        )
        

        new_status = data.get('status', 'replied')
        if new_status in dict(Message.STATUS_CHOICES).keys():
            original_message.status = new_status
            original_message.save(update_fields=['status'])
        
        try:
            frontend_url = getattr(settings, 'FRONTEND_URL', 'https://homeopathy-three.vercel.app')
            
            subject = f'Reply from Dr. {doctor.user.get_full_name()}'
            
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #3F856C; border-bottom: 2px solid #3F856C; padding-bottom: 10px;">
                        You have a new reply from Dr. {doctor.user.get_full_name()}
                    </h2>
                    
                    <div style="background: #fff; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; margin: 20px 0;">
                        <p style="white-space: pre-wrap;">{reply_text}</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding: 15px; background: #e8f5e9; border-radius: 8px;">
                        <p style="margin: 0;">
                            <strong>Quick Actions:</strong><br>
                            • Call doctor: <a href="tel:{doctor.user.phone}" style="color: #3F856C;">{doctor.user.phone}</a><br>
                            • View in inbox: <a href="{frontend_url}/patient/inbox" style="color: #3F856C;">Open Inbox</a>
                        </p>
                    </div>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        This is an automated notification from the Homeopathy Portal.
                    </p>
                </div>
            </body>
            </html>
            """
            
            email_message = EmailMultiAlternatives(
                subject=subject,
                body=reply_text,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[original_message.sender.email],
            )
            email_message.attach_alternative(html_content, "text/html")
            email_message.send(fail_silently=True)
            
        except Exception as email_error:
            logger.error(f"Failed to send reply email: {str(email_error)}")
        
        return JsonResponse({
            'success': True,
            'message': 'Reply sent successfully',
            'data': {
                'reply_id': reply.id,
                'created_at': reply.created_at.isoformat(),
                'status': original_message.status
            }
        })
    
    except Message.DoesNotExist:
        return JsonResponse({'error': 'Message not found'}, status=404)
    except Exception as e:
        logger.error(f"Error sending reply: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to send reply',
            'detail': str(e)
        }, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def mark_message_as_read(request, message_id):
    """
    Mark a message as read
    POST /homeopathy/messages/<message_id>/mark-read/
    """
    # Check if doctor or patient
    doctor_id = request.session.get('doctor_id')
    patient_id = request.session.get('patient_id')
    
    if not doctor_id and not patient_id:
        return JsonResponse({'error': 'Authentication required'}, status=401)
    
    try:
        # Get user based on session type
        if doctor_id:
            try:
                doctor = Doctor.objects.select_related('user').get(id=doctor_id)
                current_user = doctor.user
                is_doctor = True
            except Doctor.DoesNotExist:
                return JsonResponse({'error': 'Invalid session'}, status=401)
        else:
            try:
                patient = Patient.objects.select_related('user').get(id=patient_id)
                current_user = patient.user
                is_doctor = False
            except Patient.DoesNotExist:
                return JsonResponse({'error': 'Invalid session'}, status=401)
        
        # Get the message
        message = Message.objects.get(id=message_id)
        
        # Check access
        if is_doctor:
            if message.doctor.user != current_user:
                return JsonResponse({'error': 'Access denied'}, status=403)
        else:
            if message.sender != current_user:
                return JsonResponse({'error': 'Access denied'}, status=403)
        
        # Mark as read
        message.mark_as_read()
        
        return JsonResponse({
            'success': True,
            'message': 'Marked as read',
            'data': {
                'is_read': message.is_read,
                'read_at': message.read_at.isoformat() if message.read_at else None,
                'status': message.status
            }
        })
    
    except Message.DoesNotExist:
        return JsonResponse({'error': 'Message not found'}, status=404)
    except Exception as e:
        logger.error(f"Error marking message as read: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({
            'error': 'Failed to mark as read',
            'detail': str(e)
        }, status=500)


# ─────────────────────────────────────────────────────────────────────────────
# DOCTOR RUBRIC REPERTORIZATION  (symptom → rubric → medicine chart)
# POST /homeopathy/doctor/rubrics/repertorize/
# Body: { "chapter_id": 12, "symptoms": ["headache evening", "pain chips"] }
# ─────────────────────────────────────────────────────────────────────────────

@csrf_exempt
@require_http_methods(["POST"])
def doctor_rubric_repertorize(request):
    """
    Full rubric-based repertorization flow for a doctor:
    1. Doctor picks a chapter (top-level rubric).
    2. Doctor provides one or more symptom phrases (sub-rubrics the patient describes).
    3. This endpoint scores every rubric under that chapter against the symptoms,
       returns the top N matched rubrics with their associated medicines,
       and also returns an aggregated medicine ranking chart.
    """
    doctor_id = request.session.get('doctor_id')
    if not doctor_id:
        doctor = Doctor.objects.filter(is_active=True).first()
        if doctor:
            doctor_id = doctor.id
        else:
            doctor_id = 1
    
    try:
        doctor = Doctor.objects.get(id=doctor_id)
    except Doctor.DoesNotExist:
        pass

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, Exception):
        return JsonResponse({'error': 'Invalid JSON body'}, status=400)

    chapter_id = data.get('chapter_id')
    symptoms_raw = data.get('symptoms', [])
    top_n       = int(data.get('top_n', 3))

    if not symptoms_raw or not isinstance(symptoms_raw, list):
        return JsonResponse({'error': 'symptoms must be a non-empty list'}, status=400)

    # ── Step 0: NLP Tokenization ────────────────────────────────
    # Normalise symptom strings by splitting sentences into exact keywords
    import re
    symptoms_cleaned = []
    sentence_tokens = {}
    stop_words = {
        # HINDI GRAMMAR: Pronouns, Helping Verbs, Prepositions, Fillers
        'हो', 'रहा', 'है', 'में', 'का', 'की', 'से', 'को', 'और', 'पर', 'वाला', 'वाली', 'वाले', 'हुए', 'होता', 'रही', 'रहे', 'था', 'थी', 'थे',
        'मुझे', 'मेरा', 'मेरी', 'मैं', 'हम', 'हमारा', 'तू', 'तुम', 'तुम्हारा', 'आप', 'आपका', 'वह', 'यह', 'वे', 'ये', 'उनका', 'इनका',
        'हैं', 'हूँ', 'होती', 'होते', 'गया', 'गई', 'गए', 'जाता', 'जाती', 'जाते', 'करना', 'कर', 'रख', 'चुका', 'चुकी', 'चुके',
        'लगता', 'लगती', 'लगते', 'लग', 'रही', 'रहे', 'रहा', 'बहुत', 'ज्यादा', 'कम', 'थोड़ा', 'के', 'लिए', 'भी', 'ही', 'तो', 'तक',
        'जब', 'तब', 'क्यों', 'कैसे', 'क्या', 'हाँ', 'ना', 'नहीं', 'मत', 'दिया', 'दे', 'देता', 'देती', 'देते', 'ले', 'लेता', 'लेती', 'लेते',
        'आ', 'आता', 'आती', 'आते', 'रही', 'ये', 'वो', 'अंदर', 'बाहर', 'ऊपर', 'नीचे', 'पास', 'दूर',
        
        # ENGLISH GRAMMAR: Pronouns, Helping Verbs, Prepositions, Fillers
        'is', 'am', 'are', 'i', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'of', 'and', 'my', 'me', 'with', 'for', 'have', 'has', 'had',
        'been', 'was', 'were', 'it', 'that', 'this', 'he', 'she', 'they', 'them', 'his', 'her', 'we', 'us', 'our', 'you', 'your',
        'be', 'do', 'does', 'did', 'doing', 'feel', 'feels', 'feeling', 'getting', 'got', 'very', 'much', 'too', 'up', 'down',
        'out', 'about', 'from', 'by', 'as', 'but', 'or', 'so', 'if', 'then', 'than', 'because', 'who', 'what', 'where', 'when',
        'why', 'how', 'all', 'any', 'some', 'more', 'most', 'other', 'such', 'only', 'own', 'same', 'there', 'their'
    }
    
    # Split raw strings into multiple symptoms if they contain conjunctions
    all_sub_symptoms = []
    conjunctions = [
        r'\band\b', r'\bwith\b', r'\balong with\b', r'\balso\b', r'\baccompanied by\b', 
        r',', r'\.', r';', r'\n',
        r'और', r'तथा', r'के साथ', r'साथ ही', r'भी'
    ]
    split_regex = '|'.join(conjunctions)
    
    for sym in symptoms_raw:
        # Split by conjunctions
        parts = re.split(split_regex, str(sym), flags=re.IGNORECASE)
        for p in parts:
            p_strip = p.strip()
            if len(p_strip) > 2:
                all_sub_symptoms.append(p_strip)
    
    if not all_sub_symptoms and symptoms_raw:
        all_sub_symptoms = symptoms_raw

    for sym in all_sub_symptoms:
        # Strip all punctuation and convert to space, keep Devanagari blocks
        cleaned = re.sub(r'[^\w\s\u0900-\u097F]', ' ', str(sym))
        tokens = []
        for w in cleaned.split():
            w = w.strip().lower()
            if len(w) > 1 and w not in stop_words:
                tokens.append(w)
                if w not in symptoms_cleaned:
                    symptoms_cleaned.append(w)
        sentence_tokens[str(sym)] = tokens
                
    symptoms = symptoms_cleaned
    symptoms_raw = all_sub_symptoms # Update raw to the split ones for breakdown

    if not symptoms:
        return JsonResponse({'error': 'No searchable keywords extracted.'}, status=400)

    try:
        # ── Step 1: Build search queryset ─────────────────────────────────────
        base_qs = Rubric.objects.filter(is_active=True).prefetch_related(
            'synonyms', 'modalities', 'medicine_grades', 'medicine_grades__medicine'
        ).select_related('parent')

        if chapter_id:
            try:
                chapter = Rubric.objects.get(id=chapter_id, level=0, is_active=True)
                # Collect IDs of this chapter and all descendants using recursion-safe BFS
                def get_descendants(root_id):
                    all_ids = set()
                    to_visit = [root_id]
                    while to_visit:
                        children = list(Rubric.objects.filter(parent_id__in=to_visit, is_active=True).values_list('id', flat=True))
                        new_children = [c for c in children if c not in all_ids]
                        all_ids.update(new_children)
                        to_visit = new_children
                    return all_ids

                descendant_ids = get_descendants(chapter_id)
                descendant_ids.add(chapter_id)
                base_qs = base_qs.filter(id__in=descendant_ids)
            except Rubric.DoesNotExist:
                return JsonResponse({'error': 'Chapter not found'}, status=404)

        # ── Step 2: Single-Pass Candidate Collection ───────────────────────────
        # Hindi → English medical term translation map.
        # Allows Hindi symptom tokens to match English rubric names in the DB.
        HINDI_EN_MAP = {
            'नस':           ['nerve', 'neural', 'neuralgic', 'neuralgia'],
            'नसों':         ['nerve', 'neural', 'neuralgic', 'neuralgia'],
            'नसें':         ['nerve', 'neural'],
            'नसे':          ['nerve', 'neural'],
            'तंत्रिका':     ['nerve', 'neural', 'neuralgic', 'neuralgia'],
            'तंत्रिकाओं':   ['nerve', 'neural', 'neuralgic', 'neuralgia'],
            'दर्द':         ['pain', 'ache', 'painful', 'aching'],
            'पीड़ा':        ['pain', 'ache', 'suffering'],
            'तेज':          ['sharp', 'severe', 'intense', 'shooting'],
            'तीव्र':        ['intense', 'severe', 'violent'],
            'अत्यधिक':      ['excessive', 'extreme', 'much', 'severe'],
            'जलन':          ['burning', 'burn', 'smarting'],
            'सुन्न':         ['numbness', 'numb', 'insensible'],
            'सुन्नपन':      ['numbness', 'numb', 'insensible'],
            'झनझनाहट':     ['tingling', 'formication', 'crawling'],
            'ऐंठन':         ['cramp', 'spasm', 'convulsion'],
            'खिंचाव':       ['pulling', 'tearing', 'drawing'],
            'थकान':         ['fatigue', 'weakness', 'exhaustion', 'weariness'],
            'थकावट':        ['fatigue', 'weakness', 'exhaustion'],
            'कमज़ोरी':      ['weakness', 'debility', 'prostration'],
            'कमजोरी':       ['weakness', 'debility', 'prostration'],
            'सूजन':         ['swelling', 'edema', 'inflammation', 'tumefaction'],
            # Nervous system specific
            'लकवा':        ['paralysis', 'paresis', 'hemiplegia'],
            'पक्षाघात':     ['paralysis', 'paresis', 'hemiplegia'],
            'मिर्गी':        ['epilepsy', 'convulsion', 'fit'],
            'दौरा':         ['convulsion', 'fit', 'epilepsy', 'spasm'],
            'कंपन':        ['trembling', 'tremor', 'shaking'],
            'कंप':          ['trembling', 'tremor', 'shaking'],
            'बेहोशी':       ['unconscious', 'fainting', 'syncope'],
            'सिर':          ['head'],
            'सिरदर्द':      ['headache'],
            'माथा':         ['forehead'],
            'आँख':          ['eye'],
            'कान':          ['ear'],
            'नाक':          ['nose'],
            'गला':          ['throat'],
            'पेट':          ['stomach', 'abdomen'],
            'छाती':         ['chest'],
            'पीठ':          ['back'],
            'हाथ':          ['hand', 'arm'],
            'पैर':          ['leg', 'foot'],
            'बुखार':        ['fever'],
            'खाँसी':        ['cough'],
            'साँस':         ['breath', 'respiration'],
            'कब्ज':         ['constipation'],
            'दस्त':         ['diarrhea', 'loose'],
            'पेशाब':        ['urine', 'urination'],
            'नींद':         ['sleep', 'sleeplessness', 'insomnia'],
            'भूख':          ['appetite'],
            'प्यास':        ['thirst'],
            'चिंता':        ['anxiety'],
            'डर':           ['fear'],
            'गुस्सा':       ['anger', 'irritability'],
            'त्वचा':        ['skin'],
            'खुजली':        ['itching', 'pruritus'],
            'पसीना':        ['perspiration', 'sweat'],
            'खून':          ['blood', 'bleeding'],
            'रक्त':         ['blood', 'bleeding'],
            'जोड़':          ['joint', 'articulation'],
            'जोड़ों':        ['joint', 'articulation'],
            'हड्डी':        ['bone'],
            'मांसपेशी':     ['muscle'],
            'अचानक':        ['sudden', 'paroxysmal'],
            'उदासी':        ['sad', 'sadness', 'depression', 'melancholy'],
            'दुख':          ['sad', 'grief', 'sorrow', 'distress'],
            'रात':          ['night', 'nocturnal'],
            'सुबह':         ['morning'],
            'शाम':          ['evening'],
        }

        logger.debug(f"DEBUG REPERTORIZE: all_sub_symptoms={all_sub_symptoms}")
        # Collect all raw tokens from every sub-symptom
        all_tokens = set()
        for sym_part in all_sub_symptoms:
            tokens = sentence_tokens.get(str(sym_part), [])
            all_tokens.update(tokens)
        
        logger.debug(f"DEBUG REPERTORIZE: all_tokens={all_tokens}")

        # Expand Hindi tokens to their English equivalents
        expanded_tokens = set(all_tokens)
        for tok in all_tokens:
            for en_tok in HINDI_EN_MAP.get(tok, []):
                expanded_tokens.add(en_tok)

        # Hindi morphological root expansion:
        # Many rubric name_hindi fields use the root form (e.g. "नस") while
        # user input uses an inflected form (e.g. "नसों", "नसें").
        # Adding the root allows icontains to find both.
        HINDI_ROOT_MAP = {
            # Nerves
            'नसों': 'नस', 'नसें': 'नस', 'नसे': 'नस',
            'तंत्रिकाओं': 'तंत्रिका', 'तंत्रिकाएं': 'तंत्रिका',
            # Joints
            'जोड़ों': 'जोड़', 'जोड़ो': 'जोड़',
            # Muscles
            'मांसपेशियों': 'मांसपेशी', 'मांसपेशियाँ': 'मांसपेशी',
            # Bones
            'हड्डियों': 'हड्डी', 'हड्डियाँ': 'हड्डी',
            # Eyes
            'आँखों': 'आँख', 'आंखों': 'आंख',
            # Ears
            'कानों': 'कान',
            # Hands/feet
            'हाथों': 'हाथ', 'पैरों': 'पैर',
            # Common verb inflections used in symptom names
            'होती': 'होता', 'होते': 'होता',
            'रहती': 'रहता', 'रहते': 'रहता',
        }
        for tok in list(all_tokens):
            root = HINDI_ROOT_MAP.get(tok)
            if root:
                expanded_tokens.add(root)

        logger.debug(f"DEBUG REPERTORIZE: expanded_tokens={expanded_tokens}")

        # ── Modality keyword detection ────────────────────────────────────────
        # Maps Hindi/English modality phrases to searchable English terms.
        # These are aggravations (worse from) or ameliorations (better from).
        MODALITY_KEYWORD_MAP = {
            # Time modalities
            'रात': 'night',         'रात्र': 'night',
            'सुबह': 'morning',       'सुबह सवेरे': 'morning',
            'शाम': 'evening',       'दोपहर': 'afternoon',
            # Temperature
            'गर्मी': 'heat',         'गर्म': 'warmth',
            'ठंड': 'cold',         'ठंडक': 'cold',
            'ठंडा': 'cold',         'ठंडी': 'cold',
            # Motion
            'चलने': 'motion',       'चलना': 'motion',
            'चलने से': 'motion',  'हिलने': 'motion', 'हिलाने': 'motion',
            'आराम': 'rest',         'लेटने': 'lying',
            'बैठने': 'sitting',     'खड़े': 'standing',
            # Pressure
            'दबाने': 'pressure',    'दबाव': 'pressure',
            # Food/drink
            'खाने': 'eating',       'खाने से': 'eating',
            'पानी': 'drinking',     'पीने': 'drinking',
            # Weather
            'बरसात': 'damp',        'नमी': 'humidity',
            'सर्दी': 'cold',        'धूप': 'sun',
            # Touch
            'छूने': 'touch',        'छूने से': 'touch',
            # Emotions
            'तनाव': 'stress',       'गुस्से': 'anger',
            # English time modalities (was missing these!)
            'evening':   'evening',   'afternoon': 'afternoon',
            'night':     'night',     'morning':   'morning',
            'midnight':  'night',     'noon':      'afternoon',
            'sunrise':   'morning',   'sunset':    'evening',
            'daytime':   'day',       'day':       'day',
            # English temperature / weather
            'heat':      'heat',      'cold':      'cold',
            'warm':      'warmth',    'warmth':    'warmth',
            'damp':      'damp',      'wet':       'damp',
            'dry':       'dry',       'sun':       'sun',
            # English condition modalities
            'worse':     'worse',     'better':    'better',
            'motion':    'motion',    'rest':      'rest',
            'pressure':  'pressure',  'touch':     'touch',
            'eating':    'eating',    'lying':     'lying',
            'sitting':   'sitting',   'standing':  'standing',
            'exertion':  'exertion',  'walking':   'walking',
            'coughing':  'cough',     'bending':   'bending',
            'rising':    'rising',    'stooping':  'stooping',
        }

        # Separate modality tokens from symptom tokens
        modality_tokens = set()
        symptom_tokens  = set(expanded_tokens)
        for tok in list(expanded_tokens):
            if tok in MODALITY_KEYWORD_MAP:
                modality_tokens.add(MODALITY_KEYWORD_MAP[tok])
                symptom_tokens.discard(tok)   # remove from symptom search

        # Also check raw all_tokens for modality keywords
        for tok in all_tokens:
            if tok in MODALITY_KEYWORD_MAP:
                modality_tokens.add(MODALITY_KEYWORD_MAP[tok])

        # ── Symptom Alias Expansion ───────────────────────────────────────────
        # Maps common patient words to the actual repertory rubric terms in DB.
        # In classical homeopathic repertories, rubrics are named "PAIN",
        # "ERUPTIONS", "DISCHARGE" etc., NOT "headache", "rash", "runny nose".
        SYMPTOM_ALIAS_MAP = {
            # Pain aliases
            'headache':    ['pain', 'ache'],
            'stomachache': ['pain', 'ache'],
            'toothache':   ['pain', 'ache'],
            'backache':    ['pain', 'ache'],
            'earache':     ['pain', 'ache'],
            'ache':        ['pain'],
            'aching':      ['pain'],
            'painful':     ['pain'],
            'sore':        ['pain', 'soreness'],
            'hurt':        ['pain'],
            'hurting':     ['pain'],
            # Head symptoms
            'migraine':    ['pain', 'headache', 'hemicrania'],
            'dizzy':       ['vertigo', 'dizziness'],
            'dizziness':   ['vertigo'],
            # Stomach/GI
            'stomachache': ['pain', 'gastralgia'],
            'heartburn':   ['burning', 'pyrosis'],
            'bloated':     ['distension', 'flatulence', 'bloating'],
            'bloating':    ['distension', 'flatulence'],
            'gassy':       ['flatulence', 'gas'],
            'vomiting':    ['vomit', 'nausea', 'retching'],
            'nauseous':    ['nausea'],
            'loose':       ['diarrhea', 'loose stool'],
            # Eye symptoms
            'watery':      ['lachrymation', 'discharge', 'watering'],
            'watering':    ['lachrymation', 'discharge'],
            'itchy':       ['itching', 'pruritus'],
            'burning':     ['burning', 'smarting'],
            # Nose/throat
            'runny':       ['discharge', 'coryza', 'fluent'],
            'blocked':     ['obstruction', 'stopped'],
            'stuffy':      ['obstruction', 'stopped'],
            'sneezing':    ['sneezing', 'sneezes'],
            # Respiratory
            'breathless':  ['dyspnea', 'difficult breathing'],
            'wheezing':    ['wheezing', 'asthma'],
            # Skin
            'itching':     ['itching', 'pruritus'],
            'rash':        ['eruption', 'rash'],
            'swollen':     ['swelling', 'edema', 'inflammation'],
            'swelling':    ['swelling', 'edema'],
            # General
            'weak':        ['weakness', 'debility'],
            'tired':       ['fatigue', 'weakness', 'weariness'],
            'sleepless':   ['sleeplessness', 'insomnia'],
            'feverish':    ['fever', 'pyrexia'],
            'chilly':      ['chilliness', 'chill'],
            'shivering':   ['chill', 'shivering'],
            'thirsty':     ['thirst'],
            'hungry':      ['hunger', 'appetite'],
        }

        # Expand symptom tokens using alias map
        alias_expanded = set(symptom_tokens)
        for tok in list(symptom_tokens):
            for alias in SYMPTOM_ALIAS_MAP.get(tok, []):
                alias_expanded.add(alias)
        symptom_tokens = alias_expanded
        logger.debug(f"DEBUG REPERTORIZE: final symptom_tokens={symptom_tokens}")
        logger.debug(f"DEBUG REPERTORIZE: final modality_tokens={modality_tokens}")

        # ═══════════════════════════════════════════════════════════════════════
        # PRIORITY WATERFALL SEARCH
        # ─────────────────────────────────────────────────────────────────────
        # Tier 1 → Rubric name  (name EN + name_hindi)
        # Tier 2 → Modalities   (if Tier 1 returned nothing)
        # Tier 3 → Synonyms     (if Tier 2 returned nothing)
        #
        # Each tier is tried in order. As soon as any tier finds at least one
        # candidate, search stops and those candidates are used exclusively.
        # The winning tier is stored in `match_tier` so scoring can weight
        # results appropriately and the frontend can label the source.
        # ═══════════════════════════════════════════════════════════════════════

        match_tier   = None   # 'name' | 'modality' | 'synonym'
        candidate_ids = set()

        # ── TIER 1: Rubric name (English + Hindi) ──────────────────────────────
        all_search_tokens = set(symptom_tokens) | set(modality_tokens)
        if all_search_tokens:
            name_q = Q()
            for tok in all_search_tokens:
                name_q |= (
                    Q(name__icontains=tok) |
                    Q(name_hindi__icontains=tok)
                )
            tier1_ids = set(
                base_qs.filter(name_q).values_list('id', flat=True)[:300]
            )
            if tier1_ids:
                candidate_ids = tier1_ids
                match_tier    = 'name'

        # ── TIER 2: Modalities (only if Tier 1 empty) ──────────────────────────
        if not candidate_ids:
            # Build the full set of modality search terms:
            # – tokens explicitly in MODALITY_KEYWORD_MAP
            # – + the raw symptom_tokens themselves (user may have typed
            #   a modality word like "evening", "cold", "pressure" directly)
            all_mod_search = set(modality_tokens)  # already mapped English terms
            for tok in symptom_tokens:
                if tok in MODALITY_KEYWORD_MAP:
                    all_mod_search.add(MODALITY_KEYWORD_MAP[tok])
                else:
                    all_mod_search.add(tok)  # try raw token against modality fields too

            if all_mod_search:
                mod_q = Q()
                for mtok in all_mod_search:
                    mod_q |= (
                        Q(modalities__name__icontains=mtok) |
                        Q(modalities__name_hindi__icontains=mtok)
                    )
                tier2_ids = set(
                    base_qs.filter(mod_q).values_list('id', flat=True)[:300]
                )
                if tier2_ids:
                    candidate_ids = tier2_ids
                    match_tier    = 'modality'

        # ── TIER 3: Synonyms (only if Tier 1 & 2 both empty) ───────────────────
        if not candidate_ids:
            syn_search = set(symptom_tokens) | set(modality_tokens)
            if syn_search:
                syn_q = Q()
                for tok in syn_search:
                    syn_q |= (
                        Q(synonyms__synonym__icontains=tok) |
                        Q(synonyms__synonym_hindi__icontains=tok)
                    )
                tier3_ids = set(
                    base_qs.filter(syn_q).values_list('id', flat=True)[:300]
                )
                if tier3_ids:
                    candidate_ids = tier3_ids
                    match_tier    = 'synonym'

        logger.debug(f"DEBUG REPERTORIZE: match_tier={match_tier}, candidate_ids count={len(candidate_ids)}")
        if not candidate_ids:
            return JsonResponse({'success': True, 'total_matched': 0, 'match_tier': None, 'top_rubrics': [], 'medicine_chart': [], 'symptoms_breakdown': []})

        # Fetch full objects for the candidates.
        matched_rubrics = base_qs.filter(id__in=candidate_ids).distinct()

        # ── Step 3: Score each matched rubric ─────────────────────────────────
        # Scoring is tier-aware: we award points ONLY for the fields that are
        # relevant to the winning search tier. This prevents a synonym-tier
        # result from appearing to score on rubric-name fields it didn't match.
        #
        #  Tier 'name'     → score on: name (EN+HI) + description
        #  Tier 'modality' → score on: modality fields
        #  Tier 'synonym'  → score on: synonym fields (EN+HI)
        #
        # En/Hindi equivalents are always checked regardless of tier so Hindi
        # input can still match English rubric names and vice-versa.
        WEIGHTS = {
            'name':        10,
            'description':  5,
            'synonym':      8,
            'modality':     9,
            'hindi':        8,
        }

        scored = []
        for rubric in matched_rubrics:
            score = 0
            matched_symptoms = []
            matched_field    = match_tier   # which field type produced this hit

            rubric_name_lower    = rubric.name.lower()
            rubric_desc_lower    = rubric.description.lower()
            rubric_hindi_lower   = (rubric.name_hindi or '').lower()
            desc_hindi_lower     = (rubric.description_hindi or '').lower()

            synonym_texts        = [s.synonym.lower() for s in rubric.synonyms.all()]
            synonym_hindi_texts  = [(s.synonym_hindi or '').lower() for s in rubric.synonyms.all()]

            modality_texts       = [m.name.lower() for m in rubric.modalities.all()]
            modality_hindi_texts = [(m.name_hindi or '').lower() for m in rubric.modalities.all()]

            for term in list(symptom_tokens) + list(modality_tokens):
                term_lower    = term.lower()
                en_equivalents = HINDI_EN_MAP.get(term_lower, [])
                term_matched  = False

                # ── Score according to the winning tier ─────────────────────
                if match_tier == 'name':
                    # Primary: rubric name EN/HI
                    if term_lower in rubric_name_lower:
                        score += WEIGHTS['name']; term_matched = True
                    if term_lower in rubric_hindi_lower:
                        score += WEIGHTS['hindi']; term_matched = True
                    # Secondary: description
                    if term_lower in rubric_desc_lower:
                        score += WEIGHTS['description']; term_matched = True
                    if term_lower in desc_hindi_lower:
                        score += WEIGHTS['description']; term_matched = True
                    # English equivalents of Hindi tokens
                    for en_tok in en_equivalents:
                        if en_tok in rubric_name_lower:
                            score += WEIGHTS['name']; term_matched = True
                        if en_tok in rubric_desc_lower:
                            score += WEIGHTS['description']; term_matched = True

                elif match_tier == 'modality':
                    for mod in modality_texts:
                        if term_lower in mod:
                            score += WEIGHTS['modality']; term_matched = True; break
                    for mod_hi in modality_hindi_texts:
                        if term_lower in mod_hi:
                            score += WEIGHTS['modality']; term_matched = True; break
                    # English equivalents
                    for en_tok in en_equivalents:
                        for mod in modality_texts:
                            if en_tok in mod:
                                score += WEIGHTS['modality']; term_matched = True; break
                        if term_matched: break

                elif match_tier == 'synonym':
                    for syn in synonym_texts:
                        if term_lower in syn:
                            score += WEIGHTS['synonym']; term_matched = True; break
                    for syn_hi in synonym_hindi_texts:
                        if term_lower in syn_hi:
                            score += WEIGHTS['synonym']; term_matched = True; break
                    # English equivalents
                    for en_tok in en_equivalents:
                        for syn in synonym_texts:
                            if en_tok in syn:
                                score += WEIGHTS['synonym']; term_matched = True; break
                        if term_matched: break

                if term_matched and term_lower not in matched_symptoms:
                    matched_symptoms.append(term_lower)

            if score > 0:
                # Gather medicines for this rubric
                medicines = []
                for mg in rubric.medicine_grades.all():
                    medicines.append({
                        'id':          mg.medicine.id,
                        'name':        mg.medicine.name,
                        'latin_name':  mg.medicine.latin_name,
                        'grade':       mg.grade,
                        'grade_label': mg.get_grade_display(),
                    })

                scored.append({
                    'rubric': {
                        'id':               rubric.id,
                        'name':             rubric.name,
                        'name_hindi':       rubric.name_hindi,
                        'description':      rubric.description,
                        'level':            rubric.level,
                        'full_path':        rubric.get_full_path(),
                        'parent_name':      rubric.parent.name if rubric.parent else None,
                        'medicine_count':   len(medicines),
                        'match_tier':       match_tier,   # 'name' | 'modality' | 'synonym'
                        'modalities': {
                            'aggravations': [
                                {'name': m.name, 'name_hindi': m.name_hindi}
                                for m in rubric.modalities.filter(modality_type='aggravation')
                            ],
                            'ameliorations': [
                                {'name': m.name, 'name_hindi': m.name_hindi}
                                for m in rubric.modalities.filter(modality_type='amelioration')
                            ],
                        },
                        'synonyms': [
                            {'synonym': s.synonym, 'synonym_hindi': s.synonym_hindi}
                            for s in rubric.synonyms.all()
                        ],
                    },
                    'score':             score,
                    'matched_symptoms':  matched_symptoms,
                    'matched_field':     match_tier,   # echoed at result level too
                    'medicines':         medicines,
                })

        # Sort by score descending
        scored.sort(key=lambda x: x['score'], reverse=True)
        top_rubrics = scored[:top_n]

        # ── Step 4: Aggregate medicines across top rubrics ────────────────────
        # For each medicine that appears in the top rubrics:
        #   occurrence_count = how many rubrics it appears in
        #   total_grade      = sum of grades across all those rubrics
        #   avg_grade        = mean grade
        medicine_agg = {}   # medicine_id → dict

        for item in top_rubrics:
            for med in item['medicines']:
                mid = med['id']
                if mid not in medicine_agg:
                    medicine_agg[mid] = {
                        'id':             mid,
                        'name':           med['name'],
                        'latin_name':     med['latin_name'],
                        'occurrences':    0,
                        'total_grade':    0,
                        'rubric_names':   [],
                    }
                medicine_agg[mid]['occurrences']  += 1
                medicine_agg[mid]['total_grade']  += med['grade']
                medicine_agg[mid]['rubric_names'].append(item['rubric']['name'])

        # Compute avg_grade and sort: first by occurrences desc, then by total_grade desc
        medicine_chart = []
        for mid, agg in medicine_agg.items():
            agg['avg_grade']      = round(agg['total_grade'] / agg['occurrences'], 2)
            agg['score']          = (agg['occurrences'] * 10) + agg['total_grade']
            medicine_chart.append(agg)

        medicine_chart.sort(key=lambda x: (x['occurrences'], x['total_grade']), reverse=True)

        # ── Step 5: Build per-symptom breakdown for the table view ───────────
        # For each symptom, list every rubric that matched it + that rubric's medicines
        symptoms_breakdown = []
        for raw_sentence in symptoms_raw:
            sentence_words = sentence_tokens.get(str(raw_sentence), [])
            if not sentence_words:
                continue

            sym_rubrics = []
            for item in scored:
                # If ANY of the extracted tokens from this sentence matched the rubric:
                if any(w in item['matched_symptoms'] for w in sentence_words):
                    sym_rubrics.append({
                        'id':             item['rubric']['id'],
                        'name':           item['rubric']['name'],
                        'name_hindi':     item['rubric']['name_hindi'],
                        'full_path':      item['rubric']['full_path'],
                        'score':          item['score'],
                        'medicine_count': item['rubric']['medicine_count'],
                        'modalities':     item['rubric']['modalities'],
                        'synonyms':       item['rubric']['synonyms'],
                        'medicines':      item['medicines'][:5],   # top 5 per rubric
                    })
            # Sort rubrics for this symptom by score
            sym_rubrics.sort(key=lambda r: r['score'], reverse=True)
            symptoms_breakdown.append({
                'symptom':       raw_sentence,
                'rubric_count':  len(sym_rubrics),
                'rubrics':       sym_rubrics[:5],   # top 5 rubrics per symptom
            })
        return JsonResponse({
            'success':             True,
            'chapter_id':          chapter_id,
            'symptoms':            symptoms,
            'total_matched':       len(scored),
            'match_tier':          match_tier,   # 'name' | 'modality' | 'synonym' | None
            'search_note':         {
                'name':     'Matched by rubric name (English/Hindi)',
                'modality': 'No name match — matched by modality (aggravation/amelioration)',
                'synonym':  'No name/modality match — matched by synonym',
            }.get(match_tier, 'No matches found'),
            'symptoms_breakdown':  symptoms_breakdown,
            'top_rubrics':    [
                {**item['rubric'],
                 'score':            item['score'],
                 'matched_symptoms': item['matched_symptoms'],
                 'matched_field':    item.get('matched_field', match_tier),
                 'medicines':        item['medicines']}
                for item in top_rubrics
            ],
            'medicine_chart': medicine_chart,
        })

    except Exception as e:
        logger.error(f"Error in doctor_rubric_repertorize: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return JsonResponse({'error': f'Repertorization failed: {str(e)}'}, status=500)

