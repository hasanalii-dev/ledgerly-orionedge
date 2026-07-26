import { get, set, update } from 'idb-keyval';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type OfflineAction = {
  id: string;
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  payload: any;
  timestamp: number;
};

const OFFLINE_QUEUE_KEY = 'capient-offline-queue';

export async function queueOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp'>) {
  const newAction: OfflineAction = {
    ...action,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
  };

  await update<OfflineAction[]>(OFFLINE_QUEUE_KEY, (val) => (val ? [...val, newAction] : [newAction]));
}

export async function syncOfflineActions() {
  const queue = await get<OfflineAction[]>(OFFLINE_QUEUE_KEY);
  if (!queue || queue.length === 0) return;

  toast.loading(`Syncing ${queue.length} offline changes...`, { id: 'offline-sync' });

  for (const action of queue) {
    try {
      if (action.type === 'INSERT') {
        await supabase.from(action.table).insert(action.payload);
      } else if (action.type === 'UPDATE') {
        await supabase.from(action.table).update(action.payload).eq('id', action.payload.id);
      } else if (action.type === 'DELETE') {
        await supabase.from(action.table).delete().eq('id', action.payload.id);
      }
    } catch (e) {
      console.error('Failed to sync action', action, e);
    }
  }

  await set(OFFLINE_QUEUE_KEY, []);
  toast.success(`Offline changes synced successfully!`, { id: 'offline-sync' });
}

export function initOfflineSync() {
  if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
      syncOfflineActions();
    });
  }
}
