import { S } from '../utils/state.js'

export function renderCorrections() {
  const corrections = S.corrections || []
  const recent = corrections.slice(0, 100)

  return '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden">'
    + '<table style="width:100%;border-collapse:collapse;font-size:12px">'
    + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Date</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">User</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Action</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
    + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Summary</th>'
    + '</tr></thead><tbody>'
    + (recent.length === 0
      ? '<tr><td colspan="5" style="padding:40px;text-align:center;color:#8a9ba8">No activity recorded</td></tr>'
      : recent.map(c =>
          '<tr style="border-bottom:1px solid #f1f5f9">'
          + '<td style="padding:9px 12px;color:#8a9ba8;white-space:nowrap">' + (c.created_at||'').slice(0,16).replace('T',' ') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568">' + (c.user_email||'—') + '</td>'
          + '<td style="padding:9px 12px;font-weight:600;color:#1a1c1e">' + (c.action||'—') + '</td>'
          + '<td style="padding:9px 12px;font-family:monospace;color:#2ABFAA">' + (c.entity_pn||'—') + '</td>'
          + '<td style="padding:9px 12px;color:#4a5568;max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + (c.summary||'—') + '</td>'
          + '</tr>'
        ).join('')
    )
    + '</tbody></table></div>'
}