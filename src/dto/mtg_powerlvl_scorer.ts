// commanderPowerLevelCalculator.ts
// A complete system for scoring Commander/EDH decks based on both the Commander Salt scoring model
// and the official Commander Brackets system, standardized to a 1-5 scale

// ----- Types and Interfaces -----

export type BracketLevel = 1 | 2 | 3 | 4 | 5;

export interface DeckAnalysis {
  bracketLevel: BracketLevel;
  bracketName: string;
  combinedScore: number;   // Standardized 1-5 score
  originalSaltScore: number; // Original 1-10.999 score from Salt system
  categoryScores: CategoryScores;
  manabaseScore: number;
  gameChangersCount: number;
  gameChangersList: string[];
  hasMassLandDenial: boolean;
  hasExtraTurns: boolean;
  hasTwoCardCombos: boolean;
  tutorCount: number;
  comboCount: number;
  consistencyScore: number;
  interactionScore: number;
  efficiencyScore: number;
  details: string;
  suggestions: string[];
}

export interface CategoryScores {
  interaction: number;
  counterspell: number;
  removal: number;
  stax: number;
  taxes: number;
  graveyard: number;
  recursion: number;
  combo: number;
  tutor: number;
  draw: number;
  ramp: number;
  fast_mana: number;
}

export interface ScryfallCard {
  id: string;
  name: string;
  type_line: string;
  oracle_text?: string;
  mana_cost?: string;
  cmc: number;
  colors?: string[];
  color_identity: string[];
  keywords: string[];
  produced_mana?: string[];
  legalities: { [format: string]: string };
  is_commander?: boolean;
  categories?: string[];
  score?: number;
}

export interface BracketInfo {
  name: string;
  description: string;
  restrictions: {
    massLandDenial: boolean;
    extraTurns: boolean;
    twoCardCombos: boolean | 'late-game';
    gameChangers: number; // Max number allowed (0 for none)
    tutors: 'sparse' | 'unlimited';
  };
}

export interface DeckStats {
  cardCount: number;
  landCount: number;
  averageCmc: number;
  colorIdentity: string[];
  fastManaCount: number;
  tutorCount: number;
  drawCount: number;
  interactionCount: number;
  staxCount: number;
  massLandDenialCount: number;
  extraTurnsCount: number;
  rampsCount: number;
  twoCardComboCount: number;
  colorDistribution: { [color: string]: number };
  manaSymbolDistribution: { [color: string]: number };
  manaProducers: number;
  landPercentage: number;
}

// ----- Constants -----

// Commander Brackets System
export const BRACKET_DEFINITIONS: Record<BracketLevel, BracketInfo> = {
  1: {
    name: "Exhibition",
    description: "Ultra-casual Commander deck focused on themes rather than winning",
    restrictions: {
      massLandDenial: false,
      extraTurns: false,
      twoCardCombos: false,
      gameChangers: 0,
      tutors: 'sparse'
    }
  },
  2: {
    name: "Core",
    description: "Power level of average preconstructed deck",
    restrictions: {
      massLandDenial: false,
      extraTurns: false,
      twoCardCombos: false,
      gameChangers: 0,
      tutors: 'sparse'
    }
  },
  3: {
    name: "Upgraded",
    description: "Stronger than preconstructed decks but not fully optimized",
    restrictions: {
      massLandDenial: false,
      extraTurns: false,
      twoCardCombos: 'late-game',
      gameChangers: 3,
      tutors: 'sparse'
    }
  },
  4: {
    name: "Optimized",
    description: "High power Commander with no restrictions",
    restrictions: {
      massLandDenial: true,
      extraTurns: true,
      twoCardCombos: true,
      gameChangers: Infinity,
      tutors: 'unlimited'
    }
  },
  5: {
    name: "cEDH",
    description: "High power with a competitive and metagame-focused mindset",
    restrictions: {
      massLandDenial: true,
      extraTurns: true,
      twoCardCombos: true,
      gameChangers: Infinity,
      tutors: 'unlimited'
    }
  }
};

// Commander tiers and max scores (from the Salt system)
export const COMMANDER_TIERS: { [tier: number]: { tier: number; maxScore: number } } = {
  1: { tier: 1, maxScore: 10.99 },
  2: { tier: 2, maxScore: 10.69 },
  3: { tier: 3, maxScore: 10.29 },
  4: { tier: 4, maxScore: 9.29 }
};

// Game Changers List (from the bracket system image)
export const GAME_CHANGERS: string[] = [
  // White
  "Drannith Magistrate",
  "Enlightened Tutor",
  "Serra's Sanctum",
  "Smothering Tithe",
  "Trouble in Pairs",
  
  // Blue
  "Cyclonic Rift",
  "Expropriate",
  "Force of Will",
  "Fierce Guardianship",
  "Rhystic Study",
  "Thassa's Oracle",
  "Urza, Lord High Artificer",
  "Mystical Tutor",
  "Jin-Gitaxias, Core Augur",
  
  // Black
  "Bolas's Citadel",
  "Demonic Tutor",
  "Imperial Seal",
  "Opposition Agent",
  "Tergrid, God of Fright",
  "Vampiric Tutor",
  "Ad Nauseam",
  
  // Red
  "Jeska's Will",
  "Underworld Breach",
  
  // Green
  "Survival of the Fittest",
  "Vorinclex, Voice of Hunger",
  "Gaea's Cradle",
  
  // Multicolor
  "Kinnan, Bonder Prodigy",
  "Yuriko, the Tiger's Shadow",
  "Winota, Joiner of Forces",
  "Grand Arbiter Augustin IV",
  
  // Colorless
  "Ancient Tomb",
  "Chrome Mox",
  "The One Ring",
  "The Tabernacle at Pendrell Vale",
  "Trinisphere",
  "Grim Monolith",
  "Lion's Eye Diamond",
  "Mox Diamond",
  "Mana Vault",
  "Glacial Chasm"
];

