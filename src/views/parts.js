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

  const categories = [...new Set(S.parts.map(p => p.category||'Other').filter(Boolean))].sort()

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;flex-wrap:wrap">
      <input
        placeholder="Part #, description or vendor…"
        value="${sf.search||''}"
        oninput="window.setFilter('parts','search',this.value)"
        style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px"
      >
      <select
        onchange="window.setFilter('parts','category',this.value)"
        style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px"
      >
        <option value="">All Categories</option>
        ${categories.map(c => `<option value="${c}" ${sf.category===c?'selected':''}>${c}</option>`).join('')}
      </select>
      <span style="margin-left:auto;font-size:11px;color:#8a9ba8">${parts.length} parts</span>
    </div>
    <div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Part #</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Description</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Vendor</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Category</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Cost</th>
            <th style="padding:10px 12px;text-align:right;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Stock</th>
          </tr>
        </thead>
        <tbody>
          ${parts.slice(0,200).map(p => `
            <tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">${p.pn||'—'}</td>
              <td style="padding:9px 12px;color:#1a1c1e;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${p.description||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${p.vendor||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${p.category||'—'}</td>
              <td style="padding:9px 12px;text-align:right;font-weight:600;color:#1a1c1e">$${(p.unit_cost||0).toFixed(2)}</td>
              <td style="padding:9px 12px;text-align:right;font-weight:700;color:${(p.total_unpckgd||0)<=0?'#ef4444':(p.total_unpckgd||0)<5?'#f59e0b':'#22c55e'}">${p.total_unpckgd||0}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}