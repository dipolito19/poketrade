export type ParsedPokemon = {
  name: string
  shiny: boolean
  tier: string | null
  pokeball: string | null
  pokeball_bonus: string | null
  awaken: boolean
  seasonal_tag: string | null
  boost_level: number
  upgrade_level: number
  souls: number
  sex: string | null
  stat_hp: number | null
  stat_atk: number | null
  stat_def: number | null
  stat_spatk: number | null
  stat_spdef: number | null
  stat_speed: number | null
  bonus_hp: number
  bonus_atk: number
  bonus_def: number
  bonus_spatk: number
  bonus_spdef: number
  bonus_speed: number
  perfection: number | null
  ability: string | null
  ability_description: string | null
  abilities: string[]
  seal: string | null
  aura: string | null
  held_item: string | null
  held_level: string | null
  tms: { name: string; level: number }[]
  move_slots_used: number
  move_slots_total: number
  move_upgrades_count: string | null
  move_upgrades: { name: string; level: number }[]
  vitamins_used: number
  vitamins_total: number
  vitamin_details: string[]
  extra_infos: string[]
  evolution: string | null
  raw_text: string
}

// Multiline section states
type Section =
  | 'none'
  | 'move_upgrades'
  | 'vitamins'
  | 'abilities_list'
  | 'ability_description'
  | 'extra_infos'
  | 'evolution'
  | 'held_level'

