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

// ── Modal helpers ──────────────────────────────────────────────────────────

function modal(content) {
  const ov = document.createElement('div')
  ov.id = 'tgk-modal'
  ov.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:center;justify-content:center;padding:20px;overflow-y:auto'
  ov.onclick = e => { if (e.target === ov) closeModal() }
  ov.innerHTML = '<div style="background:#fff;border-radius:10px;width:min(520px,95vw);max-height:90vh;overflow-y:auto;padding:24px;box-shadow:0 16px 48px rgba(0,0,0,.2)">' + content + '</div>'
  document.body.appendChild(ov)
  return ov
}

function closeModal() { document.getElementById('tgk-modal')?.remove() }
window.closeModal = closeModal

function mHeader(title) {
  return '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">'
    + '<div style="font-size:16px;font-weight:700;color:#1a1c1e">' + title + '</div>'
    + '<button onclick="closeModal()" style="background:none;border:none;font-size:20px;cursor:pointer;color:#8a9ba8">&times;</button>'
    + '</div>'
}

function mField(id, label, type, value, placeholder) {
  placeholder = placeholder || ''
  value = value !== null && value !== undefined ? value : ''
  return '<div style="margin-bottom:12px">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">' + label + '</div>'
    + (type === 'textarea'
      ? '<textarea id="' + id + '" placeholder="' + placeholder + '" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;box-sizing:border-box;resize:vertical;min-height:80px">' + value + '</textarea>'
      : '<input id="' + id + '" type="' + type + '" value="' + value + '" placeholder="' + placeholder + '" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;box-sizing:border-box">'
    ) + '</div>'
}

function mSelect(id, label, options, selectedVal) {
  return '<div style="margin-bottom:12px">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">' + label + '</div>'
    + '<select id="' + id + '" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px">'
    + options.map(o => '<option value="' + o + '"' + (o===selectedVal?' selected':'') + '>' + o + '</option>').join('')
    + '</select></div>'
}

function mFooter(extraBtns) {
  return '<div style="display:flex;gap:8px;justify-content:flex-end;margin-top:16px;padding-top:16px;border-top:1px solid #e2e8f0">'
    + (extraBtns || '')
    + '<button onclick="closeModal()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;cursor:pointer;background:#fff">Cancel</button>'
    + '<button onclick="window._pendingSave()" style="padding:8px 16px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Save</button>'
    + '</div>'
}

function g(id) { return (document.getElementById(id)?.value || '').trim() }
function setSyncStatus(msg, color) {
  const el = document.getElementById('sync-status')
  if (el) { el.textContent = msg; el.style.color = color || '#8a9ba8' }
}

// ── BOM ────────────────────────────────────────────────────────────────────

window.selectBOM = async (pn) => {
  if (!S.filters.boms) S.filters.boms = {}
  S.filters.boms.selected = pn
  if (!S.boms[pn]) {
    const { data } = await window.db.from('bom_items').select('*').eq('parent_pn', pn).order('sort_order')
    S.boms[pn] = data || []
  }
  render()
}

