import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import confetti from 'canvas-confetti';
import { Phone, Calendar, Clock, MapPin, MessageCircle, Send, CheckCircle2, AlertCircle } from 'lucide-react';

const appointmentSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters' }),
  phone: z.string().min(10, { message: 'Enter a valid 10-digit phone number' }),
  preferredDate: z.string().min(1, { message: 'Please select a preferred date' }),
  category: z.string().min(1, { message: 'Please select a treatment category' }),
  mode: z.enum(['in-clinic', 'whatsapp']),
  notes: z.string().optional(),
});

export default function ContactSection({ selectedCondition }) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  // Web3Forms Access Key from environment variable
  const WEB3FORMS_ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      preferredDate: new Date().toISOString().split('T')[0],
      category: selectedCondition || 'Fever & General',
      mode: 'in-clinic',
      notes: ''
    }
  });

  // Update category if passed externally
  React.useEffect(() => {
    if (selectedCondition) {
      setValue('category', selectedCondition);
    }
  }, [selectedCondition, setValue]);

  const onSubmit = async (data) => {
    setSubmitError(null);
    
    try {
      // Prepare form data for Web3Forms
      const formData = {
        access_key: WEB3FORMS_ACCESS_KEY,
        name: data.fullName,
        phone: data.phone,
        date: data.preferredDate,
        category: data.category,
        mode: data.mode === 'in-clinic' ? 'In-Clinic (Dehradun)' : 'Online WhatsApp',
        message: data.notes || 'No additional notes provided',
        subject: `New Appointment Request from ${data.fullName}`,
        from_name: 'Dr. Nautiyal Clinic Website',
      };

      // Submit to Web3Forms
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        setSubmittedData(data);
        setSubmitted(true);
        
        // Trigger confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {
          // ignore confetti errors
        }
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setSubmitError(error.message || 'Failed to submit form. Please try again or call us directly.');
    }
  };

  return (
    <section id="contact" className="py-16 lg:py-24 bg-[#E9ECEF] relative border-b border-[#6C757D]/30 overflow-hidden">
      {/* Halftone dots background */}
      <div className="absolute inset-0 halftone-dots-light opacity-50 pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-96 h-96 bg-gradient-to-bl from-[#062E6F]/6 to-transparent rounded-full blur-3xl" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F8F9FA] border border-[#6C757D]/40 mb-3">
            <Calendar className="w-3.5 h-3.5 text-[#C86B5E]" />
            <span className="font-mono-ledger text-xs uppercase tracking-widest text-[#062E6F] font-semibold">
              SCHEDULE A CONSULTATION
            </span>
          </div>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#062E6F] tracking-tight">
            Book your appointment with Dr. J.P. Nautiyal.
          </h2>
          <p className="text-base text-[#212529]/85 font-sans-body mt-3">
            Visit our clinic in Rajeev Nagar, Dehradun or consult online via WhatsApp.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left Column: Form Card */}
          <div className="lg:col-span-7">
            <div className="specimen-card p-6 sm:p-8 rounded-xl shadow-xl relative">
              {/* Corner Ticks */}
              <div className="corner-tick corner-tick-tl" />
              <div className="corner-tick corner-tick-tr" />
              <div className="corner-tick corner-tick-bl" />
              <div className="corner-tick corner-tick-br" />

              {/* Form Top Strip */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-dashed border-[#6C757D]/40 font-mono-ledger text-xs uppercase text-[#6C757D]">
                <span>APPOINTMENT LEDGER ENTRY</span>
                <span className="text-[#8B3A2A] font-semibold">CONFIDENTIAL MEDICAL FORM</span>
              </div>

              {submitted ? (
                /* Success Confirmation State */
                <div className="text-center py-8 space-y-4 animate-fade-in">
                  <div className="w-16 h-16 rounded-full bg-[#062E6F] text-[#E89B8F] flex items-center justify-center mx-auto shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>

                  <h3 className="font-serif-display text-2xl font-bold text-[#062E6F]">
                    Appointment Request Confirmed!
                  </h3>

                  <p className="text-sm text-[#212529]/90 max-w-md mx-auto font-sans-body">
                    Thank you, <strong>{submittedData?.fullName}</strong>. Our clinic desk will contact you at <strong>{submittedData?.phone}</strong> shortly to confirm your slot for {submittedData?.preferredDate}.
                  </p>

                  <div className="bg-[#F8F9FA] p-4 rounded-lg border border-[#6C757D]/40 font-mono-ledger text-xs text-left max-w-sm mx-auto space-y-1 text-[#062E6F]">
                    <div><strong>Patient:</strong> {submittedData?.fullName}</div>
                    <div><strong>Date:</strong> {submittedData?.preferredDate}</div>
                    <div><strong>Category:</strong> {submittedData?.category}</div>
                    <div><strong>Mode:</strong> {submittedData?.mode === 'in-clinic' ? 'In-Clinic (Dehradun)' : 'Online WhatsApp'}</div>
                  </div>

                  <div className="pt-4 flex justify-center gap-3">
                    <button
                      onClick={() => {
                        setSubmitted(false);
                        setSubmitError(null);
                        reset();
                      }}
                      className="px-4 py-2 text-xs font-mono-ledger uppercase text-[#062E6F] border border-[#062E6F] rounded hover:bg-[#062E6F] hover:text-[#F8F9FA] transition-colors"
                    >
                      Book Another Slot
                    </button>

                    <a
                      href={`https://wa.me/917983909157?text=Hello%20Dr.%20Nautiyal,%20I%20have%20submitted%20an%20appointment%20request%20for%20${encodeURIComponent(submittedData?.fullName)}.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="amber-btn px-5 py-2 text-xs font-mono-ledger uppercase rounded flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp Desk
                    </a>
                  </div>
                </div>
              ) : (
                /* Interactive Form */
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  
                  {/* Full Name & Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Sharma"
                        {...register('fullName')}
                        className="w-full px-3.5 py-2.5 rounded bg-[#F8F9FA] border border-[#6C757D]/40 text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
                      />
                      {errors.fullName && (
                        <p className="text-xs text-[#8B3A2A] font-mono-ledger mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.fullName.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. 9876543210"
                        {...register('phone')}
                        className="w-full px-3.5 py-2.5 rounded bg-[#F8F9FA] border border-[#6C757D]/40 text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
                      />
                      {errors.phone && (
                        <p className="text-xs text-[#8B3A2A] font-mono-ledger mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Preferred Date & Treatment Category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-1">
                        Preferred Date *
                      </label>
                      <input
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        {...register('preferredDate')}
                        className="w-full px-3.5 py-2.5 rounded bg-[#F8F9FA] border border-[#6C757D]/40 text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
                      />
                      {errors.preferredDate && (
                        <p className="text-xs text-[#8B3A2A] font-mono-ledger mt-1">
                          {errors.preferredDate.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-1">
                        Treatment Category *
                      </label>
                      <select
                        {...register('category')}
                        className="w-full px-3.5 py-2.5 rounded bg-[#F8F9FA] border border-[#6C757D]/40 text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
                      >
                        <option value="Fever & General">Fever & Acute Care</option>
                        <option value="Women's Health">Women's Health (PCOD/Fibroids)</option>
                        <option value="Digestive & Liver">Digestive & Liver (IBS/Acidity)</option>
                        <option value="Skin & Hair Care">Skin & Hair (Psoriasis/Eczema)</option>
                        <option value="Joint & Muscle Pain">Joint & Muscle (Arthritis)</option>
                        <option value="Respiratory & Allergies">Respiratory & Allergies</option>
                        <option value="Renal & Kidney Stones">Renal & Kidney Stones</option>
                        <option value="Mind & Psychiatric">Mind & Psychiatric</option>
                        <option value="Other Ailment">Other Health Issue</option>
                      </select>
                    </div>
                  </div>

                  {/* Mode of Consultation */}
                  <div>
                    <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-2">
                      Consultation Mode *
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center gap-2 p-3 rounded bg-[#F8F9FA] border border-[#6C757D]/40 cursor-pointer text-xs font-mono-ledger">
                        <input
                          type="radio"
                          value="in-clinic"
                          {...register('mode')}
                          className="accent-[#C86B5E]"
                        />
                        <span>In-Clinic (Dehradun)</span>
                      </label>

                      <label className="flex items-center gap-2 p-3 rounded bg-[#F8F9FA] border border-[#6C757D]/40 cursor-pointer text-xs font-mono-ledger">
                        <input
                          type="radio"
                          value="whatsapp"
                          {...register('mode')}
                          className="accent-[#C86B5E]"
                        />
                        <span>Online WhatsApp</span>
                      </label>
                    </div>
                  </div>

                  {/* Symptoms & Notes */}
                  <div>
                    <label className="block font-mono-ledger text-xs uppercase text-[#062E6F] font-semibold mb-1">
                      Brief Symptoms / Notes (Optional)
                    </label>
                    <textarea
                      rows="3"
                      placeholder="Describe your health concern, duration of problem, or current medications..."
                      {...register('notes')}
                      className="w-full px-3.5 py-2.5 rounded bg-[#F8F9FA] border border-[#6C757D]/40 text-sm text-[#212529] focus:outline-none focus:ring-2 focus:ring-[#C86B5E]"
                    />
                  </div>

                  {/* Error Message Display */}
                  {submitError && (
                    <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-start gap-2 text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Submission Failed</p>
                        <p className="text-xs mt-1">{submitError}</p>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full amber-btn py-3.5 rounded-md text-xs font-mono-ledger uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Submitting Entry...' : 'Submit Appointment Request'}</span>
                  </button>

                  <p className="text-[11px] text-[#6C757D] text-center font-mono-ledger">
                    🔒 Strictly private & confidential homeopathic record.
                  </p>
                </form>
              )}

            </div>
          </div>

          {/* Right Column: Clinic Hours & Location Card */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Clinic Hours Card */}
            <div className="bg-[#062E6F] text-[#F8F9FA] p-6 rounded-xl border border-[#6C757D]/30 shadow-xl space-y-4">
              <div className="flex items-center gap-2 text-[#E89B8F] font-mono-ledger text-xs uppercase tracking-wider font-bold pb-2 border-b border-[#6C757D]/30">
                <Clock className="w-4 h-4" /> CLINIC TIMINGS & SCHEDULE
              </div>

              <div className="space-y-3 font-mono-ledger text-xs">
                <div className="bg-[#084A9E] p-3 rounded border border-[#6C757D]/30">
                  <div className="text-[#E89B8F] font-bold uppercase mb-1">
                    Summer Timings (April – Sept)
                  </div>
                  <div className="flex justify-between text-[#F8F9FA]/90">
                    <span>Morning:</span> <span>9:00 AM – 1:00 PM</span>
                  </div>
                  <div className="flex justify-between text-[#F8F9FA]/90 mt-0.5">
                    <span>Evening:</span> <span>4:30 PM – 8:00 PM</span>
                  </div>
                  <div className="text-[10px] text-[#6C757D] mt-1">Monday to Saturday</div>
                </div>

                <div className="bg-[#084A9E] p-3 rounded border border-[#6C757D]/30">
                  <div className="text-[#E89B8F] font-bold uppercase mb-1">
                    Winter Timings (Oct – March)
                  </div>
                  <div className="flex justify-between text-[#F8F9FA]/90">
                    <span>Morning:</span> <span>10:00 AM – 1:00 PM</span>
                  </div>
                  <div className="flex justify-between text-[#F8F9FA]/90 mt-0.5">
                    <span>Evening:</span> <span>4:00 PM – 7:00 PM</span>
                  </div>
                  <div className="text-[10px] text-[#6C757D] mt-1">Monday to Saturday</div>
                </div>

                <div className="p-3 rounded bg-[#8B3A2A]/40 border border-[#8B3A2A] flex items-center justify-between text-[#F8F9FA]">
                  <span className="font-bold">SUNDAY:</span>
                  <span className="font-semibold text-[#E89B8F]">CLOSED (Emergency Online Available)</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Action Bar */}
            <div className="bg-[#F8F9FA] p-6 rounded-xl border border-[#6C757D]/40 shadow-md space-y-4">
              <h4 className="font-serif-display font-bold text-base text-[#062E6F]">
                Direct Clinic Desk Contacts
              </h4>

              <div className="space-y-2.5">
                <a
                  href="tel:+917983909157"
                  className="flex items-center gap-3 p-3 rounded bg-[#E9ECEF] hover:bg-[#062E6F] hover:text-[#F8F9FA] transition-colors text-xs font-mono-ledger text-[#062E6F] font-semibold border border-[#6C757D]/30"
                >
                  <Phone className="w-4 h-4 text-[#C86B5E]" />
                  <span>Call: +91 7983909157</span>
                </a>

                <a
                  href="tel:+919410504434"
                  className="flex items-center gap-3 p-3 rounded bg-[#E9ECEF] hover:bg-[#062E6F] hover:text-[#F8F9FA] transition-colors text-xs font-mono-ledger text-[#062E6F] font-semibold border border-[#6C757D]/30"
                >
                  <Phone className="w-4 h-4 text-[#C86B5E]" />
                  <span>Call: +91 9410504434</span>
                </a>

                <a
                  href="https://wa.me/917983909157?text=Hello%20Dr.%20Nautiyal,%20I%20want%20to%20book%20an%20appointment."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded bg-[#E9ECEF] hover:bg-[#062E6F] hover:text-[#F8F9FA] transition-colors text-xs font-mono-ledger text-[#062E6F] font-semibold border border-[#6C757D]/30"
                >
                  <MessageCircle className="w-4 h-4 text-[#6C757D]" />
                  <span>WhatsApp: +91 7983909157</span>
                </a>
              </div>

              {/* Map Address */}
              <div className="pt-3 border-t border-[#6C757D]/30 flex items-start gap-2.5 text-xs text-[#212529]">
                <MapPin className="w-4 h-4 text-[#C86B5E] flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Clinic Address:</strong><br />
                  Rajeev Nagar Road, Near Rispana Bridge,<br />
                  Haridwar Road, Dehradun, Uttarakhand 248001
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
