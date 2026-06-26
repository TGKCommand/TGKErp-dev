import { S } from './state.js'

export async function loadAll(db) {
  const [parts, assemblies, sales, purchases, dealers, settings, warranty, auditLog, cycleCounts] = await Promise.all([
    db.from('parts').select('*').order('pn'),
    db.from('assemblies').select('*').order('pn'),
    db.from('sales').select('*').order('sale_date', { ascending: false }).limit(5000),
    db.from('purchases').select('*').order('order_date', { ascending: false }),
    db.from('dealers').select('*').order('name'),
    db.from('settings').select('key,value'),
    db.from('warranty_claims').select('*').order('created_at', { ascending: false }),
    db.from('audit_log').select('*').order('created_at', { ascending: false }).limit(500),
    db.from('cycle_counts').select('*').order('created_at', { ascending: false }),
  ])

  S.parts = parts.data || []
  S.assemblies = assemblies.data || []
  S.sales = sales.data || []
  S.purchases = purchases.data || []
  S.dealers = dealers.data || []
  S.warrantyClaims = warranty.data || []
  S.corrections = auditLog.data || []
  S.cycleCounts = cycleCounts.data || []

  const vendorNames = [...new Set(S.parts.map(p => p.vendor).filter(Boolean))].sort()
  S.vendors = vendorNames.map(name => ({ name }))

  ;(settings.data || []).forEach(s => S.settings[s.key] = s.value)
  if (S.settings.shopify) Object.assign(S.shopify, S.settings.shopify)
}