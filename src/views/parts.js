import { S } from '../utils/state.js'

export function renderParts() {
  const sf = S.filters.parts || {}
  let parts = [...S.parts]
  if (sf.search) {
    const q = sf.search.toLowerCase()
    parts = parts.filter(p =>
      (p.pn||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q) ||
      (p.vendor||'').toLowerCase().includes(q)
    )
  }
  if (sf.category) parts = parts.filter(p => p.category === sf.category)
  const cats = [...new Set(S.parts.map(p => p.category||'Other'))].sort()
  const opts = cats.map(c => '<option value="' + c + '"' + (sf.category===c?' selected':'') + '>' + c + '</option>').join('')

  return '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<input placeholder="Part # or description" value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'parts\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<select onchange="window.setFilter(\'parts\',\'category\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px">'
    + '<option value="">All Categories</option>' + opts
    + '</select>'
    + '<span style="margin-left:auto;font-size:11px;color:#8a9ba8">' + parts.length + ' parts</span>'
    + '<button onclick="window.openAddPart()" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ Part</button>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Vendor</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Category</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Cost</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Stock</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Min</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
    + '</tr></thead><tbody>'
    + parts.slice(0,200).map(p => {
        const stock = p.total_unpckgd || 0
        const color = stock <= 0 ? '#ef4444' : stock < 5 ? '#f59e0b' : '#22c55e'
        return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
          + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (p.pn||'') + '</td>'
          + '<td style="padding:9px 12px;color:#1a1c1e">' + (p.description||'') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (p.vendor||'') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (p.category||'') + '</td>'
          + '<td style="padding:9px 12px;text-align:right;font-weight:600">$' + (p.unit_cost||0).toFixed(2) + '</td>'
          + '<td style="padding:9px 12px;text-align:right;font-weight:700;color:' + color + '">' + stock + '</td>'
          + '<td style="padding:9px 12px;text-align:right;color:#8a9ba8">' + (p.min_qty||0) + '</td>'
          + '<td style="padding:9px 12px">'
          + '<button onclick="window.openEditPart(\'' + p.id + '\')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff;margin-right:4px">Edit</button>'
          + '<button onclick="window.adjustStock(\'' + p.id + '\',\'' + (p.pn||'') + '\',' + stock + ')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Stock</button>'
          + '</td>'
          + '</tr>'
      }).join('')
    + '</tbody></table></div>'
}