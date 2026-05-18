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

// ── Section state ──────────────────────────────────────────────────────────────
type Section =
  | 'none'
  | 'move_upgrades'
  | 'vitamins'
  | 'abilities_list'
  | 'ability_description'
  | 'extra_infos'
  | 'evolution'
  | 'held_level'

// Section headers that close a multi-line collecting section
const SECTION_HEADER_PATTERNS: RegExp[] = [
  /^you see/i,
  /^sex:/i,
  /^(hp|atk|def|sp\.atk|sp\.def|speed):\s*\d+/i,
  /^perfection:/i,
  /^special ability/i,
  /^abilities\s*:/i,
  /^seal:/i,
  /^poke\s*aura\s*:/i,
  /^held item:/i,
  /^held\s*:?\s*$/i,
  /^tms?\s*:/i,
  /^move\s+up-?grade/i,
  /^vitamins?\s*:\s*\(/i,
  /^extra\s+infos?\s*:/i,
  /^evolution\s*:/i,
]

function isNewSection(line: string): boolean {
  return SECTION_HEADER_PATTERNS.some(re => re.test(line))
}

// The name line always has (Level N) or [+N] or Upgrade:
function isNameLine(line: string): boolean {
  return /\(level\s+\d+\)/i.test(line) || /\[\+?\d+\]/.test(line)
}

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
  // Buffers for multi-line sections
  const abilityDescLines: string[] = []
  const evolutionLines: string[] = []

  for (const line of lines) {
    // ── STEP 1: Multi-line collecting sections ─────────────────────────────────
    // Handled FIRST. When a new section is detected, we flush and fall through
    // to process the current line as a named section header (no `continue`).

    if (section === 'ability_description') {
      if (isNewSection(line)) {
        result.ability_description = abilityDescLines.join('\n').trim() || null
        section = 'none'
        // fall through — do NOT continue
      } else {
        abilityDescLines.push(line)
        continue
      }
    }

    if (section === 'vitamins') {
      if (isNewSection(line)) {
        section = 'none'
        // fall through
      } else {
        const cleaned = line.replace(/^and\s+/i, '').replace(/,\s*$/, '').trim()
        if (cleaned) result.vitamin_details.push(cleaned)
        continue
      }
    }

    if (section === 'extra_infos') {
      if (isNewSection(line)) {
        section = 'none'
        // fall through
      } else {
        const cleaned = line.replace(/^[*\-]\s*/, '').trim()
        if (cleaned) result.extra_infos.push(cleaned)
        continue
      }
    }

    if (section === 'evolution') {
      if (isNewSection(line)) {
        result.evolution = evolutionLines.join('\n').trim() || null
        section = 'none'
        // fall through
      } else {
        evolutionLines.push(line)
        continue
      }
    }

    if (section === 'abilities_list') {
      result.abilities = parseAbilitiesList(line)
      section = 'none'
      continue
    }

    if (section === 'held_level') {
      result.held_level = line.trim()
      section = 'none'
      continue
    }

    if (section === 'move_upgrades') {
      if (isNewSection(line)) {
        section = 'none'
        // fall through
      } else if (line.includes('[')) {
        result.move_upgrades.push(...parseMoveUpgrades(line))
        continue
      } else {
        // blank or legend line — stay in section
        continue
      }
    }

    // ── STEP 2: Named section header checks ────────────────────────────────────

    // Pokeball: "You see a discharged poke ball." / "You see a inuse X ball (bonus)."
    if (/^you see/i.test(line)) {
      const m = line.match(/you see a (?:inuse\s+|discharged\s+)?(.+?)\s*(?:\(([^)]+)\))?\.?\s*$/i)
      if (m) {
        result.pokeball = m[1].trim()
        result.pokeball_bonus = m[2]?.trim() ?? null
      }
      continue
    }

    // Name line: "Shiny Cryogonal (GOD) (EGG) ... (Level 100) [+227] Upgrade: [0]."
    // Detected by the presence of (Level N) or [+N] — NOT by absence of colons.
    if (result.name === '' && isNameLine(line)) {
      parseNameLine(line, result)
      continue
    }

    // Sex
    const sexM = line.match(/^sex:\s*(.+)$/i)
    if (sexM) { result.sex = sexM[1].trim(); continue }

    // Stats: "Hp: 28 (+500)"
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
      continue
    }

    // Perfection
    const perfM = line.match(/perfection:\s*([\d.]+)%/i)
    if (perfM) { result.perfection = parseFloat(perfM[1]); continue }

    // Special Ability (two forms):
    //   "Special Ability: Sniper."              → single-line
    //   "Special Ability - Battle Armor:"       → description follows
    const saSimple = line.match(/^special ability\s*:\s*(.+?)\.?\s*$/i)
    const saDesc   = line.match(/^special ability\s*-\s*(.+?)\s*:\s*$/i)
    if (saDesc) {
      result.ability = saDesc[1].trim()
      section = 'ability_description'
      abilityDescLines.length = 0
      continue
    }
    if (saSimple) {
      result.ability = saSimple[1].trim()
      continue
    }

    // Abilities (plural list) — header only; content on next line
    if (/^abilities\s*:/i.test(line)) {
      const inline = line.replace(/^abilities\s*:\s*/i, '').trim()
      if (inline) {
        result.abilities = parseAbilitiesList(inline)
      } else {
        section = 'abilities_list'
      }
      continue
    }

    // Seal
    const sealM = line.match(/^seal:\s*(.+?)\.?\s*$/i)
    if (sealM) { result.seal = sealM[1].trim(); continue }

    // PokeAura
    const auraM = line.match(/^poke\s*aura\s*:\s*(.+?)\.?\s*$/i)
    if (auraM) { result.aura = auraM[1].trim(); continue }

    // Held Item (inline): "Held Item: Never Melt Ice."
    const heldItemM = line.match(/^held item:\s*(.+?)\.?\s*$/i)
    if (heldItemM) { result.held_item = heldItemM[1].trim(); continue }

    // Held (block): "Held:" → next line is "Level 7 Never Melt Ice +20%"
    if (/^held\s*:?\s*$/i.test(line)) {
      section = 'held_level'
      continue
    }

    // TMs
    const tmM = line.match(/^tms?\s*:\s*(.+)/i)
    if (tmM) { result.tms = parseTMList(tmM[1]); continue }

    // Move Upgrades header: "Move Up-grades (Slots: 15/15) (5/5):"
    const moveHeaderM = line.match(/^move\s+up-?grades?\s*(?:\(slots?:\s*(\d+)\/(\d+)\))?\s*(?:\((\d+\/\d+)\))?:?/i)
    if (moveHeaderM) {
      if (moveHeaderM[1]) result.move_slots_used = parseInt(moveHeaderM[1])
      if (moveHeaderM[2]) result.move_slots_total = parseInt(moveHeaderM[2])
      if (moveHeaderM[3]) result.move_upgrades_count = moveHeaderM[3]
      section = 'move_upgrades'
      continue
    }

    // Vitamins header: "Vitamins: (30/30)"
    const vitHeaderM = line.match(/^vitamins?\s*:\s*\((\d+)\/(\d+)\)/i)
    if (vitHeaderM) {
      result.vitamins_used = parseInt(vitHeaderM[1])
      result.vitamins_total = parseInt(vitHeaderM[2])
      section = 'vitamins'
      continue
    }

    // Extra Infos header
    if (/^extra\s+infos?\s*:/i.test(line)) {
      section = 'extra_infos'
      continue
    }

    // Evolution header
    if (/^evolution\s*:/i.test(line)) {
      const inline = line.replace(/^evolution\s*:\s*/i, '').trim()
      evolutionLines.length = 0
      if (inline) evolutionLines.push(inline)
      section = 'evolution'
      continue
    }

    // Skip legend footnotes: "(BB) = Baby Potion"
    if (/^\([A-Z]{1,4}\)\s*=/i.test(line)) continue
  }

  // Flush any open collecting sections
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

  // Name = first word (or two words if both capitalized) before any paren/bracket
  const nameM = rest.match(/^([A-Z][a-zA-Z\-']+(?:\s[A-Z][a-zA-Z\-']+)?)/)
  if (nameM) result.name = nameM[1].trim()

  // Tier: first (X+*) looking like a tier rating
  const tierM = rest.match(/\(([SABCDE][+\-]*)\)/)
  if (tierM) result.tier = tierM[1]

  // Awaken: (A) tag
  result.awaken = /\(A\)/.test(rest)

  // Seasonal/event tags: anything in parens that isn't a known token or tier
  const knownTokens = new Set(['A', 'P', 'GOD', 'EGG', 'BB', 'PL'])
  const parenTokens = Array.from(rest.matchAll(/\(([^)]+)\)/g)).map(m => m[1].trim())
  const seasonalCandidates = parenTokens.filter(t => {
    if (/^[SABCDE][+\-]*$/.test(t)) return false   // tier
    if (/^level\s+\d+$/i.test(t)) return false      // Level 100
    if (knownTokens.has(t.toUpperCase())) return false
    if (/^\d+$/.test(t)) return false
    return true
  })
  if (seasonalCandidates.length > 0) result.seasonal_tag = seasonalCandidates[0]

  // Boost level: [+227]
  const boostM = rest.match(/\[\+(\d+)\]/)
  if (boostM) result.boost_level = parseInt(boostM[1])

  // Upgrade level: Upgrade: [0]
  const upgradeM = rest.match(/Upgrade:\s*\[(\d+)\]/i)
  if (upgradeM) result.upgrade_level = parseInt(upgradeM[1])

  // Souls
  const soulsM = rest.match(/souls?:\s*(\d+)/i) ?? rest.match(/\((\d+)\s+souls?\)/i)
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
  return raw
    .replace(/\.$/, '')
    .split(/,\s*|\s+and\s+/i)
    .map(s => s.trim())
    .filter(Boolean)
}
