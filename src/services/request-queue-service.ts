import { DI } from 'aurelia';
import { IRequestQueueService, QueueItem } from './interfaces.js';

export const RequestQueueServiceToken = DI.createInterface<IRequestQueueService>('IRequestQueueService');

/**
 * Service that queues async function calls to ensure sequential execution and prevent race conditions.
 * 
 * While this service was originally designed to solve nonce collision issues when making API calls to 
 * cryptocurrency exchanges (like Kraken) that require strictly increasing nonce values for authentication,
 * it can be used for any scenario where you need to ensure async operations execute one at a time.
 * 
 * Common use cases:
 * - **API calls with nonce requirements** (crypto exchanges)
 * - **Database operations** that must be sequential
 * - **File system operations** that need ordering
 * - **Rate-limited API calls** where you need controlled timing
 * - **Any async operations** where race conditions are a concern
 * 
 * ## Features:
 * - **Sequential Execution**: Ensures only one async operation executes at a time
 * - **Promise-based API**: Each queued operation returns a promise that resolves when completed
 * - **Automatic Processing**: Queue starts processing automatically when operations are added
 * - **Error Isolation**: Failed operations don't stop processing of subsequent operations
 * - **Inter-operation Delays**: Configurable delay between operations for timing control
 * - **Queue Management**: Methods to inspect queue state and clear pending operations
 * 
 * ## Usage:
 * ```typescript
 * // Wrap your async calls with enqueue()
 * const result = await requestQueue.enqueue(() => 
 *   axios.get('/api/balance/BTC')
 * );
 * 
 * // Multiple async operations will be processed sequentially
 * const [balance, price, orders] = await Promise.all([
 *   requestQueue.enqueue(() => axios.get(`/api/balance/${asset.name}`)),
 *   requestQueue.enqueue(() => axios.get(`/api/price/${asset.name}/USD`)),
 *   requestQueue.enqueue(() => axios.post('/api/orders', orderData))
 * ]);
 * 
 * // Works with any async function
 * const fileResult = await requestQueue.enqueue(() => fs.promises.readFile('data.json'));
 * const dbResult = await requestQueue.enqueue(() => database.query('SELECT * FROM users'));
 * ```
 * 
 * ## Thread Safety:
 * This service maintains an internal queue and processing state to ensure that even when
 * multiple components call enqueue() simultaneously, all operations are processed one at a time
 * in the order they were queued.
 * 
 * @example
 * // In a component or service:
 * async fetchAssetData(assetName: string) {
 *   return this.requestQueue.enqueue(async () => {
 *     const response = await axios.get(`/api/assets/${assetName}`);
 *     return response.data;
 *   });
 * }
 * 
 * @example
 * // Database operations:
 * async updateUserSequentially(userData: any) {
 *   return this.requestQueue.enqueue(() => database.users.update(userData));
 * }
 * 
 * @example
 * // File operations:
 * async writeFileSequentially(filename: string, data: string) {
 *   return this.requestQueue.enqueue(() => fs.promises.writeFile(filename, data));
 * }
 */
export class RequestQueueService implements IRequestQueueService {
  private queue: QueueItem<any>[] = [];
  private processing = false;
  private requestCounter = 0;
  private readonly defaultDelay = 100; // 100ms between requests
  private readonly enableLogging = false; // Disable verbose logging for performance

  /**
   * Adds a request function to the queue and returns a promise that resolves
   * when the request is executed.
   * 
   * @param requestFn Function that returns a promise for the HTTP request
   * @returns Promise that resolves with the request result
   */
  enqueue<T>(requestFn: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const queueItem: QueueItem<T> = {
        requestFn,
        resolve,
        reject,
        id: `req_${++this.requestCounter}`,
        timestamp: Date.now()
      };

      this.queue.push(queueItem);
      if (this.enableLogging) {
        console.log(`[RequestQueue] Enqueued request ${queueItem.id}, queue size: ${this.queue.length}`);
      }

      // Start processing if not already processing
      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  /**
   * Processes the queue sequentially, ensuring only one request executes at a time
   */
  private async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    this.processing = true;
    if (this.enableLogging) {
      console.log(`[RequestQueue] Starting to process queue with ${this.queue.length} items`);
    }

    while (this.queue.length > 0) {
      const queueItem = this.queue.shift()!;

      try {
        if (this.enableLogging) {
          console.log(`[RequestQueue] Processing request ${queueItem.id}`);
        }
        const result = await queueItem.requestFn();
        queueItem.resolve(result);
        if (this.enableLogging) {
          console.log(`[RequestQueue] Completed request ${queueItem.id}`);
        }

        // Small delay between requests to ensure proper nonce ordering
        await this.delay(this.defaultDelay);

      } catch (error) {
        console.error(`[RequestQueue] Failed request ${queueItem.id}:`, error);
        queueItem.reject(error);
      }
    }

    this.processing = false;
    if (this.enableLogging) {
      console.log(`[RequestQueue] Finished processing queue`);
    }
  }

  /**
   * Clears all pending requests in the queue
   */
  clear(): void {
    const clearedCount = this.queue.length;

    // Reject all pending requests
    this.queue.forEach(item => {
      item.reject(new Error('Request queue was cleared'));
    });

    this.queue = [];
    if (this.enableLogging) {
      console.log(`[RequestQueue] Cleared ${clearedCount} pending requests`);
    }
  }

  /**
   * Returns the current number of pending requests
   */
  getQueueSize(): number {
    return this.queue.length;
  }

  /**
   * Returns whether the queue is currently processing a request
   */
  isProcessing(): boolean {
    return this.processing;
  }

  /**
   * Utility method to add delay between requests
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}