import { S } from '../utils/state.js'
import { renderLayout } from './layout.js'
import { renderDashboard } from './dashboard.js'
import { renderSales } from './sales.js'
import { renderParts } from './parts.js'
import { renderAssemblies } from './assemblies.js'
import { renderInventory } from './inventory.js'
import { renderVendors } from './vendors.js'
import { renderDealers } from './dealers.js'
import { renderPurchases } from './purchases.js'
import { renderPlanning } from './planning.js'
import { renderWarranty } from './warranty.js'

const views = {
  dashboard: renderDashboard,
  sales: renderSales,
  parts: renderParts,
  assemblies: renderAssemblies,
  inventory: renderInventory,
  vendors: renderVendors,
  dealers: renderDealers,
  purchases: renderPurchases,
  planning: renderPlanning,
  warranty: renderWarranty
}

export function render() {
  const viewFn = views[S.view] || (() => `<div style="padding:40px;color:#8a9ba8">View "${S.view}" not yet migrated</div>`)
  document.getElementById('app').innerHTML = renderLayout(viewFn())
}