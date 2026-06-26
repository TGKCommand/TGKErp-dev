import { S } from '../utils/state.js'

export function renderAssemblies() {
  const sf = S.filters.assemblies || {}
  let asms = S.assemblies.filter(a => !a.is_subassembly && !a.discontinued)
  if (sf.search) {
    const q = sf.search.toLowerCase()
    asms = asms.filter(a =>
      (a.pn||'').toLowerCase().includes(q) ||
      (a.description||'').toLowerCase().includes(q)
    )
  }

  return '<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<input placeholder="Part # or description" value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'assemblies\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<span style="margin-left:auto;font-size:11px;color:#8a9ba8">' + asms.length + ' assemblies</span>'
    + '<button onclick="window.openAddAssembly()" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ Assembly</button>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Category</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">MSRP</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Stock</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
    + '</tr></thead><tbody>'
    + asms.slice(0,200).map(a => {
        const stock = a.total_on_hand || 0
        const color = stock <= 0 ? '#ef4444' : stock < 3 ? '#f59e0b' : '#22c55e'
        return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
          + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (a.pn||'') + '</td>'
          + '<td style="padding:9px 12px;color:#1a1c1e">' + (a.description||'') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (a.category||'') + '</td>'
          + '<td style="padding:9px 12px;text-align:right;font-weight:600">$' + (a.msrp||0).toFixed(2) + '</td>'
          + '<td style="padding:9px 12px;text-align:right;font-weight:700;color:' + color + '">' + stock + '</td>'
          + '<td style="padding:9px 12px">'
          + '<button onclick="window.openEditAssembly(\'' + a.id + '\')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Edit</button>'
          + '</td>'
          + '</tr>'
      }).join('')
    + '</tbody></table></div>'
}