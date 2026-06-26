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
  const statusCounts = {}
  statuses.forEach(st => {
    statusCounts[st] = S.sales.filter(s => (s.fulfillment_status||'Open') === st).length
  })

  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<input placeholder="Order #, SKU or customer..." value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'sales\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<button onclick="window.setFilter(\'sales\',\'status\',\'\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (!sf.status?'#2ABFAA':'#e2e8f0') + ';background:' + (!sf.status?'rgba(42,191,170,.1)':'#fff') + ';color:' + (!sf.status?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">All</button>'
    + statuses.map(st =>
        '<button onclick="window.setFilter(\'sales\',\'status\',\'' + st + '\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (sf.status===st?'#2ABFAA':'#e2e8f0') + ';background:' + (sf.status===st?'rgba(42,191,170,.1)':'#fff') + ';color:' + (sf.status===st?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">'
        + st + ' <span style="opacity:.6">(' + (statusCounts[st]||0) + ')</span></button>'
      ).join('')
    + '<span style="margin-left:auto;font-size:11px;color:#8a9ba8">' + orders.length + ' orders</span>'
    + '<button onclick="window.openAddOrder()" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ Order</button>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Date</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Order #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Customer</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">SKU</th>'
    + '<th style="padding:10px 12px;text-align:center;font-size:10px;color:#8a9ba8">Qty</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Status</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Tracking</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
    + '</tr></thead><tbody>'
    + orders.slice(0,200).map(s => {
        const status = s.fulfillment_status || 'Open'
        const colors = {Open:'#E07B28',Packed:'#8b5cf6',Partial:'#3b82f6',Shipped:'#2ABFAA',Delivered:'#22c55e','On Hold':'#f59e0b',Cancelled:'#ef4444',Refunded:'#8a9ba8'}
        const c = colors[status]||'#8a9ba8'
        return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
          + '<td style="padding:9px 12px;color:#8a9ba8">' + (s.sale_date||'—') + '</td>'
          + '<td style="padding:9px 12px;font-weight:700;color:#2ABFAA;cursor:pointer" onclick="window.openOrderDetail(\'' + s.id + '\')">' + (s.order_number||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (s.customer_name||'—') + '</td>'
          + '<td style="padding:9px 12px;font-family:monospace;color:#1a1c1e">' + (s.pn||'—') + '</td>'
          + '<td style="padding:9px 12px;text-align:center">' + (s.qty||1) + '</td>'
          + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + c + '22;color:' + c + ';font-size:10px;font-weight:700">' + status + '</span></td>'
          + '<td style="padding:9px 12px;color:#8a9ba8;font-size:11px">' + (s.tracking_number||'—') + '</td>'
          + '<td style="padding:9px 12px">'
          + (status === 'Open' || status === 'Packed'
              ? '<button onclick="window.markShipped(\'' + s.id + '\')" style="padding:3px 8px;background:#2ABFAA;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;margin-right:4px">Ship</button>'
              : '')
          + (status === 'Shipped'
              ? '<button onclick="window.markDelivered(\'' + s.id + '\')" style="padding:3px 8px;background:#22c55e;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer">Deliver</button>'
              : '')
          + '</td>'
          + '</tr>'
      }).join('')
    + '</tbody></table></div>'
}