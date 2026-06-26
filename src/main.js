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

window.sendAIMessage = async () => {
  const input = document.getElementById('ai-input')
  const messages = document.getElementById('ai-messages')
  if (!input || !messages) return
  const text = input.value.trim()
  if (!text) return
  input.value = ''

  messages.innerHTML += '<div style="margin-bottom:8px"><strong style="color:#1a1c1e">You:</strong> ' + text + '</div>'

  const context = 'TGK Motorsport ERP data: '
    + S.parts.length + ' parts, '
    + S.assemblies.length + ' assemblies, '
    + S.sales.filter(s => s.fulfillment_status === 'Open').length + ' open orders, '
    + S.parts.filter(p => (p.total_unpckgd||0) <= 0).length + ' out of stock parts, '
    + S.purchases.filter(p => p.status === 'Ordered').length + ' open POs.'

  messages.innerHTML += '<div style="margin-bottom:8px;color:#8a9ba8">Thinking...</div>'
  messages.scrollTop = messages.scrollHeight

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        messages: [{ role: 'user', content: context + '\n\nQuestion: ' + text }]
      })
    })
    const data = await res.json()
    const reply = data.content?.[0]?.text || 'No response'
    const last = messages.lastElementChild
    if (last) last.remove()
    messages.innerHTML += '<div style="margin-bottom:8px"><strong style="color:#2ABFAA">AI:</strong> ' + reply + '</div>'
  } catch (e) {
    const last = messages.lastElementChild
    if (last) last.remove()
    messages.innerHTML += '<div style="margin-bottom:8px;color:#ef4444">Error: ' + e.message + '</div>'
  }
  messages.scrollTop = messages.scrollHeight
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