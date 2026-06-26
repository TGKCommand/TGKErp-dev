import { S } from '../utils/state.js'

export function renderDealers() {
  const sf = S.filters.dealers || {}
  let dealers = [...S.dealers]
  if (sf.search) {
    const q = sf.search.toLowerCase()
    dealers = dealers.filter(d =>
      (d.name||'').toLowerCase().includes(q) ||
      (d.contact_email||'').toLowerCase().includes(q)
    )
  }

  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">'
    + '<input placeholder="Dealer name or email" value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'dealers\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<span style="margin-left:auto;font-size:11px;color:#8a9ba8">' + dealers.length + ' dealers</span>'
    + '<button onclick="window.openAddDealer()" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ Dealer</button>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Dealer</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Contact</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Email</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Discount</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Status</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
    + '</tr></thead><tbody>'
    + dealers.map(d => {
        const col = d.status === 'Active' ? '#22c55e' : '#ef4444'
        return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
          + '<td style="padding:9px 12px;font-weight:700;color:#1a1c1e">' + (d.name||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (d.contact_name||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#2ABFAA">' + (d.contact_email||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#E07B28;font-weight:700">' + (d.discount_pct ? d.discount_pct+'% off' : '—') + '</td>'
          + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + col + '22;color:' + col + ';font-size:10px;font-weight:700">' + (d.status||'Active') + '</span></td>'
          + '<td style="padding:9px 12px">'
          + '<button onclick="window.openEditDealer(\'' + d.id + '\')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Edit</button>'
          + '</td>'
          + '</tr>'
      }).join('')
    + '</tbody></table></div>'
}