window.openAddBOMComponent = (parentPn) => {
  modal(mHeader('Add Component to ' + parentPn)
    + mField('bom-pn','Part # or Assembly','text','','e.g. TGK-BOLT-M8')
    + mField('bom-qty','Qty per Unit','number','1','')
    + mSelect('bom-type','Type',['part','assembly','subassembly'],'part')
    + mFooter()
  )
  window._pendingSave = async () => {
    const childPn = g('bom-pn').toUpperCase()
    const qty = parseFloat(g('bom-qty')) || 1
    const type = document.getElementById('bom-type')?.value || 'part'
    if (!childPn) { alert('Part # is required'); return }
    const sortOrder = (S.boms[parentPn]||[]).length + 1
    const { data, error } = await window.db.from('bom_items').insert({
      parent_pn: parentPn, child_pn: childPn, qty, item_type: type, sort_order: sortOrder
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    if (!S.boms[parentPn]) S.boms[parentPn] = []
    S.boms[parentPn] = [...S.boms[parentPn], data]
    closeModal()
    render()
  }
}

window.removeBOMComponent = async (itemId, parentPn) => {
  if (!confirm('Remove this component from the BOM?')) return
  const { error } = await window.db.from('bom_items').delete().eq('id', itemId)
  if (error) { alert('Error: ' + error.message); return }
  if (S.boms[parentPn]) S.boms[parentPn] = S.boms[parentPn].filter(b => b.id !== itemId)
  render()
}

// ── AI ─────────────────────────────────────────────────────────────────────

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
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: context + '\n\nQuestion: ' + text }] })
    })
    const data = await res.json()
    messages.lastElementChild?.remove()
    messages.innerHTML += '<div style="margin-bottom:8px"><strong style="color:#2ABFAA">AI:</strong> ' + (data.content?.[0]?.text||'No response') + '</div>'
  } catch (e) {
    messages.lastElementChild?.remove()
    messages.innerHTML += '<div style="margin-bottom:8px;color:#ef4444">Error: ' + e.message + '</div>'
  }
  messages.scrollTop = messages.scrollHeight
}

// ── SHOPIFY SYNC ───────────────────────────────────────────────────────────

window.syncOrders = async () => {
  const store = S.shopify?.store
  const key = S.shopify?.key
  if (!store || !key) {
    alert('Shopify credentials not configured. Go to Settings in the HTML ERP to set up credentials.')
    return
  }
  setSyncStatus('Syncing...', '#E07B28')
  try {
    const since = new Date(Date.now() - 90*24*60*60*1000).toISOString()
    const res = await fetch('https://piamamighqiielfztgic.supabase.co/functions/v1/shopify-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYW1hbWlnaHFpaWVsZnp0Z2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjkxMzUsImV4cCI6MjA5MzQ0NTEzNX0.YwLflTw6F4cRzmY78QoAY6Zud2IHGVP5xL_yvMFxheA' },
      body: JSON.stringify({ action: 'sync', store, key, since, page_info: '' })
    })
    const json = await res.json()
    if (json.error) { setSyncStatus('Error: ' + json.error, '#ef4444'); return }
    const orders = json.orders || []
    setSyncStatus('Fetched ' + orders.length + ' orders from Shopify', '#22c55e')
    // Reload sales from DB after sync
    setTimeout(async () => {
      const { data } = await window.db.from('sales').select('*').order('sale_date', { ascending: false }).limit(5000)
      if (data) { S.sales = data; render() }
      setSyncStatus('Sync complete', '#22c55e')
      setTimeout(() => setSyncStatus('', ''), 3000)
    }, 2000)
  } catch (e) {
    setSyncStatus('Sync failed: ' + e.message, '#ef4444')
  }
}

// ── SALES ──────────────────────────────────────────────────────────────────

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

window.cancelOrder = async (id) => {
  if (!confirm('Cancel this order?')) return
  const updates = { fulfillment_status: 'Cancelled', cancelled_at: new Date().toISOString() }
  const { error } = await window.db.from('sales').update(updates).eq('id', id)
  if (error) { alert('Error: ' + error.message); return }
  S.sales = S.sales.map(s => s.id === id ? {...s, ...updates} : s)
  render()
}

