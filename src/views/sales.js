import { S } from '../utils/state.js'

export function renderSales() {
  const sf = S.filters.sales || {}
  let orders = S.sales.filter(s => !s.order_number?.startsWith('Warranty_'))

  if (sf.search) {
    const q = sf.search.toLowerCase()
    orders = orders.filter(s =>
      (s.order_number||'').toLowerCase().includes(q) ||
      (s.pn||'').toLowerCase().includes(q) ||
      (s.customer_name||'').toLowerCase().includes(q)
    )
  }
  if (sf.status) orders = orders.filter(s => (s.fulfillment_status||'Open') === sf.status)

  const statuses = ['Open','Packed','Partial','Shipped','Delivered','On Hold','Cancelled','Refunded']

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <input
        placeholder="Order #, SKU or customer…"
        value="${sf.search||''}"
        oninput="window.setFilter('sales','search',this.value)"
        style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px"
      >
      <button onclick="window.setFilter('sales','status','')"
        style="padding:5px 12px;border-radius:20px;border:1px solid ${!sf.status?'#2ABFAA':'#e2e8f0'};background:${!sf.status?'rgba(42,191,170,.1)':'#fff'};color:${!sf.status?'#2ABFAA':'#4a5568'};font-size:11px;cursor:pointer">
        All
      </button>
      ${statuses.map(st=>`
        <button onclick="window.setFilter('sales','status','${st}')"
          style="padding:5px 12px;border-radius:20px;border:1px solid ${sf.status===st?'#2ABFAA':'#e2e8f0'};background:${sf.status===st?'rgba(42,191,170,.1)':'#fff'};color:${sf.status===st?'#2ABFAA':'#4a5568'};font-size:11px;cursor:pointer">
          ${st}
        </button>
      `).join('')}
      <span style="margin-left:auto;font-size:11px;color:#8a9ba8">${orders.length} orders</span>
    </div>
    <div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Date</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Order #</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Customer</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">SKU</th>
            <th style="padding:10px 12px;text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Qty</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Status</th>
          </tr>
        </thead>
        <tbody>
          ${orders.slice(0,100).map(s=>`
            <tr style="border-bottom:1px solid #f1f5f9;cursor:pointer" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:9px 12px;color:#8a9ba8">${s.sale_date||'—'}</td>
              <td style="padding:9px 12px;font-weight:700;color:#2ABFAA">${s.order_number||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${s.customer_name||'—'}</td>
              <td style="padding:9px 12px;font-family:monospace;color:#1a1c1e">${s.pn||'—'}</td>
              <td style="padding:9px 12px;text-align:center">${s.qty||1}</td>
              <td style="padding:9px 12px">${statusBadge(s.fulfillment_status||'Open')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

function statusBadge(status) {
  const colors = {
    Open:'#E07B28',Packed:'#8b5cf6',Partial:'#3b82f6',
    Shipped:'#2ABFAA',Delivered:'#22c55e','On Hold':'#f59e0b',
    Cancelled:'#ef4444',Refunded:'#8a9ba8'
  }
  const c = colors[status]||'#8a9ba8'
  return `<span style="padding:2px 8px;border-radius:10px;background:${c}22;color:${c};font-size:10px;font-weight:700">${status}</span>`
}