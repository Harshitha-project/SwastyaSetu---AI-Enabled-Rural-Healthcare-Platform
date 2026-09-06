export interface HealthArticle {
  id: string
  category: 'GENERAL' | 'MATERNAL' | 'CHILD' | 'CHRONIC' | 'INFECTIOUS' | 'FIRST_AID'
  title: {
    en: string
    mr: string
    hi: string
  }
  summary: {
    en: string
    mr: string
    hi: string
  }
  content: {
    en: string
    mr: string
    hi: string
  }
  icon: string
  keyPoints: {
    en: string[]
    mr: string[]
    hi: string[]
  }
  readTime: string
}

export const HEALTH_ARTICLES: HealthArticle[] = [
  {
    id: 'art-01',
    category: 'INFECTIOUS',
    icon: '🦟',
    title: {
      en: 'Dengue & Malaria: Rural Monsoon Prevention',
      mr: 'डेंग्यू आणि मलेरिया: ग्रामीण भागातील पावसाळी काळजी',
      hi: 'डेंगू और मलेरिया: ग्रामीण क्षेत्रों में मानसून से बचाव',
    },
    summary: {
      en: 'Recognize early symptoms of mosquito-borne fevers and eliminate stagnant water around village households.',
      mr: 'डासांमुळे होणाऱ्या तापाची सुरुवातीची लक्षणे ओळखा आणि घराभोवतालचे साचलेले पाणी नष्ट करा.',
      hi: 'मच्छरों से होने वाले बुखार के शुरुआती लक्षणों को पहचानें और घर के आसपास जमा पानी हटाएं।',
    },
    content: {
      en: 'Monsoon brings high humidity which accelerates mosquito breeding. Dengue presents with sudden high fever, severe retro-orbital eye pain, joint ache, and rash. Malaria presents with chills and rigors every alternate day. Early testing at your PHC is free and prevents platelet complications.',
      mr: 'पावसाळ्यात डासांची पैदास वेगाने होते. डेंग्यूमध्ये अचानक तीव्र ताप, डोळ्यांच्या मागे तीव्र वेदना, सांधेदुखी आणि अंगावर पुरळ येते. मलेरियामध्ये थंडी वाजून ताप येतो. प्राथमिक आरोग्य केंद्रात (PHC) मोफत तपासणी वेळेवर करून गुंतागुंत टाळा.',
      hi: 'मानसून में मच्छरों का प्रजनन तेजी से होता है। डेंगू में अचानक तेज बुखार, आंखों के पीछे दर्द और जोड़ों में दर्द होता है। अपने नजदीकी प्राथमिक स्वास्थ्य केंद्र पर निःशुल्क जांच करवाएं।',
    },
    keyPoints: {
      en: [
        'Empty flowerpots, tyres, and coconut shells every Sunday',
        'Sleep under medicated mosquito nets (LLIN)',
        'Do not take painkiller pills like Brufen or Aspirin without doctor advice',
        'Drink boiled water and maintain hydration with coconut water / ORS',
      ],
      mr: [
        'दर रविवारी घरातील आणि परिसरातील साचलेले पाणी रिकामे करा',
        'डास प्रतिबंधक मच्छरदाणीचा वापर करा',
        'डॉक्टरांच्या सल्ल्याशिवाय ब्रुफेन किंवा अस्पिरीन गोळ्या घेऊ नका',
        'उकळून थंड केलेले पाणी, नारळ पाणी आणि ORS प्या',
      ],
      hi: [
        'हर रविवार को गमले, टायर और बर्तनों का जमा पानी खाली करें',
        'मच्छरदानी का नियमित उपयोग करें',
        'बिना डॉक्टर की सलाह के दर्द की दवाइयां न लें',
        'उबला हुआ पानी और ओआरएस पिएं',
      ],
    },
    readTime: '3 min',
  },
  {
    id: 'art-02',
    category: 'CHRONIC',
    icon: '🩸',
    title: {
      en: 'Managing Blood Pressure & Diabetes with Desi Diet',
      mr: 'गावरान आहारातून रक्तदाब आणि मधुमेहाचे नियंत्रण',
      hi: 'देसी खानपान से ब्लड प्रेशर और डायबिटीज का नियंत्रण',
    },
    summary: {
      en: 'How traditional Maharashtra millets like Jowar and Bajra support cardiovascular and metabolic health.',
      mr: 'ज्वारी आणि बाजरीसारखी पारंपरिक भरड धान्ये हृदय आणि साखरेवर नियंत्रण कशी ठेवतात.',
      hi: 'ज्वार और बाजरा जैसे पारंपरिक मोटे अनाज कैसे रक्तचाप और शुगर को नियंत्रित रखते हैं।',
    },
    content: {
      en: 'High blood pressure (Hypertension) is often called a silent condition because it causes no pain until severe. Switching from refined wheat to whole Jowar and Bajra bhakri increases dietary fiber, reduces glycemic spikes, and provides magnesium for vascular relaxation.',
      mr: 'उच्च रक्तदाब शरीराला इजा होईपर्यंत कोणतीही लक्षणे दाखवत नाही. आहारात मैद्याऐवजी ज्वारी-बाजरीची भाकरी, मेथी, शेवग्याची पाने आणि कमी मीठ वापरल्याने रक्तदाब नियंत्रणात राहतो.',
      hi: 'हाई ब्लड प्रेशर एक शांत बीमारी है। खाने में कम नमक, ज्वार-बाजरे की रोटी और हरी पत्तेदार सब्जियों का उपयोग करने से स्वास्थ्य बेहतर रहता है।',
    },
    keyPoints: {
      en: [
        'Limit salt intake to less than 1 teaspoon per day',
        'Replace white rice with Jowar and Bajra bhakri',
        'Walk 30 minutes daily around the village farm or path',
        'Get BP and sugar checked monthly by your ASHA worker',
      ],
      mr: [
        'दिवसाला एका चमच्यापेक्षा कमी मीठ वापरा',
        'पांढऱ्या भाताऐवजी ज्वारी-बाजरीची भाकरी खा',
        'दररोज किमान ३० मिनिटे जलद चाला',
        'आशा सेविकेकडून दरमहा रक्तदाब व साखरेची मोफत तपासणी करून घ्या',
      ],
      hi: [
        'दिन भर में एक चम्मच से कम नमक खाएं',
        'चावल की जगह ज्वार-बाजरे की रोटी लें',
        'रोजाना 30 मिनट पैदल चलें',
        'आशा कार्यकर्ता से महीने में एक बार बीपी और शुगर जांचें',
      ],
    },
    readTime: '4 min',
  },
  {
    id: 'art-03',
    category: 'MATERNAL',
    icon: '🤰',
    title: {
      en: 'Maternal Nutrition & Safe Institutional Delivery',
      mr: 'माता पोषण आणि सुरक्षित संस्थात्मक प्रसूती',
      hi: 'मातृ पोषण और सुरक्षित संस्थागत प्रसव',
    },
    summary: {
      en: 'Essential iron, folic acid, and calcium intake during pregnancy and why PHC delivery saves lives.',
      mr: 'गरोदरपणातील लोह, फॉलिक ऍसिड आणि कॅल्शियमचे महत्त्व व प्राथमिक केंद्रातील प्रसूतीचे फायदे.',
      hi: 'गर्भावस्था में आवश्यक पोषण और अस्पताल में प्रसव के फायदे।',
    },
    content: {
      en: 'Every pregnant mother in rural areas is entitled to free antenatal care under government health missions. Timely intake of Iron & Folic Acid (IFA) tablets prevents postpartum hemorrhage and ensures healthy baby weight.',
      mr: 'प्रत्येक गरोदर मातेला शासनातर्फे मोफत तपासणी आणि औषधे मिळतात. लोहयुक्त गोळ्या नियमित घेतल्याने ॲनिमिया टळतो आणि बाळाचे वजन निरोगी राहते. नेहमी शासकीय रुग्णालय किंवा प्राथमिक आरोग्य केंद्रातच प्रसूती करा.',
      hi: 'गर्भावस्था में नियमित सरकारी स्वास्थ्य जांच करवाएं। आयरन की गोलियां नियमित लें ताकि खून की कमी न हो। प्रसव हमेशा अस्पताल में ही करवाएं।',
    },
    keyPoints: {
      en: [
        'Register pregnancy with ASHA within first 12 weeks',
        'Complete minimum 4 ANC checkups and tetanus vaccinations',
        'Consume jaggery with roasted grams, green vegetables, and milk',
        'Call 108/102 for free government ambulance during labor pains',
      ],
      mr: [
        'पहिल्या १२ आठवड्यांत आशा सेविकेकडे नाव नोंदणी करा',
        'किमान ४ वेळा तपासणी आणि धनुर्वाताची लस पूर्ण करा',
        'गूळ-फुटाणे, शेवगा, दूध आणि ताज्या भाज्या खा',
        'प्रसूती कळा सुरू होताच १०८ रुग्णवाहिकेला कॉल करा',
      ],
      hi: [
        'पहले 3 महीने में आशा कार्यकर्ता के पास पंजीकरण कराएं',
        'कम से कम 4 बार एएनसी जांच और टीके लगवाएं',
        'गुड़-चना, हरी सब्जियां और दूध का सेवन करें',
        'प्रसव पीड़ा होते ही 108 एम्बुलेंस को कॉल करें',
      ],
    },
    readTime: '3 min',
  },
  {
    id: 'art-04',
    category: 'FIRST_AID',
    icon: '🚨',
    title: {
      en: 'Emergency First Aid: Snakebite & Heat Stroke',
      mr: 'आपत्कालीन प्रथमोपचार: सर्पदंश आणि उष्माघात',
      hi: 'आपातकालीन प्राथमिक उपचार: सांप का काटना और लू लगना',
    },
    summary: {
      en: 'Critical Dos and Don’ts for snakebite management in rural agricultural communities.',
      mr: 'शेतात सर्पदंश झाल्यास काय करावे आणि काय करू नये याबद्दल महत्त्वाची माहिती.',
      hi: 'खेतों में सांप के काटने और गर्मी में लू लगने पर प्राथमिक सहायता।',
    },
    content: {
      en: 'In case of snakebite: Immobilize the limb with a splint, keep the patient calm, and transport immediately to the nearest PHC with anti-snake venom (ASV). Do NOT cut the wound, suck venom, or tie tight tourniquets which cause gangrene.',
      mr: 'सर्पदंश झाल्यास: रुग्णाला शांत ठेवा, चावलेला अवयव न हलवता काठीचा आधार द्या आणि त्वरित अँटी-स्नेक व्हेनम उपलब्ध असलेल्या जवळच्या ग्रामीण रुग्णालयात न्या. जखमेवर चीरा मारू नका, रक्त चोखू नका किंवा अतिशय घट्ट दोरी बांधू नका.',
      hi: 'सांप के काटने पर: मरीज को शांत रखें, काटे हुए अंग को हिलाएं नहीं और तुरंत नजदीकी अस्पताल ले जाएं। चीरा न लगाएं और कसकर पट्टी न बांधें।',
    },
    keyPoints: {
      en: [
        'Keep patient still and calm; do not allow walking',
        'Immobilize the bitten limb below heart level',
        'Never cut, burn, or suction the bite site',
        'Rush directly to the CHC/PHC equipped with anti-venom',
      ],
      mr: [
        'रुग्णाला धावू किंवा चालू देऊ नका',
        'चावलेला हात किंवा पाय हृदयाच्या खाली स्थिर ठेवा',
        'जखमेवर चीरा मारू नका किंवा विष चोखू नका',
        'त्वरित अँटी-व्हेनम असलेल्या शासकीय केंद्रात पोहोचा',
      ],
      hi: [
        'मरीज को चलने न दें और शांत रखें',
        'काटे हुए अंग को स्थिर रखें',
        'जख्म को न काटें और न ही जहर चूसें',
        'सीधे सरकारी अस्पताल ले जाएं',
      ],
    },
    readTime: '4 min',
  },
]

export const educationService = {
  getArticles(category?: string): HealthArticle[] {
    if (!category || category === 'ALL') return HEALTH_ARTICLES
    return HEALTH_ARTICLES.filter(a => a.category === category)
  },
  getArticleById(id: string): HealthArticle | undefined {
    return HEALTH_ARTICLES.find(a => a.id === id)
  }
}
