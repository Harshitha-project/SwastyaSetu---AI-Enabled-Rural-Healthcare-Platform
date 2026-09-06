/**
 * Medicine Database Service for SwasthyaSetu
 * Contains common medications used in rural healthcare settings
 */

export interface Medicine {
  id: string
  name: string
  genericName: string
  category: string
  dosageForms: string[]
  strengths: string[]
  commonDosages: string[]
  frequency: string[]
  route: string
  sideEffects: string[]
  contraindications: string[]
  interactions: string[]
  storageConditions: string
  maxDailyDose?: string
  pediatricDose?: string
  geriatricConsiderations?: string
  pregnancyCategory?: string
  isControlled: boolean
  requiresPrescription: boolean
}

export interface MedicineCategory {
  id: string
  name: string
  nameMarathi: string
  description: string
  icon: string
}

// Medicine categories
export const medicineCategories: MedicineCategory[] = [
  { id: 'analgesics', name: 'Pain Relievers', nameMarathi: 'वेदनाशामक', description: 'For pain and fever', icon: '💊' },
  { id: 'antibiotics', name: 'Antibiotics', nameMarathi: 'अँटीबायोटिक्स', description: 'For bacterial infections', icon: '🦠' },
  { id: 'antidiabetics', name: 'Diabetes Medications', nameMarathi: 'मधुमेह औषधे', description: 'For blood sugar control', icon: '🩸' },
  { id: 'antihypertensives', name: 'Blood Pressure', nameMarathi: 'रक्तदाब औषधे', description: 'For high blood pressure', icon: '❤️' },
  { id: 'respiratory', name: 'Respiratory', nameMarathi: 'श्वसन औषधे', description: 'For cough and breathing', icon: '🫁' },
  { id: 'gastrointestinal', name: 'Digestive', nameMarathi: 'पाचन औषधे', description: 'For stomach issues', icon: '🫃' },
  { id: 'vitamins', name: 'Vitamins & Supplements', nameMarathi: 'जीवनसत्त्वे', description: 'Nutritional supplements', icon: '💪' },
  { id: 'dermatological', name: 'Skin Medications', nameMarathi: 'त्वचा औषधे', description: 'For skin conditions', icon: '🧴' },
  { id: 'antiallergics', name: 'Allergy Medications', nameMarathi: 'अ‍ॅलर्जी औषधे', description: 'For allergies', icon: '🤧' },
  { id: 'cardiovascular', name: 'Heart Medications', nameMarathi: 'हृदय औषधे', description: 'For heart conditions', icon: '🫀' },
]