// Mass Land Denial cards
export const MASS_LAND_DENIAL: string[] = [
  "Armageddon",
  "Balance",
  "Blood Moon",
  "Catastrophe",
  "Fall of the Thran",
  "Impending Disaster",
  "Jokulhaups",
  "Land Equilibrium",
  "Limited Resources",
  "Magus of the Moon",
  "Ravages of War",
  "Rising Waters",
  "Ruination",
  "Static Orb",
  "Stasis",
  "Sunder",
  "Tectonic Break",
  "Thoughts of Ruin",
  "Tsunami",
  "Winter Orb",
  // Additional examples
  "Back to Basics",
  "Boil",
  "Boom // Bust",
  "Burning of Xinye",
  "Cataclysm",
  "Contamination",
  "Destructive Flow",
  "Devastation",
  "Dingus Egg",
  "Impending Disaster",
  "Keldon Firebombers",
  "Mana Barbs",
  "Mana Breach",
  "Mana Vortex",
  "Price of Glory",
  "Stoneshaker Shaman",
  "Sundering Titan",
  "Tangle Wire",
  "Wildfire"
];

// Extra turn cards
export const EXTRA_TURN_CARDS: string[] = [
  "Alrund's Epiphany",
  "Beacon of Tomorrows", 
  "Capture of Jingzhou",
  "Emrakul, the Promised End",
  "Expropriate",
  "Karn's Temporal Sundering",
  "Nexus of Fate",
  "Part the Waterveil",
  "Temporal Manipulation",
  "Temporal Mastery",
  "Temporal Trespass",
  "Time Stretch",
  "Time Warp",
  "Timestream Navigator",
  "Walk the Aeons",
  "Warrior's Oath"
];

// Known two-card infinite combos
export const TWO_CARD_COMBOS: [string, string][] = [
  ["Thassa's Oracle", "Demonic Consultation"],
  ["Thassa's Oracle", "Tainted Pact"],
  ["Isochron Scepter", "Dramatic Reversal"],
  ["Helm of the Host", "Godo, Bandit Warlord"],
  ["Sword of the Meek", "Thopter Foundry"],
  ["Devoted Druid", "Vizier of Remedies"],
  ["Mikaeus, the Unhallowed", "Triskelion"],
  ["Food Chain", "Eternal Scourge"],
  ["Protean Hulk", "Flash"],
  ["Kiki-Jiki, Mirror Breaker", "Zealous Conscripts"],
  ["Heliod, Sun-Crowned", "Walking Ballista"],
  ["Lion's Eye Diamond", "Underworld Breach"],
  ["Sensei's Divining Top", "Bolas's Citadel"],
  ["Worldgorger Dragon", "Animate Dead"],
  ["Sanguine Bond", "Exquisite Blood"],
  ["Peregrine Drake", "Deadeye Navigator"],
  ["Karmic Guide", "Reveillark"],
];

// Tutors (excluding land tutors)
export const TUTORS: string[] = [
  "Demonic Tutor",
  "Vampiric Tutor",
  "Imperial Seal", 
  "Enlightened Tutor",
  "Mystical Tutor",
  "Worldly Tutor",
  "Sylvan Tutor",
  "Grim Tutor",
  "Cruel Tutor",
  "Diabolic Tutor",
  "Personal Tutor",
  "Gamble",
  "Birthing Pod",
  "Defense of the Heart",
  "Eldritch Evolution",
  "Eladamri's Call",
  "Fauna Shaman",
  "Green Sun's Zenith", 
  "Finale of Devastation",
  "Chord of Calling",
  "Idyllic Tutor",
  "Beseech the Queen",
  "Demonic Bargain",
  "Profane Tutor",
  "Scheming Symmetry",
  "Razaketh, the Foulblooded",
  "Fabricate",
  "Tinker",
  "Transmute Artifact",
  "Reshape",
  "Trophy Mage",
  "Tribute Mage",
  "Trinket Mage",
  "Treasure Mage",
  "Drift of Phantasms",
  "Signal the Clans",
  "Time of Need",
  "Fleshwrither",
  "Diabolic Intent",
  "Corrupted Conscience"
];

// Fast Mana Cards
export const FAST_MANA: string[] = [
  "Sol Ring",
  "Mana Crypt",
  "Mana Vault",
  "Grim Monolith",
  "Chrome Mox",
  "Mox Diamond",
  "Mox Amber",
  "Lotus Petal",
  "Jeweled Lotus",
  "Ancient Tomb",
  "City of Traitors",
  "Gemstone Caverns",
  "Elvish Spirit Guide",
  "Simian Spirit Guide",
  "Birds of Paradise",
  "Deathrite Shaman",
  "Noble Hierarch",
  "Ignoble Hierarch",
  "Llanowar Elves",
  "Fyndhorn Elves",
  "Elvish Mystic",
  "Carpet of Flowers",
  "Exploration",
  "Burgeoning",
  "Ragavan, Nimble Pilferer"
];

// Known cEDH Commanders and their tiers
export const CEDH_COMMANDERS: { [name: string]: number } = {
  // Tier 1 Commanders
  'Thrasios, Triton Hero': 1,
  'Tymna the Weaver': 1,
  'Kraum, Ludevic\'s Opus': 1,
  'Najeela, the Blade-Blossom': 1,
  'Kenrith, the Returned King': 1,
  'Urza, Lord High Artificer': 1,
  'The Gitrog Monster': 1,
  'Godo, Bandit Warlord': 1,
  'Zur the Enchanter': 1,
  'Kinnan, Bonder Prodigy': 1,
  
  // Tier 2 Commanders
  'Korvold, Fae-Cursed King': 2,
  'Yuriko, the Tiger\'s Shadow': 2,
  'Kess, Dissident Mage': 2,
  'Edric, Spymaster of Trest': 2,
  'Brago, King Eternal': 2,
  'Teferi, Temporal Archmage': 2,
  'Animar, Soul of Elements': 2,
  'Jhoira, Weatherlight Captain': 2,
  'Elsha of the Infinite': 2,
  'Breya, Etherium Shaper': 2,
  
  // Tier 3 Commanders
  'Meren of Clan Nel Toth': 3,
  'Muldrotha, the Gravetide': 3,
  'Yisan, the Wanderer Bard': 3,
  'Tasigur, the Golden Fang': 3,
  'Krark, the Thumbless': 3,
  'Sakashima of a Thousand Faces': 3,
  'Zada, Hedron Grinder': 3,
  'Aeve, Progenitor Ooze': 3,
  'Feather, the Redeemed': 3,
  'Niv-Mizzet, Parun': 3
};

