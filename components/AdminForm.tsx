'use client'

import { useState } from 'react'
import { PokemonAd } from '@/lib/supabase'
import { ParsedPokemon } from '@/lib/parser'
import ParserInput from './ParserInput'

type FormData = Omit<PokemonAd, 'id' | 'created_at' | 'updated_at'>

const DEFAULT: FormData = {
  name: '', shiny: false, tier: null, pokeball: null, pokeball_bonus: null,
  awaken: false, seasonal_tag: null, boost_level: 0, upgrade_level: 0, souls: 0,
  sex: null, stat_hp: null, stat_atk: null, stat_def: null,
  stat_spatk: null, stat_spdef: null, stat_speed: null,
  bonus_hp: 0, bonus_atk: 0, bonus_def: 0,
  bonus_spatk: 0, bonus_spdef: 0, bonus_speed: 0,
  perfection: null, ability: null, ability_description: null, abilities: [],
  seal: null, aura: null, held_item: null, held_level: null,
  tms: [], move_slots_used: 0, move_slots_total: 0,
  move_upgrades_count: null, move_upgrades: [],
  vitamins_used: 0, vitamins_total: 0, vitamin_details: [],
  extra_infos: [], evolution: null,
  price: null, contact: null, description: null, raw_text: null,
}

const TIERS = ['S++', 'S+', 'S', 'A++', 'A+', 'A', 'B++', 'B+', 'B', 'C']

type Props = {
  initial?: PokemonAd
  onSaved: () => void
  onCancel: () => void
}

