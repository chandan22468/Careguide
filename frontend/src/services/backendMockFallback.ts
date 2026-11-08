import { Product, MyCareProduct } from "../types/product.ts";
import { Routine, RoutineSummary } from "../types/routine.ts";
import { ProgressEntry } from "../types/progress.ts";
import { ChatMessage } from "../types/ai.ts";
import { Order } from "../types/order.ts";
import { SupportTicket, FAQItem } from "../types/support.ts";
import { DashboardData, DashboardAnalytics } from "../types/dashboard.ts";
import { CareSession } from "../types/session.ts";

// Representative Man Matters catalog products with actual images from i.mscwlns.co CDN
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-hair-kit-1",
    name: "Stage 1 Anti-Hairfall Kit",
    slug: "stage-1-anti-hairfall-kit",
    category: "Hair",
    description: "A comprehensive dual-action kit formulated to tackle early hair fall, strengthen hair roots, and nourish the scalp naturally with DHT blockers.",
    shortDescription: "Tackle early stage hair fall with clinically tested DHT blockers.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800",
    additionalImages: [
      "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800",
      "https://i.mscwlns.co/media/misc/pdp_rcl/1596/DHT%20Blocking_k8fy7r.png?tr=w-800",
      "https://i.mscwlns.co/media/misc/pdp_rcl/1605/HG%2030_3y819c.jpg?tr=w-800"
    ],
    price: 999,
    originalPrice: 1299,
    rating: 4.8,
    ratingCount: 1420,
    ingredients: ["Saw Palmetto", "Redensyl 3%", "Procapil 3%", "Biotin", "Rosemary Oil"],
    benefits: [
      "Inhibits DHT accumulation around follicles",
      "Improves blood micro-circulation in scalp",
      "Reinforces keratin structure for thicker strands",
      "Sulfate & paraben free formulation"
    ],
    usageInstructions: "Apply 1ml of tonic once daily directly to the thinning scalp areas. Massage gently for 2-3 minutes. Do not rinse off immediately.",
    precautions: [
      "For external scalp use only",
      "Perform a 24-hour patch test before full application",
      "Avoid contact with eyes and broken skin"
    ],
    faqs: [
      {
        question: "When can I expect visible results?",
        answer: "Consistent daily application typically demonstrates reduced hair shedding within 4 to 8 weeks, with visible root density improvements by 3 to 4 months."
      },
      {
        question: "Can I use it with hair oil?",
        answer: "Yes, but ensure hair tonic is applied first on a clean, dry scalp so it absorbs effectively into the follicles."
      }
    ],
    isActive: true,
    inStock: true,
    tag: "Bestseller"
  },
  {
    id: "prod-dandruff-shampoo",
    name: "Advance Daily Use Anti-Dandruff Shampoo",
    slug: "anti-dandruff-shampoo",
    category: "Hair",
    description: "Formulated with 1% Ketoconazole and Tea Tree oil to eliminate stubborn dandruff flakes without drying out your scalp or hair shafts.",
    shortDescription: "1% Ketoconazole formula to combat flakes and soothing itchy scalp.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2025050/ADUS_3n9h9m.png?tr=w-800",
    additionalImages: [
      "https://i.mscwlns.co/media/misc/pdp_rcl/2025050/ADUS_3n9h9m.png?tr=w-800",
      "https://i.mscwlns.co/mosaic-wellness/image/upload/v1614580439/Man%20Matters/Keto%20shampoo%20rx%20new/Product%20images/KetoPower-Shampoo_1600X1200.jpg?tr=w-800"
    ],
    price: 499,
    originalPrice: 599,
    rating: 4.7,
    ratingCount: 890,
    ingredients: ["Ketoconazole 1%", "Tea Tree Oil", "Aloe Vera Extract", "Salicylic Acid"],
    benefits: [
      "Targets dandruff-causing fungal microbes",
      "Gentle enough for everyday or 3x weekly wash",
      "Calms itchiness and redness on the scalp",
      "Maintains natural moisture barrier"
    ],
    usageInstructions: "Wet hair thoroughly. Apply a nickel-sized amount onto the scalp, lather well and leave on for 2-3 minutes before thoroughly rinsing with lukewarm water.",
    precautions: [
      "Keep away from eyes",
      "Discontinue if severe burning sensation occurs"
    ],
    isActive: true,
    inStock: true,
    tag: "Clinical Care"
  },
  {
    id: "prod-hair-gummies",
    name: "Biotin Hair Gummies (Strawberry 30 Pack)",
    slug: "biotin-hair-gummies",
    category: "Hair",
    description: "Tasty strawberry-flavored nutritional gummies packed with high-potency Biotin, Zinc, and essential Multivitamins to support inner hair nourishment.",
    shortDescription: "High-potency Biotin & Zinc strawberry gummies for inner hair strength.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/1605/HG%2030_3y819c.jpg?tr=w-800",
    additionalImages: [
      "https://i.mscwlns.co/media/misc/pdp_rcl/1605/HG%2030_3y819c.jpg?tr=w-800"
    ],
    price: 649,
    originalPrice: 799,
    rating: 4.9,
    ratingCount: 2310,
    ingredients: ["Biotin (5000 mcg)", "Zinc", "Vitamin A", "Vitamin C", "Vitamin E", "Folic Acid"],
    benefits: [
      "Supports keratin production and strand elasticity",
      "Helps prevent vitamin-deficiency related shedding",
      "100% vegetarian, gelatin-free and no added sugar",
      "Delicious strawberry flavor"
    ],
    usageInstructions: "Chew 1 gummy daily post breakfast or your main meal. Do not exceed the recommended daily allowance.",
    precautions: [
      "Dietary supplement; not a substitute for a varied diet",
      "Consult a healthcare professional if on other prescription medication"
    ],
    isActive: true,
    inStock: true,
    tag: "Customer Favorite"
  },
  {
    id: "prod-hair-serum",
    name: "Advanced Hair Regrowth Serum (3% Redensyl + 2% Anagain)",
    slug: "advanced-hair-serum",
    category: "Hair",
    description: "Lightweight, non-greasy leave-on follicle activating serum engineered with 3% Redensyl, 2% Anagain, and 3% Procapil to stimulate dormant hair roots.",
    shortDescription: "Stimulate dormant hair roots with 3% Redensyl and 2% Anagain.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2023126/Slide-1_8gq70p.jpg?tr=w-800",
    additionalImages: [
      "https://i.mscwlns.co/media/misc/pdp_rcl/2023126/Slide-1_8gq70p.jpg?tr=w-800"
    ],
    price: 899,
    originalPrice: 1199,
    rating: 4.8,
    ratingCount: 1650,
    ingredients: ["Redensyl 3%", "Anagain 2%", "Procapil 3%", "Biotinoyl Tripeptide-1"],
    benefits: [
      "Reactivates stem cells in hair follicles",
      "Non-sticky water-based absorption",
      "Extends the hair growth (Anagen) phase"
    ],
    usageInstructions: "Apply a few drops directly onto thinning areas of the clean scalp before sleep. Gently press with fingertips.",
    precautions: ["External scalp use only"],
    isActive: true,
    inStock: true,
    tag: "Patent Active"
  },
  {
    id: "prod-derma-roller",
    name: "Derma Roller for Scalp & Beard (0.5mm)",
    slug: "derma-roller-hair-growth",
    category: "Hair",
    description: "Precision medical-grade 540 titanium micro-needles (0.5mm) designed to trigger collagen synthesis and enhance topical serum absorption into hair roots.",
    shortDescription: "0.5mm micro-needles to stimulate collagen and topical absorption.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/591102/Old%20Derma%20roller_6ehuji.png?tr=w-800",
    price: 499,
    originalPrice: 699,
    rating: 4.7,
    ratingCount: 920,
    ingredients: ["540 Grade Surgical Titanium Alloy Needles (0.5mm)"],
    benefits: [
      "Boosts transdermal absorption of serums by up to 5x",
      "Stimulates natural blood flow to dormant hair roots",
      "Ergonomic non-slip grip with protective sanitizer case"
    ],
    usageInstructions: "Sanitize roller in alcohol. Gently roll vertically, horizontally, and diagonally 4-5 times over scalp or beard patches once or twice a week. Apply serum afterwards.",
    precautions: ["Do not use on acne, cuts, or active scalp infections", "For individual personal use only"],
    isActive: true,
    inStock: true
  },
  {
    id: "prod-beard-serum",
    name: "Beardmax 5% Minoxidil Beard Growth Serum",
    slug: "beardmax-growth-serum",
    category: "Beard",
    description: "Formulated to fill in patchy beards, boost follicle blood flow, and stimulate denser, healthier facial hair growth.",
    shortDescription: "Target patchy areas and stimulate thicker facial hair follicles.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2024153/Creative-1_amiz7p.jpg?tr=w-800",
    additionalImages: [
      "https://i.mscwlns.co/media/misc/pdp_rcl/2024153/Creative-1_amiz7p.jpg?tr=w-800"
    ],
    price: 749,
    originalPrice: 899,
    rating: 4.6,
    ratingCount: 740,
    ingredients: ["Beard Growth Actives", "Argan Oil", "Cedarwood Oil", "Vitamin E"],
    benefits: [
      "Nourishes patchy beard zones",
      "Softens stiff beard whiskers",
      "Absorbs cleanly without heavy oiliness"
    ],
    usageInstructions: "Apply 4-5 drops onto clean, dry facial skin where you desire thicker growth. Massage evenly in circular motions.",
    precautions: ["Avoid contact with eyes", "Keep away from children"],
    isActive: true,
    inStock: true,
    tag: "Top Rated"
  },
  {
    id: "prod-beard-kit",
    name: "Beard Growth Kit with Derma Roller & Serum",
    slug: "beard-growth-kit",
    category: "Beard",
    description: "The complete 2-step facial grooming regime featuring the 0.5mm Activator Derma Roller paired with Beardmax growth serum for dense, uniform coverage.",
    shortDescription: "Complete kit with 0.5mm roller and Beardmax serum for patchy beards.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2024374/BGK_kpcriu.jpg?tr=w-800",
    price: 999,
    originalPrice: 1499,
    rating: 4.8,
    ratingCount: 1120,
    ingredients: ["Beardmax Serum 30ml", "0.5mm Titanium Derma Roller", "Sanitizer Cap"],
    benefits: [
      "Comprehensive duo to awaken dormant facial hair follicles",
      "Noticeable density boost across cheekline and chin",
      "Easy 5-minute routine twice weekly"
    ],
    usageInstructions: "Roll the sanitized derma roller across patchy zones, then apply 1ml of Beardmax serum. Massage until fully absorbed.",
    precautions: ["Do not press too hard when rolling", "Sanitize roller before and after every use"],
    isActive: true,
    inStock: true,
    tag: "Complete Kit"
  },
  {
    id: "prod-skin-niacinamide",
    name: "Niacinamide 10% Clarifying Face Serum",
    slug: "niacinamide-face-serum-men",
    category: "Skin",
    description: "Ultra-effective oil-balancing serum infused with 10% Niacinamide and 1% Zinc PCA to reduce acne spots, tighten visible pores, and calm razor burn.",
    shortDescription: "10% Niacinamide & Zinc PCA to control oiliness and soothe post-shave skin.",
    imageUrl: "https://i.mscwlns.co/mosaic-wellness/image/upload/v1604745972/Man%20Matters/Card%20image%20change/Skin/Face%20serum/Anti_Acne_Face_Wash_1600X1200_2.jpg?tr=w-800",
    price: 549,
    originalPrice: 699,
    rating: 4.8,
    ratingCount: 1100,
    ingredients: ["Niacinamide 10%", "Zinc PCA 1%", "Aloe Vera Extract", "Hyaluronic Acid"],
    benefits: [
      "Balances sebum without stripping skin barrier",
      "Fades dark post-acne blemishes and spots",
      "Soothes post-shave razor irritation and redness"
    ],
    usageInstructions: "Apply 2-3 drops evenly over cleansed face and neck morning and evening. Follow with sunscreen in daytime.",
    precautions: ["Store in a cool dry place away from sunlight"],
    isActive: true,
    inStock: true
  },
  {
    id: "prod-hygiene-swash",
    name: "SWASH Intimate Hygiene Wash for Men",
    slug: "swash-intimate-wash",
    category: "Other",
    description: "Dermatologically formulated pH 5.5 intimate cleanser infused with Tea Tree Oil and Aloe Vera to fight odor-causing bacteria and itchiness.",
    shortDescription: "pH-balanced daily intimate cleanser with Tea Tree and Aloe Vera.",
    imageUrl: "https://i.mscwlns.co/mosaic-wellness/image/upload/v1604745725/Man%20Matters/Card%20image%20change/Hygiene/Swash/Hygiene-Matters---SWASH---Intimate-Wash_1600X1200.jpg?tr=w-800",
    price: 349,
    originalPrice: 449,
    rating: 4.9,
    ratingCount: 1530,
    ingredients: ["Tea Tree Oil", "Aloe Vera Gel", "Sea Buckthorn Oil", "Lactic Acid"],
    benefits: [
      "Maintains optimal natural pH 5.5 balance",
      "Prevents chafing, sweat odor, and fungal itch",
      "Soap-free and paraben-free formula"
    ],
    usageInstructions: "Gently apply on wet intimate area during shower. Work into mild lather and rinse thoroughly with water.",
    precautions: ["For external use only"],
    isActive: true,
    inStock: true
  },
  {
    id: "prod-wellness-ashwagandha",
    name: "Pure Himalayan Ashwagandha Capsules (KSM-66)",
    slug: "pure-ashwagandha-capsules",
    category: "Wellness",
    description: "Standardized KSM-66 Ashwagandha extract to lower cortisol stress markers, boost energy, and enhance deep sleep quality.",
    shortDescription: "Clinically proven KSM-66 extract to manage daily stress and vitality.",
    imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2025025/125_b8btap.jpg?tr=w-800",
    price: 599,
    originalPrice: 749,
    rating: 4.9,
    ratingCount: 1850,
    ingredients: ["KSM-66 Ashwagandha 600mg", "BioPerine Black Pepper Extract"],
    benefits: [
      "Lowers elevated stress hormone cortisol",
      "Supports natural vitality and athletic endurance",
      "Promotes restful REM sleep cycles"
    ],
    usageInstructions: "Take 1 capsule twice daily with milk or water after meals.",
    precautions: ["If pregnant, lactating or under medical supervision, consult a doctor."],
    isActive: true,
    inStock: true
  }
];

