export type ParsedPokemon = {
  name: string
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
  held_item: string | null
  tms: { name: string; level: number }[]
  move_slots_used: number
  move_slots_total: number
  move_upgrades_count: string | null
  move_upgrades: { name: string; level: number }[]
  vitamins_used: number
  vitamins_total: number
  vitamin_details: string[]
  raw_text: string
}

export function parsePokemonText(raw: string): ParsedPokemon {
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean)

  const result: ParsedPokemon = {
    name: '',
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
    held_item: null,
    tms: [],
    move_slots_used: 0,
    move_slots_total: 0,
    move_upgrades_count: null,
    move_upgrades: [],
    vitamins_used: 0,
    vitamins_total: 0,
    vitamin_details: [],
    raw_text: raw,
  }

  let inMoveUpgrades = false
  let inVitamins = false

  for (const line of lines) {
    // ── Pokeball line ──────────────────────────────────────────────────────────
    // "You see a inuse hogwarts ball (25% ATK/DEF Dark/Ghost)."
    const pokeballMatch = line.match(/you see a (?:inuse\s+)?(.+?)\s*(?:\(([^)]+)\))?\.?\s*$/i)
    if (pokeballMatch && line.toLowerCase().includes('you see')) {
      result.pokeball = pokeballMatch[1].trim()
      result.pokeball_bonus = pokeballMatch[2]?.trim() ?? null
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Name line ──────────────────────────────────────────────────────────────
    // "Sawsbuck (P) (S++) (A)(YULE) (Level 100) [+200] Upgrade: [5]."
    const nameLine = line.match(/^([A-Z][a-zA-Z\-']+(?:\s[A-Z][a-zA-Z\-']+)?)\s*(.*)$/)
    if (
      nameLine &&
      !line.toLowerCase().startsWith('you see') &&
      !line.toLowerCase().startsWith('sex') &&
      !line.toLowerCase().startsWith('hp') &&
      !line.toLowerCase().startsWith('atk') &&
      !line.toLowerCase().startsWith('def') &&
      !line.toLowerCase().startsWith('sp.') &&
      !line.toLowerCase().startsWith('speed') &&
      !line.toLowerCase().startsWith('perf') &&
      !line.toLowerCase().startsWith('special') &&
      !line.toLowerCase().startsWith('held') &&
      !line.toLowerCase().startsWith('tms') &&
      !line.toLowerCase().startsWith('move') &&
      !line.toLowerCase().startsWith('vitamin') &&
      result.name === ''
    ) {
      const rest = nameLine[2]
      result.name = nameLine[1].trim()

      // tier: first (X+*) pattern that is not "Level"
      const tierMatch = rest.match(/\(([SABCDE][+\-]*)\)/)
      if (tierMatch) result.tier = tierMatch[1]

      // awaken: (A) present
      result.awaken = /\(A\)/.test(rest)

      // seasonal tag: uppercase word in parens that isn't a known token
      const knownTags = new Set(['A', 'P', 'Level', '100'])
      const seasonalMatch = rest.match(/\(([A-Z]{3,})\)/g)
      if (seasonalMatch) {
        const candidates = seasonalMatch
          .map(m => m.replace(/[()]/g, ''))
          .filter(t => !knownTags.has(t) && !/^[SABCDE][+\-]*$/.test(t))
        if (candidates.length > 0) result.seasonal_tag = candidates[0]
      }

      // boost level: [+200]
      const boostMatch = rest.match(/\[\+(\d+)\]/)
      if (boostMatch) result.boost_level = parseInt(boostMatch[1])

      // upgrade level: Upgrade: [5]
      const upgradeMatch = rest.match(/Upgrade:\s*\[(\d+)\]/i)
      if (upgradeMatch) result.upgrade_level = parseInt(upgradeMatch[1])

      // souls: Souls: X or (X souls)
      const soulsMatch = rest.match(/souls?:\s*(\d+)/i) || rest.match(/\((\d+)\s+souls?\)/i)
      if (soulsMatch) result.souls = parseInt(soulsMatch[1])

      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Sex ────────────────────────────────────────────────────────────────────
    const sexMatch = line.match(/^sex:\s*(.+)$/i)
    if (sexMatch) {
      result.sex = sexMatch[1].trim()
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Stats ──────────────────────────────────────────────────────────────────
    // "Hp: 28 (+500)"
    const statLine = line.match(/^(Hp|Atk|Def|Sp\.Atk|Sp\.Def|Speed):\s*(\d+)\s*(?:\(\+(\d+)\))?/i)
    if (statLine) {
      const key = statLine[1].toLowerCase().replace('.', '')
      const val = parseInt(statLine[2])
      const bonus = statLine[3] ? parseInt(statLine[3]) : 0
      switch (key) {
        case 'hp':    result.stat_hp = val;    result.bonus_hp = bonus;    break
        case 'atk':   result.stat_atk = val;   result.bonus_atk = bonus;   break
        case 'def':   result.stat_def = val;   result.bonus_def = bonus;   break
        case 'spatk': result.stat_spatk = val; result.bonus_spatk = bonus; break
        case 'spdef': result.stat_spdef = val; result.bonus_spdef = bonus; break
        case 'speed': result.stat_speed = val; result.bonus_speed = bonus; break
      }
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Perfection ─────────────────────────────────────────────────────────────
    const perfMatch = line.match(/perfection:\s*([\d.]+)%/i)
    if (perfMatch) {
      result.perfection = parseFloat(perfMatch[1])
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Special Ability ────────────────────────────────────────────────────────
    const abilityMatch = line.match(/special ability:\s*(.+?)\.?\s*$/i)
    if (abilityMatch) {
      result.ability = abilityMatch[1].trim()
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Held Item ──────────────────────────────────────────────────────────────
    const heldMatch = line.match(/held item:\s*(.+?)\.?\s*$/i)
    if (heldMatch) {
      result.held_item = heldMatch[1].trim()
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── TMs ────────────────────────────────────────────────────────────────────
    // "TMs: Sketch(100), X-Scissor(114), Night Slash(75)"
    const tmMatch = line.match(/^tms?:\s*(.+)$/i)
    if (tmMatch) {
      result.tms = parseTMList(tmMatch[1])
      inMoveUpgrades = false
      inVitamins = false
      continue
    }

    // ── Move Upgrades header ───────────────────────────────────────────────────
    // "Move Up-grades (Slots: 11/11) (5/5):"
    const moveHeader = line.match(/^move\s+up-?grades?\s*(?:\(slots?:\s*(\d+)\/(\d+)\))?\s*(?:\((\d+\/\d+)\))?:?/i)
    if (moveHeader) {
      if (moveHeader[1]) result.move_slots_used = parseInt(moveHeader[1])
      if (moveHeader[2]) result.move_slots_total = parseInt(moveHeader[2])
      if (moveHeader[3]) result.move_upgrades_count = moveHeader[3]
      inMoveUpgrades = true
      inVitamins = false
      continue
    }

    // ── Vitamins header ────────────────────────────────────────────────────────
    // "Vitamins: (10/30)"
    const vitHeader = line.match(/^vitamins?:\s*\((\d+)\/(\d+)\)/i)
    if (vitHeader) {
      result.vitamins_used = parseInt(vitHeader[1])
      result.vitamins_total = parseInt(vitHeader[2])
      inMoveUpgrades = false
      inVitamins = true
      continue
    }

    // ── Move upgrades body ─────────────────────────────────────────────────────
    // "Rock Cannon: [11], Solar Beam: [11]"
    if (inMoveUpgrades && line.includes('[')) {
      const moves = parseMoveUpgrades(line)
      result.move_upgrades.push(...moves)
      continue
    }

    // ── Vitamin details ────────────────────────────────────────────────────────
    // "3x HP Up (+14% Max HP)"
    if (inVitamins && line.length > 0) {
      result.vitamin_details.push(line)
      continue
    }
  }

  return result
}

function parseTMList(raw: string): { name: string; level: number }[] {
  const items: { name: string; level: number }[] = []
  // Pattern: "Name With Spaces(level)"
  const regex = /([A-Za-z][A-Za-z\s\-']+?)\((\d+)\)/g
  let m
  while ((m = regex.exec(raw)) !== null) {
    items.push({ name: m[1].trim(), level: parseInt(m[2]) })
  }
  return items
}

function parseMoveUpgrades(raw: string): { name: string; level: number }[] {
  const items: { name: string; level: number }[] = []
  // Pattern: "Move Name: [level]"
  const regex = /([A-Za-z][A-Za-z\s\-']+?):\s*\[(\d+)\]/g
  let m
  while ((m = regex.exec(raw)) !== null) {
    items.push({ name: m[1].trim(), level: parseInt(m[2]) })
  }
  return items
}
