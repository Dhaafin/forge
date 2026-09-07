import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { workoutsService, CreateWorkoutSessionPayload } from './workouts.service';

const QUEUE_STORAGE_KEY = 'FORGE_PENDING_WORKOUTS_QUEUE';

export interface QueuedWorkoutItem {
  id: string;
  createdAt: string;
  payload: CreateWorkoutSessionPayload;
  retryCount: number;
}

export const workoutSyncQueue = {
  /** Fetch all pending workout items from AsyncStorage */
  async getQueue(): Promise<QueuedWorkoutItem[]> {
    try {
      const raw = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /** Enqueue a newly finished workout when offline or connection is poor */
  async enqueue(payload: CreateWorkoutSessionPayload): Promise<QueuedWorkoutItem> {
    const queue = await this.getQueue();
    const item: QueuedWorkoutItem = {
      id: `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date().toISOString(),
      payload,
      retryCount: 0,
    };
    queue.push(item);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return item;
  },

  /** Process pending workouts queue sequentially (FIFO) */
  async processQueue(
    onSuccess?: (item: QueuedWorkoutItem) => void,
    onError?: (err: any) => void
  ): Promise<void> {
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) return;

    const queue = await this.getQueue();
    if (queue.length === 0) return;

    const remainingQueue: QueuedWorkoutItem[] = [];

    for (const item of queue) {
      try {
        await workoutsService.createSession(item.payload);
        if (onSuccess) onSuccess(item);
      } catch (err) {
        item.retryCount += 1;
        remainingQueue.push(item);
        if (onError) onError(err);
      }
    }

    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(remainingQueue));
  },

  /** Listen for network status changes and trigger processQueue automatically when back online */
  initAutoSyncListener(onSynced?: (syncedItem: QueuedWorkoutItem) => void): () => void {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        this.processQueue(onSynced);
      }
    });
    return unsubscribe;
  },
};
