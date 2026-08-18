import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X } from 'lucide-react';
import { useState } from 'react';

export default function AboutSection() {
  const [selectedModal, setSelectedModal] = useState(null);

  const modalContent = {
    'About Dr. Nautiyal': {
      title: 'About Dr. J.P. Nautiyal',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Dr. J.P. Nautiyal is a well known Homeopathic doctor of Uttarakhand. Born in the well-cultivated Brahmin family of village Bhriguban in the Budha kedar area of  district Tehri Garhwal, Uttarakhand.
          </p>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Educational Qualifications</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Bachelor of Homeopathy Medicine and Surgery (BHMS) from University of Kanpur</li>
            <li>M.D. (Postgraduate degree) from Janardan Rai University, Rajasthan</li>
            <li><strong>First Homeopathic M.D. of Uttarakhand</strong></li>
          </ul>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Professional Experience</h3>
          <p className="text-gray-700 leading-relaxed">
            With more than <strong>45 years of homeopathy experience</strong>, of which about 23 years are involved in various important government hospitals including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Doon Hospital (now known as Doon Medical College Hospital)</li>
            <li>Various district hospitals across Uttarakhand</li>
            <li>Served as Registrar Homoeopathic Medicine Board</li>
            <li>District Homeopathic Medical Officer in different districts</li>
          </ul>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Publications & Contributions</h3>
          <p className="text-gray-700 leading-relaxed">
            In 2011, published a book entitled <strong>"Ayush Chikitsa Padhatiyan"</strong>, which comprehensively describes all about the methods of Ayurveda, Homeopathy, Siddha Medicine, Unani Medicine, Yoga and Naturopathy.
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            At present, Dr. J.P. Nautiyal is a well known Homeopathic doctor of Uttarakhand, aiming to serve the society through homeopathy.
          </p>
        </div>
      )
    },
    'Our Treatments': {
      title: 'Our Treatment Approach',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We offer comprehensive homeopathic treatment for a wide range of conditions, focusing on holistic healing and individualized care. Our treatments are safe, effective, and suitable for all age groups.
          </p>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Treatment Specialties</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Chronic diseases and lifestyle disorders</li>
            <li>Respiratory conditions (Asthma, Allergies, COPD)</li>
            <li>Digestive and gastrointestinal problems</li>
            <li>Skin conditions and allergies</li>
            <li>Mental health and psychiatric support</li>
            <li>Women's health and hormonal balance</li>
            <li>Pediatric care and childhood ailments</li>
            <li>Joint, muscle, and bone disorders</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Each treatment plan is customized based on detailed consultation, symptom analysis, and constitutional assessment.
          </p>
        </div>
      )
    },
    'HomeoAI Platform': {
      title: 'HomeoAI: AI-Powered Homeopathy',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            Our innovative HomeoAI platform combines traditional homeopathic wisdom with cutting-edge artificial intelligence to provide precise symptom analysis, remedy selection, and treatment tracking.
          </p>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Key Features</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>AI Rubric Analyzer - Transforms patient narratives into repertory rubrics</li>
            <li>Manual Repertorization - Direct rubric selection and remedy matching</li>
            <li>Digital Prescription Management with WhatsApp dispatch</li>
            <li>Patient Database - Secure patient records and history</li>
            <li>Analysis History - Track patient consultations and follow-ups</li>
            <li>Reference Library - Kent Repertory and Boericke Materia Medica</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            HomeoAI assists practitioners in making informed decisions while maintaining the personal touch of traditional homeopathic care.
          </p>
        </div>
      )
    },
    'Patient Testimonials': {
      title: 'What Our Patients Say',
      content: (
        <div className="space-y-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 italic mb-3">
              "Dr. Nautiyal's treatment completely changed my life. After years of suffering from chronic respiratory issues, I finally found relief through his personalized homeopathic approach."
            </p>
            <p className="font-primary-semibold text-[#062E6F]">- Rameshwar Sharma, Dehradun</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 italic mb-3">
              "The care and attention I received was exceptional. Dr. Nautiyal took time to understand my condition thoroughly and created a treatment plan that actually worked."
            </p>
            <p className="font-primary-semibold text-[#062E6F]">- Priya Rawat, Haridwar</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p className="text-gray-700 italic mb-3">
              "I was skeptical about homeopathy at first, but the results speak for themselves. My digestive issues are completely resolved, and I feel healthier than ever."
            </p>
            <p className="font-primary-semibold text-[#062E6F]">- Sunil Verma, Rishikesh</p>
          </div>
        </div>
      )
    },
    'Contact Us': {
      title: 'Get in Touch',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            We're here to help you on your journey to better health. Reach out to us for consultations, appointments, or any questions about homeopathic treatment.
          </p>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Clinic Address</h3>
          <p className="text-gray-700">
            Dr. J.P. Nautiyal Homeopathic Clinic<br />
            Rajeev Nagar Road, Near Rispana Bridge<br />
            Haridwar Road, Dehradun<br />
            Uttarakhand 248001, India
          </p>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Contact Information</h3>
          <ul className="space-y-2 text-gray-700">
            <li><strong>Phone:</strong> +91 7983909157</li>
            <li><strong>Email:</strong> drjpnaut@gmail.com</li>
            <li><strong>Summer Hours (Apr-Sep):</strong> Mon-Sat, 9:00 AM - 1:00 PM, 4:30 PM - 8:00 PM</li>
            <li><strong>Winter Hours (Oct-Mar):</strong> Mon-Sat, 10:00 AM - 1:00 PM, 4:00 PM - 7:00 PM</li>
            <li><strong>Sunday:</strong> Only on Appointment</li>
          </ul>
          <h3 className="text-xl font-primary-semibold text-[#062E6F] mt-6">Book a Consultation</h3>
          <p className="text-gray-700 leading-relaxed">
            Schedule your appointment online or call us directly. We offer both in-person and telemedicine consultations for your convenience.
          </p>
        </div>
      )
    }
  };

  const links = [
    { title: 'About Dr. Nautiyal', href: '#about' },
    { title: 'Our Treatments', href: '#treatments' },
    { title: 'HomeoAI Platform', href: '#homeoai' },
    { title: 'Patient Testimonials', href: '#testimonials' },
    { title: 'Contact Us', href: '#contact' }
  ];

  return (
    <>
      <section id="about" className="py-20 lg:py-28 bg-[#062E6F] relative">

        <div className="section-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left Column: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6 }}
              className="space-y-6 lg:space-y-8"
            >
              {/* Main Heading */}
              <h2 className="font-secondary-regular text-3xl sm:text-4xl lg:text-5xl xl:text-6xl text-white leading-tight font-light">
                Making healthcare work{' '}
                <span className="font-secondary-regular italic">for all of us</span>
              </h2>

              {/* Description */}
              <p className="font-primary-regular text-[#F8F9FA]/85 text-base sm:text-lg leading-relaxed">
                Together, we're reshaping the homeopathic healthcare experience for families across Uttarakhand—meeting them where care truly happens: at home, in the community, and through personalized treatment.
              </p>

              {/* Navigation Links */}
              <div className="space-y-1">
                {links.map((link) => (
                  <motion.button
                    key={link.title}
                    onClick={() => setSelectedModal(link.title)}
                    whileHover={{ x: 10 }}
                    className="group flex items-center justify-between text-white/90 hover:text-white font-primary-medium text-[#F8F9FA] text-base sm:text-lg py-3 border-b border-white/20 transition-all w-full text-left cursor-pointer"
                  >
                    <span>{link.title}</span>
                    <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity text-[#C86B5E]" />
                  </motion.button>
                ))}
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedModal('About Dr. Nautiyal')}
                className="px-8 py-3.5 rounded-lg bg-[#C86B5E] hover:bg-[#B85A4D] text-white font-primary-semibold text-base transition-all shadow-lg cursor-pointer"
              >
                Learn more about our practice
              </motion.button>
            </motion.div>

            {/* Right Column: Doctor Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl relative">
                <img
                  src="/images/drjpnaut/doc_pic.jpg"
                  alt="Dr. J.P. Nautiyal - Homeopathic Physician"
                  className="w-full h-[460px] sm:h-[580px] lg:h-[700px] object-cover object-top"
                />

                {/* Gradient Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent pt-16 pb-6 px-4 sm:px-6">
                  <div className="space-y-2">
                    <p className="text-white/80 font-primary-regular text-xs sm:text-sm uppercase tracking-wide">
                      Senior Post Graduate Homoeopathic Physician
                    </p>
                    <h3 className="text-white font-primary-bold text-2xl sm:text-3xl">
                      Dr. J.P. Nautiyal
                    </h3>
                    <p className="text-white/90 font-primary-medium text-base sm:text-lg">
                      MD (Homeo) • 45+ Years Experience
                    </p>

                    {/* Contact Information */}
                    <div className="pt-3 space-y-2 border-t border-white/20 mt-3">
                      <div className="flex flex-wrap items-center gap-2 text-white/90 text-xs sm:text-sm">
                        <svg className="w-4 h-4 flex-shrink-0 text-[#E89B8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <div>
                          <a href="tel:+917983909157" className="hover:text-[#C86B5E] transition-colors">+91-7983909157</a>
                          <span className="mx-1">•</span>
                          <a href="tel:+919410504434" className="hover:text-[#C86B5E] transition-colors">9410504434</a>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-white/90 text-xs sm:text-sm">
                        <svg className="w-4 h-4 flex-shrink-0 text-[#E89B8F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a href="mailto:drjpnaut@gmail.com" className="hover:text-[#C86B5E] transition-colors">
                          drjpnaut@gmail.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>

      </section>

      {/* Modal */}
      <AnimatePresence>
        {selectedModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedModal(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            />
            
            {/* Modal Content */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden"
              >
                {/* Modal Header */}
                <div className="bg-[#062E6F] px-5 sm:px-8 py-4 sm:py-6 flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-secondary-regular text-white">
                    {modalContent[selectedModal].title}
                  </h3>
                  <button
                    onClick={() => setSelectedModal(null)}
                    className="text-white/80 hover:text-white transition-colors cursor-pointer p-1"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="px-5 sm:px-8 py-5 sm:py-6 overflow-y-auto max-h-[calc(85vh-80px)]">
                  {modalContent[selectedModal].content}
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
