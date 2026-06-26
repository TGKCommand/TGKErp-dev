const SUPA_URL = 'https://piamamighqiielfztgic.supabase.co'
const SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpYW1hbWlnaHFpaWVsZnp0Z2ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4NjkxMzUsImV4cCI6MjA5MzQ0NTEzNX0.YwLflTw6F4cRzmY78QoAY6Zud2IHGVP5xL_yvMFxheA'

let db = null

export async function initSupabase() {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm')
  db = createClient(SUPA_URL, SUPA_KEY)
  return db
}

export function getDb() {
  return db
}

export { SUPA_URL, SUPA_KEY }