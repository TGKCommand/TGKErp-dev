import { S } from '../utils/state.js'

export function renderPurchases() {
  const sf = S.filters.purchases || {}
  let pos = [...S.purchases]
  if (sf.search) {
    const q = sf.search.toLowerCase()
    pos = pos.filter(p =>
      (p.vendor||'').toLowerCase().includes(q) ||
      (p.pn||'').toLowerCase().includes(q) ||
      (p.order_number||'').toLowerCase().includes(q)
    )
  }
  if (sf.status) pos = pos.filter(p => p.status === sf.status)
  const statuses = ['Ordered','Partial','Received','Cancelled']
  const totalOpen = pos.filter(p => p.status !== 'Received' && p.status !== 'Cancelled').reduce((sum,p) => sum + (p.total_cost||0), 0)

  return '<div style="display:flex;gap:16px;margin-bottom:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Open POs</div><div style="font-size:24px;font-weight:800;color:#E07B28">' + pos.filter(p=>p.status==='Ordered'||p.status==='Partial').length + '</div></div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Open Value</div><div style="font-size:24px;font-weight:800;color:#2ABFAA">$' + totalOpen.toFixed(2) + '</div></div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1"><div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Total POs</div><div style="font-size:24px;font-weight:800;color:#1a1c1e">' + pos.length + '</div></div>'
    + '</div>'
    + '<div style="display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap">'
    + '<input placeholder="Vendor, part # or order #" value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'purchases\',\'search\',this.value)"'
    + ' style="padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;width:240px">'
    + '<button onclick="window.setFilter(\'purchases\',\'status\',\'\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (!sf.status?'#2ABFAA':'#e2e8f0') + ';background:' + (!sf.status?'rgba(42,191,170,.1)':'#fff') + ';color:' + (!sf.status?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">All</button>'
    + statuses.map(st => '<button onclick="window.setFilter(\'purchases\',\'status\',\'' + st + '\')" style="padding:5px 12px;border-radius:20px;border:1px solid ' + (sf.status===st?'#2ABFAA':'#e2e8f0') + ';background:' + (sf.status===st?'rgba(42,191,170,.1)':'#fff') + ';color:' + (sf.status===st?'#2ABFAA':'#4a5568') + ';font-size:11px;cursor:pointer">' + st + '</button>').join('')
    + '<span style="margin-left:auto;font-size:11px;color:#8a9ba8">' + pos.length + ' POs</span>'
    + '<button onclick="window.openAddPO()" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ PO</button>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Order #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Vendor</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Date</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Qty</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Cost</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Status</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Actions</th>'
    + '</tr></thead><tbody>'
    + pos.slice(0,200).map(p => {
        const colors = {Ordered:'#E07B28',Partial:'#3b82f6',Received:'#22c55e',Cancelled:'#ef4444'}
        const c = colors[p.status]||'#8a9ba8'
        return '<tr style="border-bottom:1px solid #f1f5f9" onmouseover="this.style.background=\'#f8fafc\'" onmouseout="this.style.background=\'\'">'
          + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (p.order_number||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#1a1c1e">' + (p.vendor||'—') + '</td>'
          + '<td style="padding:9px 12px;font-family:monospace;color:#4a5568">' + (p.pn||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#8a9ba8">' + (p.order_date||'—') + '</td>'
          + '<td style="padding:9px 12px;text-align:right">' + (p.qty||0) + '</td>'
          + '<td style="padding:9px 12px;text-align:right;font-weight:600">$' + (p.total_cost||0).toFixed(2) + '</td>'
          + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + c + '22;color:' + c + ';font-size:10px;font-weight:700">' + (p.status||'—') + '</span></td>'
          + '<td style="padding:9px 12px">'
          + (p.status === 'Ordered' || p.status === 'Partial'
              ? '<button onclick="window.markPOReceived(\'' + p.id + '\')" style="padding:3px 8px;background:#22c55e;color:#fff;border:none;border-radius:4px;font-size:10px;cursor:pointer;margin-right:4px">Receive</button>'
              : '')
          + '<button onclick="window.openEditPO(\'' + p.id + '\')" style="padding:3px 8px;border:1px solid #e2e8f0;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Edit</button>'
          + '</td>'
          + '</tr>'
      }).join('')
    + '</tbody></table></div>'
}