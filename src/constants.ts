export const SYLLABUS: Record<string, any> = {
  Mathematics: [
    "Real Numbers", "Polynomials", "Pair of Linear Equations in Two Variables",
    "Quadratic Equations", "Arithmetic Progressions", "Triangles",
    "Coordinate Geometry", "Introduction to Trigonometry", "Some Applications of Trigonometry",
    "Circles", "Areas Related to Circles", "Surface Areas and Volumes",
    "Statistics", "Probability"
  ],
  Science: [
    "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals",
    "Carbon and its Compounds", "Periodic Classification of Elements", "Life Processes",
    "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution",
    "Light – Reflection and Refraction", "Human Eye and the Colourful World", "Electricity",
    "Magnetic Effects of Electric Current", "Sources of Energy", "Our Environment",
    "Sustainable Management of Natural Resources"
  ],
  "Social Science": {
    HISTORY: ["The Rise of Nationalism in Europe", "Nationalism in India", "The Making of a Global World", "The Age of Industrialisation", "Print Culture and the Modern World"],
    GEOGRAPHY: ["Resources and Development", "Forest and Wildlife Resources", "Water Resources", "Agriculture", "Minerals and Energy Resources", "Manufacturing Industries", "Lifelines of the National Economy", "Population"],
    POLITICAL_SCIENCE: ["Power Sharing", "Federalism", "Democracy and Diversity", "Gender, Religion and Caste", "Popular Struggles and Movements", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"],
    ECONOMICS: ["Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy", "Consumer Rights"]
  }
};

export const CHAPTER_CONTENT: Record<string, any> = {
  "Real Numbers": {
    intro: "Fundamental foundation of school mathematics, covering division and prime factorization.",
    concepts: [
      { title: "Euclid's Division Lemma", detail: "Given positive integers a and b, there exist unique integers q and r satisfying a = bq + r, 0 <= r < b." },
      { title: "Fundamental Theorem of Arithmetic", detail: "Every composite number can be expressed as a product of primes uniquely." },
      { title: "Irrationality", detail: "Proving numbers like sqrt(2), sqrt(3) are irrational using contradiction." }
    ],
    qa: [
      { q: "What is the HCF of two prime numbers?", a: "The HCF of any two prime numbers is always 1." },
      { q: "Define composite number.", a: "A number that has more than two factors." }
    ]
  },
  "Life Processes": {
    intro: "The fundamental processes that maintain life in living organisms.",
    concepts: [
      { title: "Autotrophic Nutrition", detail: "Processing inorganic sources like CO2 and water into food using sunlight." },
      { title: "Human Heart", detail: "Four-chambered muscular organ ensuring separation of oxygenated and deoxygenated blood." },
      { title: "Excretion", detail: "The biological process involved in the removal of harmful metabolic wastes from the body." }
    ],
    qa: [
      { q: "What is the role of saliva in digestion?", a: "It contains salivary amylase that breaks down starch into sugar." },
      { q: "Difference between Artery and Vein?", a: "Arteries carry oxygenated blood away from the heart (thick walls), while veins carry deoxygenated blood to the heart (thin walls)." }
    ]
  },
  "Electricity": {
    intro: "Understanding flow of charge, potential difference, and electrical circuits.",
    concepts: [
      { title: "Ohm's Law", detail: "V = IR. The current through a conductor is proportional to the potential difference." },
      { title: "Resistance", detail: "Property of a conductor to resist the flow of charges. Unit: Ohm." },
      { title: "Joule's Heating Effect", detail: "H = I^2Rt. Heat produced in a resistor." }
    ],
    qa: [
      { q: "Define 1 Ampere.", a: "Flow of one coulomb of charge per second." },
      { q: "Why is tungsten used in bulbs?", a: "High melting point and high resistivity prevent it from burning at high temperatures." }
    ]
  }
};

export const DISTRICTS = [
  "Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban",
  "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga",
  "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri",
  "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur",
  "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara",
  "Vijayapura", "Yadgir"
];

export const PRIORITY_FLAGS = {
  HIGH: ["Quadratic Equations", "Trigonometry", "Statistics", "Circles", "Electricity", "Chemical Reactions", "Heredity", "Nationalism in India", "Resources and Development", "Power Sharing", "Money and Credit"],
  MODERATE: ["Coordinate Geometry", "Arithmetic Progressions", "Carbon Compounds", "Life Processes", "Manufacturing Industries", "Federalism"],
  REVISION: ["Real Numbers", "Polynomials", "Our Environment", "Consumer Rights"]
};