export default function AdminForm({ initial, onSaved, onCancel }: Props) {
  const [form, setForm] = useState<FormData>(initial ? {
    ...DEFAULT, ...initial,
    tms: initial.tms ?? [],
    move_upgrades: initial.move_upgrades ?? [],
    vitamin_details: initial.vitamin_details ?? [],
    abilities: initial.abilities ?? [],
    extra_infos: initial.extra_infos ?? [],
  } : DEFAULT)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set<K extends keyof FormData>(key: K, val: FormData[K]) {
    setForm(f => ({ ...f, [key]: val }))
  }

  function handleParsed(parsed: ParsedPokemon) {
    setForm(f => ({ ...f, ...parsed }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const method = initial ? 'PUT' : 'POST'
      const url = initial ? `/api/ads/${initial.id}` : '/api/ads'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error ?? 'Erro ao salvar')
      }
      onSaved()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Erro desconhecido')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <ParserInput onParsed={handleParsed} />

      {/* Basic info */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Informações Básicas</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Field label="Nome *" required>
            <input value={form.name} onChange={e => set('name', e.target.value)} required className={inputCls} />
          </Field>
          <Field label="Tier">
            <select value={form.tier ?? ''} onChange={e => set('tier', e.target.value || null)} className={inputCls}>
              <option value="">—</option>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </Field>
          <Field label="Pokébola">
            <input value={form.pokeball ?? ''} onChange={e => set('pokeball', e.target.value || null)} className={inputCls} />
          </Field>
          <Field label="Bônus da Pokébola">
            <input value={form.pokeball_bonus ?? ''} onChange={e => set('pokeball_bonus', e.target.value || null)} className={inputCls} />
          </Field>
          <Field label="Tag Sazonal">
            <input value={form.seasonal_tag ?? ''} onChange={e => set('seasonal_tag', e.target.value || null)} className={inputCls} />
          </Field>
          <Field label="Sexo">
            <select value={form.sex ?? ''} onChange={e => set('sex', e.target.value || null)} className={inputCls}>
              <option value="">—</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="unknown">Unknown</option>
            </select>
          </Field>
          <Field label="Boost Level">
            <input type="number" min={0} value={form.boost_level} onChange={e => set('boost_level', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Upgrade Level">
            <input type="number" min={0} value={form.upgrade_level} onChange={e => set('upgrade_level', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Souls">
            <input type="number" min={0} value={form.souls} onChange={e => set('souls', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Perfection (%)">
            <input type="number" step="0.001" value={form.perfection ?? ''} onChange={e => set('perfection', e.target.value ? Number(e.target.value) : null)} className={inputCls} />
          </Field>
          <div className="flex items-center gap-6 pt-6">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="awaken" checked={form.awaken} onChange={e => set('awaken', e.target.checked)} className="w-4 h-4 accent-poke-yellow" />
              <label htmlFor="awaken" className="text-white text-sm">Awakened</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="shiny" checked={form.shiny} onChange={e => set('shiny', e.target.checked)} className="w-4 h-4 accent-poke-yellow" />
              <label htmlFor="shiny" className="text-white text-sm">Shiny</label>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Stats */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Stats</legend>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
          {(['hp', 'atk', 'def', 'spatk', 'spdef', 'speed'] as const).map(stat => (
            <div key={stat} className="space-y-1">
              <label className="text-xs text-poke-muted uppercase tracking-wide">{stat}</label>
              <div className="flex gap-1">
                <input
                  type="number" min={0} max={31}
                  placeholder="IV"
                  value={(form[`stat_${stat}` as keyof FormData] as number | null) ?? ''}
                  onChange={e => set(`stat_${stat}` as keyof FormData, e.target.value ? Number(e.target.value) : null as unknown as FormData[keyof FormData])}
                  className={inputCls + ' w-16'}
                />
                <input
                  type="number" min={0}
                  placeholder="+bonus"
                  value={(form[`bonus_${stat}` as keyof FormData] as number) ?? 0}
                  onChange={e => set(`bonus_${stat}` as keyof FormData, Number(e.target.value) as unknown as FormData[keyof FormData])}
                  className={inputCls + ' flex-1'}
                />
              </div>
            </div>
          ))}
        </div>
      </fieldset>

      {/* Ability & Item */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Habilidade & Item</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Field label="Special Ability">
            <input value={form.ability ?? ''} onChange={e => set('ability', e.target.value || null)} className={inputCls} />
          </Field>
          <Field label="Held Item">
            <input value={form.held_item ?? ''} onChange={e => set('held_item', e.target.value || null)} className={inputCls} />
          </Field>
        </div>
      </fieldset>

      {/* Abilities list */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Abilities (lista)</legend>
        <div className="mt-3 space-y-2">
          {form.abilities.map((ab, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={ab}
                onChange={e => {
                  const arr = [...form.abilities]
                  arr[i] = e.target.value
                  set('abilities', arr)
                }}
                placeholder="Nome da ability"
                className={inputCls + ' flex-1'}
              />
              <button type="button" onClick={() => set('abilities', form.abilities.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300 px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => set('abilities', [...form.abilities, ''])}
            className="text-sm text-poke-yellow hover:underline">+ Adicionar Ability</button>
        </div>
      </fieldset>

      {/* Ability Description */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Descrição da Special Ability</legend>
        <div className="mt-3">
          <textarea
            value={form.ability_description ?? ''}
            onChange={e => set('ability_description', e.target.value || null)}
            rows={5}
            placeholder="Descrição completa da ability especial..."
            className={inputCls + ' resize-y'}
          />
        </div>
      </fieldset>

      {/* Seal & Aura */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Seal & Aura</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Field label="Seal">
            <input value={form.seal ?? ''} onChange={e => set('seal', e.target.value || null)} className={inputCls} placeholder="ex: star seal F (ATK: 40% DEF: 40%)" />
          </Field>
          <Field label="PokeAura">
            <input value={form.aura ?? ''} onChange={e => set('aura', e.target.value || null)} className={inputCls} placeholder="ex: Niver (+0) (ATK +66%) (DEF +85%)" />
          </Field>
        </div>
      </fieldset>

      {/* Held Level */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Held (com nível)</legend>
        <div className="mt-3">
          <Field label="Held Level">
            <input value={form.held_level ?? ''} onChange={e => set('held_level', e.target.value || null)} className={inputCls} placeholder="ex: Level 7 Never Melt Ice +20%" />
          </Field>
        </div>
      </fieldset>

      {/* TMs */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">TMs</legend>
        <div className="mt-3 space-y-2">
          {form.tms.map((tm, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={tm.name}
                onChange={e => {
                  const tms = [...form.tms]
                  tms[i] = { ...tms[i], name: e.target.value }
                  set('tms', tms)
                }}
                placeholder="Nome"
                className={inputCls + ' flex-1'}
              />
              <input
                type="number"
                value={tm.level}
                onChange={e => {
                  const tms = [...form.tms]
                  tms[i] = { ...tms[i], level: Number(e.target.value) }
                  set('tms', tms)
                }}
                placeholder="Level"
                className={inputCls + ' w-24'}
              />
              <button type="button" onClick={() => set('tms', form.tms.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300 px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => set('tms', [...form.tms, { name: '', level: 0 }])}
            className="text-sm text-poke-yellow hover:underline">+ Adicionar TM</button>
        </div>
      </fieldset>

      {/* Move Upgrades */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Move Upgrades</legend>
        <div className="grid grid-cols-3 gap-3 mt-3 mb-3">
          <Field label="Slots usados">
            <input type="number" value={form.move_slots_used} onChange={e => set('move_slots_used', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Slots total">
            <input type="number" value={form.move_slots_total} onChange={e => set('move_slots_total', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Upgrades (ex: 5/5)">
            <input value={form.move_upgrades_count ?? ''} onChange={e => set('move_upgrades_count', e.target.value || null)} className={inputCls} />
          </Field>
        </div>
        <div className="space-y-2">
          {form.move_upgrades.map((m, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={m.name}
                onChange={e => {
                  const arr = [...form.move_upgrades]
                  arr[i] = { ...arr[i], name: e.target.value }
                  set('move_upgrades', arr)
                }}
                placeholder="Nome do golpe"
                className={inputCls + ' flex-1'}
              />
              <input
                type="number"
                value={m.level}
                onChange={e => {
                  const arr = [...form.move_upgrades]
                  arr[i] = { ...arr[i], level: Number(e.target.value) }
                  set('move_upgrades', arr)
                }}
                placeholder="Nível"
                className={inputCls + ' w-24'}
              />
              <button type="button" onClick={() => set('move_upgrades', form.move_upgrades.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300 px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => set('move_upgrades', [...form.move_upgrades, { name: '', level: 0 }])}
            className="text-sm text-poke-yellow hover:underline">+ Adicionar Move Upgrade</button>
        </div>
      </fieldset>

      {/* Vitamins */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Vitamins</legend>
        <div className="grid grid-cols-2 gap-3 mt-3 mb-3">
          <Field label="Usados">
            <input type="number" value={form.vitamins_used} onChange={e => set('vitamins_used', Number(e.target.value))} className={inputCls} />
          </Field>
          <Field label="Total">
            <input type="number" value={form.vitamins_total} onChange={e => set('vitamins_total', Number(e.target.value))} className={inputCls} />
          </Field>
        </div>
        <div className="space-y-2">
          {form.vitamin_details.map((v, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={v}
                onChange={e => {
                  const arr = [...form.vitamin_details]
                  arr[i] = e.target.value
                  set('vitamin_details', arr)
                }}
                className={inputCls + ' flex-1'}
              />
              <button type="button" onClick={() => set('vitamin_details', form.vitamin_details.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300 px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => set('vitamin_details', [...form.vitamin_details, ''])}
            className="text-sm text-poke-yellow hover:underline">+ Adicionar Vitamin</button>
        </div>
      </fieldset>

      {/* Extra Infos */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Extra Infos</legend>
        <div className="mt-3 space-y-2">
          {form.extra_infos.map((info, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={info}
                onChange={e => {
                  const arr = [...form.extra_infos]
                  arr[i] = e.target.value
                  set('extra_infos', arr)
                }}
                placeholder="ex: Clan Bonus: DMG +40% / DEF +40%"
                className={inputCls + ' flex-1'}
              />
              <button type="button" onClick={() => set('extra_infos', form.extra_infos.filter((_, j) => j !== i))}
                className="text-red-400 hover:text-red-300 px-2">&times;</button>
            </div>
          ))}
          <button type="button" onClick={() => set('extra_infos', [...form.extra_infos, ''])}
            className="text-sm text-poke-yellow hover:underline">+ Adicionar Info</button>
        </div>
      </fieldset>

      {/* Evolution */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Evolution</legend>
        <div className="mt-3">
          <Field label="Evolução">
            <input value={form.evolution ?? ''} onChange={e => set('evolution', e.target.value || null)} className={inputCls} placeholder="ex: None / Evolve with Fire Stone" />
          </Field>
        </div>
      </fieldset>

      {/* Listing info */}
      <fieldset className="bg-poke-card border border-poke-border rounded-xl p-5">
        <legend className="text-white font-semibold px-2">Anúncio</legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
          <Field label="Preço (R$)">
            <input type="number" step="0.01" min={0} value={form.price ?? ''} onChange={e => set('price', e.target.value ? Number(e.target.value) : null)} className={inputCls} />
          </Field>
          <Field label="Contato">
            <input value={form.contact ?? ''} onChange={e => set('contact', e.target.value || null)} className={inputCls} placeholder="Discord, WhatsApp, etc." />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descrição">
              <textarea value={form.description ?? ''} onChange={e => set('description', e.target.value || null)} rows={3} className={inputCls + ' resize-y'} />
            </Field>
          </div>
        </div>
      </fieldset>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={onCancel}
          className="px-6 py-2 rounded-lg border border-poke-border text-poke-muted hover:text-white hover:border-white/30 transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={saving}
          className="px-6 py-2 rounded-lg bg-poke-yellow text-black font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50">
          {saving ? 'Salvando…' : initial ? 'Atualizar' : 'Criar Anúncio'}
        </button>
      </div>
    </form>
  )
}

function Field({ label, children, required }: { label: string; children: React.ReactNode; required?: boolean }) {
  return (
    <div>
      <label className="block text-xs text-poke-muted mb-1">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = 'w-full bg-poke-dark border border-poke-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-poke-yellow/60 transition-colors'
