/** Shared API shapes for the web app and the future PerdiU API. */
export type ReportStatus = 'lost' | 'found' | 'resolved'
export type ReportCategory = 'pet' | 'object' | 'document'

export interface ReportSummary {
  id: string
  title: string
  description: string
  status: ReportStatus
  category: ReportCategory
  city: string
  zone: string
  imageUrls: string[]
  createdAt: string
}

export interface PublicProfile {
  id: string
  displayName: string
  photoUrl?: string
}
