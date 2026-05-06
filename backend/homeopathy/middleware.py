from .models import Doctor, Patient

class BypassAuthMiddleware:
    """
    Middleware to globally bypass authentication by forcing doctor_id,
    patient_id, and is_admin in the session.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Force doctor session
        if not request.session.get('doctor_id'):
            doctor = Doctor.objects.filter(is_active=True).first()
            if doctor:
                request.session['doctor_id'] = doctor.id
            else:
                request.session['doctor_id'] = 1
                
        # Force patient session
        if not request.session.get('patient_id'):
            patient = Patient.objects.filter(is_active=True).first()
            if patient:
                request.session['patient_id'] = patient.id
            else:
                request.session['patient_id'] = 1
                
        # Force admin session
        if not request.session.get('is_admin'):
            request.session['is_admin'] = True

        return self.get_response(request)
