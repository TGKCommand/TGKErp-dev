import { S } from './state.js'
import { render } from '../views/render.js'

export function setupRealtime(db) {
  db.channel('erp-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, p => {
      if (p.eventType === 'INSERT') {
        if (!S.sales.find(s => s.id === p.new.id)) {
          S.sales = [p.new, ...S.sales]
        }
      } else if (p.eventType === 'UPDATE') {
        S.sales = S.sales.map(s => s.id === p.new.id ? p.new : s)
      } else if (p.eventType === 'DELETE') {
        S.sales = S.sales.filter(s => s.id !== p.old.id)
      }
      if (['sales', 'dashboard'].includes(S.view)) render()
    })
    .subscribe()
}