import './style.css'
import { initSupabase } from './utils/supabase.js'
import { loadAll } from './utils/data.js'
import { render } from './views/render.js'
import { setupRealtime } from './utils/realtime.js'
import { nav } from './utils/nav.js'
import { S } from './utils/state.js'

window.nav = nav
window.S = S
window.setFilter = (section, key, val) => {
  if (!S.filters[section]) S.filters[section] = {}
  S.filters[section][key] = val
  render()
}
window.selectBOM = async (pn) => {
  if (!S.filters.boms) S.filters.boms = {}
  S.filters.boms.selected = pn
  if (!S.boms[pn]) {
    const { data } = await window.db.from('bom_items').select('*').eq('parent_pn', pn).order('sort_order')
    S.boms[pn] = data || []
  }
  render()
}

async function start() {
  const db = await initSupabase()
  if (!db) return
  window.db = db
  await loadAll(db)
  render()
  setupRealtime(db)
}

start()