// ----- API Integration -----

/**
 * Base URL for Scryfall API
 */
const SCRYFALL_API_BASE = 'https://api.scryfall.com';

/**
 * Determines the deck hosting site from the URL
 */
export function getDeckSite(url: string): 'moxfield' | 'archidekt' | 'unknown' {
  if (url.includes('moxfield.com')) {
    return 'moxfield';
  } else if (url.includes('archidekt.com')) {
    return 'archidekt';
  }
  return 'unknown';
}

/**
 * Extracts the deck ID from the URL
 */
export function extractDeckId(url: string, site: 'moxfield' | 'archidekt' | 'unknown'): string | null {
  if (site === 'moxfield') {
    const match = url.match(/moxfield\.com\/decks\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } else if (site === 'archidekt') {
    const match = url.match(/archidekt\.com\/decks\/([0-9]+)/);
    return match ? match[1] : null;
  }
  return null;
}

/**
 * Fetches a deck from Moxfield
 */
export async function fetchDeckFromMoxfield(deckId: string): Promise<{ commanders: ScryfallCard[], cards: ScryfallCard[] }> {
  try {
    const response = await fetch(`https://api.moxfield.com/v2/decks/all/${deckId}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch deck from Moxfield: ${response.status} ${response.statusText}`);
    }
    
    const deckData = await response.json();
    
    // Extract commanders
    const commanders: ScryfallCard[] = [];
    if (deckData.commanders) {
      for (const cardId in deckData.commanders) {
        const card = deckData.commanders[cardId];
        commanders.push({
          id: card.card.scryfall_id || cardId,
          name: card.card.name,
          type_line: card.card.type_line || "",
          oracle_text: card.card.oracle_text || "",
          mana_cost: card.card.mana_cost || "",
          cmc: card.card.cmc || 0,
          colors: card.card.colors || [],
          color_identity: card.card.color_identity || [],
          keywords: card.card.keywords || [],
          is_commander: true,
          legalities: card.card.legalities || {}
        });
      }
    }
    
    // Extract main deck cards
    const cards: ScryfallCard[] = [];
    if (deckData.mainboard) {
      for (const cardId in deckData.mainboard) {
        const card = deckData.mainboard[cardId];
        
        // Skip cards that are already commanders
        if (commanders.some(c => c.name === card.card.name)) {
          continue;
        }
        
        // Create the card object
        const cardObj: ScryfallCard = {
          id: card.card.scryfall_id || cardId,
          name: card.card.name,
          type_line: card.card.type_line || "",
          oracle_text: card.card.oracle_text || "",
          mana_cost: card.card.mana_cost || "",
          cmc: card.card.cmc || 0,
          colors: card.card.colors || [],
          color_identity: card.card.color_identity || [],
          keywords: card.card.keywords || [],
          legalities: card.card.legalities || {}
        };
        
        // Add card quantity times
        for (let i = 0; i < card.quantity; i++) {
          cards.push({...cardObj});
        }
      }
    }
    
    return { commanders, cards };
  } catch (error) {
    console.error(`Error fetching deck from Moxfield:`, error);
    throw error;
  }
}

/**
 * Fetches a deck from Archidekt
 */
export async function fetchDeckFromArchidekt(deckId: string): Promise<{ commanders: ScryfallCard[], cards: ScryfallCard[] }> {
  try {
    const response = await fetch(`https://archidekt.com/api/decks/${deckId}/`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch deck from Archidekt: ${response.status} ${response.statusText}`);
    }
    
    const deckData = await response.json();
    
    // Extract commanders and cards
    const commanders: ScryfallCard[] = [];
    const cards: ScryfallCard[] = [];
    
    if (deckData.cards) {
      deckData.cards.forEach((cardEntry: any) => {
        const cardObj: ScryfallCard = {
          id: cardEntry.card.uid || "",
          name: cardEntry.card.oracleCard.name,
          type_line: cardEntry.card.oracleCard.typeLine || "",
          oracle_text: cardEntry.card.oracleCard.oracleText || "",
          mana_cost: cardEntry.card.oracleCard.manaCost || "",
          cmc: cardEntry.card.oracleCard.cmc || 0,
          colors: cardEntry.card.oracleCard.colors || [],
          color_identity: cardEntry.card.colorIdentity || [],
          keywords: cardEntry.card.oracleCard.keywords || [],
          legalities: cardEntry.card.oracleCard.legalities || {}
        };
        
        // Check if card is a commander
        if (cardEntry.categories.includes('Commander')) {
          cardObj.is_commander = true;
          commanders.push(cardObj);
        } else if (!cardEntry.categories.includes('Sideboard') && 
                  !cardEntry.categories.includes('Maybeboard')) {
          // Add card quantity times
          for (let i = 0; i < cardEntry.quantity; i++) {
            cards.push({...cardObj});
          }
        }
      });
    }
    
    return { commanders, cards };
  } catch (error) {
    console.error(`Error fetching deck from Archidekt:`, error);
    throw error;
  }
}

/**
 * Fetches card details from Scryfall
 */
export async function fetchCardsFromScryfall(cardNames: string[]): Promise<ScryfallCard[]> {
  const uniqueNames = [...new Set(cardNames)]; // Remove duplicates
  const cards: ScryfallCard[] = [];
  
  // Split into batches of 75 (Scryfall's limit)
  const BATCH_SIZE = 75;
  
  for (let i = 0; i < uniqueNames.length; i += BATCH_SIZE) {
    const batchNames = uniqueNames.slice(i, i + BATCH_SIZE);
    
    try {
      // Create identifiers for the batch
      const identifiers = batchNames.map(name => ({ name }));
      
      const response = await fetch(`${SCRYFALL_API_BASE}/cards/collection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ identifiers })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cards from Scryfall: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Process each card
      result.data.forEach((card: any) => {
        cards.push({
          id: card.id,
          name: card.name,
          mana_cost: card.mana_cost || "",
          cmc: card.cmc || 0,
          type_line: card.type_line || "",
          oracle_text: card.oracle_text || "",
          colors: card.colors || [],
          color_identity: card.color_identity || [],
          keywords: card.keywords || [],
          produced_mana: card.produced_mana || [],
          legalities: card.legalities || {}
        });
      });
      
      // Add a small delay to avoid rate limiting
      if (i + BATCH_SIZE < uniqueNames.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`Error fetching cards from Scryfall:`, error);
      // Continue with next batch instead of failing completely
    }
  }
  
  return cards;
}

