import { db } from './db';
import { api } from '../api/client';

export async function synchronizeOfflineMutations(queryClient: any) {
  if (!navigator.onLine) return;
  const pending = await db.offlineMutations.where('status').equals('PENDING').toArray();
  if (pending.length === 0) return;
  
  await db.offlineMutations.toCollection().modify({ status: 'SYNCING' });
  try {
    await api.post('/sync/batch', pending);
    await db.offlineMutations.clear();
    queryClient.invalidateQueries();
  } catch (err) {
    await db.offlineMutations.toCollection().modify({ status: 'FAILED' });
  }
}
