import { existsSync } from 'node:fs'
import { loadEnvFile } from 'node:process'

export interface ApiConfig {
  databaseUrl: string
  port: number
  host: string
}

export class ConfigurationError extends Error {}

export function loadEnvironment() {
  const path = new URL('../../../.env', import.meta.url)
  if (existsSync(path)) loadEnvFile(path)
}

export function readConfig(env: NodeJS.ProcessEnv): ApiConfig {
  if (!env.DATABASE_URL) throw new ConfigurationError('DATABASE_URL es obligatoria.')
  try {
    const url = new URL(env.DATABASE_URL)
    if (!['postgres:', 'postgresql:'].includes(url.protocol) || !url.hostname || !url.username || url.pathname.length < 2) throw new Error()
  } catch {
    throw new ConfigurationError('DATABASE_URL debe ser una URL PostgreSQL válida con usuario y base de datos.')
  }
  const port = Number(env.PORT ?? 3000)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigurationError('PORT debe ser un entero entre 1 y 65535.')
  return { databaseUrl: env.DATABASE_URL, port, host: env.HOST || '127.0.0.1' }
}

export function assertLocalDatabase(databaseUrl: string) {
  const url = new URL(databaseUrl)
  // pg query parameters can override the URL's host/database; mutation URLs accept none.
  if (!['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || !/^\/perdiu_[a-z0-9_]*(dev|test)$/.test(url.pathname)
    || url.search || url.hash || process.env.NODE_ENV === 'production') {
    throw new ConfigurationError('Esta operación requiere una base PerdiU local terminada en dev o test, fuera de producción.')
  }
}