// ----- Deck Analysis Logic -----

/**
 * Categorizes a card based on its oracle text and type
 */
function categorizeCard(card: ScryfallCard): string[] {
  const categories: string[] = [];
  const text = card.oracle_text || "";
  const type = card.type_line || "";
  
  // Check for interaction
  if (text.match(/counter.*spell|counter.*activated|counter.*triggered/i)) {
    categories.push('counterspell');
    categories.push('interaction');
  }
  
  if (text.match(/destroy|exile|return.*to.*hand|return.*to.*library/i) && 
      text.match(/target|each|all/i)) {
    categories.push('removal');
    categories.push('interaction');
  }
  
  // Check for stax and taxes
  if (text.match(/can't|players can't|additional cost|costs? (more|X more)/i)) {
    categories.push('stax');
    categories.push('interaction');
  }
  
  if (text.match(/pay (X|\d+) more|costs? (X|\d+) more/i)) {
    categories.push('taxes');
    categories.push('interaction');
  }
  
  // Check for consistency tools
  if (text.match(/search your library/i)) {
    categories.push('tutor');
  }
  
  if (text.match(/draw/i)) {
    categories.push('draw');
  }
  
  // Check for mana production
  if (type.match(/^Land/i) || 
      text.match(/add (one|two|three|\w) mana|adds? (\{[WUBRGC]\})/i)) {
    categories.push('ramp');
  }
  
  if (card.cmc <= 2 && text.match(/add (\{[WUBRGC]\})/i) && !type.match(/^Land/i)) {
    categories.push('fast_mana');
  }
  
  // Check for graveyard interaction
  if (text.match(/graveyard/i) && text.match(/exile|remove/i)) {
    categories.push('graveyard');
    categories.push('interaction');
  }
  
  if (text.match(/return.*from.*graveyard|from.*graveyard.*to/i)) {
    categories.push('recursion');
  }
  
  // Check for combos
  if (isTwoCardComboCard(card.name)) {
    categories.push('combo');
  }
  
  // Check for mass land denial
  if (MASS_LAND_DENIAL.includes(card.name)) {
    categories.push('mass_land_denial');
  }
  
  // Check for extra turns
  if (EXTRA_TURN_CARDS.includes(card.name)) {
    categories.push('extra_turn');
  }
  
  // Check for Game Changers
  if (GAME_CHANGERS.includes(card.name)) {
    categories.push('game_changer');
  }
  
  // Check for Fast Mana
  if (FAST_MANA.includes(card.name)) {
    categories.push('fast_mana');
  }
  
  return categories;
}

/**
 * Checks if a card is part of a known two-card combo
 */
function isTwoCardComboCard(cardName: string): boolean {
  return TWO_CARD_COMBOS.some(combo => combo[0] === cardName || combo[1] === cardName);
}

/**
 * Calculates comprehensive stats for a deck
 */
function calculateDeckStats(commanders: ScryfallCard[], cards: ScryfallCard[]): DeckStats {
  const stats: DeckStats = {
    cardCount: cards.length,
    landCount: 0,
    averageCmc: 0,
    colorIdentity: [],
    fastManaCount: 0,
    tutorCount: 0,
    drawCount: 0,
    interactionCount: 0,
    staxCount: 0,
    massLandDenialCount: 0,
    extraTurnsCount: 0,
    rampsCount: 0,
    twoCardComboCount: 0,
    colorDistribution: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    manaSymbolDistribution: { W: 0, U: 0, B: 0, R: 0, G: 0, C: 0 },
    manaProducers: 0,
    landPercentage: 0
  };
  
  // Set color identity from commanders
  stats.colorIdentity = Array.from(new Set(
    commanders.flatMap(cmd => cmd.color_identity)
  ));
  
  // Category counts
  let cmcSum = 0;
  let nonLandCount = 0;
  
  // Process each card
  for (const card of cards) {
    const categories = card.categories || [];
    
    // Count lands
    if (card.type_line.toLowerCase().includes('land')) {
      stats.landCount++;
    } else {
      // Add to CMC sum for non-lands
      cmcSum += card.cmc;
      nonLandCount++;
    }
    
    // Count by categories
    if (categories.includes('fast_mana')) {
      stats.fastManaCount++;
    }
    if (categories.includes('tutor')) {
      stats.tutorCount++;
    }
    if (categories.includes('draw')) {
      stats.drawCount++;
    }
    if (categories.includes('interaction')) {
      stats.interactionCount++;
    }
    if (categories.includes('stax')) {
      stats.staxCount++;
    }
    if (categories.includes('mass_land_denial')) {
      stats.massLandDenialCount++;
    }
    if (categories.includes('extra_turn')) {
      stats.extraTurnsCount++;
    }
    if (categories.includes('ramp')) {
      stats.rampsCount++;
    }
    if (categories.includes('combo')) {
      stats.twoCardComboCount++;
    }
    
    // Count by colors
    (card.colors || []).forEach(color => {
      if (stats.colorDistribution[color]) {
        stats.colorDistribution[color]++;
      }
    });
    
    // Parse mana symbols in cost
    if (card.mana_cost) {
      const matches = card.mana_cost.match(/\{([^}]+)\}/g) || [];
      matches.forEach(match => {
        const symbol = match.substring(1, match.length - 1);
        if (symbol === 'W' || symbol === 'U' || symbol === 'B' || symbol === 'R' || symbol === 'G' || symbol === 'C') {
          stats.manaSymbolDistribution[symbol]++;
        }
      });
    }
    
    // Count mana producers
    if (categories.includes('ramp')) {
      stats.manaProducers++;
    }
  }
  
  // Calculate averages and percentages
  stats.averageCmc = nonLandCount > 0 ? cmcSum / nonLandCount : 0;
  stats.landPercentage = (stats.landCount / stats.cardCount) * 100;
  
  return stats;
}

