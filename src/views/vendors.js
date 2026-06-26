import { S } from '../utils/state.js'

export function renderVendors() {
  const sf = S.filters.vendors || {}
  let vendors = [...S.vendors]

  if (sf.search) {
    const q = sf.search.toLowerCase()
    vendors = vendors.filter(v =>
      (v.name||'').toLowerCase().includes(q) ||
      (v.contact_email||'').toLowerCase().includes(q)
    )
  }

  return `
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
      <input
        placeholder="Vendor name or email…"
        value="${sf.search||''}"
        oninput="window.setFilter('vendors','search',this.value)"
        style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px"
      >
      <span style="margin-left:auto;font-size:11px;color:#8a9ba8">${vendors.length} vendors</span>
    </div>
    <div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">
      <table style="width:100%;border-collapse:collapse;font-size:12px">
        <thead>
          <tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Vendor</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Contact</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Email</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Phone</th>
            <th style="padding:10px 12px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#8a9ba8">Lead Time</th>
          </tr>
        </thead>
        <tbody>
          ${vendors.map(v => `
            <tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background='#f8fafc'" onmouseout="this.style.background=''">
              <td style="padding:9px 12px;font-weight:700;color:#1a1c1e">${v.name||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${v.contact_name||'—'}</td>
              <td style="padding:9px 12px;color:#2ABFAA">${v.contact_email||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${v.contact_phone||'—'}</td>
              <td style="padding:9px 12px;color:#4a5568">${v.lead_time_weeks ? v.lead_time_weeks+' weeks' : '—'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}