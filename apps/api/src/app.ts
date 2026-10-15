import 'reflect-metadata'
import { Controller, Get, Inject, Module, ServiceUnavailableException } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { createPool } from './database.js'
import { ListReports } from './reports/catalog.js'
import { PostgresReportRepository } from './reports/postgres-repository.js'

@Controller('reports')
class ReportsController {
  constructor(@Inject(ListReports) private readonly catalog: ListReports) {}

  @Get()
  async list() {
    try {
      return await this.catalog.execute()
    } catch {
      throw new ServiceUnavailableException('No se pudo cargar el catálogo. Intenta nuevamente.')
    }
  }
}

@Module({})
class AppModule {}

export async function createApplication(databaseUrl: string) {
  const pool = createPool(databaseUrl)
  try {
    await pool.query('SELECT 1')
    const app = await NestFactory.create({
      module: AppModule,
      controllers: [ReportsController],
      providers: [
        { provide: ListReports, useValue: new ListReports(new PostgresReportRepository(pool)) },
        { provide: 'DATABASE_LIFECYCLE', useValue: { onModuleDestroy: () => pool.end() } },
      ],
    }, { logger: false, abortOnError: false })
    app.enableShutdownHooks()
    return app
  } catch {
    await pool.end()
    throw new Error('No se pudo conectar o iniciar la API. Revisa PostgreSQL y DATABASE_URL.')
  }
}
