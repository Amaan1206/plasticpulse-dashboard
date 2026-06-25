// ─── WasteWise 9-Category Waste Model ───────────────────────────────────
// Single source of truth for the nine waste categories used across the app.
// When the backend migrates from `plastic_type`/`resin_code` to the
// 9-category model, the values below are the only thing that needs to align.

import { Apple, Package, Wine, Magnet, Shapes, FileText, CupSoda, Shirt, Leaf, HelpCircle } from 'lucide-react'

export const CATEGORIES = [
  {
    key: 'Biological',
    Icon: Apple,
    accent: 'jade',
    color: '#34D399',
    gradient: 'from-jade-500 to-jade-400',
    badge: 'bg-jade-400/10 text-jade-400 border-jade-400/15',
    disposal_stream: 'Compost / Wet Waste',
    handling_action: 'Compost',
    description: 'Food scraps, bones, and other animal- or food-derived organic waste that decomposes.',
    examples: ['Leftover food', 'Bones', 'Eggshells', 'Tea bags'],
    handling: 'Place in the wet/green bin for composting. Keep free of plastic wrappers.',
  },
  {
    key: 'Cardboard',
    Icon: Package,
    accent: 'ember',
    color: '#FF853D',
    gradient: 'from-ember-500 to-ember-400',
    badge: 'bg-ember-400/10 text-ember-400 border-ember-400/15',
    disposal_stream: 'Dry Recycling',
    handling_action: 'Recycle',
    description: 'Corrugated boxes and thick paperboard packaging.',
    examples: ['Shipping boxes', 'Cereal boxes', 'Shoe boxes', 'Egg cartons'],
    handling: 'Flatten and keep dry. Place in the dry recycling stream.',
  },
  {
    key: 'Glass',
    Icon: Wine,
    accent: 'teal',
    color: '#00E8AE',
    gradient: 'from-teal-500 to-mint-400',
    badge: 'bg-teal-500/10 text-teal-400 border-teal-500/15',
    disposal_stream: 'Glass Recycling',
    handling_action: 'Recycle',
    description: 'Bottles and jars made of glass — infinitely recyclable.',
    examples: ['Beverage bottles', 'Jam jars', 'Cosmetic jars', 'Broken glassware'],
    handling: 'Rinse and place in the glass recycling stream. Handle shards with care.',
  },
  {
    key: 'Metal',
    Icon: Magnet,
    accent: 'slate',
    color: '#94A3B8',
    gradient: 'from-slate-400 to-slate-500',
    badge: 'bg-slate-500/10 text-slate-300 border-slate-500/15',
    disposal_stream: 'Metal Recycling',
    handling_action: 'Recycle',
    description: 'Aluminium and steel cans, foils, and small metal objects.',
    examples: ['Soda cans', 'Food tins', 'Aluminium foil', 'Bottle caps'],
    handling: 'Rinse and place in the dry recycling stream. Crush cans to save space.',
  },
  {
    key: 'Miscellaneous',
    Icon: Shapes,
    accent: 'terracotta',
    color: '#FF7B63',
    gradient: 'from-terracotta-500 to-ember-400',
    badge: 'bg-terracotta-400/10 text-terracotta-500 border-terracotta-400/15',
    disposal_stream: 'General Waste',
    handling_action: 'Landfill',
    description: 'Mixed or non-recyclable items that do not fit any other category.',
    examples: ['Multi-layer packaging', 'Ceramics', 'Diapers', 'Rubber'],
    handling: 'Place in general waste. Avoid mixing with recyclables to prevent contamination.',
  },
  {
    key: 'Paper',
    Icon: FileText,
    accent: 'sun',
    color: '#FFC81A',
    gradient: 'from-sun-500 to-sun-300',
    badge: 'bg-sun-500/10 text-sun-400 border-sun-500/15',
    disposal_stream: 'Dry Recycling',
    handling_action: 'Recycle',
    description: 'Office paper, newspaper, and other thin paper products.',
    examples: ['Newspaper', 'Printer paper', 'Magazines', 'Envelopes'],
    handling: 'Keep dry and clean. Place in the dry recycling stream.',
  },
  {
    key: 'Plastic',
    Icon: CupSoda,
    accent: 'iris',
    color: '#7A68FF',
    gradient: 'from-iris-500 to-iris-300',
    badge: 'bg-iris-500/10 text-iris-400 border-iris-500/15',
    disposal_stream: 'Plastic Recycling',
    handling_action: 'Recycle',
    description: 'Bottles, containers, and packaging made of plastic resins.',
    examples: ['Water bottles', 'Food containers', 'Carry bags', 'Shampoo bottles'],
    handling: 'Rinse, dry, and place in the plastic recycling stream where accepted.',
  },
  {
    key: 'Textile',
    Icon: Shirt,
    accent: 'rose',
    color: '#FF5C85',
    gradient: 'from-rose-500 to-ember-400',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/15',
    disposal_stream: 'Textile Reuse',
    handling_action: 'Donate / Reuse',
    description: 'Clothing, fabric, and other woven materials.',
    examples: ['Old clothes', 'Bedsheets', 'Towels', 'Shoes'],
    handling: 'Donate if usable, otherwise take to a textile collection point.',
  },
  {
    key: 'Vegetation',
    Icon: Leaf,
    accent: 'mint',
    color: '#1AFF88',
    gradient: 'from-mint-500 to-jade-400',
    badge: 'bg-mint-500/10 text-mint-400 border-mint-500/15',
    disposal_stream: 'Compost / Garden Waste',
    handling_action: 'Compost',
    description: 'Garden and plant-based green waste.',
    examples: ['Leaves', 'Grass clippings', 'Twigs', 'Flowers'],
    handling: 'Compost or place in the green/garden waste stream.',
  },
]

// Fallback used when a category value is unknown (keeps the UI resilient).
const FALLBACK = {
  key: 'Unknown',
  Icon: HelpCircle,
  accent: 'slate',
  color: '#5A6A80',
  gradient: 'from-slate-500 to-slate-400',
  badge: 'bg-slate-500/10 text-slate-400 border-slate-500/15',
  disposal_stream: 'General Waste',
  handling_action: 'Sort',
  description: '',
  examples: [],
  handling: '',
}

const CATEGORY_MAP = CATEGORIES.reduce((acc, c) => {
  acc[c.key] = c
  return acc
}, {})

// Returns the config for a category name, preserving the original label for
// unknown values while supplying neutral fallback styling.
export function getCategory(name) {
  if (name && CATEGORY_MAP[name]) return CATEGORY_MAP[name]
  return { ...FALLBACK, key: name || FALLBACK.key }
}

export const CATEGORY_NAMES = CATEGORIES.map((c) => c.key)

// Derive a recommended handling action from a category (used when the backend
// has not yet supplied `handling_action` directly).
export function handlingActionFor(name) {
  return getCategory(name).handling_action
}
