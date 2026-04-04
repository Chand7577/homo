// @ts-nocheck
"use client";

import { useState } from 'react';
import {
  BookOpen,
  Pill,
  Heart,
  Brain,
  Leaf,
  Sparkles,
  ArrowRight,
  X,
  ExternalLink,
  Video,
  FileText,
  HelpCircle,
  Lightbulb,
  Shield,
  Users,
  Search,
  TrendingUp,
  Award,
  CheckCircle2,
  Star,
  MessageCircle,
  Phone
} from 'lucide-react';

// Resource Detail Modal
const ResourceModal = ({ isOpen, onClose, resource }) => {
  if (!isOpen || !resource) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl animate-slideUp overflow-hidden">
        {/* Header */}
        <div className={`sticky top-0 z-10 bg-gradient-to-br ${resource.gradient} text-white px-6 md:px-8 py-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <resource.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-white/80 uppercase tracking-wide font-semibold">{resource.category}</p>
                <h2 className="text-2xl md:text-3xl font-bold">{resource.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-3 hover:bg-white/20 rounded-xl transition-all hover:rotate-90"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 md:p-8">
          <div className="prose prose-lg max-w-none">
            <div dangerouslySetInnerHTML={{ __html: resource.content }} />
          </div>

          {/* CTA Banner */}
          <div className="mt-8 bg-gradient-to-r from-[#3F856C] to-[#2d6350] rounded-2xl p-6 text-white">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-bold mb-2">Need Personalized Guidance?</h3>
                <p className="text-white/90 text-sm">
                  Consult with our expert homeopathic doctors for personalized treatment plans
                </p>
              </div>
              <button className="px-6 py-3 bg-white text-[#3F856C] rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2 whitespace-nowrap">
                <MessageCircle className="w-5 h-5" />
                Book Consultation
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

const PatientResources = () => {
  const [selectedResource, setSelectedResource] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'all', name: 'All Resources', icon: BookOpen, color: 'from-gray-600 to-gray-700' },
    { id: 'basics', name: 'Getting Started', icon: Lightbulb, color: 'from-yellow-500 to-orange-500' },
    { id: 'remedies', name: 'Common Remedies', icon: Pill, color: 'from-green-500 to-emerald-600' },
    { id: 'wellness', name: 'Wellness Guide', icon: Heart, color: 'from-rose-500 to-pink-600' },
    { id: 'faq', name: 'FAQ', icon: HelpCircle, color: 'from-purple-500 to-indigo-600' },
  ];

  const resources = [
    {
      id: 1,
      category: 'basics',
      title: 'What is Homeopathy?',
      description: 'Learn about the fundamentals of homeopathic medicine and how it works to heal naturally',
      icon: Brain,
      gradient: 'from-blue-500 to-blue-600',
      readTime: '5 min read',
      popularity: 'Most Popular',
      content: `
        <h2>Understanding Homeopathy</h2>
        <p>Homeopathy is a natural, holistic system of medicine that has been used for over 200 years to treat both acute and chronic conditions. It is based on the principle of "like cures like" – meaning a substance that causes symptoms in a healthy person can be used in a highly diluted form to treat similar symptoms in a sick person.</p>
        
        <h3>Core Principles</h3>
        <ul>
          <li><strong>Law of Similars:</strong> "Like cures like" - substances that produce symptoms in healthy people cure similar symptoms in sick people.</li>
          <li><strong>Minimum Dose:</strong> The remedy is given in extremely dilute form, making it safe and free from side effects.</li>
          <li><strong>Individualized Treatment:</strong> Each person is treated as unique, with remedies selected based on their specific symptoms and constitution.</li>
        </ul>

        <h3>How Does It Work?</h3>
        <p>Homeopathic remedies work by stimulating the body's own healing mechanisms. The highly diluted substances act as a signal to the body, encouraging it to heal itself. This gentle approach makes homeopathy suitable for people of all ages, from infants to the elderly.</p>

        <h3>What Can Homeopathy Treat?</h3>
        <p>Homeopathy can be used to treat a wide range of conditions, including:</p>
        <ul>
          <li>Acute illnesses (colds, flu, injuries)</li>
          <li>Chronic conditions (allergies, migraines, digestive issues)</li>
          <li>Emotional and mental health concerns</li>
          <li>Women's health issues</li>
          <li>Children's health concerns</li>
        </ul>
      `,
    },
    {
      id: 2,
      category: 'remedies',
      title: 'Common Remedies Guide',
      description: 'A comprehensive guide to frequently used homeopathic remedies and their applications',
      icon: Pill,
      gradient: 'from-green-500 to-emerald-600',
      readTime: '8 min read',
      popularity: 'Trending',
      content: `
        <h2>Most Common Homeopathic Remedies</h2>
        <p>Here are some of the most frequently used remedies in homeopathy and their primary indications:</p>

        <h3>Arnica Montana</h3>
        <p><strong>Primary Use:</strong> Trauma, injuries, bruising, muscle soreness</p>
        <p>Arnica is the go-to remedy for any kind of physical trauma. It helps reduce swelling, bruising, and pain. Often used after surgery, dental work, or sports injuries.</p>

        <h3>Belladonna</h3>
        <p><strong>Primary Use:</strong> High fever, throbbing headaches, inflammation</p>
        <p>Belladonna is indicated for sudden, intense symptoms with high fever, red face, and throbbing sensations. Commonly used for acute illnesses with rapid onset.</p>

        <h3>Nux Vomica</h3>
        <p><strong>Primary Use:</strong> Digestive issues, hangovers, stress</p>
        <p>This remedy is excellent for digestive complaints, especially those caused by overindulgence in food or alcohol. Also helpful for people who are stressed, irritable, and overworked.</p>

        <h3>Arsenicum Album</h3>
        <p><strong>Primary Use:</strong> Food poisoning, anxiety, restlessness</p>
        <p>Arsenicum is indicated for burning pains, anxiety, restlessness, and digestive disturbances. The person may feel chilly and anxious, with a need for company.</p>

        <h3>Pulsatilla</h3>
        <p><strong>Primary Use:</strong> Colds, hormonal issues, gentle temperaments</p>
        <p>Pulsatilla is often suited to gentle, emotional people who crave sympathy and feel better in open air. Commonly used for colds, hormonal imbalances, and changeable symptoms.</p>

        <h3>Rhus Toxicodendron</h3>
        <p><strong>Primary Use:</strong> Joint pain, stiffness, skin conditions</p>
        <p>This remedy is excellent for joint pain and stiffness that is worse on first movement but improves with continued motion. Also used for certain skin conditions.</p>
      `,
    },
    {
      id: 3,
      category: 'wellness',
      title: 'Daily Wellness Tips',
      description: 'Practical advice for maintaining health and preventing illness naturally',
      icon: Heart,
      gradient: 'from-rose-500 to-pink-600',
      readTime: '6 min read',
      popularity: 'Editor\'s Pick',
      content: `
        <h2>Maintaining Optimal Health</h2>
        <p>Prevention is better than cure. Here are some daily wellness tips to support your health naturally:</p>

        <h3>1. Stay Hydrated</h3>
        <p>Drink at least 8 glasses of water daily. Proper hydration supports every system in your body, from digestion to skin health.</p>

        <h3>2. Prioritize Sleep</h3>
        <p>Aim for 7-9 hours of quality sleep each night. Good sleep is essential for immune function, mental clarity, and overall health.</p>

        <h3>3. Eat Whole Foods</h3>
        <p>Focus on fresh, unprocessed foods. Include plenty of fruits, vegetables, whole grains, and lean proteins in your diet.</p>

        <h3>4. Manage Stress</h3>
        <p>Practice stress-reduction techniques like meditation, deep breathing, or yoga. Chronic stress weakens the immune system.</p>

        <h3>5. Exercise Regularly</h3>
        <p>Engage in at least 30 minutes of moderate exercise most days. Physical activity boosts immunity and mental health.</p>

        <h3>6. Maintain Good Posture</h3>
        <p>Poor posture can lead to various health issues. Be mindful of your posture, especially if you sit for long periods.</p>

        <h3>7. Spend Time in Nature</h3>
        <p>Fresh air and sunlight are beneficial for both physical and mental health. Try to spend time outdoors daily.</p>

        <h3>8. Practice Mindful Eating</h3>
        <p>Eat slowly, chew thoroughly, and pay attention to your body's hunger and fullness signals.</p>

        <h3>9. Limit Screen Time</h3>
        <p>Excessive screen time, especially before bed, can disrupt sleep patterns and eye health.</p>

        <h3>10. Stay Connected</h3>
        <p>Maintain meaningful relationships. Social connections are important for mental and emotional well-being.</p>
      `,
    },
    {
      id: 4,
      category: 'faq',
      title: 'Frequently Asked Questions',
      description: 'Get answers to the most common questions about homeopathy',
      icon: HelpCircle,
      gradient: 'from-purple-500 to-indigo-600',
      readTime: '7 min read',
      popularity: 'Most Helpful',
      content: `
        <h2>Your Questions Answered</h2>

        <h3>Is homeopathy safe?</h3>
        <p>Yes, homeopathic remedies are generally considered safe when used as directed. Because they are highly diluted, they are free from toxic side effects. However, it's important to consult with a qualified practitioner, especially for serious or chronic conditions.</p>

        <h3>How long does treatment take?</h3>
        <p>The duration varies depending on the condition and individual. Acute conditions may respond quickly (hours to days), while chronic conditions often require longer treatment (weeks to months). Your practitioner can give you a better timeline based on your specific case.</p>

        <h3>Can I use homeopathy with conventional medicine?</h3>
        <p>In many cases, yes. Homeopathy can often be used alongside conventional treatments. However, always inform both your homeopath and your conventional doctor about all treatments you're receiving.</p>

        <h3>Are there any side effects?</h3>
        <p>Homeopathic remedies are generally safe with minimal side effects. Occasionally, there may be a temporary worsening of symptoms (called a "healing crisis") before improvement occurs. This is usually a positive sign that the remedy is working.</p>

        <h3>How do I store homeopathic remedies?</h3>
        <p>Store remedies in a cool, dry place away from strong smells, direct sunlight, and electronic devices. Keep them in their original containers and away from essential oils and strong fragrances.</p>

        <h3>Can children use homeopathy?</h3>
        <p>Yes, homeopathy is very safe for children of all ages, including infants. The remedies are gentle and free from harsh chemicals, making them ideal for treating children's ailments.</p>

        <h3>Do I need to avoid certain foods while taking remedies?</h3>
        <p>Generally, avoid consuming coffee, mint, and strongly flavored foods 15 minutes before and after taking a remedy, as these can interfere with its effectiveness.</p>

        <h3>How do I know which remedy to take?</h3>
        <p>Our symptom analyzer can help guide you, but for best results, consult with a qualified homeopathic practitioner who can take a complete case history and prescribe the most appropriate remedy for your individual needs.</p>
      `,
    },
    {
      id: 5,
      category: 'basics',
      title: 'Understanding Potencies',
      description: 'Learn about different potency levels and when to use them for optimal results',
      icon: Sparkles,
      gradient: 'from-amber-500 to-orange-600',
      readTime: '5 min read',
      popularity: 'Beginner Friendly',
      content: `
        <h2>Homeopathic Potencies Explained</h2>
        <p>In homeopathy, potency refers to the strength and dilution level of a remedy. Understanding potencies helps you choose the right remedy for your situation.</p>

        <h3>Common Potency Scales</h3>
        <p>There are two main scales used in homeopathy:</p>
        <ul>
          <li><strong>Decimal (X):</strong> Each step is a 1:10 dilution (e.g., 6X, 12X, 30X)</li>
          <li><strong>Centesimal (C):</strong> Each step is a 1:100 dilution (e.g., 6C, 30C, 200C)</li>
        </ul>

        <h3>Low Potencies (6C, 6X, 12C, 12X)</h3>
        <p><strong>When to use:</strong> Physical symptoms, acute conditions, frequent repetition needed</p>
        <p>Low potencies work more on the physical level and can be repeated more frequently. They're ideal for:</p>
        <ul>
          <li>Recent injuries or trauma</li>
          <li>Acute physical symptoms</li>
          <li>First aid situations</li>
        </ul>

        <h3>Medium Potencies (30C, 30X)</h3>
        <p><strong>When to use:</strong> Most common ailments, both physical and emotional symptoms</p>
        <p>This is the most commonly used potency level. It's suitable for:</p>
        <ul>
          <li>General acute illnesses (colds, flu)</li>
          <li>Common ailments</li>
          <li>First-time users</li>
        </ul>

        <h3>High Potencies (200C, 1M, 10M)</h3>
        <p><strong>When to use:</strong> Deep-seated conditions, mental/emotional issues, constitutional treatment</p>
        <p>Higher potencies work more deeply and should typically be used under professional guidance. They're used for:</p>
        <ul>
          <li>Chronic conditions</li>
          <li>Mental and emotional imbalances</li>
          <li>Constitutional prescribing</li>
        </ul>

        <h3>General Guidelines</h3>
        <ul>
          <li>Start with lower potencies if you're new to homeopathy</li>
          <li>Higher potencies should be repeated less frequently</li>
          <li>If symptoms worsen significantly, stop the remedy and consult a practitioner</li>
          <li>For serious or chronic conditions, always consult a qualified homeopath</li>
        </ul>
      `,
    },
    {
      id: 6,
      category: 'wellness',
      title: 'Stress Management Guide',
      description: 'Natural approaches to managing stress and anxiety effectively',
      icon: Leaf,
      gradient: 'from-teal-500 to-cyan-600',
      readTime: '10 min read',
      popularity: 'Trending',
      content: `
        <h2>Natural Stress Relief</h2>
        <p>Stress is a major contributor to many health problems. Here are natural techniques to help manage stress effectively:</p>

        <h3>1. Deep Breathing Exercises</h3>
        <p><strong>4-7-8 Technique:</strong></p>
        <ul>
          <li>Inhale through your nose for 4 counts</li>
          <li>Hold your breath for 7 counts</li>
          <li>Exhale through your mouth for 8 counts</li>
          <li>Repeat 4 times</li>
        </ul>

        <h3>2. Progressive Muscle Relaxation</h3>
        <p>Tense and relax different muscle groups systematically, starting from your toes and moving up to your head. This helps release physical tension and promotes relaxation.</p>

        <h3>3. Mindfulness Meditation</h3>
        <p>Practice being present in the moment without judgment. Start with just 5 minutes a day and gradually increase. Focus on your breath or use a guided meditation app.</p>

        <h3>4. Regular Exercise</h3>
        <p>Physical activity is one of the best stress relievers. Find an activity you enjoy - walking, swimming, dancing, or yoga - and do it regularly.</p>

        <h3>5. Maintain a Routine</h3>
        <p>Having a consistent daily routine helps reduce anxiety and provides a sense of control. Include time for work, rest, and activities you enjoy.</p>

        <h3>6. Limit Caffeine and Alcohol</h3>
        <p>Both can increase anxiety and interfere with sleep. Try herbal teas or water instead.</p>

        <h3>7. Connect with Others</h3>
        <p>Talk to friends, family, or a therapist. Social support is crucial for managing stress.</p>

        <h3>8. Time in Nature</h3>
        <p>Spending time outdoors has been shown to reduce stress hormones and improve mood. Even a short walk in a park can help.</p>

        <h3>9. Journaling</h3>
        <p>Writing about your thoughts and feelings can help you process emotions and gain perspective on stressful situations.</p>

        <h3>10. Practice Gratitude</h3>
        <p>Each day, write down three things you're grateful for. This simple practice can shift your focus from stress to appreciation.</p>

        <h3>When to Seek Professional Help</h3>
        <p>If stress is overwhelming or persistent, don't hesitate to seek help from a healthcare professional. They can provide additional support and treatment options.</p>
      `,
    }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesCategory = activeCategory === 'all' || resource.category === activeCategory;
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleResourceClick = (resource) => {
    setSelectedResource(resource);
    setShowModal(true);
  };

  const currentCategory = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 pb-20 md:pb-0">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-[#3F856C] via-[#35735E] to-[#2d6350] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
              <BookOpen className="w-9 h-9" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">Knowledge Center</h1>
              <p className="text-white/90 text-lg">
                Everything you need to know about homeopathy
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles, remedies, tips..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm whitespace-nowrap transition-all ${
                    activeCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {category.name}
                  {activeCategory === category.id && (
                    <span className="ml-1 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                      {filteredResources.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Articles</p>
                <p className="text-2xl font-bold text-gray-900">{resources.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trending Now</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Most Popular</p>
                <p className="text-2xl font-bold text-gray-900">5.0</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                <Users className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Readers</p>
                <p className="text-2xl font-bold text-gray-900">10K+</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        {filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.id}
                  onClick={() => handleResourceClick(resource)}
                  className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:shadow-2xl hover:border-[#3F856C] transition-all duration-300 cursor-pointer group hover:-translate-y-1"
                >
                  {/* Gradient Header */}
                  <div className={`relative bg-gradient-to-br ${resource.gradient} p-6 h-40`}>
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        {resource.popularity && (
                          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold text-white border border-white/30">
                            {resource.popularity}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-bold text-white/80 uppercase tracking-wide mb-2">
                        {resource.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-[#3F856C] transition-colors">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-3">
                      {resource.description}
                    </p>
                    
                    {/* Meta Info */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        {resource.readTime}
                      </span>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#3F856C] group-hover:text-[#2d6350]">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Resources Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              We couldn't find any resources matching your search. Try different keywords or browse by category.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="px-6 py-3 bg-gradient-to-r from-[#3F856C] to-[#35735E] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-r from-[#3F856C] to-[#2d6350] rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="max-w-4xl mx-auto text-center">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6 border border-white/20">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Healing Journey?
            </h2>
            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
              Our expert homeopathic doctors are here to provide personalized care and guidance tailored to your unique health needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-[#3F856C] rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center gap-2 group">
                <MessageCircle className="w-5 h-5" />
                Book Consultation
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-2">
                <Phone className="w-5 h-5" />
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 max-w-4xl mx-auto">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900 mb-2">Important Disclaimer</h3>
              <p className="text-sm text-blue-800 leading-relaxed">
                The information provided here is for educational purposes only and should not replace 
                professional medical advice. Always consult with a qualified homeopathic practitioner 
                or healthcare provider before starting any new treatment.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Resource Detail Modal */}
      <ResourceModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        resource={selectedResource}
      />

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default PatientResources;