window.openOrderDetail = (id) => {
  const sale = S.sales.find(s => s.id === id)
  if (!sale) return
  const f = (label, value) => '<div><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px">' + label + '</div><div style="color:#1a1c1e;font-weight:500">' + (value||'—') + '</div></div>'
  modal(mHeader(sale.order_number||'Order')
    + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:12px;margin-bottom:16px">'
    + f('Customer', sale.customer_name) + f('Email', sale.customer_email)
    + f('Phone', sale.customer_phone) + f('Date', sale.sale_date)
    + f('Status', sale.fulfillment_status||'Open') + f('Source', sale.source)
    + f('SKU', sale.pn) + f('Qty', sale.qty)
    + f('Tracking', sale.tracking_number) + f('Carrier', sale.carrier)
    + '</div>'
    + '<div style="font-size:12px;font-weight:700;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px">Shipping Address</div>'
    + '<div style="font-size:12px;color:#4a5568;line-height:1.8;margin-bottom:16px">'
    + [sale.shipping_address1, sale.shipping_address2, sale.shipping_city, sale.shipping_province, sale.shipping_zip, sale.shipping_country].filter(Boolean).join('<br>')
    + '</div>'
    + '<div style="display:flex;gap:8px;padding-top:16px;border-top:1px solid #e2e8f0">'
    + (sale.fulfillment_status === 'Open' || sale.fulfillment_status === 'Packed'
        ? '<button onclick="closeModal();window.markShipped(\'' + id + '\')" style="padding:8px 16px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Mark Shipped</button>'
        : '')
    + (sale.fulfillment_status === 'Shipped'
        ? '<button onclick="closeModal();window.markDelivered(\'' + id + '\')" style="padding:8px 16px;background:#22c55e;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">Mark Delivered</button>'
        : '')
    + '<button onclick="closeModal()" style="padding:8px 16px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;cursor:pointer;background:#fff;margin-left:auto">Close</button>'
    + '</div>'
  )
}

window.openAddOrder = () => {
  modal(mHeader('Add Order')
    + mField('o-num','Order #','text','','#9401')
    + mField('o-pn','Part # (SKU)','text','','')
    + mField('o-qty','Quantity','number','1','')
    + mField('o-cust','Customer Name','text','','')
    + mField('o-email','Customer Email','email','','')
    + mField('o-date','Order Date','date',new Date().toISOString().slice(0,10),'')
    + mFooter()
  )
  window._pendingSave = async () => {
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
    closeModal()
    render()
  }
}

// ── PACK QUEUE ─────────────────────────────────────────────────────────────

window.packLine = async (id) => {
  const { error } = await window.db.from('sales').update({ fulfillment_status: 'Packed' }).eq('id', id)
  if (error) { alert('Error: ' + error.message); return }
  S.sales = S.sales.map(s => s.id === id ? {...s, fulfillment_status: 'Packed'} : s)
  render()
}

window.packOrder = async (orderNumber) => {
  const lines = S.sales.filter(s => s.order_number === orderNumber && s.fulfillment_status === 'Open')
  for (const line of lines) {
    await window.db.from('sales').update({ fulfillment_status: 'Packed' }).eq('id', line.id)
    S.sales = S.sales.map(s => s.id === line.id ? {...s, fulfillment_status: 'Packed'} : s)
  }
  render()
}

window.shipOrder = async (orderNumber) => {
  const tracking = prompt('Enter tracking number for ' + orderNumber + ':')
  const lines = S.sales.filter(s => s.order_number === orderNumber && (s.fulfillment_status === 'Open' || s.fulfillment_status === 'Packed'))
  const updates = { fulfillment_status: 'Shipped', shipped_at: new Date().toISOString() }
  if (tracking) updates.tracking_number = tracking
  for (const line of lines) {
    await window.db.from('sales').update(updates).eq('id', line.id)
    S.sales = S.sales.map(s => s.id === line.id ? {...s, ...updates} : s)
  }
  render()
}

// ── PARTS ──────────────────────────────────────────────────────────────────