// Common medicines database (Essential Medicines List - India)
export const medicineDatabase: Medicine[] = [
  // === ANALGESICS / PAIN RELIEVERS ===
  {
    id: 'paracetamol',
    name: 'Paracetamol',
    genericName: 'Acetaminophen',
    category: 'analgesics',
    dosageForms: ['Tablet', 'Syrup', 'Drops', 'Suppository'],
    strengths: ['250mg', '500mg', '650mg', '125mg/5ml'],
    commonDosages: ['500mg', '650mg', '1000mg'],
    frequency: ['Every 4-6 hours', 'Three times daily', 'As needed'],
    route: 'Oral',
    sideEffects: ['Rare: Liver damage with overdose', 'Allergic reactions'],
    contraindications: ['Liver disease', 'Alcohol abuse'],
    interactions: ['Warfarin', 'Alcohol'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '4000mg',
    pediatricDose: '10-15mg/kg every 4-6 hours',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'ibuprofen',
    name: 'Ibuprofen',
    genericName: 'Ibuprofen',
    category: 'analgesics',
    dosageForms: ['Tablet', 'Syrup', 'Gel'],
    strengths: ['200mg', '400mg', '100mg/5ml'],
    commonDosages: ['200mg', '400mg'],
    frequency: ['Every 6-8 hours', 'Three times daily', 'As needed'],
    route: 'Oral',
    sideEffects: ['Stomach upset', 'Nausea', 'Dizziness'],
    contraindications: ['Peptic ulcer', 'Kidney disease', 'Aspirin allergy'],
    interactions: ['Aspirin', 'Blood thinners', 'ACE inhibitors'],
    storageConditions: 'Store below 25°C',
    maxDailyDose: '1200mg (OTC), 3200mg (Rx)',
    pregnancyCategory: 'C (D in 3rd trimester)',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'diclofenac',
    name: 'Diclofenac',
    genericName: 'Diclofenac Sodium',
    category: 'analgesics',
    dosageForms: ['Tablet', 'Gel', 'Injection'],
    strengths: ['50mg', '100mg', '1% gel'],
    commonDosages: ['50mg', '100mg'],
    frequency: ['Twice daily', 'Three times daily'],
    route: 'Oral/Topical',
    sideEffects: ['Stomach pain', 'Heartburn', 'Dizziness'],
    contraindications: ['GI bleeding', 'Heart failure', 'Kidney disease'],
    interactions: ['Anticoagulants', 'Lithium', 'Methotrexate'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '150mg',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: true,
  },

  // === ANTIBIOTICS ===
  {
    id: 'amoxicillin',
    name: 'Amoxicillin',
    genericName: 'Amoxicillin',
    category: 'antibiotics',
    dosageForms: ['Capsule', 'Tablet', 'Syrup'],
    strengths: ['250mg', '500mg', '125mg/5ml', '250mg/5ml'],
    commonDosages: ['250mg', '500mg'],
    frequency: ['Three times daily', 'Every 8 hours'],
    route: 'Oral',
    sideEffects: ['Diarrhea', 'Nausea', 'Rash'],
    contraindications: ['Penicillin allergy', 'Mononucleosis'],
    interactions: ['Methotrexate', 'Warfarin'],
    storageConditions: 'Store below 25°C, reconstituted syrup in refrigerator',
    pediatricDose: '25-50mg/kg/day divided in 3 doses',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'azithromycin',
    name: 'Azithromycin',
    genericName: 'Azithromycin',
    category: 'antibiotics',
    dosageForms: ['Tablet', 'Syrup'],
    strengths: ['250mg', '500mg', '200mg/5ml'],
    commonDosages: ['500mg', '250mg'],
    frequency: ['Once daily', 'Once daily for 3-5 days'],
    route: 'Oral',
    sideEffects: ['Nausea', 'Diarrhea', 'Abdominal pain'],
    contraindications: ['Macrolide allergy', 'Liver disease'],
    interactions: ['Antacids', 'Warfarin', 'Digoxin'],
    storageConditions: 'Store below 30°C',
    pediatricDose: '10mg/kg on day 1, then 5mg/kg for 4 days',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'ciprofloxacin',
    name: 'Ciprofloxacin',
    genericName: 'Ciprofloxacin',
    category: 'antibiotics',
    dosageForms: ['Tablet', 'Eye drops', 'IV'],
    strengths: ['250mg', '500mg', '750mg', '0.3% drops'],
    commonDosages: ['500mg', '250mg'],
    frequency: ['Twice daily', 'Every 12 hours'],
    route: 'Oral',
    sideEffects: ['Nausea', 'Diarrhea', 'Tendon problems'],
    contraindications: ['Quinolone allergy', 'Myasthenia gravis'],
    interactions: ['Antacids', 'Iron supplements', 'Theophylline'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'metronidazole',
    name: 'Metronidazole',
    genericName: 'Metronidazole',
    category: 'antibiotics',
    dosageForms: ['Tablet', 'Syrup', 'IV', 'Gel'],
    strengths: ['200mg', '400mg', '200mg/5ml'],
    commonDosages: ['400mg', '200mg'],
    frequency: ['Three times daily', 'Twice daily'],
    route: 'Oral',
    sideEffects: ['Metallic taste', 'Nausea', 'Dark urine'],
    contraindications: ['First trimester pregnancy', 'Alcohol consumption'],
    interactions: ['Alcohol (disulfiram reaction)', 'Warfarin', 'Lithium'],
    storageConditions: 'Store below 25°C, protect from light',
    pregnancyCategory: 'B (avoid in 1st trimester)',
    isControlled: false,
    requiresPrescription: true,
  },

  // === ANTIDIABETICS ===
  {
    id: 'metformin',
    name: 'Metformin',
    genericName: 'Metformin Hydrochloride',
    category: 'antidiabetics',
    dosageForms: ['Tablet', 'Extended-release tablet'],
    strengths: ['500mg', '850mg', '1000mg'],
    commonDosages: ['500mg', '850mg', '1000mg'],
    frequency: ['Once daily', 'Twice daily', 'With meals'],
    route: 'Oral',
    sideEffects: ['Nausea', 'Diarrhea', 'Stomach upset', 'Lactic acidosis (rare)'],
    contraindications: ['Kidney disease', 'Liver disease', 'Heart failure'],
    interactions: ['Alcohol', 'Contrast dyes', 'Diuretics'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '2550mg',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'glimepiride',
    name: 'Glimepiride',
    genericName: 'Glimepiride',
    category: 'antidiabetics',
    dosageForms: ['Tablet'],
    strengths: ['1mg', '2mg', '3mg', '4mg'],
    commonDosages: ['1mg', '2mg'],
    frequency: ['Once daily with breakfast'],
    route: 'Oral',
    sideEffects: ['Low blood sugar', 'Weight gain', 'Dizziness'],
    contraindications: ['Type 1 diabetes', 'Diabetic ketoacidosis'],
    interactions: ['Beta blockers', 'NSAIDs', 'Alcohol'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '8mg',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: true,
  },

  // === ANTIHYPERTENSIVES ===
  {
    id: 'amlodipine',
    name: 'Amlodipine',
    genericName: 'Amlodipine Besylate',
    category: 'antihypertensives',
    dosageForms: ['Tablet'],
    strengths: ['2.5mg', '5mg', '10mg'],
    commonDosages: ['5mg', '10mg'],
    frequency: ['Once daily'],
    route: 'Oral',
    sideEffects: ['Swelling in ankles', 'Headache', 'Flushing'],
    contraindications: ['Severe aortic stenosis', 'Cardiogenic shock'],
    interactions: ['Simvastatin', 'Cyclosporine'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '10mg',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'losartan',
    name: 'Losartan',
    genericName: 'Losartan Potassium',
    category: 'antihypertensives',
    dosageForms: ['Tablet'],
    strengths: ['25mg', '50mg', '100mg'],
    commonDosages: ['50mg', '100mg'],
    frequency: ['Once daily', 'Twice daily'],
    route: 'Oral',
    sideEffects: ['Dizziness', 'High potassium', 'Cough (less than ACE inhibitors)'],
    contraindications: ['Pregnancy', 'Bilateral renal artery stenosis'],
    interactions: ['Potassium supplements', 'NSAIDs', 'Lithium'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '100mg',
    pregnancyCategory: 'D',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'atenolol',
    name: 'Atenolol',
    genericName: 'Atenolol',
    category: 'antihypertensives',
    dosageForms: ['Tablet'],
    strengths: ['25mg', '50mg', '100mg'],
    commonDosages: ['50mg', '100mg'],
    frequency: ['Once daily'],
    route: 'Oral',
    sideEffects: ['Fatigue', 'Cold hands/feet', 'Slow heart rate'],
    contraindications: ['Asthma', 'Heart block', 'Severe bradycardia'],
    interactions: ['Verapamil', 'Clonidine', 'NSAIDs'],
    storageConditions: 'Store below 25°C',
    maxDailyDose: '100mg',
    pregnancyCategory: 'D',
    isControlled: false,
    requiresPrescription: true,
  },

  // === RESPIRATORY ===
  {
    id: 'salbutamol',
    name: 'Salbutamol',
    genericName: 'Salbutamol/Albuterol',
    category: 'respiratory',
    dosageForms: ['Inhaler', 'Nebulizer solution', 'Tablet', 'Syrup'],
    strengths: ['100mcg/puff', '2mg/5ml', '2mg', '4mg'],
    commonDosages: ['2 puffs', '2mg', '4mg'],
    frequency: ['Every 4-6 hours as needed', 'Three times daily'],
    route: 'Inhalation/Oral',
    sideEffects: ['Tremor', 'Palpitations', 'Headache'],
    contraindications: ['Severe heart disease'],
    interactions: ['Beta blockers', 'MAO inhibitors'],
    storageConditions: 'Store below 30°C, protect from sunlight',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'montelukast',
    name: 'Montelukast',
    genericName: 'Montelukast Sodium',
    category: 'respiratory',
    dosageForms: ['Tablet', 'Chewable tablet', 'Granules'],
    strengths: ['10mg', '5mg', '4mg'],
    commonDosages: ['10mg (adults)', '5mg (children 6-14)', '4mg (children 2-5)'],
    frequency: ['Once daily at bedtime'],
    route: 'Oral',
    sideEffects: ['Headache', 'Stomach pain', 'Mood changes'],
    contraindications: ['Phenylketonuria (chewable)'],
    interactions: ['Phenobarbital', 'Rifampicin'],
    storageConditions: 'Store below 30°C, protect from moisture and light',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: true,
  },

  // === GASTROINTESTINAL ===
  {
    id: 'omeprazole',
    name: 'Omeprazole',
    genericName: 'Omeprazole',
    category: 'gastrointestinal',
    dosageForms: ['Capsule', 'Tablet'],
    strengths: ['20mg', '40mg'],
    commonDosages: ['20mg', '40mg'],
    frequency: ['Once daily before breakfast', 'Twice daily'],
    route: 'Oral',
    sideEffects: ['Headache', 'Diarrhea', 'Nausea'],
    contraindications: ['Hypersensitivity to PPIs'],
    interactions: ['Clopidogrel', 'Methotrexate', 'Antifungals'],
    storageConditions: 'Store below 25°C, protect from moisture',
    maxDailyDose: '40mg (OTC), 360mg (Rx for specific conditions)',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'ondansetron',
    name: 'Ondansetron',
    genericName: 'Ondansetron',
    category: 'gastrointestinal',
    dosageForms: ['Tablet', 'ODT', 'Injection', 'Syrup'],
    strengths: ['4mg', '8mg', '4mg/5ml'],
    commonDosages: ['4mg', '8mg'],
    frequency: ['Every 8 hours as needed', 'Before meals'],
    route: 'Oral',
    sideEffects: ['Headache', 'Constipation', 'Dizziness'],
    contraindications: ['QT prolongation'],
    interactions: ['Apomorphine', 'Tramadol'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: true,
  },
  {
    id: 'ors',
    name: 'ORS',
    genericName: 'Oral Rehydration Salts',
    category: 'gastrointestinal',
    dosageForms: ['Powder for solution'],
    strengths: ['WHO standard formula'],
    commonDosages: ['After each loose stool'],
    frequency: ['As needed for diarrhea'],
    route: 'Oral',
    sideEffects: ['Vomiting if taken too fast'],
    contraindications: ['Severe vomiting', 'Intestinal obstruction'],
    interactions: ['None significant'],
    storageConditions: 'Store in cool, dry place. Use within 24 hours of preparation.',
    pediatricDose: '50-100ml after each loose stool',
    pregnancyCategory: 'A',
    isControlled: false,
    requiresPrescription: false,
  },

  // === VITAMINS & SUPPLEMENTS ===
  {
    id: 'iron-folic',
    name: 'Iron + Folic Acid',
    genericName: 'Ferrous Sulfate + Folic Acid',
    category: 'vitamins',
    dosageForms: ['Tablet', 'Syrup'],
    strengths: ['100mg + 0.5mg', '60mg + 0.5mg'],
    commonDosages: ['1 tablet daily'],
    frequency: ['Once daily', 'With meals'],
    route: 'Oral',
    sideEffects: ['Constipation', 'Black stools', 'Nausea'],
    contraindications: ['Hemochromatosis', 'Hemolytic anemia'],
    interactions: ['Antacids', 'Tetracyclines', 'Tea/Coffee'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'A',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'calcium-d3',
    name: 'Calcium + Vitamin D3',
    genericName: 'Calcium Carbonate + Cholecalciferol',
    category: 'vitamins',
    dosageForms: ['Tablet', 'Chewable tablet'],
    strengths: ['500mg + 250IU', '500mg + 400IU'],
    commonDosages: ['1-2 tablets daily'],
    frequency: ['Once or twice daily with meals'],
    route: 'Oral',
    sideEffects: ['Constipation', 'Gas', 'Nausea'],
    contraindications: ['Hypercalcemia', 'Kidney stones'],
    interactions: ['Tetracyclines', 'Thyroid medications', 'Bisphosphonates'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'A',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'multivitamin',
    name: 'Multivitamin',
    genericName: 'Multivitamin Complex',
    category: 'vitamins',
    dosageForms: ['Tablet', 'Syrup', 'Drops'],
    strengths: ['Standard formula'],
    commonDosages: ['1 tablet daily'],
    frequency: ['Once daily with food'],
    route: 'Oral',
    sideEffects: ['Nausea', 'Upset stomach'],
    contraindications: ['Specific vitamin excess'],
    interactions: ['Antibiotics', 'Levodopa'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'A',
    isControlled: false,
    requiresPrescription: false,
  },

  // === ANTIALLERGICS ===
  {
    id: 'cetirizine',
    name: 'Cetirizine',
    genericName: 'Cetirizine Hydrochloride',
    category: 'antiallergics',
    dosageForms: ['Tablet', 'Syrup'],
    strengths: ['5mg', '10mg', '5mg/5ml'],
    commonDosages: ['10mg', '5mg'],
    frequency: ['Once daily'],
    route: 'Oral',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Fatigue'],
    contraindications: ['Severe kidney disease'],
    interactions: ['CNS depressants', 'Alcohol'],
    storageConditions: 'Store below 30°C',
    maxDailyDose: '10mg',
    pediatricDose: '2.5-5mg for children 2-6 years',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'chlorpheniramine',
    name: 'Chlorpheniramine',
    genericName: 'Chlorpheniramine Maleate',
    category: 'antiallergics',
    dosageForms: ['Tablet', 'Syrup'],
    strengths: ['4mg', '2mg/5ml'],
    commonDosages: ['4mg'],
    frequency: ['Every 4-6 hours'],
    route: 'Oral',
    sideEffects: ['Drowsiness', 'Dry mouth', 'Blurred vision'],
    contraindications: ['Narrow-angle glaucoma', 'Urinary retention'],
    interactions: ['MAO inhibitors', 'CNS depressants'],
    storageConditions: 'Store below 25°C',
    maxDailyDose: '24mg',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: false,
  },

  // === DERMATOLOGICAL ===
  {
    id: 'clotrimazole',
    name: 'Clotrimazole',
    genericName: 'Clotrimazole',
    category: 'dermatological',
    dosageForms: ['Cream', 'Powder', 'Solution'],
    strengths: ['1%'],
    commonDosages: ['Apply thin layer'],
    frequency: ['Twice daily', 'Three times daily'],
    route: 'Topical',
    sideEffects: ['Skin irritation', 'Burning', 'Itching'],
    contraindications: ['Hypersensitivity'],
    interactions: ['None significant for topical use'],
    storageConditions: 'Store below 30°C',
    pregnancyCategory: 'B',
    isControlled: false,
    requiresPrescription: false,
  },
  {
    id: 'hydrocortisone-cream',
    name: 'Hydrocortisone Cream',
    genericName: 'Hydrocortisone',
    category: 'dermatological',
    dosageForms: ['Cream', 'Ointment'],
    strengths: ['0.5%', '1%', '2.5%'],
    commonDosages: ['Apply thin layer'],
    frequency: ['Once or twice daily'],
    route: 'Topical',
    sideEffects: ['Skin thinning', 'Burning', 'Itching'],
    contraindications: ['Skin infections', 'Open wounds'],
    interactions: ['None significant for topical use'],
    storageConditions: 'Store below 25°C',
    pregnancyCategory: 'C',
    isControlled: false,
    requiresPrescription: false,
  },
]

// Search medicines by name or generic name
export function searchMedicines(query: string): Medicine[] {
  const lowerQuery = query.toLowerCase().trim()
  if (!lowerQuery) return []
  
  return medicineDatabase.filter(med =>
    med.name.toLowerCase().includes(lowerQuery) ||
    med.genericName.toLowerCase().includes(lowerQuery)
  )
}

// Get medicines by category
export function getMedicinesByCategory(categoryId: string): Medicine[] {
  return medicineDatabase.filter(med => med.category === categoryId)
}

// Get medicine by ID
export function getMedicineById(id: string): Medicine | undefined {
  return medicineDatabase.find(med => med.id === id)
}

// Get all categories with medicine count
export function getCategoriesWithCount(): Array<MedicineCategory & { count: number }> {
  return medicineCategories.map(cat => ({
    ...cat,
    count: medicineDatabase.filter(med => med.category === cat.id).length,
  }))
}

// Dosage frequency options
export const frequencyOptions = [
  { value: 'OD', label: 'Once daily', labelMarathi: 'दिवसातून एकदा' },
  { value: 'BD', label: 'Twice daily', labelMarathi: 'दिवसातून दोनदा' },
  { value: 'TDS', label: 'Three times daily', labelMarathi: 'दिवसातून तीनदा' },
  { value: 'QID', label: 'Four times daily', labelMarathi: 'दिवसातून चारदा' },
  { value: 'HS', label: 'At bedtime', labelMarathi: 'झोपताना' },
  { value: 'SOS', label: 'As needed', labelMarathi: 'गरजेनुसार' },
  { value: 'AC', label: 'Before meals', labelMarathi: 'जेवणापूर्वी' },
  { value: 'PC', label: 'After meals', labelMarathi: 'जेवणानंतर' },
  { value: 'STAT', label: 'Immediately', labelMarathi: 'लगेच' },
  { value: 'PRN', label: 'When required', labelMarathi: 'आवश्यकतेनुसार' },
]

// Duration options
export const durationOptions = [
  { value: '3', label: '3 days', labelMarathi: '३ दिवस' },
  { value: '5', label: '5 days', labelMarathi: '५ दिवस' },
  { value: '7', label: '7 days (1 week)', labelMarathi: '७ दिवस (१ आठवडा)' },
  { value: '10', label: '10 days', labelMarathi: '१० दिवस' },
  { value: '14', label: '14 days (2 weeks)', labelMarathi: '१४ दिवस (२ आठवडे)' },
  { value: '21', label: '21 days (3 weeks)', labelMarathi: '२१ दिवस (३ आठवडे)' },
  { value: '28', label: '28 days (4 weeks)', labelMarathi: '२८ दिवस (४ आठवडे)' },
  { value: '30', label: '1 month', labelMarathi: '१ महिना' },
  { value: '60', label: '2 months', labelMarathi: '२ महिने' },
  { value: '90', label: '3 months', labelMarathi: '३ महिने' },
  { value: 'continuous', label: 'Continuous', labelMarathi: 'सतत' },
]

// Route of administration options
export const routeOptions = [
  { value: 'ORAL', label: 'Oral', labelMarathi: 'तोंडाने' },
  { value: 'TOPICAL', label: 'Topical', labelMarathi: 'लावणे' },
  { value: 'INHALATION', label: 'Inhalation', labelMarathi: 'श्वास घेणे' },
  { value: 'IV', label: 'Intravenous', labelMarathi: 'शिरेत' },
  { value: 'IM', label: 'Intramuscular', labelMarathi: 'स्नायूमध्ये' },
  { value: 'SC', label: 'Subcutaneous', labelMarathi: 'त्वचेखाली' },
  { value: 'RECTAL', label: 'Rectal', labelMarathi: 'गुदाद्वारे' },
  { value: 'OPHTHALMIC', label: 'Eye drops', labelMarathi: 'डोळ्यात' },
  { value: 'OTIC', label: 'Ear drops', labelMarathi: 'कानात' },
  { value: 'NASAL', label: 'Nasal', labelMarathi: 'नाकात' },
]

export default {
  medicineDatabase,
  medicineCategories,
  searchMedicines,
  getMedicinesByCategory,
  getMedicineById,
  getCategoriesWithCount,
  frequencyOptions,
  durationOptions,
  routeOptions,
}
