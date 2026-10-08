import { Map, Plus, SlidersHorizontal } from 'lucide-react'
import type { Dispatch, SetStateAction } from 'react'
import type { FilterStatus, Report, ReportView, Section } from '../types'
import { PageHeading } from '../components/common/PageHeading'
import { MapResult, MapView } from '../components/reports/MapView'
import { ReportCollection } from '../components/reports/ReportCollection'
import { ReportFilters } from '../components/reports/ReportFilters'
import { ReportSearch } from '../components/reports/ReportSearch'

type ExplorePageProps = {
  reports: Report[]
  search: string
  setSearch: (value: string) => void
  city: string
  setCity: Dispatch<SetStateAction<string>>
  category: string
  setCategory: Dispatch<SetStateAction<string>>
  status: FilterStatus
  setStatus: Dispatch<SetStateAction<FilterStatus>>
  view: ReportView
  setView: Dispatch<SetStateAction<ReportView>>
  resetFilters: () => void
  onOpen: (report: Report) => void
  saved: number[]
  onSave: (id: number) => void
  onNavigate: (section: Section) => void
}

export function ExplorePage({ reports, search, setSearch, city, setCity, category, setCategory, status, setStatus, view, setView, resetFilters, onOpen, saved, onSave, onNavigate }: ExplorePageProps) {
  return (
    <>
      <PageHeading eyebrow="CATÁLOGO DE LA COMUNIDAD" title="Explorar reportes" description="Busca por palabra, ciudad o categoría para encontrar lo que necesitas." action={<button className="primary-button" onClick={() => onNavigate('publish')}><Plus size={16} /> Publicar reporte</button>} />
      <div className="explore-toolbar">
        <ReportSearch value={search} onChange={setSearch} />
        <ReportFilters city={city} setCity={setCity} category={category} setCategory={setCategory} status={status} setStatus={setStatus} showStatus={false} />
        <button className="filter-reset" onClick={resetFilters}><SlidersHorizontal size={15} /> Limpiar</button>
      </div>
      <div className="catalog-toolbar">
        <div className="status-tabs" role="tablist" aria-label="Estado del reporte">
          {(['Todos', 'Perdido', 'Encontrado'] as FilterStatus[]).map((item) => <button key={item} className={status === item ? 'selected' : ''} aria-selected={status === item} role="tab" onClick={() => setStatus(item)}>{item === 'Todos' ? 'Todos' : item + 's'}</button>)}
        </div>
        <div className="catalog-meta"><span><b>{reports.length}</b> resultados</span><span className="header-divider" /><div className="view-toggle">
          <button className={view === 'grid' ? 'selected' : ''} onClick={() => setView('grid')} aria-label="Ver en lista"><span className="grid-glyph"><i /><i /><i /><i /></span></button>
          <button className={view === 'map' ? 'selected' : ''} onClick={() => setView('map')} aria-label="Ver en mapa"><Map size={16} /></button>
        </div></div>
      </div>
      {view === 'grid'
        ? <ReportCollection reports={reports} saved={saved} onSave={onSave} onOpen={onOpen} onNavigate={onNavigate} onClear={resetFilters} emptyCopy="Prueba con otra búsqueda o cambia los filtros." />
        : <div className="map-layout"><MapView reports={reports} onOpen={onOpen} /><div className="map-results">{reports.slice(0, 4).map((report) => <MapResult key={report.id} report={report} onOpen={() => onOpen(report)} />)}</div></div>}
    </>
  )
}
