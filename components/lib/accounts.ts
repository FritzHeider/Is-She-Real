export type AuthenticitySignal = {
  label: string;
  description: string;
};

export type AccountProfile = {
  id: string;
  platform: 'instagram' | 'tiktok' | 'x' | 'youtube';
  handle: string;
  displayName: string;
  avatar: string;
  followers: number;
  following: number;
  postsPerWeek: number;
  credibilityScore: number;
  verdict: string;
  explanation: string;
  signals: AuthenticitySignal[];
  gallery: Array<{
    id: string;
    src: string;
    alt: string;
    caption?: string;
    sizeX?: number;
    sizeY?: number;
  }>;
};

export const accountProfiles: AccountProfile[] = [
  {
    id: 'candidsunsets',
    platform: 'instagram',
    handle: '@candidsunsets',
    displayName: 'Candid Sunsets',
    avatar: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=256&q=80',
    followers: 18400,
    following: 180,
    postsPerWeek: 5,
    credibilityScore: 0.86,
    verdict: 'Likely authentic travel storyteller with consistent narrative voice.',
    explanation:
      'Content cadence, cross-posted stories, and follower conversations align with legitimate creator behavior. The model flagged minimal risk based on transparent collaborations and long-running audience engagement.',
    signals: [
      {
        label: 'Conversation Health',
        description: 'Replies include location-specific anecdotes and direct references to previous posts, indicating recurring community members.'
      },
      {
        label: 'Media Depth',
        description: 'High-resolution carousel sets with behind-the-scenes clips supply layered evidence rather than generic stock imagery.'
      },
      {
        label: 'Network Authenticity',
        description: 'Tag graph reveals mutual mentions with verified photographers and tourism boards collected over 24 months.'
      }
    ],
    gallery: [
      {
        id: 'cs-1',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80',
        alt: 'Sunset photographer on a cliff',
        caption: 'Golden hour from Santorini with geo-tagged story highlights.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-2',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80',
        alt: 'Ocean waves washing ashore at dusk',
        caption: 'Long exposure reel referenced in bio call-to-action.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-3',
        src: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=900&q=80',
        alt: 'Traveler walking through lavender fields',
        caption: 'Collaboration with Provence tourism board disclosed in caption.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-4',
        src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80',
        alt: 'Hot air balloons at sunrise',
        caption: 'Carousel second slide contains voice-over stories.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-5',
        src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=900&q=80',
        alt: 'Mountain lake with reflection',
        caption: 'Viewer comments cite meeting the creator on-site.',
        sizeX: 2,
        sizeY: 1
      },
      {
        id: 'cs-6',
        src: 'https://images.unsplash.com/photo-1496284045406-d3e0b918d7ba?auto=format&fit=crop&w=900&q=80',
        alt: 'City skyline at night with light trails',
        caption: 'Archive clip reused with updated metadata via reels.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-7',
        src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1100&q=80',
        alt: 'Snow capped peaks during sunrise',
        caption: 'Matching behind-the-scenes on TikTok cross-posted the same day.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-8',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=900&q=80',
        alt: 'Drone shot over tropical island',
        caption: 'Metadata includes location coordinates and weather context.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-9',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=1100&q=80',
        alt: 'Boats anchored in turquoise water',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-10',
        src: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1200&q=80',
        alt: 'Person kayaking at sunrise',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-11',
        src: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80',
        alt: 'Pastel sunrise with hot air balloons',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'cs-12',
        src: 'https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=80',
        alt: 'Lavender fields with traveler',
        sizeX: 1,
        sizeY: 1
      }
    ]
  },
  {
    id: 'analogatelier',
    platform: 'tiktok',
    handle: '@analogatelier',
    displayName: 'Analog Atelier',
    avatar: 'https://images.unsplash.com/photo-1526948531399-320e7e40f0ca?auto=format&fit=crop&w=256&q=80',
    followers: 98200,
    following: 250,
    postsPerWeek: 7,
    credibilityScore: 0.72,
    verdict: 'Legitimate collective with occasional brand collaborations.',
    explanation:
      'Posting velocity is high yet consistent with multi-person studios. Verified buyers and workshop attendees appear in stitched reactions, reinforcing authenticity despite polished editing.',
    signals: [
      {
        label: 'Community Proof',
        description: 'Duet chains feature repeat customers sharing film scans and tagging the studio.'
      },
      {
        label: 'Commerce Trail',
        description: 'Link-in-bio references Stripe receipts and match Shopify fulfillment data.'
      },
      {
        label: 'Production Cadence',
        description: 'Upload schedule aligns with behind-the-scenes livestreams archived on YouTube.'
      }
    ],
    gallery: [
      {
        id: 'aa-1',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80',
        alt: 'Studio desk with analog camera',
        caption: 'Workshop footage reused in authenticity audit prompt.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-2',
        src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80',
        alt: 'Film negatives hanging to dry',
        caption: 'Tagged apprentice appears in multiple archived lives.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-3',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=1100&q=80',
        alt: 'Close up of a medium format camera',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-4',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=900&q=80',
        alt: 'Neon lights inside the studio',
        caption: 'Matches color palette from brand deck shared publicly.',
        sizeX: 2,
        sizeY: 1
      },
      {
        id: 'aa-5',
        src: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1100&q=80',
        alt: 'Photographer reviewing photos on a computer',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-6',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=1000&q=80',
        alt: 'Film camera on tripod',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-7',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=900&q=80',
        alt: 'Lighting setup in studio',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-8',
        src: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
        alt: 'Editing footage on monitors',
        caption: 'Livestream replay matches timeline of product drops.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-9',
        src: 'https://images.unsplash.com/photo-1474631245212-32dc3c8310c6?auto=format&fit=crop&w=1000&q=80',
        alt: 'Camera lenses on a shelf',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-10',
        src: 'https://images.unsplash.com/photo-1431068799455-80bae0caf685?auto=format&fit=crop&w=1000&q=80',
        alt: 'Team collaborating on prints',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-11',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=1100&q=80',
        alt: 'Creative space with monitors and lights',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'aa-12',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80',
        alt: 'Studio portrait session setup',
        sizeX: 1,
        sizeY: 1
      }
    ]
  },
  {
    id: 'signalboost',
    platform: 'x',
    handle: '@signalboost',
    displayName: 'Signal Boost Coalition',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=256&q=80',
    followers: 415000,
    following: 520,
    postsPerWeek: 15,
    credibilityScore: 0.64,
    verdict: 'Mostly authentic advocacy account with occasional automation cues.',
    explanation:
      'Thread structure, on-the-ground photography, and references to offline events support legitimacy. Automation signals appear around scheduled fundraising pushes but stay within acceptable transparency thresholds.',
    signals: [
      {
        label: 'Real-World Trail',
        description: 'Posts include timestamps that match municipal livestream archives and press photos.'
      },
      {
        label: 'Contributor Mesh',
        description: 'Volunteer photographers credited in alt text also appear in LinkedIn rosters and Instagram tags.'
      },
      {
        label: 'Automation Watch',
        description: 'Scheduled posts recycle copy during campaigns but respond to replies with unique language within an hour.'
      }
    ],
    gallery: [
      {
        id: 'sb-1',
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1100&q=80',
        alt: 'Crowd gathered at night with city lights',
        caption: 'Geo-matched to livestream of civic vigil.',
        sizeX: 2,
        sizeY: 1
      },
      {
        id: 'sb-2',
        src: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1100&q=80',
        alt: 'Speaker addressing audience from stage',
        caption: 'Photo credit aligns with accredited journalist in thread.',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-3',
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
        alt: 'Volunteer distributing flyers',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-4',
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1100&q=80',
        alt: 'Hands holding placards during march',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-5',
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=900&q=80',
        alt: 'Poster close up with slogans',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-6',
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
        alt: 'Night rally near city hall',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-7',
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1000&q=80',
        alt: 'Close up of community organizer speaking',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-8',
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1200&q=80',
        alt: 'People holding lights during vigil',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-9',
        src: 'https://images.unsplash.com/photo-1526481280695-3c46973edc88?auto=format&fit=crop&w=1200&q=80',
        alt: 'Volunteers preparing care packages',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-10',
        src: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80',
        alt: 'City skyline at dusk with crowd silhouettes',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-11',
        src: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1100&q=80',
        alt: 'Organizer on a call behind the scenes',
        sizeX: 1,
        sizeY: 1
      },
      {
        id: 'sb-12',
        src: 'https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=1100&q=80',
        alt: 'Raised hands during community meeting',
        sizeX: 1,
        sizeY: 1
      }
    ]
  }
];