/**
 * Checks if the deck contains pairs of two-card combos
 */
function checkForTwoCardCombos(cards: ScryfallCard[]): { hasCombos: boolean; comboPairs: string[][] } {
  const cardNames = cards.map(card => card.name);
  const comboPairs: string[][] = [];
  
  for (const combo of TWO_CARD_COMBOS) {
    if (cardNames.includes(combo[0]) && cardNames.includes(combo[1])) {
      comboPairs.push([combo[0], combo[1]]);
    }
  }
  
  return {
    hasCombos: comboPairs.length > 0,
    comboPairs
  };
}

/**
 * Calculate Salt score based on the Commander Salt system
 * This is the original 1-10.999 scale
 */
function calculateSaltScore(
  commanders: ScryfallCard[],
  cards: ScryfallCard[],
  deckStats: DeckStats
): number {
  // ----- Interaction Score -----
  const interactionScore = calculateInteractionScore(cards, deckStats);
  
  // ----- Consistency Score -----
  const consistencyScore = calculateConsistencyScore(commanders, cards, deckStats);
  
  // ----- Efficiency Score -----
  const efficiencyScore = calculateEfficiencyScore(cards, deckStats);
  
  // ----- Manabase Score -----
  const manabaseScore = calculateManabaseScore(cards, deckStats);
  
  // Combine scores as per the Salt system
  // The image shows: average combined scores * manabase score
  const averagedCategoryScore = (interactionScore + consistencyScore + efficiencyScore) / 3;
  
  // Normalize manabase score to 0-1 range
  const normalizedManabaseScore = manabaseScore / 10;
  
  // Apply commander tier cap
  const commanderTier = getCommanderTier(commanders);
  const maxScoreForTier = COMMANDER_TIERS[commanderTier].maxScore;
  
  // Calculate final salt score
  const rawScore = averagedCategoryScore * normalizedManabaseScore;
  
  // Cap at tier max score
  return Math.min(rawScore, maxScoreForTier);
}

/**
 * Calculate the interaction score
 * Accounts for counterspells, removal, stax, taxes, and graveyard hate
 */
function calculateInteractionScore(cards: ScryfallCard[], deckStats: DeckStats): number {
  // Count cards in each interaction subcategory
  const counterspellCount = cards.filter(card => 
    card.categories?.includes('counterspell')
  ).length;
  
  const removalCount = cards.filter(card => 
    card.categories?.includes('removal')
  ).length;
  
  const staxCount = cards.filter(card => 
    card.categories?.includes('stax')
  ).length;
  
  const taxesCount = cards.filter(card => 
    card.categories?.includes('taxes')
  ).length;
  
  const graveyardHateCount = cards.filter(card => 
    card.categories?.includes('graveyard')
  ).length;
  
  // Baseline values from salt scoring
  const baselineCounterspells = 8;
  const baselineRemoval = 12;
  const baselineStax = 5;
  const baselineTaxes = 5;
  const baselineGraveyardHate = 3;
  
  // Calculate ratios
  const counterspellRatio = counterspellCount / baselineCounterspells;
  const removalRatio = removalCount / baselineRemoval;
  const staxRatio = staxCount / baselineStax;
  const taxesRatio = taxesCount / baselineTaxes;
  const graveyardHateRatio = graveyardHateCount / baselineGraveyardHate;
  
  // Calculate weighted values
  const weightedCounterspellValue = Math.min(counterspellRatio, 1) * 10.999;
  const weightedRemovalValue = Math.min(removalRatio, 1) * 10.999;
  const weightedStaxValue = Math.min(staxRatio, 1) * 10.999;
  const weightedTaxesValue = Math.min(taxesRatio, 1) * 10.999;
  const weightedGraveyardHateValue = Math.min(graveyardHateRatio, 1) * 10.999;
  
  // Average these scores
  const interactionScore = (
    weightedCounterspellValue + 
    weightedRemovalValue + 
    weightedStaxValue + 
    weightedTaxesValue + 
    weightedGraveyardHateValue
  ) / 5;
  
  return interactionScore;
}

/**
 * Calculate the consistency score
 * Accounts for combos, tutors, and card draw
 */
function calculateConsistencyScore(
  commanders: ScryfallCard[],
  cards: ScryfallCard[],
  deckStats: DeckStats
): number {
  // Combo subscore
  const comboResult = checkForTwoCardCombos(cards);
  let comboScore = 0;
  
  if (comboResult.hasCombos) {
    // Base score for having combos
    comboScore = 5;
    
    // Add points for number of combos
    comboScore += Math.min(comboResult.comboPairs.length * 2, 5);
    
    // Check if any of the tutors can find combo pieces
    const canTutorForCombo = cards.some(card => 
      card.categories?.includes('tutor') && 
      comboResult.comboPairs.some(pair => 
        pair.some(comboCard => {
          // Check if tutor can find the combo piece based on card type
          const comboCardObj = cards.find(c => c.name === comboCard);
          if (comboCardObj) {
            if (comboCardObj.type_line.includes('Creature') && 
                card.oracle_text?.toLowerCase().includes('creature')) {
              return true;
            }
            if (comboCardObj.type_line.includes('Artifact') && 
                card.oracle_text?.toLowerCase().includes('artifact')) {
              return true;
            }
            if (comboCardObj.type_line.includes('Enchantment') && 
                card.oracle_text?.toLowerCase().includes('enchantment')) {
              return true;
            }
            if (card.oracle_text?.toLowerCase().includes('search your library for a card')) {
              return true;
            }
          }
          return false;
        })
      )
    );
    
    if (canTutorForCombo) {
      comboScore += 3;
    }
    
    // Check if commander is part of a combo
    const commanderInCombo = commanders.some(cmd => 
      comboResult.comboPairs.some(pair => pair.includes(cmd.name))
    );
    
    if (commanderInCombo) {
      comboScore += 3;
    }
  }
  
  // Tutor subscore (based on number of tutors)
  const tutorCount = deckStats.tutorCount;
  let tutorScore = 0;
  
  if (tutorCount > 0) {
    // Base score for having tutors
    tutorScore = 3;
    
    // Add points for number of tutors
    tutorScore += Math.min(tutorCount, 7);
  }
  
  // Draw subscore (based on number of card draw effects)
  const drawCount = deckStats.drawCount;
  let drawScore = 0;
  
  if (drawCount > 0) {
    // Base score for having card draw
    drawScore = 2;
    
    // Add points for number of draw effects
    drawScore += Math.min(drawCount * 0.5, 6);
  }
  
  // Combine subscores with weights
  const consistencyScore = (
    (comboScore * 0.4) +
    (tutorScore * 0.4) +
    (drawScore * 0.2)
  ) * 10.999 / 10; // Normalize to 10.999 scale
  
  return consistencyScore;
}

