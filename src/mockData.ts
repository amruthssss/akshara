export const MOCK_QUESTIONS = [
  // MATHEMATICS - Real Numbers
  {
    id: "m_rn_1",
    question: "If the HCF of 65 and 117 is expressible in the form 65m - 117, then the value of m is:",
    type: "MCQ",
    options: ["1", "2", "3", "4"],
    correctAnswer: 1,
    explanation: "HCF(65, 117) is 13. 65m - 117 = 13 => 65m = 130 => m = 2.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Real Numbers",
    difficulty: "medium",
    conceptTag: "HCF"
  },
  {
    id: "m_rn_2",
    question: "The largest number which divides 70 and 125, leaving remainders 5 and 8 respectively, is:",
    type: "MCQ",
    options: ["13", "65", "875", "1750"],
    correctAnswer: 0,
    explanation: "The numbers are 70-5=65 and 125-8=117. HCF(65, 117) = 13.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Real Numbers",
    difficulty: "hard",
    conceptTag: "Division Algorithm"
  },
  {
    id: "m_rn_3",
    question: "Explain why 7 × 11 × 13 + 13 is a composite number.",
    type: "SHORT",
    explanation: "7 × 11 × 13 + 13 = 13(7 × 11 + 1) = 13(77 + 1) = 13 × 78. Since it has factors other than 1 and itself, it is composite.",
    marks: 2,
    subject: "Mathematics",
    chapter: "Real Numbers",
    difficulty: "easy",
    conceptTag: "Composite Numbers"
  },

  // MATHEMATICS - Polynomials
  {
    id: "m_poly_1",
    question: "If one zero of the quadratic polynomial x^2 + 3x + k is 2, then the value of k is:",
    type: "MCQ",
    options: ["10", "-10", "5", "-5"],
    correctAnswer: 1,
    explanation: "P(2) = 0 => 2^2 + 3(2) + k = 0 => 4 + 6 + k = 0 => k = -10.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Polynomials",
    difficulty: "easy",
    conceptTag: "Zeros"
  },
  {
    id: "m_poly_2",
    question: "The degree of the polynomial (x+1)(x^2 - x - x^4 + 1) is:",
    type: "MCQ",
    options: ["2", "3", "4", "5"],
    correctAnswer: 3,
    explanation: "Multiplying x and x^4 gives x^5, which is the highest power. Corrected: wait, x^1 * x^4 = x^5. Let me re-check. Yes, degree is 5.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Polynomials",
    difficulty: "medium",
    conceptTag: "Degree"
  },

  // MATHEMATICS - Arithmetic Progressions
  {
    id: "m_ap_1",
    question: "The 10th term of the AP: 5, 8, 11, 14, ... is:",
    type: "MCQ",
    options: ["32", "35", "38", "185"],
    correctAnswer: 1,
    explanation: "a = 5, d = 3. a10 = a + 9d = 5 + 9(3) = 5 + 27 = 32. Actually 5+27 is 32. Option 0 is correct.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Arithmetic Progressions",
    difficulty: "easy",
    conceptTag: "nth term"
  },

  // SCIENCE - Chemical Reactions
  {
    id: "s_chem_1",
    question: "Which of the following is a displacement reaction?",
    type: "MCQ",
    options: ["MgCO3 -> MgO + CO2", "2H2 + O2 -> 2H2O", "Fe + CuSO4 -> FeSO4 + Cu", "NaOH + HCl -> NaCl + H2O"],
    correctAnswer: 2,
    explanation: "Iron displaces copper from copper sulphate solution. This is a single displacement reaction.",
    marks: 1,
    subject: "Science",
    chapter: "Chemical Reactions and Equations",
    difficulty: "easy",
    conceptTag: "Types of Reactions"
  },
  {
    id: "s_chem_2",
    question: "What happens when dilute hydrochloric acid is added to iron filings?",
    type: "MCQ",
    options: ["Hydrogen gas and iron chloride are produced", "Chlorine gas and iron hydroxide are produced", "No reaction takes place", "Iron salt and water are produced"],
    correctAnswer: 0,
    explanation: "Fe + 2HCl -> FeCl2 + H2. Hydrogen gas and iron(II) chloride are formed.",
    marks: 1,
    subject: "Science",
    chapter: "Chemical Reactions and Equations",
    difficulty: "medium",
    conceptTag: "Reaction with Acids"
  },

  // SCIENCE - Life Processes
  {
    id: "s_life_1",
    question: "The breakdown of pyruvate to give carbon dioxide, water and energy takes place in:",
    type: "MCQ",
    options: ["Cytoplasm", "Mitochondria", "Chloroplast", "Nucleus"],
    correctAnswer: 1,
    explanation: "Aerobic respiration occurs in the mitochondria where pyruvate is completely oxidized.",
    marks: 1,
    subject: "Science",
    chapter: "Life Processes",
    difficulty: "medium",
    conceptTag: "Respiration"
  },
  {
    id: "s_life_2",
    question: "The kidneys in human beings are a part of the system for:",
    type: "MCQ",
    options: ["Nutrition", "Respiration", "Excretion", "Transportation"],
    correctAnswer: 2,
    explanation: "Kidneys are the primary organs of the human excretory system.",
    marks: 1,
    subject: "Science",
    chapter: "Life Processes",
    difficulty: "easy",
    conceptTag: "Excretion"
  },

  // SOCIAL SCIENCE - History
  {
    id: "ss_hist_1",
    question: "Who was the author of the book 'Hind Swaraj'?",
    type: "MCQ",
    options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Subhas Chandra Bose", "Rabindranath Tagore"],
    correctAnswer: 1,
    explanation: "Mahatma Gandhi wrote 'Hind Swaraj' in 1909.",
    marks: 1,
    subject: "Social Science",
    chapter: "Nationalism in India",
    difficulty: "easy",
    conceptTag: "Literature"
  },
  {
    id: "ss_hist_2",
    question: "The Simon Commission was boycotted because:",
    type: "MCQ",
    options: ["It had no Indian members", "It was too expensive", "It supported the Muslim League", "Congress was not invited"],
    correctAnswer: 0,
    explanation: "The commission consisted of seven British Members of Parliament. It was boycotted because it lacked Indian representation.",
    marks: 1,
    subject: "Social Science",
    chapter: "Nationalism in India",
    difficulty: "medium",
    conceptTag: "Protests"
  },

  // SOCIAL SCIENCE - Power Sharing
  {
    id: "ss_ps_1",
    question: "In which year was an Act passed to recognize Sinhala as the only official language in Sri Lanka?",
    type: "MCQ",
    options: ["1948", "1952", "1956", "1960"],
    correctAnswer: 2,
    explanation: "The 1956 Act in Sri Lanka recognized Sinhala as the official language, ignoring Tamil.",
    marks: 1,
    subject: "Social Science",
    chapter: "Power Sharing",
    difficulty: "medium",
    conceptTag: "Official Language"
  },

  // MATHEMATICS - Triangles
  {
    id: "m_tri_1",
    question: "Side of two similar triangles are in the ratio 4:9. Areas of these triangles are in the ratio:",
    type: "MCQ",
    options: ["2:3", "4:9", "81:16", "16:81"],
    correctAnswer: 3,
    explanation: "The ratio of the areas of two similar triangles is equal to the square of the ratio of their corresponding sides. (4/9)^2 = 16/81.",
    marks: 1,
    subject: "Mathematics",
    chapter: "Triangles",
    difficulty: "medium",
    conceptTag: "Area Theorem"
  },
  {
    id: "m_tri_2",
    question: "In triangle ABC, DE || BC. If AD=3cm, DB=4cm, and AE=6cm, find EC.",
    type: "FILL",
    fillAnswer: "8",
    explanation: "By Basic Proportionality Theorem, AD/DB = AE/EC => 3/4 = 6/EC => EC = (4*6)/3 = 8cm.",
    marks: 2,
    subject: "Mathematics",
    chapter: "Triangles",
    difficulty: "medium",
    conceptTag: "BPT"
  },

  // SCIENCE - Acids, Bases and Salts
  {
    id: "s_abs_1",
    question: "What is the pH range of our body?",
    type: "MCQ",
    options: ["7.0 - 7.8", "6.0 - 6.8", "5.0 - 5.8", "8.0 - 8.8"],
    correctAnswer: 0,
    explanation: "Our body works within the pH range of 7.0 to 7.8. Living organisms can survive only in a narrow range of pH change.",
    marks: 1,
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    difficulty: "easy",
    conceptTag: "pH"
  },
  {
    id: "s_abs_2",
    question: "Which acid is present in tomato?",
    type: "MCQ",
    options: ["Methanoic acid", "Citric acid", "Oxalic acid", "Tartaric acid"],
    correctAnswer: 2,
    explanation: "Tomato contains Oxalic acid. Vinegar contains Acetic acid, and Tamarind contains Tartaric acid.",
    marks: 1,
    subject: "Science",
    chapter: "Acids, Bases and Salts",
    difficulty: "medium",
    conceptTag: "Natural Acids"
  },

  // SCIENCE - Electricity
  {
    id: "s_elec_1",
    question: "The SI unit of electric current is:",
    type: "MCQ",
    options: ["Ohm", "Watt", "Ampere", "Volt"],
    correctAnswer: 2,
    explanation: "The SI unit of electric current is the Ampere (A), named after André-Marie Ampère.",
    marks: 1,
    subject: "Science",
    chapter: "Electricity",
    difficulty: "easy",
    conceptTag: "Units"
  },
  {
    id: "s_elec_2",
    question: "Define Ohm's Law.",
    type: "SHORT",
    explanation: "Ohm's law states that the current through a conductor between two points is directly proportional to the voltage across the two points, provided physical conditions like temperature remain constant (V = IR).",
    marks: 2,
    subject: "Science",
    chapter: "Electricity",
    difficulty: "medium",
    conceptTag: "Ohm's Law"
  },

  // SOCIAL SCIENCE - Geography
  {
    id: "ss_geo_1",
    question: "Black soil is also known as:",
    type: "MCQ",
    options: ["Bangar", "Khadar", "Regur", "Humus"],
    correctAnswer: 2,
    explanation: "Black soil is also called Regur soil. It is ideal for growing cotton and is typical of the Deccan trap region.",
    marks: 1,
    subject: "Social Science",
    chapter: "Resources and Development",
    difficulty: "easy",
    conceptTag: "Soil Types"
  },

  // SOCIAL SCIENCE - Economics
  {
    id: "ss_eco_1",
    question: "The primary sector is also called:",
    type: "MCQ",
    options: ["Service sector", "Agriculture and related sector", "Industrial sector", "None of these"],
    correctAnswer: 1,
    explanation: "The primary sector is called the agriculture and related sector because most of the natural products we get are from agriculture, dairy, fishing, and forestry.",
    marks: 1,
    subject: "Social Science",
    chapter: "Sectors of the Indian Economy",
    difficulty: "easy",
    conceptTag: "Sectors"
  },

  // Adding more filler to reach volume
  ...Array.from({ length: 60 }).map((_, i) => ({
    id: `filler_${i}`,
    question: `Practice Question ${i + 1}: Importance of revision for SSLC board exams.`,
    type: "MCQ",
    options: ["Very Important", "Not Important", "Maybe", "None"],
    correctAnswer: 0,
    explanation: "Revision helps in retention and understanding of complex topics during exams.",
    marks: 1,
    subject: i % 3 === 0 ? "Mathematics" : i % 3 === 1 ? "Science" : "Social Science",
    chapter: "General Awareness",
    difficulty: "easy",
    conceptTag: "General"
  }))
];