export function parsePokemonText(raw: string): ParsedPokemon {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  const result: ParsedPokemon = {
    name: '',
    shiny: false,
    tier: null,
    pokeball: null,
    pokeball_bonus: null,
    awaken: false,
    seasonal_tag: null,
    boost_level: 0,
    upgrade_level: 0,
    souls: 0,
    sex: null,
    stat_hp: null,
    stat_atk: null,
    stat_def: null,
    stat_spatk: null,
    stat_spdef: null,
    stat_speed: null,
    bonus_hp: 0,
    bonus_atk: 0,
    bonus_def: 0,
    bonus_spatk: 0,
    bonus_spdef: 0,
    bonus_speed: 0,
    perfection: null,
    ability: null,
    ability_description: null,
    abilities: [],
    seal: null,
    aura: null,
    held_item: null,
    held_level: null,
    tms: [],
    move_slots_used: 0,
    move_slots_total: 0,
    move_upgrades_count: null,
    move_upgrades: [],
    vitamins_used: 0,
    vitamins_total: 0,
    vitamin_details: [],
    extra_infos: [],
    evolution: null,
    raw_text: raw,
  }

  let section: Section = 'none'
  const abilityDescLines: string[] = []
  const evolutionLines: string[] = []

  for (const line of lines) {
    const low = line.toLowerCase()

    // ── Pokeball line ──────────────────────────────────────────────────────────
    // "You see a discharged poke ball."
    // "You see a inuse hogwarts ball (25% ATK/DEF Dark/Ghost)."
    if (low.startsWith('you see')) {
      const m = line.match(/you see a (?:inuse\s+|discharged\s+)?(.+?)\s*(?:\(([^)]+)\))?\.?\s*$/i)
      if (m) {
        result.pokeball = m[1].trim()
        result.pokeball_bonus = m[2]?.trim() ?? null
      }
      section = 'none'
      continue
    }

    // ── Sex ────────────────────────────────────────────────────────────────────
    if (/^sex:/i.test(line)) {
      result.sex = line.replace(/^sex:\s*/i, '').trim()
      section = 'none'
      continue
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    const statM = line.match(/^(Hp|Atk|Def|Sp\.Atk|Sp\.Def|Speed):\s*(\d+)\s*(?:\(\+(\d+)\))?/i)
    if (statM) {
      const key = statM[1].toLowerCase().replace('.', '')
      const val = parseInt(statM[2])
      const bonus = statM[3] ? parseInt(statM[3]) : 0
      switch (key) {
        case 'hp':    result.stat_hp = val;    result.bonus_hp = bonus;    break
        case 'atk':   result.stat_atk = val;   result.bonus_atk = bonus;   break
        case 'def':   result.stat_def = val;   result.bonus_def = bonus;   break
        case 'spatk': result.stat_spatk = val; result.bonus_spatk = bonus; break
        case 'spdef': result.stat_spdef = val; result.bonus_spdef = bonus; break
        case 'speed': result.stat_speed = val; result.bonus_speed = bonus; break
      }
      section = 'none'
      continue
    }

    // ── Perfection ─────────────────────────────────────────────────────────────
    const perfM = line.match(/perfection:\s*([\d.]+)%/i)
    if (perfM) {
      result.perfection = parseFloat(perfM[1])
      section = 'none'
      continue
    }

    // ── Special Ability (with optional description block) ──────────────────────
    // "Special Ability: Sniper."  → single-line form
    // "Special Ability - Battle Armor:"  → multi-line description follows
    const saM = line.match(/^special ability(?:\s*[-:]\s*|\s*:\s*)(.+?)(?:\.|\s*:)?\s*$/i)
    if (saM) {
      const val = saM[1].trim().replace(/\.$/, '')
      if (low.includes('-') || line.endsWith(':')) {
        // "Special Ability - Battle Armor:" → description follows
        result.ability = val
        section = 'ability_description'
        abilityDescLines.length = 0
      } else {
        result.ability = val
        section = 'none'
      }
      continue
    }

    // ── Abilities (plural list) ────────────────────────────────────────────────
    // "Abilities:" → next line(s) with the list
    // " Abilities:\nStrength, Rock Smash and Blink..."
    if (/^abilities\s*:/i.test(line)) {
      section = 'abilities_list'
      // inline list?
      const inline = line.replace(/^abilities\s*:\s*/i, '').trim()
      if (inline) {
        result.abilities = parseAbilitiesList(inline)
        section = 'none'
      }
      continue
    }

    // ── Seal ───────────────────────────────────────────────────────────────────
    // "Seal: star seal F (ATK: 40% DEF: 40%)."
    const sealM = line.match(/^seal:\s*(.+?)\.?\s*$/i)
    if (sealM) {
      result.seal = sealM[1].trim()
      section = 'none'
      continue
    }

    // ── PokeAura ───────────────────────────────────────────────────────────────
    // "PokeAura: Niver (+0) (ATK +66%) (DEF +85%)"
    const auraM = line.match(/^poke\s*aura\s*:\s*(.+?)\.?\s*$/i)
    if (auraM) {
      result.aura = auraM[1].trim()
      section = 'none'
      continue
    }

    // ── Held Item (simple inline) ──────────────────────────────────────────────
    // "Held Item: Soft Sand."
    const heldItemM = line.match(/^held item:\s*(.+?)\.?\s*$/i)
    if (heldItemM) {
      result.held_item = heldItemM[1].trim()
      section = 'none'
      continue
    }

    // ── Held (level block) ─────────────────────────────────────────────────────
    // "Held:" → next line(s): "Level 7 Never Melt Ice +20%"
    if (/^held\s*:?\s*$/i.test(line)) {
      section = 'held_level'
      continue
    }

    // ── TMs ────────────────────────────────────────────────────────────────────
    const tmM = line.match(/^tms?\s*:\s*(.+)/i)
    if (tmM) {
      result.tms = parseTMList(tmM[1])
      section = 'none'
      continue
    }

    // ── Move Upgrades header ───────────────────────────────────────────────────
    const moveHeaderM = line.match(/^move\s+up-?grades?\s*(?:\(slots?:\s*(\d+)\/(\d+)\))?\s*(?:\((\d+\/\d+)\))?:?/i)
    if (moveHeaderM) {
      if (moveHeaderM[1]) result.move_slots_used = parseInt(moveHeaderM[1])
      if (moveHeaderM[2]) result.move_slots_total = parseInt(moveHeaderM[2])
      if (moveHeaderM[3]) result.move_upgrades_count = moveHeaderM[3]
      section = 'move_upgrades'
      continue
    }

    // ── Vitamins header ────────────────────────────────────────────────────────
    const vitHeaderM = line.match(/^vitamins?\s*:\s*\((\d+)\/(\d+)\)/i)
    if (vitHeaderM) {
      result.vitamins_used = parseInt(vitHeaderM[1])
      result.vitamins_total = parseInt(vitHeaderM[2])
      section = 'vitamins'
      continue
    }

    // ── Extra Infos header ─────────────────────────────────────────────────────
    if (/^extra\s+infos?\s*:/i.test(line)) {
      section = 'extra_infos'
      continue
    }

    // ── Evolution header ───────────────────────────────────────────────────────
    if (/^evolution\s*:/i.test(line)) {
      section = 'evolution'
      evolutionLines.length = 0
      const inline = line.replace(/^evolution\s*:\s*/i, '').trim()
      if (inline) evolutionLines.push(inline)
      continue
    }

    // ── Skip legend/footnote lines (BB = ..., EGG = ..., PL = ...) ────────────
    if (/^\(([A-Z]{1,4})\)\s*=\s*/i.test(line)) {
      section = 'none'
      continue
    }

    // ── Name line (must come after all "Section:" patterns above) ──────────────
    // "Shiny Cryogonal (GOD) (EGG) (BB) (PL)(ZERO PROTOCOL) (Level 100) [+227] Upgrade: [0]."
    if (result.name === '' && /^(Shiny\s+)?[A-Z][a-zA-Z\-']+/.test(line) && !low.includes(':')) {
      parseNameLine(line, result)
      section = 'none'
      continue
    }

    // ── Section body handlers ──────────────────────────────────────────────────

    if (section === 'ability_description') {
      // Stop collecting if we hit another named section
      if (isNewSection(line)) {
        result.ability_description = abilityDescLines.join('\n').trim() || null
        section = 'none'
        // re-process this line as a new section by falling through — but since
        // we can't re-process in a for loop, we handle common cases below
        handleFallthroughLine(line, result)
      } else {
        abilityDescLines.push(line)
      }
      continue
    }

    if (section === 'abilities_list') {
      result.abilities = parseAbilitiesList(line)
      section = 'none'
      continue
    }

    if (section === 'move_upgrades' && line.includes('[')) {
      result.move_upgrades.push(...parseMoveUpgrades(line))
      continue
    }

    if (section === 'vitamins') {
      // Lines: "9x HP Up (+50% Max HP)," or "and 9x PP Up (...)"
      const cleaned = line.replace(/^and\s+/i, '').replace(/,\s*$/, '').trim()
      if (cleaned) result.vitamin_details.push(cleaned)
      continue
    }

    if (section === 'held_level') {
      // "Level 7 Never Melt Ice +20%"
      result.held_level = line.trim()
      section = 'none'
      continue
    }

    if (section === 'extra_infos') {
      // Lines start with "*" or "- " or plain text
      const cleaned = line.replace(/^[*\-]\s*/, '').trim()
      if (cleaned) result.extra_infos.push(cleaned)
      continue
    }

    if (section === 'evolution') {
      evolutionLines.push(line)
      continue
    }
  }

  // Flush ability description if file ends while collecting
  if (abilityDescLines.length > 0 && result.ability_description === null) {
    result.ability_description = abilityDescLines.join('\n').trim() || null
  }
  if (evolutionLines.length > 0 && result.evolution === null) {
    result.evolution = evolutionLines.join('\n').trim() || null
  }

  return result
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function parseNameLine(line: string, result: ParsedPokemon) {
  let rest = line

  // Shiny prefix
  if (/^shiny\s+/i.test(rest)) {
    result.shiny = true
    rest = rest.replace(/^shiny\s+/i, '')
  }

  // Name = first word(s) before a parenthesis or bracket
  const nameM = rest.match(/^([A-Z][a-zA-Z\-']+(?:\s[A-Z][a-zA-Z\-']+)?)/)
  if (nameM) result.name = nameM[1].trim()

  // Tier: first (X+*) that looks like a tier
  const tierM = rest.match(/\(([SABCDE][+\-]*)\)/)
  if (tierM) result.tier = tierM[1]

  // Awaken: (A) present
  result.awaken = /\(A\)/.test(rest)

  // Seasonal tags: uppercase words in parens that are NOT known tokens
  // Also handles multi-word like (ZERO PROTOCOL)
  const knownSingle = new Set(['A', 'P', 'GOD', 'EGG', 'BB', 'PL', 'Level'])
  const parenTokens = Array.from(rest.matchAll(/\(([^)]+)\)/g)).map(m => m[1].trim())
  const seasonalCandidates = parenTokens.filter(t => {
    if (/^[SABCDE][+\-]*$/.test(t)) return false   // tier
    if (/^level\s+\d+$/i.test(t)) return false       // Level 100
    if (knownSingle.has(t.toUpperCase())) return false
    if (/^\d+$/.test(t)) return false
    return true
  })
  if (seasonalCandidates.length > 0) result.seasonal_tag = seasonalCandidates[0]

  // Boost level: [+200]
  const boostM = rest.match(/\[\+(\d+)\]/)
  if (boostM) result.boost_level = parseInt(boostM[1])

  // Upgrade level
  const upgradeM = rest.match(/Upgrade:\s*\[(\d+)\]/i)
  if (upgradeM) result.upgrade_level = parseInt(upgradeM[1])

  // Souls
  const soulsM = rest.match(/souls?:\s*(\d+)/i) || rest.match(/\((\d+)\s+souls?\)/i)
  if (soulsM) result.souls = parseInt(soulsM[1])
}

