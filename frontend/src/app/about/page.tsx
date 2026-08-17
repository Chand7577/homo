import React from 'react';
import { Coffee, Heart, Leaf, Users, Award, Globe, TrendingUp } from 'lucide-react';

export default function OurStoryPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[rgba(26,111,74,0.9)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Our Story
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 font-light">
            From the misty hills of Karnataka to your cup—a journey of passion, quality, and authenticity
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block p-3 bg-[rgba(26,111,74,0.1)] rounded-full mb-4">
              <Coffee className="w-8 h-8 text-[rgba(26,111,74,1)]" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Where It All Began</h2>
          </div>
          
          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <p className="text-xl mb-6">
              In the heart of India's coffee country, where the Western Ghats cradle the finest coffee estates, 
              a dream was brewing. It was 2018 when <span className="font-semibold text-[rgba(26,111,74,1)]">Varun Leelaprasad</span>, 
              an MBA graduate with a deep-rooted passion for coffee and agriculture, envisioned something extraordinary.
            </p>
            <p className="text-lg mb-6">
              Growing up surrounded by the rich coffee culture of Karnataka, Varun witnessed firsthand the dedication 
              of thousands of farmers who poured their hearts into cultivating India's finest Arabica and Robusta beans. 
              Yet, he also saw the challenges they faced—limited market access, price volatility, and the gap between 
              their exceptional produce and global recognition.
            </p>
            <p className="text-lg">
              This sparked an idea: What if there was a way to bridge this gap? What if Indian coffee could reach 
              the world stage with the recognition it deserves, while ensuring farmers receive fair compensation and 
              sustainable support?
            </p>
          </div>
        </div>
      </section>

      {/* The Birth of LIT Coffee */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-[rgba(26,111,74,0.05)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">The Birth of LIT Coffee</h2>
              <p className="text-lg text-gray-700 mb-6">
                Thus, <span className="font-semibold text-[rgba(26,111,74,1)]">Leelaprasad International Pvt Ltd</span>, 
                proudly known as <span className="font-semibold text-[rgba(26,111,74,1)]">LIT Coffee</span>, was born. 
                Starting from our headquarters in Bangalore, we embarked on a mission to become India's most trusted 
                coffee exporter and manufacturer.
              </p>
              <p className="text-lg text-gray-700 mb-6">
                We didn't just want to sell coffee—we wanted to tell its story. Every bean, every batch, every cup 
                carries with it the legacy of Indian coffee heritage, the dedication of our farming partners, and our 
                commitment to excellence.
              </p>
              <div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow-sm border border-[rgba(26,111,74,0.2)]">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 bg-[rgba(26,111,74,0.1)] rounded-full flex items-center justify-center">
                    <Heart className="w-8 h-8 text-[rgba(26,111,74,1)]" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[rgba(26,111,74,1)] mb-1">OUR MISSION</p>
                  <p className="text-gray-700">
                    To elevate Indian coffee on the global stage while empowering farming communities
                  </p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="mb-6">
                  <p className="text-[rgba(26,111,74,1)] font-semibold mb-2">FOUNDED</p>
                  <p className="text-4xl font-bold text-gray-900">2018</p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[rgba(26,111,74,0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-6 h-6 text-[rgba(26,111,74,1)]" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-gray-900">20,000+</p>
                      <p className="text-sm text-gray-600">Farming Partners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[rgba(26,111,74,0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Leaf className="w-6 h-6 text-[rgba(26,111,74,1)]" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-gray-900">250+</p>
                      <p className="text-sm text-gray-600">Acres of Coffee Estate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[rgba(26,111,74,0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-6 h-6 text-[rgba(26,111,74,1)]" />
                    </div>
                    <div>
                      <p className="font-bold text-2xl text-gray-900">17+</p>
                      <p className="text-sm text-gray-600">Countries Served</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Roots Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center">Rooted in India's Coffee Heartland</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                region: "Chikmagalur",
                description: "The birthplace of Indian coffee, where legend meets legacy in every bean"
              },
              {
                region: "Coorg",
                description: "Misty mountains and monsoon magic create coffee with unparalleled depth"
              },
              {
                region: "Sakleshpur",
                description: "Hidden valleys producing some of India's most sought-after specialty coffee"
              }
            ].map((place, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-xl border border-gray-200 hover:border-[rgba(26,111,74,0.5)] transition-all hover:shadow-lg">
                <div className="w-12 h-12 bg-[rgba(26,111,74,0.1)] rounded-full flex items-center justify-center mb-4">
                  <Coffee className="w-6 h-6 text-[rgba(26,111,74,1)]" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{place.region}</h3>
                <p className="text-gray-600">{place.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* The Journey */}
      <section className="py-20 px-4 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Our Journey of Growth</h2>
          <div className="space-y-8">
            {[
              {
                year: "2018",
                title: "The Foundation",
                description: "Varun Leelaprasad establishes Leelaprasad International with a vision to transform Indian coffee exports"
              },
              {
                year: "2019-2020",
                title: "Building Trust",
                description: "Formed partnerships with over 20,000 farmers and acquired 250+ acres of coffee plantations"
              },
              {
                year: "2021-2022",
                title: "Global Recognition",
                description: "Achieved multiple certifications including ISO 22000, HACCP, and Coffee Board of India approvals"
              },
              {
                year: "2023",
                title: "Market Expansion",
                description: "Expanded to 17+ countries with over 8,000 satisfied clients worldwide"
              },
              {
                year: "2024",
                title: "LIT Coffee Launch",
                description: "Launched LIT Coffee platform to bring premium Indian coffee directly to consumers across India"
              }
            ].map((milestone, index) => (
              <div key={index} className="flex gap-6">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-2xl font-bold text-[rgba(26,111,74,1)]">{milestone.year}</span>
                </div>
                <div className="flex-shrink-0 w-px bg-[rgba(26,111,74,0.5)] relative">
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-[rgba(26,111,74,1)] rounded-full border-4 border-gray-900" />
                </div>
                <div className="flex-grow pb-8">
                  <h3 className="text-xl font-bold mb-2">{milestone.title}</h3>
                  <p className="text-gray-300">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Drives Us</h2>
            <p className="text-xl text-gray-600">The principles that guide every decision we make</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Award,
                title: "Quality First",
                description: "Every bean undergoes rigorous testing to meet international standards"
              },
              {
                icon: Heart,
                title: "Farmer Empowerment",
                description: "Fair prices and sustainable practices that support farming communities"
              },
              {
                icon: Leaf,
                title: "Sustainability",
                description: "Environmentally responsible farming and ethical trade practices"
              },
              {
                icon: TrendingUp,
                title: "Innovation",
                description: "Continuously improving processes while honoring traditional methods"
              }
            ].map((value, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-200 hover:border-[rgba(26,111,74,0.5)] transition-all">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-[rgba(26,111,74,0.1)] rounded-full mb-4">
                  <value.icon className="w-8 h-8 text-[rgba(26,111,74,1)]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-[rgba(26,111,74,0.05)] to-white">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="grid md:grid-cols-2">
              <div className="bg-gradient-to-br from-gray-900 to-[rgba(26,111,74,0.8)] p-12 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-full mx-auto mb-6 flex items-center justify-center">
                    <span className="text-6xl font-bold">VL</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Varun Leelaprasad</h3>
                  <p className="text-[rgba(255, 255, 255, 0.3)] text-sm font-semibold mb-4">FOUNDER & MANAGING DIRECTOR</p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Award className="w-4 h-4" />
                    <span>MBA Graduate & Coffee Expert</span>
                  </div>
                </div>
              </div>
              <div className="p-12">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">The Visionary Behind LIT Coffee</h3>
                <p className="text-gray-700 mb-4">
                  Varun Leelaprasad is more than just a founder—he's a coffee enthusiast who transformed his 
                  passion into a thriving enterprise that serves thousands.
                </p>
                <p className="text-gray-700 mb-6">
                  With over 10 years of expertise in coffee farming and manufacturing, Varun has earned multiple 
                  prestigious awards and recognition in the industry. His vision goes beyond business success; 
                  it's about creating a sustainable ecosystem where quality coffee, farmer welfare, and 
                  environmental responsibility coexist harmoniously.
                </p>
                <div className="bg-[rgba(26,111,74,0.05)] p-4 rounded-lg border-l-4 border-[rgba(26,111,74,1)]">
                  <p className="text-gray-800 italic">
                    "Our success is measured not just in exports, but in the smiles of farmers who trust us 
                    and the satisfaction of customers who savor our coffee."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today & Tomorrow */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-8">Today & Tomorrow</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-8">
            Today, LIT Coffee stands as a testament to what's possible when passion meets purpose. We're proud 
            to be recognized as one of India's leading coffee exporters, serving over 8,000 clients across 17+ 
            countries. But we're not stopping here.
          </p>
          <p className="text-xl text-gray-700 leading-relaxed mb-12">
            With the launch of our consumer platform, we're bringing the same premium quality that international 
            clients love directly to coffee enthusiasts across India. Every cup of LIT Coffee is an invitation 
            to experience the rich heritage, exceptional quality, and heartfelt dedication that defines Indian coffee.
          </p>
          
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[rgba(26,111,74,1)] to-[rgba(26,111,74,0.8)] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:shadow-xl transition-all cursor-pointer">
            Join Our Journey
            <Coffee className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Closing */}
      <section className="py-16 px-4 bg-gradient-to-r from-gray-900 to-[rgba(26,111,74,0.9)] text-white text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-2xl font-light mb-4">
            This is more than coffee. This is our story—and we're honored to share it with you.
          </p>
          <p className="text-lg text-gray-300">
            Welcome to the LIT Coffee family.
          </p>
        </div>
      </section>
    </div>
  );
}
