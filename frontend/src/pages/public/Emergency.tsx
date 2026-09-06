import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../../components/common';
import { Button } from '../../components/common';
import { Alert } from '../../components/common';

const Emergency: React.FC = () => {
  const { t } = useTranslation();

  const emergencyContacts = [
    { name: 'National Emergency Number', number: '112', color: 'red' },
    { name: 'Ambulance', number: '108', color: 'red' },
    { name: 'Police', number: '100', color: 'blue' },
    { name: 'Fire', number: '101', color: 'orange' },
    { name: 'Women Helpline', number: '1091', color: 'pink' },
    { name: 'Child Helpline', number: '1098', color: 'green' },
  ];

  const firstAidTips = [
    {
      title: 'Heart Attack',
      steps: [
        'Call 112 immediately',
        'Have the person sit down and rest',
        'Loosen any tight clothing',
        'If aspirin is available and not allergic, give one',
        'Be ready to perform CPR if needed',
      ],
    },
    {
      title: 'Choking',
      steps: [
        'Encourage coughing if partial blockage',
        'Give 5 back blows between shoulder blades',
        'Give 5 abdominal thrusts (Heimlich maneuver)',
        'Repeat until object is dislodged',
        'Call 112 if person becomes unconscious',
      ],
    },
    {
      title: 'Severe Bleeding',
      steps: [
        'Apply direct pressure with clean cloth',
        'Elevate the wound above heart level',
        'Keep applying pressure for 10-15 minutes',
        'Apply bandage firmly but not too tight',
        'Seek medical help immediately',
      ],
    },
    {
      title: 'Burns',
      steps: [
        'Cool burn under running water for 20 minutes',
        'Remove jewelry/clothing near burn',
        'Cover with clean, non-stick bandage',
        'Do NOT apply ice, butter, or creams',
        'Seek medical help for severe burns',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-red-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('emergency.title')}</h1>
          <p className="text-xl text-red-100 max-w-2xl mx-auto">
            {t('emergency.subtitle')}
          </p>
        </div>
      </section>

      {/* Main Emergency Number */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 bg-red-50 border-red-200 text-center">
            <p className="text-gray-600 mb-2">{t('emergency.nationalEmergency')}</p>
            <a href="tel:112" className="block">
              <div className="text-6xl font-bold text-red-600 mb-4">112</div>
              <Button className="bg-red-600 hover:bg-red-700">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {t('emergency.callEmergency')}
              </Button>
            </a>
          </Card>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Alert variant="warning">
            {t('emergency.disclaimer')}
          </Alert>
        </div>
      </section>

      {/* Emergency Contacts */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Emergency Contacts</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {emergencyContacts.map((contact, index) => (
              <a key={index} href={`tel:${contact.number}`}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 text-sm">{contact.name}</p>
                      <p className="text-3xl font-bold text-gray-900">{contact.number}</p>
                    </div>
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                  </div>
                </Card>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* First Aid Tips */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">{t('emergency.firstAid')}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {firstAidTips.map((tip, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-red-100 text-red-600 rounded-full flex items-center justify-center mr-3 text-sm font-bold">
                    {index + 1}
                  </span>
                  {tip.title}
                </h3>
                <ol className="space-y-2">
                  {tip.steps.map((step, stepIndex) => (
                    <li key={stepIndex} className="flex items-start text-gray-600">
                      <span className="text-primary-600 mr-2">{stepIndex + 1}.</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CPR Instructions */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Basic CPR Steps</h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Call for Help</h3>
                <p className="text-gray-600 text-sm">Dial 112 or ask someone to call</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Push Hard & Fast</h3>
                <p className="text-gray-600 text-sm">30 compressions at 100-120/min, 2 inches deep</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Give Breaths</h3>
                <p className="text-gray-600 text-sm">2 rescue breaths after every 30 compressions</p>
              </div>
            </div>
            <p className="text-center text-gray-500 mt-6 text-sm">
              Continue until emergency services arrive or the person shows signs of life.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default Emergency;
