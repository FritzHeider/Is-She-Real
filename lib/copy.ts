export const navItems = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const;

export const featureCards = [
  {
    title: "On-device detection",
    description: "Privacy-first intelligence that keeps sensitive content on the edge while syncing insights across the team in real time.",
    icon: "ShieldCheck",
  },
  {
    title: "Contextual scoring",
    description: "Our adaptive models continuously recalibrate risk using behavioral, semantic, and biometric signals for unrivaled accuracy.",
    icon: "Radar",
  },
  {
    title: "Decision intelligence",
    description: "Automate actions with rules, journeys, and no-code workflows that plug into your stack without the integration tax.",
    icon: "Workflow",
  },
  {
    title: "Global coverage",
    description: "Localized experiences in 42 languages backed by ISO 27001 compliance, SOC2 Type II, and air-gapped options for regulated teams.",
    icon: "Globe",
  },
];

export const metrics = [
  { label: "Signals per day", value: 4500000 },
  { label: "Models tuned", value: 128 },
  { label: "Countries covered", value: 64 },
  { label: "Customer NPS", value: 76 },
];

export const testimonials = [
  {
    quote:
      "It’s like adding a full-time investigation unit without adding headcount. The clarity of the dashboards is unparalleled.",
    author: "Amelia Flynn",
    role: "Chief Trust Officer, Vanta",
    avatar: "https://avatars.githubusercontent.com/u/10660468?v=4",
  },
  {
    quote:
      "The GSAP-driven interactions tell a story—our analysts now fix issues 40% faster because the insights are impossible to miss.",
    author: "David Chen",
    role: "Director of Operations, Lattice",
    avatar: "https://avatars.githubusercontent.com/u/124599?v=4",
  },
  {
    quote:
      "We saw an immediate lift in signal precision. The pricing model scales predictably across all our regions.",
    author: "Priya Ramesh",
    role: "VP of Platform, Segment",
    avatar: "https://avatars.githubusercontent.com/u/7154763?v=4",
  },
];

export const pricingTiers = [
  {
    name: "Starter",
    monthly: 49,
    annual: 39,
    tagline: "Launch with best-in-class detection and reporting.",
    features: [
      "5M API calls per month",
      "Pre-built trust workflows",
      "Shared analyst workspace",
      "Email + chat support",
    ],
    cta: "Start free",
  },
  {
    name: "Growth",
    monthly: 129,
    annual: 109,
    tagline: "Scale confidently with automation and AI co-pilots.",
    features: [
      "Unlimited event ingestion",
      "Adaptive scoring engine",
      "Role-based access controls",
      "Priority integrations desk",
    ],
    cta: "Talk to sales",
    highlighted: true,
  },
  {
    name: "Enterprise",
    monthly: 259,
    annual: 219,
    tagline: "Compliance-grade controls with dedicated analysts.",
    features: [
      "Dedicated trust architect",
      "Air-gapped deployment",
      "Customer-managed keys",
      "24/7 white-glove support",
    ],
    cta: "Request demo",
  },
];

export const faqs = [
  {
    question: "How accurate is the detector?",
    answer:
      "Our models maintain a >99.7% precision on benchmark sets, with continuous training using your live signals via secure enclaves.",
  },
  {
    question: "Do you offer on-premise deployments?",
    answer:
      "Yes. Enterprise plans can run in your VPC or air-gapped environments with managed updates and compliance tooling included.",
  },
  {
    question: "How do you handle data privacy?",
    answer:
      "We keep raw data on-device, stream metadata only, and deliver complete SOC2 Type II reports. Bring-your-own-keys is standard.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "Starter tiers include a 30-day free trial with no credit card required and full access to integrations and automation.",
  },
];

export const trustLogos = [
  "https://images.unsplash.com/photo-1529619768328-e37af76c6fe5?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=300&q=60",
  "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=300&q=60",
];

export const blogPosts = [
  {
    slug: "ai-trust-blueprint",
    title: "The Blueprint for AI Trust & Safety Ops",
    description: "How leading platforms restructure their trust teams around adaptive intelligence and automation.",
    date: "2024-06-18",
    readTime: "7 min read",
  },
  {
    slug: "scaling-incident-response",
    title: "Scaling Incident Response Without Burning Out Analysts",
    description: "Designing humane runbooks with machine copilots and predictive playbooks.",
    date: "2024-05-29",
    readTime: "5 min read",
  },
];