/**
 * Calculate the efficiency score
 * Accounts for average mana value and fast mana
 */
function calculateEfficiencyScore(cards: ScryfallCard[], deckStats: DeckStats): number {
  // Average mana value subscore
  // Lower is better, with diminishing returns
  let avgCmcScore = 0;
  
  if (deckStats.averageCmc <= 2) {
    // Extremely efficient
    avgCmcScore = 10;
  } else if (deckStats.averageCmc <= 2.5) {
    // Very efficient
    avgCmcScore = 8;
  } else if (deckStats.averageCmc <= 3) {
    // Efficient
    avgCmcScore = 6;
  } else if (deckStats.averageCmc <= 3.5) {
    // Average
    avgCmcScore = 4;
  } else if (deckStats.averageCmc <= 4) {
    // Somewhat inefficient
    avgCmcScore = 2;
  } else {
    // Inefficient
    avgCmcScore = 1;
  }
  
  // Fast mana subscore
  const fastManaCount = deckStats.fastManaCount;
  const fastManaScore = Math.min(fastManaCount, 10);
  
  // Combine subscores with equal weight
  const efficiencyScore = (
    (avgCmcScore * 0.5) +
    (fastManaScore * 0.5)
  ) * 10.999 / 10; // Normalize to 10.999 scale
  
  return efficiencyScore;
}

/**
 * Calculate the manabase score
 * From the flowchart this involves land quantity, pip coverage, and mana fixing
 */
function calculateManabaseScore(cards: ScryfallCard[], deckStats: DeckStats): number {
  // Land quantity score
  let landQuantityScore = 0;
  const idealLandCount = calculateIdealLandCount(deckStats.averageCmc, deckStats.rampsCount);
  const landRatio = deckStats.landCount / idealLandCount;
  
  if (landRatio >= 0.9 && landRatio <= 1.1) {
    // Optimal land count
    landQuantityScore = 10;
  } else if (landRatio >= 0.8 && landRatio <= 1.2) {
    // Good land count
    landQuantityScore = 8;
  } else if (landRatio >= 0.7 && landRatio <= 1.3) {
    // Acceptable land count
    landQuantityScore = 6;
  } else {
    // Suboptimal land count
    landQuantityScore = 4;
  }
  
  // Pip coverage score (simplified version)
  let pipCoverageScore = 10; // Default for monocolored
  
  if (deckStats.colorIdentity.length > 1) {
    // Calculate how well the mana symbols in mana costs are covered by producers
    // This is a simplified implementation
    
    // Count total mana symbols by color
    const totalPips = Object.values(deckStats.manaSymbolDistribution).reduce((sum, count) => sum + count, 0);
    
    // For multi-colored decks, checks if deck has enough mana fixing
    const manaFixingCount = cards.filter(card => 
      card.type_line.toLowerCase().includes('land') && 
      card.produced_mana && 
      card.produced_mana.length > 1
    ).length;
    
    // Score based on number of colors and fixing
    if (deckStats.colorIdentity.length === 2) {
      pipCoverageScore = Math.min(10, manaFixingCount * 1.5);
    } else if (deckStats.colorIdentity.length === 3) {
      pipCoverageScore = Math.min(10, manaFixingCount * 1);
    } else if (deckStats.colorIdentity.length === 4) {
      pipCoverageScore = Math.min(10, manaFixingCount * 0.8);
    } else if (deckStats.colorIdentity.length === 5) {
      pipCoverageScore = Math.min(10, manaFixingCount * 0.7);
    }
  }
  
  // Calculate final manabase score
  if (deckStats.colorIdentity.length <= 1) {
    // Mono-colored: Land quantity matters more
    return (landQuantityScore * 0.8) + (pipCoverageScore * 0.2);
  } else {
    // Multi-colored: More balanced scoring
    return (landQuantityScore * 0.5) + (pipCoverageScore * 0.5);
  }
}

/**
 * Calculate ideal land count based on average CMC and ramp count
 */
function calculateIdealLandCount(averageCmc: number, rampCount: number): number {
  let baseLandCount = 35; // Default
  
  // Adjust for average CMC
  if (averageCmc < 2) {
    baseLandCount = 30;
  } else if (averageCmc < 2.5) {
    baseLandCount = 33;
  } else if (averageCmc > 3.5) {
    baseLandCount = 37;
  } else if (averageCmc > 4) {
    baseLandCount = 39;
  }
  
  // Adjust for ramp
  // Each ramp piece reduces land count needs slightly
  const rampAdjustment = Math.min(rampCount * 0.5, 6);
  
  return Math.round(baseLandCount - rampAdjustment);
}

/**
 * Get the competitiveness tier of the commander
 */
function getCommanderTier(commanders: ScryfallCard[]): number {
  // Check for known competitive commanders
  for (const cmd of commanders) {
    if (CEDH_COMMANDERS[cmd.name]) {
      return CEDH_COMMANDERS[cmd.name];
    }
  }
  
  // Default to tier 4 if not in the list
  return 4;
}

/**
 * Determine which bracket a deck belongs to based on the Commander Brackets system
 */