export const INITIAL_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    category: "General",
    question: "What is CareGuide and how does it help me?",
    answer: "CareGuide is Man Matters' comprehensive personal care companion. It brings your product catalogue, usage directions, routine reminders, progress photo journal, and an intelligent AI assistant together into one simple interface."
  },
  {
    id: "faq-2",
    category: "Products",
    question: "Are all Man Matters products clinically tested?",
    answer: "Yes, our formulations undergo dermatologist-supervised trials and are certified paraben-free, cruelty-free, and crafted with scientifically backed concentrations."
  },
  {
    id: "faq-3",
    category: "Routines",
    question: "How should I structure my morning vs evening routine?",
    answer: "Morning routines generally focus on protection (gentle cleansing, antioxidant serums, hydrating gels, and sunscreen), while nighttime routines focus on active nourishment and follicle stimulation (like Hair Tonic or Beardmax Serums) while your body rests."
  },
  {
    id: "faq-4",
    category: "Orders",
    question: "How can I track my sample order in this demo?",
    answer: "Navigate to the Orders tab and enter any sample order ID (e.g. MM-84920 or MM-91042) to view the live timeline, tracking code, and itemized breakdown."
  },
  {
    id: "faq-5",
    category: "Ingredients",
    question: "What makes Redensyl and Procapil effective for hair?",
    answer: "Redensyl targets hair follicle stem cells to awaken the growth cycle, while Procapil strengthens the follicle anchor by boosting microcirculation and fighting follicle aging."
  }
];

