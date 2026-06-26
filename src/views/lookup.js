import { S } from '../utils/state.js'

export function renderLookup() {
  const sf = S.filters.lookup || {}
  const q = (sf.search || '').toLowerCase()

  let results = []
  if (q.length >= 2) {
    const matchParts = S.parts.filter(p =>
      (p.pn||'').toLowerCase().includes(q) ||
      (p.description||'').toLowerCase().includes(q)
    ).map(p => ({ type: 'Part', pn: p.pn, desc: p.description, detail: 'Stock: ' + (p.total_unpckgd||0) + ' | Cost: $' + (p.unit_cost||0).toFixed(2) }))

    const matchAsm = S.assemblies.filter(a =>
      (a.pn||'').toLowerCase().includes(q) ||
      (a.description||'').toLowerCase().includes(q)
    ).map(a => ({ type: 'Assembly', pn: a.pn, desc: a.description, detail: 'Stock: ' + (a.total_on_hand||0) + ' | MSRP: $' + (a.msrp||0).toFixed(2) }))

    const matchOrders = S.sales.filter(s =>
      (s.order_number||'').toLowerCase().includes(q) ||
      (s.customer_name||'').toLowerCase().includes(q) ||
      (s.pn||'').toLowerCase().includes(q)
    ).slice(0,20).map(s => ({ type: 'Order', pn: s.order_number, desc: s.customer_name||'—', detail: s.pn + ' | ' + (s.fulfillment_status||'Open') }))

    results = [...matchParts, ...matchAsm, ...matchOrders].slice(0, 50)
  }

  const typeColors = { Part: '#2ABFAA', Assembly: '#E07B28', Order: '#8b5cf6' }

  return '<div style="margin-bottom:20px">'
    + '<input placeholder="Search parts, assemblies, orders, customers..." value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'lookup\',\'search\',this.value)"'
    + ' style="width:100%;padding:12px 16px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;box-sizing:border-box"'
    + ' autofocus>'
    + '<div style="font-size:11px;color:#8a9ba8;margin-top:6px">Search across all parts, assemblies, and orders</div>'
    + '</div>'
    + (q.length < 2
      ? '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:60px;text-align:center;color:#8a9ba8">Type at least 2 characters to search</div>'
      : results.length === 0
        ? '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:60px;text-align:center;color:#8a9ba8">No results for "' + sf.search + '"</div>'
        : '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
          + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Type</th>'
          + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">ID / #</th>'
          + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
          + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Details</th>'
          + '</tr></thead><tbody>'
          + results.map(r =>
              '<tr style="border-bottom:1px solid #f1f5f9">'
              + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + (typeColors[r.type]||'#8a9ba8') + '22;color:' + (typeColors[r.type]||'#8a9ba8') + ';font-size:10px;font-weight:700">' + r.type + '</span></td>'
              + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (r.pn||'') + '</td>'
              + '<td style="padding:9px 12px;color:#1a1c1e">' + (r.desc||'') + '</td>'
              + '<td style="padding:9px 12px;color:#4a5568">' + (r.detail||'') + '</td>'
              + '</tr>'
            ).join('')
          + '</tbody></table></div>'
    )
}