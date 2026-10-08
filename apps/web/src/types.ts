export type Category = 'Mascota' | 'Objeto' | 'Documentos'
export type ReportStatus = 'Perdido' | 'Encontrado'
export type FilterStatus = 'Todos' | ReportStatus
export type Section = 'overview' | 'explore' | 'map' | 'publish' | 'my-reports' | 'saved' | 'safety'

export type Report = {
  id: number
  title: string
  description: string
  category: Category
  status: ReportStatus
  city: string
  zone: string
  date: string
  posted: string
  image: string
  person: string
  initials: string
  phone: string
  color: string
  resolved?: boolean
  position: { top: string; left: string }
}

export type ReportView = 'grid' | 'map'
