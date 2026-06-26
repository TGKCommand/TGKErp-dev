import { S } from './state.js'

export async function loadAll(db) {
  const [parts, assemblies, sales, purchases, dealers, vendors, settings] = await Promise.all([
    db.from('parts').select('*').order('pn'),
    db.from('assemblies').select('*').order('pn'),
    db.from('sales').select('*').order('sale_date', { ascending: false }).limit(5000),
    db.from('purchases').select('*').order('order_date', { ascending: false }),
    db.from('dealers').select('*').order('name'),
    db.from('vendors').select('*').order('name'),
    db.from('settings').select('key,value'),
  ])

  S.parts = parts.data || []
  S.assemblies = assemblies.data || []
  S.sales = sales.data || []
  S.purchases = purchases.data || []
  S.dealers = dealers.data || []
  S.vendors = vendors.data || []
  ;(settings.data || []).forEach(s => S.settings[s.key] = s.value)
  if (S.settings.shopify) Object.assign(S.shopify, S.settings.shopify)
}