export const DEMO_ORDERS: Order[] = [
  {
    id: "ord-1",
    orderNumber: "MM-84920",
    orderDate: "2026-11-04",
    status: "Shipped",
    items: [
      {
        id: "item-1",
        productId: "prod-hair-kit-1",
        productName: "Stage 1 Anti-Hairfall Kit",
        quantity: 1,
        price: 999,
        imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2025137/Combo-Kit_umbirx.png?tr=w-800"
      },
      {
        id: "item-2",
        productId: "prod-hair-gummies",
        productName: "Biotin Hair Gummies (Strawberry 30 Pack)",
        quantity: 1,
        price: 649,
        imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/1605/HG%2030_3y819c.jpg?tr=w-800"
      }
    ],
    totalAmount: 1648,
    shippingAddress: "Flat 402, Green Valley Apts, Indiranagar, Bengaluru, 560038",
    estimatedDelivery: "2026-11-09",
    trackingNumber: "DELHIVERY-774921948",
    isDemo: true
  },
  {
    id: "ord-2",
    orderNumber: "MM-91042",
    orderDate: "2026-10-22",
    status: "Delivered",
    items: [
      {
        id: "item-3",
        productId: "prod-dandruff-shampoo",
        productName: "Advance Daily Use Anti-Dandruff Shampoo",
        quantity: 2,
        price: 499,
        imageUrl: "https://i.mscwlns.co/media/misc/pdp_rcl/2025050/ADUS_3n9h9m.png?tr=w-800"
      }
    ],
    totalAmount: 998,
    shippingAddress: "Plot 18, Sector 14, Gurugram, Haryana, 122001",
    estimatedDelivery: "2026-10-25",
    trackingNumber: "BLUEDART-88203192",
    isDemo: true
  }
];

