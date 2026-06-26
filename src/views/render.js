import { S } from '../utils/state.js'
import { renderLayout } from './layout.js'
import { renderDashboard } from './dashboard.js'
import { renderSales } from './sales.js'
import { renderParts } from './parts.js'
import { renderAssemblies } from './assemblies.js'

const views = {
  dashboard: renderDashboard,
  sales: renderSales,
  parts: renderParts,
  assemblies: renderAssemblies,
}

export function render() {
  const viewFn = views[S.view] || (() => `<div style="padding:40px;color:#8a9ba8">View "${S.view}" not yet migrated</div>`)
  document.getElementById('app').innerHTML = renderLayout(viewFn())
}