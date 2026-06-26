import { S } from '../utils/state.js'

export function renderBOMs() {
  const sf = S.filters.boms || {}
  const asms = S.assemblies.filter(a => !a.is_subassembly && !a.discontinued)

  let filtered = asms
  if (sf.search) {
    const q = sf.search.toLowerCase()
    filtered = asms.filter(a =>
      (a.pn||'').toLowerCase().includes(q) ||
      (a.description||'').toLowerCase().includes(q)
    )
  }

  const selectedPn = sf.selected
  const bom = selectedPn ? (S.boms[selectedPn] || []) : []
  const selectedAsm = selectedPn ? asms.find(a => a.pn === selectedPn) : null

  return '<div style="display:grid;grid-template-columns:300px 1fr;gap:16px;height:calc(100vh - 140px)">'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;display:flex;flex-direction:column">'
    + '<div style="padding:12px;border-bottom:1px solid #e2e8f0">'
    + '<input placeholder="Search assemblies..." value="' + (sf.search||'') + '"'
    + ' oninput="window.setFilter(\'boms\',\'search\',this.value)"'
    + ' style="width:100%;padding:8px 12px;border:1px solid #e2e8f0;border-radius:6px;font-size:12px;box-sizing:border-box">'
    + '</div>'
    + '<div style="overflow-y:auto;flex:1">'
    + filtered.map(a =>
        '<div onclick="window.selectBOM(\'' + a.pn + '\')"'
        + ' style="padding:10px 14px;border-bottom:1px solid #f1f5f9;cursor:pointer;background:' + (selectedPn===a.pn?'rgba(42,191,170,.08)':'') + '">'
        + '<div style="font-family:monospace;font-size:11px;font-weight:700;color:#2ABFAA">' + a.pn + '</div>'
        + '<div style="font-size:11px;color:#4a5568;margin-top:2px">' + (a.description||'') + '</div>'
        + '<div style="font-size:10px;color:#8a9ba8;margin-top:2px">Stock: ' + (a.total_on_hand||0) + ' | MSRP: $' + (a.msrp||0).toFixed(2) + '</div>'
        + '</div>'
      ).join('')
    + '</div></div>'
    + '<div style="background:#fff;border-radius:8px;border:1px solid #e2e8f0;overflow:hidden;display:flex;flex-direction:column">'
    + (!selectedPn
      ? '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#8a9ba8;font-size:13px">Select an assembly to view its BOM</div>'
      : '<div style="padding:16px;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;gap:12px">'
        + '<div style="flex:1">'
        + '<div style="font-size:14px;font-weight:700;color:#2ABFAA">' + selectedPn + '</div>'
        + '<div style="font-size:12px;color:#4a5568;margin-top:2px">' + (selectedAsm?.description||'') + '</div>'
        + '<div style="font-size:11px;color:#8a9ba8;margin-top:4px">' + bom.length + ' components</div>'
        + '</div>'
        + '<button onclick="window.openAddBOMComponent(\'' + selectedPn + '\')" style="padding:7px 14px;background:#2ABFAA;color:#fff;border:none;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer">+ Add Component</button>'
        + '</div>'
        + '<div style="overflow-y:auto;flex:1">'
        + (bom.length === 0
          ? '<div style="padding:40px;text-align:center;color:#8a9ba8">No BOM components — click + Add Component</div>'
          : '<table style="width:100%;border-collapse:collapse;font-size:12px">'
            + '<thead><tr style="background:#f8fafc;border-bottom:2px solid #e2e8f0">'
            + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Part #</th>'
            + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Description</th>'
            + '<th style="padding:10px 12px;text-align:right;font-size:10px;color:#8a9ba8">Qty/Unit</th>'
            + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8">Type</th>'
            + '<th style="padding:10px 12px;text-align:left;font-size:10px;color:#8a9ba8"></th>'
            + '</tr></thead><tbody>'
            + bom.map(item => {
                const part = S.parts.find(p => p.pn === item.child_pn) || S.assemblies.find(a => a.pn === item.child_pn)
                return '<tr style="border-bottom:1px solid #f1f5f9">'
                  + '<td style="padding:9px 12px;font-family:monospace;font-weight:700;color:#2ABFAA">' + (item.child_pn||'') + '</td>'
                  + '<td style="padding:9px 12px;color:#1a1c1e">' + (part?.description||'—') + '</td>'
                  + '<td style="padding:9px 12px;text-align:right;font-weight:700">' + (item.qty||1) + '</td>'
                  + '<td style="padding:9px 12px;color:#4a5568">' + (item.item_type||'part') + '</td>'
                  + '<td style="padding:9px 12px;text-align:right">'
                  + '<button onclick="window.removeBOMComponent(\'' + item.id + '\',\'' + selectedPn + '\')" style="padding:3px 8px;border:1px solid #ef444433;color:#ef4444;border-radius:4px;font-size:10px;cursor:pointer;background:#fff">Remove</button>'
                  + '</td>'
                  + '</tr>'
              }).join('')
            + '</tbody></table>'
        )
        + '</div>'
    )
    + '</div></div>'
}