// Helper to get or set storage items
export const mockStorage = {
  getProducts(): Product[] {
    const data = localStorage.getItem("careguide_mock_products_v2");
    if (!data) {
      localStorage.setItem("careguide_mock_products_v2", JSON.stringify(INITIAL_PRODUCTS));
      return INITIAL_PRODUCTS;
    }
    try {
      const parsed = JSON.parse(data);
      // If older cached products without real CDN exist, refresh with actual CDN
      if (!parsed[0]?.imageUrl?.includes("mscwlns.co")) {
        localStorage.setItem("careguide_mock_products_v2", JSON.stringify(INITIAL_PRODUCTS));
        return INITIAL_PRODUCTS;
      }
      return parsed;
    } catch {
      return INITIAL_PRODUCTS;
    }
  },

  getMyCare(sessionId: string): MyCareProduct[] {
    const data = localStorage.getItem(`careguide_mock_mycare_${sessionId}_v2`);
    if (!data) {
      // Seed initial active items with actual CDN products
      const initial: MyCareProduct[] = [
        {
          id: "mycare-1",
          sessionId,
          productId: "prod-hair-kit-1",
          product: INITIAL_PRODUCTS[0],
          status: "active",
          startDate: "2026-10-15",
          personalNotes: "Applying 1ml nightly on crown and temple hairline.",
          dosageSchedule: "Nightly before sleep"
        },
        {
          id: "mycare-2",
          sessionId,
          productId: "prod-hair-gummies",
          product: INITIAL_PRODUCTS[2],
          status: "active",
          startDate: "2026-10-15",
          personalNotes: "Chewing 1 gummy after breakfast.",
          dosageSchedule: "Every morning with breakfast"
        }
      ];
      localStorage.setItem(`careguide_mock_mycare_${sessionId}_v2`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveMyCare(sessionId: string, items: MyCareProduct[]) {
    localStorage.setItem(`careguide_mock_mycare_${sessionId}_v2`, JSON.stringify(items));
  },

  getRoutines(sessionId: string): Routine[] {
    const data = localStorage.getItem(`careguide_mock_routines_${sessionId}`);
    const todayStr = new Date().toISOString().split("T")[0];
    if (!data) {
      const initial: Routine[] = [
        {
          id: "rt-1",
          sessionId,
          productId: "prod-hair-gummies",
          productName: "Biotin Hair Gummies",
          activityName: "Chew Morning Hair Biotin Gummy",
          category: "Hair",
          timeOfDay: "Morning",
          instructions: "1 gummy post breakfast with a glass of water.",
          scheduledDate: todayStr,
          status: "completed",
          completedAt: new Date(Date.now() - 3600000 * 4).toISOString()
        },
        {
          id: "rt-2",
          sessionId,
          productId: "prod-skin-hydra-gel",
          productName: "Hydra-Boost Oil-Free Skin Gel",
          activityName: "Apply Hydra-Boost Facial Gel",
          category: "Skin",
          timeOfDay: "Morning",
          instructions: "Gently spread on cleansed face and neck.",
          scheduledDate: todayStr,
          status: "completed",
          completedAt: new Date(Date.now() - 3600000 * 3).toISOString()
        },
        {
          id: "rt-3",
          sessionId,
          productId: "prod-hair-kit-1",
          productName: "Stage 1 Anti-Hairfall Tonic",
          activityName: "Apply 1ml Follicle Tonic",
          category: "Hair",
          timeOfDay: "Night",
          instructions: "Apply 1ml directly on crown and temples. Massage 2 mins.",
          scheduledDate: todayStr,
          status: "pending"
        }
      ];
      localStorage.setItem(`careguide_mock_routines_${sessionId}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveRoutines(sessionId: string, routines: Routine[]) {
    localStorage.setItem(`careguide_mock_routines_${sessionId}`, JSON.stringify(routines));
  },

  getProgress(sessionId: string): ProgressEntry[] {
    const data = localStorage.getItem(`careguide_mock_progress_${sessionId}`);
    if (!data) {
      const initial: ProgressEntry[] = [
        {
          id: "prog-1",
          sessionId,
          careType: "Hair",
          entryDate: "2026-10-20",
          condition: "Noticed heavy shedding during shower",
          observations: "Shedding around 60-80 hairs post wash. Scalp feels somewhat dry and flaky.",
          photoUrls: ["https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80"],
          metrics: { scale: 5, ratingLabel: "Moderate concern" },
          notes: "Started Stage 1 Anti-Hairfall Kit and Daily Shampoo today."
        },
        {
          id: "prog-2",
          sessionId,
          careType: "Hair",
          entryDate: "2026-11-01",
          condition: "Hair wash shedding visibly decreased",
          observations: "Less hair caught in drain. Scalp itchiness has completely stopped since using the shampoo 3x a week.",
          photoUrls: ["https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80"],
          metrics: { scale: 8, ratingLabel: "Noticeable improvement" },
          notes: "Consistent routine maintained for 2 weeks."
        }
      ];
      localStorage.setItem(`careguide_mock_progress_${sessionId}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveProgress(sessionId: string, items: ProgressEntry[]) {
    localStorage.setItem(`careguide_mock_progress_${sessionId}`, JSON.stringify(items));
  },

  getChatHistory(sessionId: string): ChatMessage[] {
    const data = localStorage.getItem(`careguide_mock_chat_${sessionId}`);
    if (!data) {
      const initial: ChatMessage[] = [
        {
          id: "msg-welcome",
          role: "assistant",
          message: "Hello! I am **CareGuide AI**, your personal care assistant. I'm here to help you understand your Man Matters products, ingredients, recommended routine schedules, and wellness questions.\n\n*What can I help you with today?*",
          suggestions: [
            "What does Redensyl do in the Hair Tonic?",
            "How do I use the Stage 1 Kit?",
            "Compare Anti-Dandruff Shampoo vs Normal Shampoo",
            "Help me structure my morning routine"
          ],
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(`careguide_mock_chat_${sessionId}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveChatHistory(sessionId: string, messages: ChatMessage[]) {
    localStorage.setItem(`careguide_mock_chat_${sessionId}`, JSON.stringify(messages));
  },

  getTickets(sessionId: string): SupportTicket[] {
    const data = localStorage.getItem(`careguide_mock_tickets_${sessionId}`);
    if (!data) {
      const initial: SupportTicket[] = [
        {
          id: "tick-1",
          ticketId: "TKT-38291",
          sessionId,
          name: "Care Guide Member",
          email: "member@example.com",
          category: "Product Usage",
          subject: "Can I combine Beardmax with derma roller?",
          message: "I wanted to know if using a 0.5mm derma roller before applying Beardmax serum is recommended.",
          status: "In Review",
          createdAt: "2026-11-06T10:30:00.000Z"
        }
      ];
      localStorage.setItem(`careguide_mock_tickets_${sessionId}`, JSON.stringify(initial));
      return initial;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveTickets(sessionId: string, tickets: SupportTicket[]) {
    localStorage.setItem(`careguide_mock_tickets_${sessionId}`, JSON.stringify(tickets));
  }
};
