import { S } from '../utils/state.js'

export function renderInventory() {
  const sf = S.filters.inventory || {}
  let parts = [...S.parts]

  if (sf.search) {
    const q = sf.search.toLowerCase()
    parts = parts.filter(p =>
      (p.pn||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q)
    )
  }

  const lowStock = parts.filter(p => (p.total_unpckgd||0) < (p.min_qty||0) && (p.min_qty||0) > 0)

  const rows = parts.slice(0,200).map(p => {
    const stock = p.total_unpckgd || 0
    const min = p.min_qty || 0
    const isLow = min > 0 && stock < min
    const color = stock <= 0 ? '#ef4444' : isLow ? '#f59e0b' : '#22c55e'
    return '<tr style="border-bottom:1px solid #f1f5f9">'
      + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (p.pn||'') + '</td>'
      + '<td style="padding:9px 12px;color:#1a1c1e">' + (p.description||'') + '</td>'
      + '<td style="padding:9px 12px;text-align:right;font-weight:700;color:' + color + '">' + stock + '</td>'
      + '<td style="padding:9px 12px;text-align:right;color:#8a9ba8">' + (min||'') + '</td>'
      + '<td style="padding:9px 12px;text-align:right;color:#8a9ba8">' + (p.max_qty||'') + '</td>'
      + '<td style="padding:9px 12px;color:#4a5568">' + (p.location||'') + '</td>'
      + '</tr>'
  }).join('')

  return '<div style="display:flex;gap:8px;margin-bottom:16px">'
    + '<input placeholder="Part # or description" value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'inventory\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<span style="margin-left:auto;font-size:11px;color:#ef4444;font-weight:600">' + lowStock.length + ' below min</span>'
    + '<span style="font-size:11px;color:#8a9ba8;margin-left:8px">' + parts.length + ' parts</span>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">On Hand</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Min</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Max</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Location</th>'
    + '</tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table></div>'
}