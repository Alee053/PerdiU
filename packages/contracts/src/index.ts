/** Shared report model; ownership is the verified Auth subject, never a display name. */
export type ReportType = 'lost' | 'found'
export type ReportState = 'active' | 'resolved'
export type ReportCategory = 'pet' | 'object' | 'document'

export interface ReportData {
  id: string
  ownerId: string
  title: string
  description: string
  type: ReportType
  state: ReportState
  category: ReportCategory
  city: string
  zone: string
  incidentDate: string
  createdAt: string
}

/** Public allowlist: private contact and storage keys have no place in this DTO. */
export interface ReportSummary extends Omit<ReportData, 'ownerId'> {
  author: PublicProfile
  imageUrls: string[]
}

export interface PublicProfile {
  id: string
  displayName: string
  photoUrl?: string
}
