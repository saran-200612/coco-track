import Dexie, { Table } from 'dexie';

export interface OfflineMutation {
  id?: number;
  clientId: string;
  endpoint: string;
  method: string;
  payload: any;
  timestamp: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  entityName: string;
}

export class CocoTrackDB extends Dexie {
  offlineMutations!: Table<OfflineMutation, number>;
  constructor() {
    super('CocoTrackOfflineDB');
    this.version(1).stores({ offlineMutations: '++id, status, entityName, timestamp' });
  }
}
export const db = new CocoTrackDB();
