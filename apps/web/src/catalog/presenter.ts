import type { ReportCategory, ReportSummary } from '@perdiu/contracts'
import type { CatalogReport, Category, FilterStatus } from '../types.js'
import { normalizeText } from '../utils/text.js'

export type CatalogState =
  | { status: 'loading'; reports: CatalogReport[] }
  | { status: 'ready'; reports: CatalogReport[] }
  | { status: 'error'; reports: CatalogReport[]; message: string }

export const categoryImages = { Mascota: '/images/pet.svg', Objeto: '/images/object.svg', Documentos: '/images/document.svg' }
const categories: Record<ReportCategory, Category> = { pet: 'Mascota', object: 'Objeto', document: 'Documentos' }

function presentReport(report: ReportSummary): CatalogReport {
  const category = categories[report.category]
  const name = report.author.displayName
  return {
    id: report.id, source: 'catalog', title: report.title, description: report.description,
    category, status: report.type === 'lost' ? 'Perdido' : 'Encontrado', city: report.city, zone: report.zone,
    date: new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(report.incidentDate + 'T00:00:00Z')),
    posted: new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium', timeZone: 'America/La_Paz' }).format(new Date(report.createdAt)),
    image: report.imageUrls[0] || categoryImages[category], person: name,
    initials: name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toLocaleUpperCase('es'),
    color: 'lavender', resolved: report.state === 'resolved',
  }
}

export interface ReportsClient {
  list(signal: AbortSignal): Promise<ReportSummary[]>
}

export class CatalogPresenter {
  private state: CatalogState = { status: 'loading', reports: [] }
  private listeners = new Set<() => void>()
  private request = 0
  private controller?: AbortController
  constructor(private readonly client: ReportsClient) {}
  getSnapshot = () => this.state
  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  private setState(state: CatalogState) {
    this.state = state
    this.listeners.forEach((listener) => listener())
  }

  cancel() {
    this.request++
    this.controller?.abort()
  }

  async load() {
    this.cancel()
    const request = this.request
    this.controller = new AbortController()
    this.setState({ status: 'loading', reports: [] })
    try {
      const reports = await this.client.list(this.controller.signal)
      if (request === this.request) this.setState({ status: 'ready', reports: reports.map(presentReport) })
    } catch {
      if (request === this.request) this.setState({ status: 'error', reports: [], message: 'No se pudo cargar el catálogo. Intenta nuevamente.' })
    }
  }
}

/** Keep existing demo filters usable until S1-02 introduces server queries. */
export function filterCatalog(reports: CatalogReport[], filters: { search: string; city: string; category: string; status: FilterStatus }) {
  return reports.filter((report) => {
    const text = normalizeText([report.title, report.description, report.zone, report.city].join(' '))
    return (!filters.search || text.includes(normalizeText(filters.search)))
      && (filters.city === 'Todas las ciudades' || report.city === filters.city)
      && (filters.category === 'Todas las categorías' || report.category === filters.category)
      && (filters.status === 'Todos' || report.status === filters.status)
  })
}
