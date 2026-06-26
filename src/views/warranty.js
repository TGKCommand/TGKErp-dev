import { S } from '../utils/state.js'

export function renderWarranty() {
  const claims = S.warrantyClaims || []
  const sf = S.filters.warranty || {}

  let filtered = [...claims]
  if (sf.status) filtered = filtered.filter(c => c.status === sf.status)
  if (sf.search) {
    const q = sf.search.toLowerCase()
    filtered = filtered.filter(c =>
      (c.order_number||'').toLowerCase().includes(q) ||
      (c.customer_name||'').toLowerCase().includes(q) ||
      (c.pn||'').toLowerCase().includes(q)
    )
  }

  const open = claims.filter(c => c.status === 'Open').length

  return '<div style="display:flex;gap:16px;margin-bottom:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Open Claims</div><div style="font-size:24px;font-weight:800;color:#ef4444">' + open + '</div></div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Total Claims</div><div style="font-size:24px;font-weight:800;color:#1a1c1e">' + claims.length + '</div></div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<input placeholder="Order #, customer or part..." value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'warranty\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<button onclick="window.setFilter(\'warranty\',\'status\',\'\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (!sf.status?'#2ABFAA':'#e2e8f0') + ';background:' + (!sf.status?'rgba(42,191,170,.1)':'#fff') + ';color:' + (!sf.status?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">All</button>'
    + ['Open','Resolved','Closed'].map(st =>
        '<button onclick="window.setFilter(\'warranty\',\'status\',\'' + st + '\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (sf.status===st?'#2ABFAA':'#e2e8f0') + ';background:' + (sf.status===st?'rgba(42,191,170,.1)':'#fff') + ';color:' + (sf.status===st?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">' + st + '</button>'
      ).join('')
    + '<button onclick="window.openAddClaim()" style="padding:7px 14px;background:#ef4444;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;margin-left:auto">+ Claim</button>'
    + '</div>'
    + (filtered.length === 0
      ? '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:40px;text-align:center;color:#8a9ba8">No claims found</div>'
      : '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
        + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
        + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Order #</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Customer</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Issue</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Status</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Date</th>'
        + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
        + '</tr></thead><tbody>'
        + filtered.map(c => {
            const colors = {Open:'#ef4444',Resolved:'#22c55e',Closed:'#8a9ba8'}
            const col = colors[c.status]||'#8a9ba8'
            return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
              + '<td style="padding:9px 12px;font-weight:700;color:#2ABFAA">' + (c.order_number||'—') + '</td>'
              + '<td style="padding:9px 12px">' + (c.customer_name||'—') + '</td>'
              + '<td style="padding:9px 12px;font-family:monospace">' + (c.pn||'—') + '</td>'
              + '<td style="padding:9px 12px;color:#4a5568;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (c.issue||'—') + '</td>'
              + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + col + '22;color:' + col + ';font-size:10px;font-weight:700">' + (c.status||'—') + '</span></td>'
              + '<td style="padding:9px 12px;color:#8a9ba8">' + (c.created_at||'').slice(0,10) + '</td>'
              + '<td style="padding:9px 12px">'
              + '<button onclick="window.openEditClaim(\'' + c.id + '\')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Edit</button>'
              + '</td>'
              + '</tr>'
          }).join('')
        + '</tbody></table></div>'
    )
}