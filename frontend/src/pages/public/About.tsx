import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';

const About: React.FC = () => {
  const { t } = useTranslation();

  const stats = [
    { value: '20+', label: 'Healthcare Facilities' },
    { value: '4', label: 'User Roles' },
    { value: '3', label: 'Languages Supported' },
    { value: '100%', label: 'Open Source' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('nav.about')}</h1>
          <p className="text-xl text-primary-100 max-w-2xl mx-auto">
            Building accessible healthcare solutions for rural Maharashtra through technology and innovation.
          </p>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4">
                Smart India Hackathon 2024
              </span>
              <h2 className="text-2xl font-bold text-gray-900">Problem Statement ID: 26133</h2>
            </div>
            <div className="prose prose-lg max-w-none text-gray-600">
              <p>
                <strong>Ministry:</strong> Government of Maharashtra
              </p>
              <p>
                <strong>Theme:</strong> Healthcare & Biomedical Devices
              </p>
              <p>
                <strong>Problem:</strong> Accessibility and quality of public healthcare services in rural Maharashtra.
                Building an AI-enabled platform connecting patients, doctors, healthcare workers, and public facilities.
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Capabilities</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { title: 'AI Health Assessment', desc: 'Rule-based preliminary health risk assessment with vital analysis', icon: '🤖' },
              { title: 'Teleconsultation', desc: 'Text-based chat consultations optimized for low bandwidth', icon: '💬' },
              { title: 'Offline Support', desc: 'Full functionality without internet, with automatic sync', icon: '📴' },
              { title: 'Multi-role Access', desc: 'Patient, Doctor, Health Worker, and Admin dashboards', icon: '👥' },
              { title: 'Facility Finder', desc: '20+ Maharashtra healthcare facilities with details', icon: '🏥' },
              { title: 'Multilingual', desc: 'English, Marathi, and Hindi language support', icon: '🌐' },
            ].map((feature, index) => (
              <Card key={index} className="p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Technology Stack</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-primary-700">Frontend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>React + TypeScript</li>
                <li>Vite Build Tool</li>
                <li>Tailwind CSS</li>
                <li>React Router</li>
                <li>i18next (Multilingual)</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-primary-700">Backend</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Node.js + Express</li>
                <li>TypeScript</li>
                <li>MongoDB + Mongoose</li>
                <li>JWT Authentication</li>
                <li>RESTful APIs</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4 text-primary-700">AI Service</h3>
              <ul className="space-y-2 text-gray-600">
                <li>Python + FastAPI</li>
                <li>Rule-based Assessment</li>
                <li>Vital Analysis</li>
                <li>Symptom Pattern Matching</li>
                <li>Risk Scoring</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 bg-yellow-50 border-yellow-200">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">Important Disclaimer</h3>
                <p className="text-yellow-700">
                  SwasthyaSetu provides AI-assisted preliminary health risk assessments and is NOT a substitute for 
                  professional medical diagnosis, treatment, or advice. Always consult qualified healthcare 
                  professionals for medical decisions. In case of emergency, contact emergency services immediately.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default About;
