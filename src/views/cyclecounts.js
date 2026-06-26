import { S } from '../utils/state.js'

export function renderCycleCounts() {
  const counts = S.cycleCounts || []
  const open = counts.filter(c => c.status === 'Open')
  const closed = counts.filter(c => c.status === 'Closed')

  return '<div style="display:flex;gap:16px;margin-bottom:16px">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Open Counts</div>'
    + '<div style="font-size:24px;font-weight:800;color:#E07B28">' + open.length + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;padding:16px;flex:1">'
    + '<div style="font-size:10px;color:#8a9ba8;text-transform:uppercase;letter-spacing:.06em">Completed</div>'
    + '<div style="font-size:24px;font-weight:800;color:#22c55e">' + closed.length + '</div>'
    + '</div>'
    + '</div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Name</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Created</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Status</th>'
    + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Items</th>'
    + '</tr></thead><tbody>'
    + (counts.length === 0
      ? '<tr><td colspan="4" style="padding:40px;text-align:center;color:#8a9ba8">No cycle counts yet</td></tr>'
      : counts.map(c => {
          const col = c.status === 'Open' ? '#E07B28' : '#22c55e'
          return '<tr style="border-bottom:1px solid #f1f5f9">'
            + '<td style="padding:9px 12px;font-weight:600;color:#1a1c1e">' + (c.name||'Untitled') + '</td>'
            + '<td style="padding:9px 12px;color:#8a9ba8">' + (c.created_at||'').slice(0,10) + '</td>'
            + '<td style="padding:9px 12px"><span style="padding:2px 8px;border-radius:10px;background:' + col + '22;color:' + col + ';font-size:10px;font-weight:700">' + (c.status||'Open') + '</span></td>'
            + '<td style="padding:9px 12px;text-align:right;color:#4a5568">' + (c.item_count||0) + '</td>'
            + '</tr>'
        }).join('')
    )
    + '</tbody></table></div>'
}