function parseTMList(raw: string): { name: string; level: number }[] {
  const items: { name: string; level: number }[] = []
  const regex = /([A-Za-z][A-Za-z\s\-']+?)\((\d+)\)/g
  let m
  while ((m = regex.exec(raw)) !== null) {
    items.push({ name: m[1].trim(), level: parseInt(m[2]) })
  }
  return items
}

function parseMoveUpgrades(raw: string): { name: string; level: number }[] {
  const items: { name: string; level: number }[] = []
  const regex = /([A-Za-z][A-Za-z\s\-']+?):\s*\[(\d+)\]/g
  let m
  while ((m = regex.exec(raw)) !== null) {
    items.push({ name: m[1].trim(), level: parseInt(m[2]) })
  }
  return items
}

function parseAbilitiesList(raw: string): string[] {
  // Split on commas and " and " (case-insensitive)
  return raw
    .replace(/\.$/, '')
    .split(/,\s*|\s+and\s+/i)
    .map(s => s.trim())
    .filter(Boolean)
}

const SECTION_HEADERS = [
  /^sex:/i, /^(hp|atk|def|sp\.atk|sp\.def|speed):/i, /^perfection:/i,
  /^special ability/i, /^abilities:/i, /^seal:/i, /^poke\s*aura:/i,
  /^held item:/i, /^held\s*:?$/i, /^tms?:/i, /^move\s+up-?grade/i,
  /^vitamins?:/i, /^extra\s+info/i, /^evolution:/i,
]

function isNewSection(line: string): boolean {
  return SECTION_HEADERS.some(re => re.test(line))
}

// Handle lines that were "discovered" while flushing a section
function handleFallthroughLine(line: string, result: ParsedPokemon) {
  const sealM = line.match(/^seal:\s*(.+?)\.?\s*$/i)
  if (sealM) { result.seal = sealM[1].trim(); return }

  const auraM = line.match(/^poke\s*aura\s*:\s*(.+?)\.?\s*$/i)
  if (auraM) { result.aura = auraM[1].trim(); return }

  const heldM = line.match(/^held item:\s*(.+?)\.?\s*$/i)
  if (heldM) { result.held_item = heldM[1].trim() }
}
