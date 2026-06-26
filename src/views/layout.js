import { S } from '../utils/state.js'

export function renderLayout(content) {
  return `
    <div style="display:flex;height:100vh;font-family:'DM Sans',sans-serif;background:#F0F2F5;color:#1a1c1e">
      ${renderSidebar()}
      <div style="flex:1;overflow-y:auto;display:flex;flex-direction:column">
        ${renderTopbar()}
        <div id="content" style="flex:1;padding:24px">
          ${content}
        </div>
      </div>
    </div>
  `
}

function renderSidebar() {
  const t = (id, label, onclick) => `
    <button onclick="${onclick}" style="display:flex;align-items:center;gap:9px;padding:7px 11px;margin:2px 8px;border-radius:20px;cursor:pointer;border:1px solid transparent;background:${S.view===id?'var(--teal-dim)':'transparent'};color:${S.view===id?'#2ABFAA':'#8a9ba8'};font-size:12px;font-weight:500;width:calc(100% - 16px);text-align:left">
      <span style="width:6px;height:6px;border-radius:50%;background:${S.view===id?'#2ABFAA':'#3a4a55'};flex-shrink:0"></span>
      ${label}
    </button>`

  return `
    <div style="width:220px;min-width:220px;background:#141618;border-right:1px solid #1e2428;display:flex;flex-direction:column;height:100vh;overflow-y:auto">
      <div style="padding:14px 16px 12px;border-bottom:1px solid #1e2428">
        <div style="font-size:14px;font-weight:800;color:#2ABFAA">TGK MOTORSPORT</div>
        <div style="font-size:10px;color:#4a5568">Command Center</div>
      </div>
      <div style="flex:1;padding:8px 0">
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Overview</div>
        ${t('dashboard','Dashboard',"window.nav('dashboard')")}
        ${t('lookup','Master Lookup',"window.nav('lookup')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Catalog</div>
        ${t('parts','Parts Catalog',"window.nav('parts')")}
        ${t('assemblies','Assemblies',"window.nav('assemblies')")}
        ${t('boms','Bill of Materials',"window.nav('boms')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Operations</div>
        ${t('inventory','Inventory',"window.nav('inventory')")}
        ${t('packqueue','Production',"window.nav('packqueue')")}
        ${t('cyclecounts','Cycle Counts',"window.nav('cyclecounts')")}
        ${t('corrections','Activity Log',"window.nav('corrections')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Purchasing</div>
        ${t('planning','Purchasing',"window.nav('planning')")}
        ${t('purchases','Purchase Orders',"window.nav('purchases')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Sales</div>
        ${t('sales','Sales Orders',"window.nav('sales')")}
        ${t('warranty','Customer Resolution',"window.nav('warranty')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Contacts</div>
        ${t('vendors','Vendors',"window.nav('vendors')")}
        ${t('dealers','Dealers',"window.nav('dealers')")}
        <div style="padding:14px 14px 4px;font-size:9px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#4a5568">Tools</div>
        ${t('ai','AI Assistant',"window.nav('ai')")}
        ${t('reports','Reports & Export',"window.nav('reports')")}
      </div>
      <div style="padding:12px 16px;border-top:1px solid #1e2428;font-size:11px;color:#4a5568">
        <div style="color:#8a9ba8">${S.currentUser||''}</div>
        <div style="display:flex;align-items:center;gap:6px;margin-top:4px">
          <span style="width:7px;height:7px;border-radius:50%;background:#22c55e"></span>
          <span>Live — Real-time</span>
        </div>
      </div>
    </div>
  `
}

function renderTopbar() {
  const titles = {
    dashboard:'Dashboard',sales:'Sales Orders',parts:'Parts Catalog',
    assemblies:'Assemblies',boms:'Bill of Materials',inventory:'Inventory',
    planning:'Purchasing',purchases:'Purchase Orders',vendors:'Vendors',
    dealers:'Dealers',warranty:'Customer Resolution',ai:'AI Assistant',
    reports:'Reports & Export',packqueue:'Production',cyclecounts:'Cycle Counts',
    corrections:'Activity Log',lookup:'Master Lookup'
  }
  return `
    <div style="height:52px;background:#fff;border-bottom:1px solid #e2e8f0;display:flex;align-items:center;padding:0 24px;gap:16px;flex-shrink:0">
      <div style="font-size:16px;font-weight:700;color:#1a1c1e">${titles[S.view]||S.view}</div>
    </div>
  `
}