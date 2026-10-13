import { spawn } from 'node:child_process'
import { randomBytes } from 'node:crypto'

export async function run(command, args, env = {}, capture = false) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { env: { ...process.env, ...env }, stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit' })
    let output = ''
    if (capture) {
      child.stdout.on('data', (chunk) => { output += chunk })
      child.stderr.on('data', (chunk) => { output += chunk })
    }
    child.on('error', reject)
    child.on('exit', (code) => code === 0 ? resolve(output.trim()) : reject(new Error(`Falló ${command} (código ${code}).`)))
  })
}

const container = `perdiu-catalog-test-${randomBytes(6).toString('hex')}`
const password = randomBytes(24).toString('hex')
let started = false
try {
  await run('docker', ['run', '-d', '--rm', '--name', container, '-e', 'POSTGRES_PASSWORD', '-e', 'POSTGRES_USER=perdiu', '-e', 'POSTGRES_DB=perdiu_test', '-p', '127.0.0.1::5432', 'postgres:17-alpine'], { POSTGRES_PASSWORD: password }, true)
  started = true
  let ready = false
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      await run('docker', ['exec', container, 'pg_isready', '-U', 'perdiu', '-d', 'perdiu_test'], {}, true)
      ready = true
      break
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
  if (!ready) throw new Error('PostgreSQL de pruebas no inició en 30 segundos.')
  const mapping = await run('docker', ['port', container, '5432/tcp'], {}, true)
  const port = mapping.match(/^127\.0\.0\.1:(\d+)$/)?.[1]
  if (!port) throw new Error('No se pudo determinar el puerto local de PostgreSQL de pruebas.')
  const env = { TEST_DATABASE_URL: `postgresql://perdiu:${password}@127.0.0.1:${port}/perdiu_test`, PERDIU_TEST_CONTAINER: '1' }
  await run('pnpm', ['exec', 'turbo', 'run', 'test:integration', '--filter=@perdiu/api'], env)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
} finally {
  if (started) await run('docker', ['stop', container], {}, true)
}