window.openAddPart = () => {
  modal(mHeader('Add Part')
    + mField('p-pn','Part #','text','','')
    + mField('p-desc','Description','text','','')
    + mField('p-vendor','Vendor','text','','')
    + mField('p-cat','Category','text','','')
    + mField('p-cost','Unit Cost','number','0','')
    + mField('p-min','Min Qty','number','0','')
    + mField('p-max','Max Qty','number','0','')
    + mField('p-loc','Location','text','','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const pn = g('p-pn').toUpperCase()
    if (!pn) { alert('Part # is required'); return }
    const { data, error } = await window.db.from('parts').insert({
      pn, description: g('p-desc'),
      vendor: g('p-vendor') || null,
      category: g('p-cat') || null,
      unit_cost: parseFloat(g('p-cost')) || 0,
      min_qty: parseFloat(g('p-min')) || 0,
      max_qty: parseFloat(g('p-max')) || 0,
      location: g('p-loc') || null,
      total_unpckgd: 0
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    S.parts = [...S.parts, data].sort((a,b) => a.pn.localeCompare(b.pn))
    closeModal()
    render()
  }
}

window.openEditPart = (id) => {
  const p = S.parts.find(x => x.id === id)
  if (!p) return
  modal(mHeader('Edit Part — ' + p.pn)
    + mField('p-desc','Description','text', p.description||'','')
    + mField('p-vendor','Vendor','text', p.vendor||'','')
    + mField('p-cat','Category','text', p.category||'','')
    + mField('p-cost','Unit Cost','number', p.unit_cost||0,'')
    + mField('p-min','Min Qty','number', p.min_qty||0,'')
    + mField('p-max','Max Qty','number', p.max_qty||0,'')
    + mField('p-loc','Location','text', p.location||'','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const updates = {
      description: g('p-desc'),
      vendor: g('p-vendor') || null,
      category: g('p-cat') || null,
      unit_cost: parseFloat(g('p-cost')) || 0,
      min_qty: parseFloat(g('p-min')) || 0,
      max_qty: parseFloat(g('p-max')) || 0,
      location: g('p-loc') || null,
      updated_at: new Date().toISOString()
    }
    const { error } = await window.db.from('parts').update(updates).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.parts = S.parts.map(x => x.id === id ? {...x, ...updates} : x)
    closeModal()
    render()
  }
}

window.adjustStock = (id, pn, current) => {
  modal(mHeader('Adjust Stock — ' + pn)
    + '<div style="font-size:12px;color:#8a9ba8;margin-bottom:16px">Current stock: <strong style="color:#1a1c1e">' + current + '</strong></div>'
    + mField('s-qty','New Stock Count','number', current,'')
    + mField('s-note','Note (optional)','text','','Reason for adjustment')
    + mFooter()
  )
  window._pendingSave = async () => {
    const newQty = parseInt(g('s-qty'))
    if (isNaN(newQty)) { alert('Enter a valid number'); return }
    const { error } = await window.db.from('parts').update({ total_unpckgd: newQty, updated_at: new Date().toISOString() }).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.parts = S.parts.map(x => x.id === id ? {...x, total_unpckgd: newQty} : x)
    closeModal()
    render()
  }
}

// ── ASSEMBLIES ─────────────────────────────────────────────────────────────

window.openAddAssembly = () => {
  modal(mHeader('Add Assembly')
    + mField('a-pn','Part #','text','','')
    + mField('a-desc','Description','text','','')
    + mField('a-cat','Category','text','','')
    + mField('a-msrp','MSRP','number','0','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const pn = g('a-pn').toUpperCase()
    if (!pn) { alert('Part # is required'); return }
    const { data, error } = await window.db.from('assemblies').insert({
      pn, description: g('a-desc'),
      category: g('a-cat') || null,
      msrp: parseFloat(g('a-msrp')) || 0,
      is_subassembly: false, discontinued: false, total_on_hand: 0
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    S.assemblies = [...S.assemblies, data].sort((a,b) => a.pn.localeCompare(b.pn))
    closeModal()
    render()
  }
}

window.openEditAssembly = (id) => {
  const a = S.assemblies.find(x => x.id === id)
  if (!a) return
  modal(mHeader('Edit Assembly — ' + a.pn)
    + mField('a-desc','Description','text', a.description||'','')
    + mField('a-cat','Category','text', a.category||'','')
    + mField('a-msrp','MSRP','number', a.msrp||0,'')
    + mField('a-ship-us','Shipping US','text', a.ship_us||'','FREE')
    + mField('a-ship-ca','Shipping CA','text', a.ship_ca||'','$25.00')
    + mField('a-pl-notes','Price List Notes','text', a.pl_notes||'','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const updates = {
      description: g('a-desc'),
      category: g('a-cat') || null,
      msrp: parseFloat(g('a-msrp')) || 0,
      ship_us: g('a-ship-us') || null,
      ship_ca: g('a-ship-ca') || null,
      pl_notes: g('a-pl-notes') || null,
      updated_at: new Date().toISOString()
    }
    const { error } = await window.db.from('assemblies').update(updates).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.assemblies = S.assemblies.map(x => x.id === id ? {...x, ...updates} : x)
    closeModal()
    render()
  }
}

// ── PURCHASE ORDERS ────────────────────────────────────────────────────────

window.openAddPO = () => {
  const vendors = [...new Set(S.parts.map(p => p.vendor).filter(Boolean))].sort()
  const vendorOpts = vendors.map(v => '<option value="' + v + '">' + v + '</option>').join('')
  modal(mHeader('Add Purchase Order')
    + '<div style="margin-bottom:12px"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px">Vendor</div>'
    + '<select id="po-vendor" style="width:100%;padding:8px 10px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px"><option value="">Select vendor...</option>' + vendorOpts + '</select></div>'
    + mField('po-pn','Part #','text','','')
    + mField('po-qty','Quantity','number','1','')
    + mField('po-cost','Unit Cost','number','0','')
    + mField('po-date','Order Date','date',new Date().toISOString().slice(0,10),'')
    + mField('po-eta','Expected Delivery','date','','')
    + mField('po-num','PO Number (optional)','text','','PO-001')
    + mFooter()
  )
  window._pendingSave = async () => {
    const vendor = document.getElementById('po-vendor')?.value || ''
    const pn = g('po-pn').toUpperCase()
    const qty = parseInt(g('po-qty')) || 1
    const cost = parseFloat(g('po-cost')) || 0
    if (!vendor || !pn) { alert('Vendor and Part # are required'); return }
    const { data, error } = await window.db.from('purchases').insert({
      vendor, pn, qty, unit_cost: cost, total_cost: cost * qty,
      order_date: g('po-date'), expected_date: g('po-eta') || null,
      order_number: g('po-num') || null, status: 'Ordered'
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    S.purchases = [data, ...S.purchases]
    closeModal()
    render()
  }
}

window.markPOReceived = async (id) => {
  if (!confirm('Mark this PO as Received?')) return
  const updates = { status: 'Received', received_date: new Date().toISOString().slice(0,10) }
  const { error } = await window.db.from('purchases').update(updates).eq('id', id)
  if (error) { alert('Error: ' + error.message); return }
  S.purchases = S.purchases.map(p => p.id === id ? {...p, ...updates} : p)
  render()
}

window.openEditPO = (id) => {
  const p = S.purchases.find(x => x.id === id)
  if (!p) return
  modal(mHeader('Edit PO — ' + (p.order_number||p.pn))
    + mSelect('po-status','Status',['Ordered','Partial','Received','Cancelled'], p.status||'Ordered')
    + mField('po-qty','Quantity','number', p.qty||1,'')
    + mField('po-cost','Unit Cost','number', p.unit_cost||0,'')
    + mField('po-eta','Expected Delivery','date', p.expected_date||'','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const qty = parseInt(g('po-qty')) || 1
    const cost = parseFloat(g('po-cost')) || 0
    const updates = {
      status: document.getElementById('po-status')?.value || p.status,
      qty, unit_cost: cost, total_cost: cost * qty,
      expected_date: g('po-eta') || null
    }
    const { error } = await window.db.from('purchases').update(updates).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.purchases = S.purchases.map(x => x.id === id ? {...x, ...updates} : x)
    closeModal()
    render()
  }
}

// ── WARRANTY CLAIMS ────────────────────────────────────────────────────────

window.openAddClaim = () => {
  modal(mHeader('Add Warranty Claim')
    + mField('w-order','Order #','text','','')
    + mField('w-pn','Part #','text','','')
    + mField('w-customer','Customer Name','text','','')
    + mField('w-issue','Issue Description','textarea','','Describe the problem...')
    + mSelect('w-status','Status',['Open','Resolved','Closed'],'Open')
    + mFooter()
  )
  window._pendingSave = async () => {
    const orderNum = g('w-order')
    const pn = g('w-pn').toUpperCase()
    if (!orderNum) { alert('Order # is required'); return }
    const { data, error } = await window.db.from('warranty_claims').insert({
      order_number: orderNum,
      pn: pn || null,
      customer_name: g('w-customer') || null,
      issue: g('w-issue') || null,
      status: document.getElementById('w-status')?.value || 'Open'
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    S.warrantyClaims = [data, ...S.warrantyClaims]
    closeModal()
    render()
  }
}

window.openEditClaim = (id) => {
  const c = S.warrantyClaims.find(x => x.id === id)
  if (!c) return
  modal(mHeader('Edit Claim — ' + (c.order_number||''))
    + mField('w-pn','Part #','text', c.pn||'','')
    + mField('w-customer','Customer','text', c.customer_name||'','')
    + mField('w-issue','Issue','textarea', c.issue||'','')
    + mField('w-resolution','Resolution','textarea', c.resolution||'','What was done to resolve...')
    + mSelect('w-status','Status',['Open','Resolved','Closed'], c.status||'Open')
    + mFooter()
  )
  window._pendingSave = async () => {
    const updates = {
      pn: g('w-pn').toUpperCase() || null,
      customer_name: g('w-customer') || null,
      issue: g('w-issue') || null,
      resolution: g('w-resolution') || null,
      status: document.getElementById('w-status')?.value || c.status
    }
    const { error } = await window.db.from('warranty_claims').update(updates).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.warrantyClaims = S.warrantyClaims.map(x => x.id === id ? {...x, ...updates} : x)
    closeModal()
    render()
  }
}

// ── DEALERS ────────────────────────────────────────────────────────────────

window.openAddDealer = () => {
  modal(mHeader('Add Dealer')
    + mField('d-name','Dealer Name','text','','')
    + mField('d-contact','Contact Name','text','','')
    + mField('d-email','Email','email','','')
    + mField('d-phone','Phone','text','','')
    + mField('d-disc','Discount %','number','20','')
    + mFooter()
  )
  window._pendingSave = async () => {
    const name = g('d-name')
    if (!name) { alert('Dealer name is required'); return }
    const { data, error } = await window.db.from('dealers').insert({
      name,
      contact_name: g('d-contact') || null,
      contact_email: g('d-email') || null,
      contact_phone: g('d-phone') || null,
      discount_pct: parseFloat(g('d-disc')) || 20,
      status: 'Active'
    }).select().single()
    if (error) { alert('Error: ' + error.message); return }
    S.dealers = [...S.dealers, data].sort((a,b) => a.name.localeCompare(b.name))
    closeModal()
    render()
  }
}

window.openEditDealer = (id) => {
  const d = S.dealers.find(x => x.id === id)
  if (!d) return
  modal(mHeader('Edit Dealer — ' + d.name)
    + mField('d-contact','Contact Name','text', d.contact_name||'','')
    + mField('d-email','Email','email', d.contact_email||'','')
    + mField('d-phone','Phone','text', d.contact_phone||'','')
    + mField('d-disc','Discount %','number', d.discount_pct||20,'')
    + mSelect('d-status','Status',['Active','Inactive'], d.status||'Active')
    + mFooter()
  )
  window._pendingSave = async () => {
    const updates = {
      contact_name: g('d-contact') || null,
      contact_email: g('d-email') || null,
      contact_phone: g('d-phone') || null,
      discount_pct: parseFloat(g('d-disc')) || 20,
      status: document.getElementById('d-status')?.value || d.status
    }
    const { error } = await window.db.from('dealers').update(updates).eq('id', id)
    if (error) { alert('Error: ' + error.message); return }
    S.dealers = S.dealers.map(x => x.id === id ? {...x, ...updates} : x)
    closeModal()
    render()
  }
}

// ── INIT ───────────────────────────────────────────────────────────────────

async function start() {
  const db = await initSupabase()
  if (!db) return
  window.db = db
  await loadAll(db)
  render()
  setupRealtime(db)
}

start()