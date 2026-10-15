import assert from 'node:assert/strict'
import { test } from 'node:test'
import { ListReports } from '../src/reports/catalog.js'
import type { ReportRecord } from '../src/reports/model.js'

const record = (id: string, overrides: Partial<ReportRecord> = {}): ReportRecord => ({
  id, ownerId: 'owner-1', type: 'found', state: 'active', category: 'object',
  title: 'Mochila azul', description: 'Encontrada en un minibús.', city: 'La Paz', zone: 'Centro',
  incidentDate: '2026-10-10', createdAt: '2026-10-10T12:00:00.000Z',
  author: { id: 'owner-1', displayName: 'Autor de prueba' }, imageUrls: [], ...overrides,
})

test('el catálogo se ordena por creación descendente y por ID ascendente en empates', async () => {
  const reports = [
    record('b'), record('old', { createdAt: '2026-10-01T12:00:00.000Z' }),
    record('a'), record('new', { createdAt: '2026-10-11T12:00:00.000Z' }),
  ]
  const result = await new ListReports({ list: async () => reports }).execute()
  assert.deepEqual(result.map(({ id }) => id), ['new', 'a', 'b', 'old'])
})

test('el visitante ve activos y resolver un hallazgo conserva su tipo', async () => {
  const reports = [record('active'), record('closed', { state: 'resolved' })]
  const result = await new ListReports({ list: async () => reports }).execute()
  assert.deepEqual(result.map(({ id, type, state }) => ({ id, type, state })), [
    { id: 'active', type: 'found', state: 'active' },
  ])
})

test('la proyección pública excluye contacto, identidad privada y claves de almacenamiento', async () => {
  const privateRecord = {
    ...record('public'), phone: 'private-phone-sentinel', email: 'private-email-sentinel',
    storageKey: 'private-storage-sentinel', token: 'private-token-sentinel',
    author: { id: 'owner-1', displayName: 'Autor de prueba', email: 'private-author-sentinel' },
  }
  const result = await new ListReports({ list: async () => [privateRecord] }).execute()
  assert.deepEqual(result, [{
    id: 'public', type: 'found', state: 'active', category: 'object', title: 'Mochila azul',
    description: 'Encontrada en un minibús.', city: 'La Paz', zone: 'Centro',
    incidentDate: '2026-10-10', createdAt: '2026-10-10T12:00:00.000Z',
    author: { id: 'owner-1', displayName: 'Autor de prueba' }, imageUrls: [],
  }])
})

test('el catálogo conserva el orden de PostgreSQL dentro de un mismo milisegundo', async () => {
  const reports = [record('a', { createdAt: '2026-10-10T12:00:00.123100Z' }), record('b', { createdAt: '2026-10-10T12:00:00.123900Z' })]
  const result = await new ListReports({ list: async () => reports }).execute()
  assert.deepEqual(result.map(({ id }) => id), ['b', 'a'])
})
