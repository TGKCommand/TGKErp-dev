import { S } from '../utils/state.js'

export function renderPlanning() {
  const parts = S.parts.filter(p => !p.discontinued)
  
  const reorder = parts.filter(p => {
    const stock = p.total_unpckgd || 0
    const min = p.min_qty || 0
    const safety = p.safety_stock || 0
    return min > 0 && stock <= (min + safety)
  }).sort((a,b) => {
    const aUrgency = (a.total_unpckgd||0) - (a.min_qty||0)
    const bUrgency = (b.total_unpckgd||0) - (b.min_qty||0)
    return aUrgency - bUrgency
  })

  const rows = reorder.map(p => {
    const stock = p.total_unpckgd || 0
    const min = p.min_qty || 0
    const max = p.max_qty || 0
    const toOrder = Math.max(0, max - stock) || min
    const cost = (p.unit_cost||0) * toOrder
    const isOut = stock <= 0
    return '<tr style="border-bottom:1px solid #f1f5f9">'
      + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (p.pn||'') + '</td>'
      + '<td style="padding:9px 12px;color:#1a1c1e">' + (p.description||'') + '</td>'
      + '<td style="padding:9px 12px;color:#4a5568">' + (p.vendor||'—') + '</td>'
      + '<td style="padding:9px 12px;text-align:right;font-weight:700;color:' + (isOut?'#ef4444':'#f59e0b') + '">' + stock + '</td>'
      + '<td style="padding:9px 12px;text-align:right;color:#8a9ba8">' + min + '</td>'
      + '<td style="padding:9px 12px;text-align:right;font-weight:700;color:#E07B28">' + toOrder + '</td>'
      + '<td style="padding:9px 12px;text-align:right;color:#1a1c1e">$' + cost.toFixed(2) + '</td>'
      + '<td style="padding:9px 12px;color:#8a9ba8">' + (p.lead_time_weeks ? p.lead_time_weeks+'w' : '—') + '</td>'
      + '</tr>'
  }).join('')

  return '<div style="display:flex;gap:16px;margin-bottom:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Need Reorder</div>'
    + '<div style="font-size:24px;font-weight:800;color:#E07B28">' + reorder.length + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Out of Stock</div>'
    + '<div style="font-size:24px;font-weight:800;color:#ef4444">' + reorder.filter(p=>(p.total_unpckgd||0)<=0).length + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Est. Reorder Cost</div>'
    + '<div style="font-size:24px;font-weight:800;color:#2ABFAA">$' + reorder.reduce((s,p)=>{const t=Math.max(0,(p.max_qty||0)-(p.total_unpckgd||0))||(p.min_qty||0);return s+(p.unit_cost||0)*t},0).toFixed(2) + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Vendor</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Stock</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Min</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">To Order</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Est Cost</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Lead</th>'
    + '</tr></thead>'
    + '<tbody>' + rows + '</tbody>'
    + '</table></div>'
}