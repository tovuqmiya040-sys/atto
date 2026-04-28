/**
 * Real-time Event Manager
 * Bu modul orqali ilovaning turli qismlari bir-biri bilan real-time muloqot qiladi
 * WebSocket yoki boshqa real-time texnologiyalarni qo'shish oson bo'ladi
 */

type EventCallback = (...args: any[]) => void;

class EventManager {
  private listeners: Map<string, Set<EventCallback>> = new Map();

  /**
   * Eventga listener qo'shish
   */
  on(event: string, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Cleanup function qaytarish
    return () => {
      this.off(event, callback);
    };
  }

  /**
   * Event listener'ni o'chirish
   */
  off(event: string, callback: EventCallback) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Eventni trigger qilish - barcha listenerlarni chaqirish
   */
  emit(event: string, ...args: any[]) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`[EventManager] Error in listener for event "${event}":`, error);
        }
      });
    }
  }

  /**
   * Bir martalik listener
   */
  once(event: string, callback: EventCallback) {
    const unsubscribe = this.on(event, (...args) => {
      callback(...args);
      unsubscribe();
    });
    return unsubscribe;
  }

  /**
   * Barcha listenerlarni o'chirish
   */
  clear(event?: string) {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Listenerlar sonini olish
   */
  listenerCount(event: string): number {
    return this.listeners.get(event)?.size || 0;
  }
}

// Singleton instance
export const eventManager = new EventManager();

// Foydalanish misollari:
// 
// 1. Balance yangilanganda:
//    eventManager.emit('balance:updated', newBalance);
//
// 2. Yangi transaction kelganda:
//    eventManager.emit('transaction:new', transaction);
//
// 3. Offline/Online holat o'zgarganda:
//    eventManager.emit('network:status', { online: true });
//
// 4. Listener qo'shish:
//    eventManager.on('balance:updated', (newBalance) => {
//      console.log('Balance updated:', newBalance);
//    });
//
// 5. WebSocket integratsiyasi (kelajakda):
//    websocket.onmessage = (event) => {
//      const data = JSON.parse(event.data);
//      eventManager.emit(data.type, data.payload);
//    };