function determineBracket(
  commanders: ScryfallCard[],
  cards: ScryfallCard[],
  deckStats: DeckStats
): { 
  bracketLevel: BracketLevel; 
  name: string; 
  reason: string; 
  suggestions: string[] 
} {
  // Count Game Changers
  const gameChangersCount = cards.filter(card => 
    card.categories?.includes('game_changer')
  ).length;
  
  // Check for mass land denial
  const hasMassLandDenial = deckStats.massLandDenialCount > 0;
  
  // Check for extra turns
  const hasExtraTurns = deckStats.extraTurnsCount > 0;
  
  // Check for two-card combos
  const comboResult = checkForTwoCardCombos(cards);
  const hasTwoCardCombos = comboResult.hasCombos;
  
  // Check for tutors
  const hasManyTutors = deckStats.tutorCount >= 5;
  
  // Determine bracket
  let bracketLevel: BracketLevel;
  let reason = "";
  const suggestions: string[] = [];
  
  // Apply bracket logic in order from highest to lowest
  if (gameChangersCount > 3 || hasMassLandDenial || hasManyTutors) {
    bracketLevel = 4; // Optimized
    
    if (hasMassLandDenial) {
      reason = "Deck contains mass land denial cards";
    } else if (gameChangersCount > 3) {
      reason = `Deck contains ${gameChangersCount} Game Changers (max 3 for Bracket 3)`;
    } else {
      reason = `Deck contains ${deckStats.tutorCount} tutors (high tutor density)`;
    }
    
    // Check if it could be cEDH
    const cEDHCommander = commanders.some(cmd => CEDH_COMMANDERS[cmd.name] === 1);
    
    if (
      (gameChangersCount >= 7) || 
      (deckStats.tutorCount >= 8) || 
      (hasTwoCardCombos && hasExtraTurns) ||
      cEDHCommander
    ) {
      bracketLevel = 5; // cEDH
      reason = cEDHCommander ? 
        `Commander (${commanders.find(cmd => CEDH_COMMANDERS[cmd.name] === 1)?.name}) is a Tier 1 cEDH commander` : 
        "Deck has high density of competitive elements (tutors, combos, Game Changers)";
    }
  } else if (gameChangersCount > 0 || hasTwoCardCombos) {
    bracketLevel = 3; // Upgraded
    
    if (gameChangersCount > 0) {
      reason = `Deck contains ${gameChangersCount} Game Changers`;
    } else {
      reason = "Deck contains potential two-card combos";
    }
    
    if (gameChangersCount > 2) {
      suggestions.push(`To stay in Bracket 3, reduce Game Changers from ${gameChangersCount} to maximum 3`);
    }
  } else if (hasExtraTurns || deckStats.tutorCount > 0) {
    bracketLevel = 2; // Core
    
    if (hasExtraTurns) {
      reason = "Deck contains extra turn cards";
    } else {
      reason = `Deck contains ${deckStats.tutorCount} tutors`;
    }
    
    if (deckStats.tutorCount > 2) {
      suggestions.push("Consider reducing tutor count to maintain Bracket 2 experience");
    }
  } else {
    bracketLevel = 1; // Exhibition
    reason = "Deck has no Game Changers, infinite combos, extra turns, or tutors";
  }
  
  // Get bracket info
  const bracket = BRACKET_DEFINITIONS[bracketLevel];
  
  return {
    bracketLevel,
    name: bracket.name,
    reason,
    suggestions
  };
}

/**
 * Convert Salt Score (0-10.999) to Bracket Level (1-5)
 */
function saltScoreToBracket(saltScore: number): BracketLevel {
  if (saltScore >= 9.5) {
    return 5; // cEDH
  } else if (saltScore >= 8) {
    return 4; // Optimized
  } else if (saltScore >= 6) {
    return 3; // Upgraded
  } else if (saltScore >= 4) {
    return 2; // Core
  } else {
    return 1; // Exhibition
  }
}

/**
 * Combine analysis from both systems
 */
function combineAnalysis(
  commanders: ScryfallCard[],
  cards: ScryfallCard[],
  deckStats: DeckStats,
  saltScore: number,
  bracketAnalysis: {
    bracketLevel: BracketLevel;
    name: string;
    reason: string;
    suggestions: string[];
  }
): DeckAnalysis {
  // Check two-card combos
  const comboResult = checkForTwoCardCombos(cards);
  
  // Get Game Changers
  const gameChangers = cards
    .filter(card => card.categories?.includes('game_changer'))
    .map(card => card.name);
  
  // Calculate individual category scores
  const interactionScore = calculateInteractionScore(cards, deckStats);
  const consistencyScore = calculateConsistencyScore(commanders, cards, deckStats);
  const efficiencyScore = calculateEfficiencyScore(cards, deckStats);
  const manabaseScore = calculateManabaseScore(cards, deckStats);
  
  // For category scores
  const categoryScores: CategoryScores = {
    interaction: 0,
    counterspell: 0,
    removal: 0,
    stax: 0,
    taxes: 0,
    graveyard: 0,
    recursion: 0,
    combo: 0,
    tutor: 0,
    draw: 0,
    ramp: 0,
    fast_mana: 0
  };
  
  // Calculate category scores
  categoryScores.interaction = interactionScore;
  categoryScores.counterspell = cards.filter(card => card.categories?.includes('counterspell')).length / 6 * 10;
  categoryScores.removal = cards.filter(card => card.categories?.includes('removal')).length / 12 * 10;
  categoryScores.stax = cards.filter(card => card.categories?.includes('stax')).length / 5 * 10;
  categoryScores.taxes = cards.filter(card => card.categories?.includes('taxes')).length / 5 * 10;
  categoryScores.graveyard = cards.filter(card => card.categories?.includes('graveyard')).length / 3 * 10;
  categoryScores.recursion = cards.filter(card => card.categories?.includes('recursion')).length / 6 * 10;
  categoryScores.combo = comboResult.hasCombos ? comboResult.comboPairs.length * 3 : 0;
  categoryScores.tutor = deckStats.tutorCount / 5 * 10;
  categoryScores.draw = deckStats.drawCount / 10 * 10;
  categoryScores.ramp = deckStats.rampsCount / 10 * 10;
  categoryScores.fast_mana = deckStats.fastManaCount / 5 * 10;
  
  // Cap all scores at 10
  for (const key in categoryScores) {
    categoryScores[key as keyof CategoryScores] = Math.min(
      categoryScores[key as keyof CategoryScores],
      10
    );
  }
  
  // Reconcile any differences between Salt score bracket and Commander Bracket
  // Give precedence to the Commander Bracket system as it's the newer, official one
  const bracketFromSalt = saltScoreToBracket(saltScore);
  
  // Generate detailed analysis text
  let details = `Commander(s): ${commanders.map(cmd => cmd.name).join(', ')}\n\n`;
  
  details += `Original Salt Score: ${saltScore.toFixed(2)}/10.99\n`;
  details += `Commander Bracket: ${bracketAnalysis.bracketLevel} - ${bracketAnalysis.name}\n`;
  details += `Bracket Reason: ${bracketAnalysis.reason}\n\n`;
  
  details += "Deck Statistics:\n";
  details += `Total Cards: ${deckStats.cardCount}\n`;
  details += `Lands: ${deckStats.landCount} (${deckStats.landPercentage.toFixed(1)}%)\n`;
  details += `Average CMC: ${deckStats.averageCmc.toFixed(2)}\n`;
  details += `Color Identity: ${deckStats.colorIdentity.join('')}\n\n`;
  
  details += "Key Categories:\n";
  details += `Interaction: ${deckStats.interactionCount} cards\n`;
  details += `Tutors: ${deckStats.tutorCount} cards\n`;
  details += `Card Draw: ${deckStats.drawCount} cards\n`;
  details += `Ramp: ${deckStats.rampsCount} cards\n`;
  details += `Fast Mana: ${deckStats.fastManaCount} cards\n`;
  
  if (comboResult.hasCombos) {
    details += `\nPotential Infinite Combos: ${comboResult.comboPairs.length}\n`;
    comboResult.comboPairs.forEach((pair, i) => {
      details += `- Combo ${i+1}: ${pair[0]} + ${pair[1]}\n`;
    });
  }
  
  if (gameChangers.length > 0) {
    details += `\nGame Changers (${gameChangers.length}):\n`;
    gameChangers.forEach(card => {
      details += `- ${card}\n`;
    });
  }
  
  // Combine the bracket level, using the official Commander Bracket system
  // but include information from the Salt score as well
  return {
    bracketLevel: bracketAnalysis.bracketLevel,
    bracketName: bracketAnalysis.name,
    combinedScore: bracketAnalysis.bracketLevel, // 1-5 standardized scale
    originalSaltScore: saltScore,
    categoryScores,
    manabaseScore,
    gameChangersCount: gameChangers.length,
    gameChangersList: gameChangers,
    hasMassLandDenial: deckStats.massLandDenialCount > 0,
    hasExtraTurns: deckStats.extraTurnsCount > 0,
    hasTwoCardCombos: comboResult.hasCombos,
    tutorCount: deckStats.tutorCount,
    comboCount: comboResult.comboPairs.length,
    consistencyScore,
    interactionScore,
    efficiencyScore,
    details,
    suggestions: bracketAnalysis.suggestions
  };
}

