import axios from 'axios';
import { db } from '../offline/db';

export const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  if (!navigator.onLine && ['post', 'put', 'patch', 'delete'].includes(config.method || '')) {
    const clientId = 'offline-' + Math.random().toString(36).substr(2, 9);
    await db.offlineMutations.add({
      clientId, endpoint: config.url || '', method: config.method?.toUpperCase() || 'POST',
      payload: config.data, timestamp: Date.now(), status: 'PENDING', entityName: config.url?.split('/')[1] || 'unknown'
    });
    return Promise.reject({ _offlineQueued: true, clientId, config });
  }
  return config;
});

api.interceptors.response.use(res => res, error => {
  if (error._offlineQueued) {
    return Promise.resolve({ status: 202, data: { _offlineQueued: true, id: error.clientId } });
  }
  return Promise.reject(error);
});
