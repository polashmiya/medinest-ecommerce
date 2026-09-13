import type { GenericInfo } from "@/types";

/**
 * Original, general-purpose reference notes for common active ingredients.
 * This is educational mock content for the storefront UI. It is not medical
 * advice; a production deployment should source monographs from a licensed
 * drug-information provider and have them reviewed by a pharmacist.
 */
type Entry = Omit<GenericInfo, "id" | "name"> & { match: string[] };

const common = {
  missedDose: "If you miss a dose, take it when you remember unless the next dose is almost due. Never take a double dose to make up for a missed one.",
};

export const genericEntries: Record<string, Entry> = {
  paracetamol: {
    match: ["paracetamol", "acetaminophen"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains paracetamol, a widely used pain reliever and fever reducer. It is suitable for headaches, toothache, period pain, muscle aches and the aches and fever that come with colds and flu." },
      { title: "Uses of __NAME__", content: { list: ["Pain relief", "Fever"] } },
      { title: "Side effects of __NAME__", content: { tag: "Uncommon", list: ["Nausea", "Skin rash", "Liver problems with overdose or long-term high doses"] } },
      { title: "How to use __NAME__", content: "Take it with water at the dose on the label or as advised by your doctor. Leave at least 4 hours between doses and do not exceed the maximum daily dose." },
      { title: "How __NAME__ works", content: "It reduces the production of prostaglandins in the brain, chemical messengers that signal pain and raise body temperature." },
      { title: "What if you forget to take __NAME__?", content: common.missedDose },
    ],
    briefDescription: [
      { title: "Indication", content: "Mild to moderate pain and fever." },
      { title: "Administration", content: "May be taken with or without food." },
      { title: "Contraindication", content: "Known hypersensitivity to paracetamol; severe active liver disease." },
      { title: "Precaution", content: "Use with care in liver or kidney impairment, chronic alcohol use and malnutrition. Check other medicines for hidden paracetamol to avoid accidental overdose." },
    ],
    quickTips: [
      "Check the label of cold and flu products — many already contain paracetamol.",
      "Seek urgent help if you take more than the recommended dose, even if you feel well.",
      "Avoid alcohol while taking it regularly.",
    ],
    safetyAdvices: [
      { type: "Alcohol", tag: "UNSAFE", content: "Drinking alcohol with __NAME__ increases the risk of liver damage." },
      { type: "Pregnancy", tag: "SAFE IF PRESCRIBED", content: "Generally considered suitable during pregnancy at the lowest effective dose for the shortest time." },
      { type: "Breastfeeding", tag: "SAFE IF PRESCRIBED", content: "Small amounts pass into breast milk and are not expected to harm the baby." },
      { type: "Driving", tag: "SAFE", content: "__NAME__ does not usually affect your ability to drive." },
      { type: "Liver", tag: "CAUTION", content: "People with liver disease may need a lower dose. Ask your doctor." },
    ],
  },
  esomeprazole: {
    match: ["esomeprazole"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains esomeprazole, a proton pump inhibitor (PPI) that lowers the amount of acid the stomach makes. It is used for heartburn, acid reflux and stomach ulcers." },
      { title: "Uses of __NAME__", content: { list: ["Gastro-oesophageal reflux disease (GERD)", "Peptic ulcer", "Prevention of NSAID-related ulcers", "H. pylori eradication (with antibiotics)"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Headache", "Diarrhoea", "Stomach pain", "Nausea", "Flatulence"] } },
      { title: "How to use __NAME__", content: "Swallow whole, usually once a day before breakfast. Do not crush or chew." },
      { title: "How __NAME__ works", content: "It blocks the proton pump in the stomach lining, the final step in acid production." },
      { title: "What if you forget to take __NAME__?", content: common.missedDose },
    ],
    briefDescription: [
      { title: "Indication", content: "Reflux oesophagitis, symptomatic GERD, gastric and duodenal ulcers, Zollinger–Ellison syndrome." },
      { title: "Administration", content: "Take at least 1 hour before a meal." },
      { title: "Precaution", content: "Long-term use may reduce magnesium and vitamin B12 levels and slightly raise fracture risk. Review the need for continued treatment regularly." },
    ],
    quickTips: ["Take it before food for the best effect.", "Tell your doctor if heartburn persists after 2 weeks.", "Avoid large late-night meals, spicy food and smoking."],
    safetyAdvices: [
      { type: "Alcohol", tag: "CAUTION", content: "Alcohol can worsen acid symptoms." },
      { type: "Pregnancy", tag: "CONSULT", content: "Use only if your doctor considers it necessary." },
      { type: "Driving", tag: "SAFE", content: "Usually does not affect driving; dizziness is uncommon." },
    ],
  },
  omeprazole: {
    match: ["omeprazole"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains omeprazole, a proton pump inhibitor that reduces stomach acid to treat heartburn, reflux and ulcers." },
      { title: "Uses of __NAME__", content: { list: ["Heartburn and acid reflux", "Stomach and duodenal ulcers", "H. pylori eradication (with antibiotics)"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Headache", "Diarrhoea or constipation", "Abdominal pain", "Nausea"] } },
      { title: "How to use __NAME__", content: "Take once daily before a meal, swallowed whole." },
      { title: "How __NAME__ works", content: "It switches off the acid pumps in the stomach lining." },
    ],
    briefDescription: [
      { title: "Indication", content: "GERD, peptic ulcer disease, prevention of NSAID-associated ulcers." },
      { title: "Administration", content: "Best taken before breakfast." },
    ],
    quickTips: ["Take it 30–60 minutes before food.", "Do not stop long-term treatment suddenly without advice."],
    safetyAdvices: [{ type: "Pregnancy", tag: "CONSULT", content: "Ask your doctor before use in pregnancy." }],
  },
  pantoprazole: {
    match: ["pantoprazole"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains pantoprazole, a proton pump inhibitor used to treat acid-related stomach and gullet problems." },
      { title: "Uses of __NAME__", content: { list: ["GERD", "Peptic ulcer", "Prevention of stress ulcers"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Headache", "Diarrhoea", "Nausea"] } },
      { title: "How to use __NAME__", content: "Swallow whole with water before a meal." },
    ],
    briefDescription: [{ title: "Indication", content: "Acid-related disorders of the upper GI tract." }],
    quickTips: ["Take before breakfast.", "Report black stools or persistent vomiting to a doctor."],
    safetyAdvices: [{ type: "Driving", tag: "SAFE", content: "Unlikely to affect driving." }],
  },
  rabeprazole: {
    match: ["rabeprazole"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains rabeprazole, a proton pump inhibitor that lowers stomach acid." },
      { title: "Uses of __NAME__", content: { list: ["GERD", "Duodenal and gastric ulcers"] } },
      { title: "How to use __NAME__", content: "Take once daily, swallowed whole." },
    ],
    briefDescription: [{ title: "Indication", content: "Acid reflux, ulcers and hypersecretory conditions." }],
    quickTips: ["Swallow the tablet whole — it has a protective coating."],
    safetyAdvices: [{ type: "Pregnancy", tag: "CONSULT", content: "Use only if clearly needed." }],
  },
  cholecalciferol: {
    match: ["cholecalciferol", "vitamin d3"],
    overview: [
      { title: "Introduction", content: "__NAME__ provides cholecalciferol (vitamin D3), which helps the body absorb calcium and keep bones and muscles healthy." },
      { title: "Uses of __NAME__", content: { list: ["Vitamin D deficiency", "Bone health support", "Osteoporosis (with calcium)"] } },
      { title: "Side effects of __NAME__", content: { tag: "Rare", list: ["High calcium levels with excessive doses", "Nausea", "Constipation"] } },
      { title: "How to use __NAME__", content: "Take with a meal that contains some fat to improve absorption, exactly as prescribed (daily or weekly)." },
    ],
    briefDescription: [
      { title: "Indication", content: "Prevention and treatment of vitamin D deficiency." },
      { title: "Precaution", content: "Avoid high doses in people with high blood calcium, kidney stones or sarcoidosis." },
    ],
    quickTips: ["High-strength weekly capsules are not meant for daily use.", "Sensible sun exposure also raises vitamin D."],
    safetyAdvices: [{ type: "Kidney", tag: "CAUTION", content: "Use with care in kidney disease; your doctor may monitor calcium." }],
  },
  montelukast: {
    match: ["montelukast"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains montelukast, a leukotriene receptor antagonist used to prevent asthma symptoms and relieve allergic rhinitis." },
      { title: "Uses of __NAME__", content: { list: ["Asthma prevention", "Allergic rhinitis", "Exercise-induced bronchoconstriction"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Headache", "Abdominal pain", "Sleep disturbance", "Mood changes (rare)"] } },
      { title: "How to use __NAME__", content: "Take once daily in the evening. It does not relieve a sudden asthma attack." },
      { title: "How __NAME__ works", content: "It blocks leukotrienes, substances that tighten and inflame the airways." },
    ],
    briefDescription: [{ title: "Indication", content: "Prophylaxis and chronic treatment of asthma; seasonal and perennial allergic rhinitis." }],
    quickTips: ["Keep your reliever inhaler for sudden symptoms.", "Report unusual mood or behaviour changes promptly."],
    safetyAdvices: [
      { type: "Driving", tag: "SAFE", content: "Unlikely to affect driving, but dizziness has been reported." },
      { type: "Pregnancy", tag: "CONSULT", content: "Use if your doctor considers the benefit outweighs the risk." },
    ],
  },
  rosuvastatin: {
    match: ["rosuvastatin"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains rosuvastatin, a statin that lowers LDL (“bad”) cholesterol and reduces the risk of heart attack and stroke." },
      { title: "Uses of __NAME__", content: { list: ["High cholesterol", "Prevention of cardiovascular disease"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Muscle aches", "Headache", "Constipation", "Nausea"] } },
      { title: "How to use __NAME__", content: "Take once a day at the same time, with or without food." },
    ],
    briefDescription: [
      { title: "Indication", content: "Primary hypercholesterolaemia and mixed dyslipidaemia; cardiovascular risk reduction." },
      { title: "Contraindication", content: "Active liver disease, pregnancy and breastfeeding." },
    ],
    quickTips: ["Report unexplained muscle pain or weakness.", "Keep up a healthy diet and exercise."],
    safetyAdvices: [
      { type: "Pregnancy", tag: "UNSAFE", content: "Statins should not be used during pregnancy." },
      { type: "Alcohol", tag: "CAUTION", content: "Heavy drinking increases the risk of liver problems." },
    ],
  },
  atorvastatin: {
    match: ["atorvastatin"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains atorvastatin, a statin used to lower cholesterol and protect the heart." },
      { title: "Uses of __NAME__", content: { list: ["High cholesterol", "Heart attack and stroke prevention"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Muscle pain", "Diarrhoea", "Joint pain"] } },
    ],
    briefDescription: [{ title: "Contraindication", content: "Active liver disease, pregnancy, breastfeeding." }],
    quickTips: ["Avoid large amounts of grapefruit juice."],
    safetyAdvices: [{ type: "Pregnancy", tag: "UNSAFE", content: "Do not use during pregnancy." }],
  },
  clopidogrel: {
    match: ["clopidogrel"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains clopidogrel, an antiplatelet medicine that helps prevent harmful blood clots." },
      { title: "Uses of __NAME__", content: { list: ["Prevention of heart attack and stroke", "After coronary stent placement"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Easy bruising", "Bleeding", "Indigestion"] } },
    ],
    briefDescription: [{ title: "Precaution", content: "Tell your dentist or surgeon you take it before any procedure." }],
    quickTips: ["Do not stop without speaking to your cardiologist."],
    safetyAdvices: [{ type: "Alcohol", tag: "CAUTION", content: "Alcohol may increase the risk of stomach bleeding." }],
  },
  aspirin: {
    match: ["aspirin"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains low-dose aspirin, which reduces the stickiness of platelets to prevent clots." },
      { title: "Uses of __NAME__", content: { list: ["Secondary prevention of heart attack and stroke"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Indigestion", "Bruising", "Stomach bleeding (uncommon)"] } },
    ],
    briefDescription: [{ title: "Contraindication", content: "Children under 16, active peptic ulcer, bleeding disorders." }],
    quickTips: ["Take with or after food."],
    safetyAdvices: [{ type: "Alcohol", tag: "CAUTION", content: "Alcohol raises the risk of stomach irritation and bleeding." }],
  },
  losartan: {
    match: ["losartan"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains losartan, an angiotensin II receptor blocker (ARB) used to treat high blood pressure and protect the kidneys in diabetes." },
      { title: "Uses of __NAME__", content: { list: ["High blood pressure", "Heart failure", "Diabetic kidney disease"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Dizziness", "Tiredness", "High potassium"] } },
    ],
    briefDescription: [{ title: "Contraindication", content: "Pregnancy." }],
    quickTips: ["Stand up slowly to avoid dizziness.", "Monitor your blood pressure regularly."],
    safetyAdvices: [{ type: "Pregnancy", tag: "UNSAFE", content: "ARBs can harm the unborn baby; do not use in pregnancy." }],
  },
  telmisartan: {
    match: ["telmisartan"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains telmisartan, an ARB that relaxes blood vessels to lower blood pressure." },
      { title: "Uses of __NAME__", content: { list: ["High blood pressure", "Cardiovascular risk reduction"] } },
    ],
    briefDescription: [{ title: "Contraindication", content: "Pregnancy, severe liver impairment." }],
    quickTips: ["Take at the same time every day."],
    safetyAdvices: [{ type: "Pregnancy", tag: "UNSAFE", content: "Not for use in pregnancy." }],
  },
  olmesartan: {
    match: ["olmesartan medoxomil", "olmesartan"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains olmesartan, an ARB used for long-term control of high blood pressure." },
      { title: "Uses of __NAME__", content: { list: ["High blood pressure"] } },
    ],
    briefDescription: [{ title: "Contraindication", content: "Pregnancy." }],
    quickTips: ["Report persistent diarrhoea to your doctor."],
    safetyAdvices: [{ type: "Pregnancy", tag: "UNSAFE", content: "Not for use in pregnancy." }],
  },
  bisoprolol: {
    match: ["bisoprolol"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains bisoprolol, a beta-blocker that slows the heart rate and lowers blood pressure." },
      { title: "Uses of __NAME__", content: { list: ["High blood pressure", "Angina", "Heart failure"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Tiredness", "Cold hands and feet", "Dizziness"] } },
    ],
    briefDescription: [{ title: "Precaution", content: "Do not stop suddenly; the dose should be tapered by a doctor." }],
    quickTips: ["Check your pulse if you feel faint."],
    safetyAdvices: [{ type: "Driving", tag: "CAUTION", content: "May cause dizziness, especially when starting treatment." }],
  },
  amlodipine: {
    match: ["amlodipine"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains amlodipine, a calcium-channel blocker that widens blood vessels." },
      { title: "Uses of __NAME__", content: { list: ["High blood pressure", "Angina"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Ankle swelling", "Flushing", "Headache"] } },
    ],
    briefDescription: [{ title: "Administration", content: "Once daily, with or without food." }],
    quickTips: ["Ankle swelling is common; tell your doctor if it is troublesome."],
    safetyAdvices: [{ type: "Alcohol", tag: "CAUTION", content: "Alcohol can add to the blood-pressure-lowering effect." }],
  },
  metformin: {
    match: ["metformin hydrochloride", "metformin"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains metformin, a first-line medicine for type 2 diabetes that helps the body use insulin better." },
      { title: "Uses of __NAME__", content: { list: ["Type 2 diabetes", "Polycystic ovary syndrome (off-label)"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Nausea", "Diarrhoea", "Metallic taste", "Low vitamin B12 with long-term use"] } },
      { title: "How to use __NAME__", content: "Take with or after meals to reduce stomach upset." },
    ],
    briefDescription: [{ title: "Precaution", content: "Your doctor will check kidney function before and during treatment." }],
    quickTips: ["Take with food.", "Pause before contrast X-ray scans if your doctor advises."],
    safetyAdvices: [
      { type: "Alcohol", tag: "UNSAFE", content: "Heavy drinking with __NAME__ increases the risk of lactic acidosis." },
      { type: "Kidney", tag: "CAUTION", content: "Dose adjustment or avoidance may be needed in kidney disease." },
    ],
  },
  gliclazide: {
    match: ["gliclazide"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains gliclazide, a sulfonylurea that helps the pancreas release more insulin." },
      { title: "Uses of __NAME__", content: { list: ["Type 2 diabetes"] } },
      { title: "Side effects of __NAME__", content: { tag: "Common", list: ["Low blood sugar", "Weight gain", "Indigestion"] } },
    ],
    briefDescription: [{ title: "Precaution", content: "Do not skip meals while taking it." }],
    quickTips: ["Carry glucose or sweets for low-sugar episodes."],
    safetyAdvices: [{ type: "Driving", tag: "CAUTION", content: "Low blood sugar can affect driving; check your glucose first." }],
  },
  domperidone: {
    match: ["domperidone"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains domperidone, which relieves nausea and vomiting and helps the stomach empty." },
      { title: "Uses of __NAME__", content: { list: ["Nausea and vomiting", "Bloating and fullness"] } },
    ],
    briefDescription: [{ title: "Administration", content: "Take 15–30 minutes before meals, for the shortest time possible." }],
    quickTips: ["Do not use for longer than a week without medical advice."],
    safetyAdvices: [{ type: "Heart", tag: "CAUTION", content: "Not suitable for people with certain heart rhythm problems." }],
  },
  ketotifen: {
    match: ["ketotifen"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains ketotifen, an antihistamine and mast-cell stabiliser used for allergies." },
      { title: "Uses of __NAME__", content: { list: ["Allergic rhinitis", "Allergic skin conditions", "Asthma prevention (adjunct)"] } },
    ],
    briefDescription: [{ title: "Precaution", content: "May cause drowsiness." }],
    quickTips: ["Effects build up over several weeks."],
    safetyAdvices: [{ type: "Driving", tag: "CAUTION", content: "Can cause drowsiness; avoid driving if affected." }],
  },
  levothyroxine: {
    match: ["levothyroxine sodium", "levothyroxine"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains levothyroxine, a replacement for the thyroid hormone thyroxine." },
      { title: "Uses of __NAME__", content: { list: ["Hypothyroidism"] } },
    ],
    briefDescription: [{ title: "Administration", content: "Take on an empty stomach, 30–60 minutes before breakfast." }],
    quickTips: ["Separate from calcium or iron supplements by 4 hours."],
    safetyAdvices: [{ type: "Pregnancy", tag: "SAFE IF PRESCRIBED", content: "Treatment usually continues in pregnancy, often at a higher dose." }],
  },
  metronidazole: {
    match: ["metronidazole"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains metronidazole, an antibiotic and antiprotozoal medicine." },
      { title: "Uses of __NAME__", content: { list: ["Amoebiasis and giardiasis", "Dental and anaerobic infections", "Bacterial vaginosis"] } },
    ],
    briefDescription: [{ title: "Precaution", content: "Complete the full course." }],
    quickTips: ["Avoid alcohol during and for 48 hours after the course."],
    safetyAdvices: [{ type: "Alcohol", tag: "UNSAFE", content: "Alcohol with __NAME__ can cause severe nausea, flushing and palpitations." }],
  },
  salbutamol: {
    match: ["salbutamol"],
    overview: [
      { title: "Introduction", content: "__NAME__ contains salbutamol, a fast-acting bronchodilator that opens the airways." },
      { title: "Uses of __NAME__", content: { list: ["Relief of asthma symptoms", "COPD"] } },
    ],
    briefDescription: [{ title: "Side Effect", content: "Tremor, palpitations, headache." }],
    quickTips: ["See a doctor if you need your reliever more than usual."],
    safetyAdvices: [{ type: "Pregnancy", tag: "SAFE IF PRESCRIBED", content: "Controlling asthma in pregnancy is important; use as prescribed." }],
  },
  "folic acid": {
    match: ["folic acid"],
    overview: [
      { title: "Introduction", content: "__NAME__ provides folic acid (vitamin B9), needed to make healthy red blood cells." },
      { title: "Uses of __NAME__", content: { list: ["Folate deficiency anaemia", "Pregnancy planning and early pregnancy"] } },
    ],
    briefDescription: [{ title: "Administration", content: "Once daily, with or without food." }],
    quickTips: ["Start before conception if planning a pregnancy."],
    safetyAdvices: [{ type: "Pregnancy", tag: "SAFE", content: "Recommended before and during early pregnancy." }],
  },
};

/** Resolve reference notes for a generic name (single-ingredient matches only). */
export function findGenericEntry(genericName: string): Entry | null {
  const g = genericName.toLowerCase().trim();
  if (!g || g.includes("+")) return null;
  for (const entry of Object.values(genericEntries)) {
    if (entry.match.some((m) => g === m || g.startsWith(`${m} `) || g.startsWith(`${m}(`))) return entry;
  }
  return null;
}
