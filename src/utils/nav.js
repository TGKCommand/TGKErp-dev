import { S } from './state.js'
import { render } from '../views/render.js'

export function nav(v) {
  S.view = v
  render()
}