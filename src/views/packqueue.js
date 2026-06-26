import { S } from '../utils/state.js'

export function renderPackQueue() {
  const open = S.sales.filter(s =>
    !s.order_number?.startsWith('Warranty_') &&
    (s.fulfillment_status === 'Open' || s.fulfillment_status === 'Packed')
  )

  const byOrder = {}
  open.forEach(s => {
    const key = s.order_number || s.id
    if (!byOrder[key]) byOrder[key] = { order_number: s.order_number, customer: s.customer_name, date: s.sale_date, lines: [] }
    byOrder[key].lines.push(s)
  })

  const orders = Object.values(byOrder).sort((a,b) => (a.date||'').localeCompare(b.date||''))

  return '<div style="margin-bottom:16px;display:flex;gap:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Orders to Pack</div>'
    + '<div style="font-size:24px;font-weight:800;color:#E07B28">' + orders.length + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Total Lines</div>'
    + '<div style="font-size:24px;font-weight:800;color:#1a1c1e">' + open.length + '</div>'
    + '</div>'
    + '</div>'
    + (orders.length === 0
      ? '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:60px;text-align:center;color:#8a9ba8">All orders fulfilled</div>'
      : orders.map(o =>
          '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;margin-bottom:12px;overflow:hidden">'
          + '<div style="padding:12px 16px;background:#f8fafc;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:12px">'
          + '<div style="font-weight:700;color:#2ABFAA;font-family:monospace">' + (o.order_number||'—') + '</div>'
          + '<div style="color:#4a5568;font-size:12px">' + (o.customer||'—') + '</div>'
          + '<div style="color:#8a9ba8;font-size:11px;margin-left:auto">' + (o.date||'') + '</div>'
          + '</div>'
          + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
          + o.lines.map(l =>
              '<tr style="border-bottom:1px solid #f1f5f9">'
              + '<td style="padding:8px 16px;font-family:monospace;font-weight:700;color:#2ABFAA;width:140px">' + (l.pn||'') + '</td>'
              + '<td style="padding:8px 16px;color:#1a1c1e">' + (S.parts.find(p=>p.pn===l.pn)?.description || S.assemblies.find(a=>a.pn===l.pn)?.description || '') + '</td>'
              + '<td style="padding:8px 16px;text-align:right;font-weight:700;width:60px">' + (l.qty||1) + '</td>'
              + '<td style="padding:8px 16px;width:100px"><span style="padding:2px 8px;border-radius:10px;background:' + (l.fulfillment_status==='Packed'?'#8b5cf622':'#E07B2822') + ';color:' + (l.fulfillment_status==='Packed'?'#8b5cf6':'#E07B28') + ';font-size:10px;font-weight:700">' + (l.fulfillment_status||'Open') + '</span></td>'
              + '</tr>'
            ).join('')
          + '</table></div>'
        ).join('')
    )
}