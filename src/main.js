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
  const context = 'TGK Motorsport ERP: ' + S.parts.length + ' parts, ' + S.assemblies.length + ' assemblies, '
    + S.sales.filter(s => s.fulfillment_status === 'Open').length + ' open orders, '
    + S.parts.filter(p => (p.total_unpckgd||0) <= 0).length + ' out of stock, '
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
    messages.lastElementChild?.remove()
    messages.innerHTML += '<div style="margin-bottom:8px"><strong style="color:#2ABFAA">AI:</strong> ' + reply + '</div>'
  } catch (e) {
    messages.lastElementChild?.remove()
    messages.innerHTML += '<div style="margin-bottom:8px;color:#ef4444">Error: ' + e.message + '</div>'
  }
  messages.scrollTop = messages.scrollHeight
}

window.markShipped = async (id) => {
  const tracking = prompt('Enter tracking number (optional):')
  const updates = { fulfillment_status: 'Shipped', shipped_at: new Date().toISOString() }
  if (tracking) updates.tracking_number = tracking
  const { error } = await window.db.from('sales').update(updates).eq('id', id)
  if (error) { alert('Error: ' + error.message); return }
  S.sales = S.sales.map(s => s.id === id ? {...s, ...updates} : s)
  render()
}

window.markDelivered = async (id) => {
  if (!confirm('Mark as Delivered?')) return
  const updates = { fulfillment_status: 'Delivered', delivered_at: new Date().toISOString() }
  const { error } = await window.db.from('sales').update(updates).eq('id', id)
  if (error) { alert('Error: ' + error.message); return }
  S.sales = S.sales.map(s => s.id === id ? {...s, ...updates} : s)
  render()
}

window.openOrderDetail = (id) => {
  const sale = S.sales.find(s => s.id === id)
  if (!sale) return
  const ov = document.createElement('div')
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px'
  ov.onclick = e => { if (e.target === ov) ov.remove() }
  const f = (label, value) => '<div><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">' + label + '</div><div style="color:#1a1c1e;font-weight:500">' + (value||'—') + '</div></div>'
  ov.innerHTML = '<div style="background:#fff;border-radius:10px;width:min(560px,95vw);max-height:85vh;overflow-y:auto;padding:24px;box-shadow:0 16px 48px rgba(0,0,0,.2)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<div style="font-size:16px;font-weight:700;color:#2ABFAA">' + (sale.order_number||'Order') + '</div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#8a9ba8">&times;</button>'
    + '</div>'
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;margin-bottom:16px">'
    + f('Customer', sale.customer_name) + f('Email', sale.customer_email)
    + f('Phone', sale.customer_phone) + f('Date', sale.sale_date)
    + f('Status', sale.fulfillment_status||'Open') + f('Source', sale.source)
    + f('SKU', sale.pn) + f('Qty', sale.qty)
    + f('Tracking', sale.tracking_number) + f('Carrier', sale.carrier)
    + '</div>'
    + '<div style="font-size:12px;font-weight:700;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Shipping Address</div>'
    + '<div style="font-size:12px;color:#4a5568;line-height:1.8">'
    + [sale.shipping_address1, sale.shipping_address2, sale.shipping_city, sale.shipping_province, sale.shipping_zip, sale.shipping_country].filter(Boolean).join('<br>')
    + '</div></div>'
  document.body.appendChild(ov)
}

window.openAddOrder = () => {
  const ov = document.createElement('div')
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px'
  ov.onclick = e => { if (e.target === ov) ov.remove() }
  const inp = (id, label, type, ph) => '<div><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">' + label + '</div>'
    + '<input id="' + id + '" type="' + type + '" placeholder="' + ph + '" value="' + (type==='date'?new Date().toISOString().slice(0,10):'') + '"'
    + ' style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;box-sizing:border-box"></div>'
  ov.innerHTML = '<div style="background:#fff;border-radius:10px;width:min(480px,95vw);padding:24px;box-shadow:0 16px 48px rgba(0,0,0,.2)">'
    + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<div style="font-size:16px;font-weight:700">Add Order</div>'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#8a9ba8">&times;</button>'
    + '</div>'
    + '<div style="display:grid;gap:12px;font-size:12px">'
    + inp('o-num','Order #','text','#9401')
    + inp('o-pn','Part # (SKU)','text','')
    + inp('o-qty','Quantity','number','1')
    + inp('o-cust','Customer Name','text','')
    + inp('o-email','Customer Email','email','')
    + inp('o-date','Order Date','date','')
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end">'
    + '<button onclick="this.closest(\'div[style*=fixed]\').remove()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;cursor:pointer;background:#fff">Cancel</button>'
    + '<button onclick="window.saveNewOrder()" style="padding:8px 16px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Save Order</button>'
    + '</div></div>'
  document.body.appendChild(ov)
}

window.saveNewOrder = async () => {
  const g = id => document.getElementById(id)?.value?.trim() || ''
  const orderNum = g('o-num')
  const pn = g('o-pn').toUpperCase()
  const qty = parseInt(g('o-qty')) || 1
  if (!orderNum || !pn) { alert('Order # and Part # are required'); return }
  const { data, error } = await window.db.from('sales').insert({
    order_number: orderNum, pn, qty,
    customer_name: g('o-cust') || null,
    customer_email: g('o-email') || null,
    sale_date: g('o-date'),
    fulfillment_status: 'Open',
    source: 'Manual'
  }).select().single()
  if (error) { alert('Error: ' + error.message); return }
  S.sales = [data, ...S.sales]
  document.querySelector('div[style*="position:fixed"]')?.remove()
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