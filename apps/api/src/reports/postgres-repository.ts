import type { Pool } from 'pg'
import type { ReportRecord, ReportRepository } from './model.js'

export class PostgresReportRepository implements ReportRepository {
  constructor(private readonly pool: Pool) {}

  async list(): Promise<ReportRecord[]> {
    // SQL restricts work; the case of use also enforces catalog invariants for other adapters.
    const result = await this.pool.query<ReportRecord>(`
      SELECT r.id, r.owner_id AS "ownerId", r.type, r.state, r.category,
        r.title, r.description, r.city, r.zone,
        to_char(r.incident_date, 'YYYY-MM-DD') AS "incidentDate",
        to_char(r.created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "createdAt",
        jsonb_strip_nulls(jsonb_build_object('id', p.id, 'displayName', p.display_name, 'photoUrl', p.photo_url)) AS author,
        ARRAY(SELECT i.public_url FROM report_images i WHERE i.report_id = r.id ORDER BY i.position) AS "imageUrls"
      FROM reports r JOIN profiles p ON p.id = r.owner_id
      WHERE r.state = $1
      ORDER BY r.created_at DESC, r.id ASC
    `, ['active'])
    return result.rows
  }
}
