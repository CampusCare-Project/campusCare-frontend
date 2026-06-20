import { getErrorMessage } from '@/api/client';
import { mediaService } from '@/api/media/service';
import { reportService } from '@/api/reports/service';
import type { CreateReportPayload } from '@/api/reports/types';
import { listLocalReports, markLocalReportFailed, markLocalReportSynced } from './db';

export const getLocalReports = listLocalReports;

export async function syncPendingReports() {
  const rows = await listLocalReports();
  let synced = 0;

  for (const row of rows) {
    try {
      const payload = JSON.parse(row.payload) as CreateReportPayload;
      const report = await reportService.create(payload);

      if (row.mediaUri) {
        const media = await mediaService.upload({
          uri: row.mediaUri,
          source: 'CAMERA',
          targetType: 'REPORT',
          targetId: report.id,
          usageType: 'REPORT_DAMAGE_PHOTO',
        });
        await reportService.addMedia(report.id, {
          mediaId: media.id,
          type: 'DAMAGE_PHOTO',
          caption: 'Foto kerusakan dari offline queue',
        });
      }

      await markLocalReportSynced(row.id);
      synced += 1;
    } catch (error) {
      await markLocalReportFailed(row.id, getErrorMessage(error));
    }
  }

  const remaining = await listLocalReports();
  return { synced, remaining: remaining.length };
}
