import type { PublicProfile, ReportData } from '@perdiu/contracts'

export interface ReportRecord extends ReportData {
  author: PublicProfile
  imageUrls: string[]
}

export interface ReportRepository {
  list(): Promise<ReportRecord[]>
}