/**
 * Main entry point to analyze a deck from URL
 */
export async function analyzeDeck(deckUrl: string): Promise<DeckAnalysis> {
  try {
    console.log("URL: ", deckUrl);
    // Parse URL to determine site
    const site = getDeckSite(deckUrl);
    console.log("SITE: ", site);
    const deckId = extractDeckId(deckUrl, site);
    console.log("SITE: ", deckId);
    
    if (!deckId) {
      throw new Error('Could not extract deck ID from URL');
    }
    
    // Fetch deck based on site
    let commanders: ScryfallCard[] = [];
    let cards: ScryfallCard[] = [];
    
    if ("moxfield" === 'moxfield') {
      const result = await fetchDeckFromMoxfield(deckId);
      commanders = result.commanders;
      cards = result.cards;
    }else if (site === 'archidekt') {
      const result = await fetchDeckFromArchidekt(deckId);
      commanders = result.commanders;
      cards = result.cards;
    } else {
      throw new Error('Unsupported deck site');
    }
    
    // If we need more card data, fetch from Scryfall
    if (cards.some(c => !c.oracle_text) || commanders.some(c => !c.oracle_text)) {
      const allCardNames = [
        ...commanders.map(c => c.name),
        ...cards.map(c => c.name)
      ];
      
      const scryfallCards = await fetchCardsFromScryfall(allCardNames);
      
      // Update card data with Scryfall info
      commanders = commanders.map(cmd => {
        const scryfallCard = scryfallCards.find(c => c.name === cmd.name);
        return scryfallCard ? { ...scryfallCard, is_commander: true } : cmd;
      });
      
      cards = cards.map(card => {
        const scryfallCard = scryfallCards.find(c => c.name === card.name);
        return scryfallCard ? { ...scryfallCard } : card;
      });
    }
    
    // Categorize cards
    cards = cards.map(card => ({
      ...card,
      categories: categorizeCard(card)
    }));
    
    // Calculate deck stats
    const deckStats = calculateDeckStats(commanders, cards);
    
    // Calculate salt score (original 1-10.999 system)
    const saltScore = calculateSaltScore(commanders, cards, deckStats);
    
    // Determine the bracket (official 1-5 system)
    const bracketAnalysis = determineBracket(commanders, cards, deckStats);
    
    // Combine the analysis from both systems
    return combineAnalysis(commanders, cards, deckStats, saltScore, bracketAnalysis);
    
  } catch (error) {
    console.error('Error analyzing deck:', error);
    throw error;
  }
}

/**
 * Formats the deck analysis into a readable format
 */
export function formatDeckAnalysis(analysis: DeckAnalysis): string {
  let result = `==== COMMANDER POWER LEVEL ANALYSIS ====\n\n`;
  
  result += `Bracket: ${analysis.bracketLevel} - ${analysis.bracketName}\n`;
  result += `Power Score: ${analysis.combinedScore.toFixed(1)}/5.0 (Salt Score: ${analysis.originalSaltScore.toFixed(2)}/10.99)\n\n`;
  
  result += analysis.details;
  
  if (analysis.suggestions.length > 0) {
    result += "\nSuggestions:\n";
    analysis.suggestions.forEach((suggestion, i) => {
      result += `${i+1}. ${suggestion}\n`;
    });
  }
  
  return result;
}

// Export the main function
export default {
  analyzeDeck,
  formatDeckAnalysis,
  getDeckSite,
  extractDeckId,
  fetchDeckFromMoxfield,
  fetchDeckFromArchidekt,
  fetchCardsFromScryfall
};