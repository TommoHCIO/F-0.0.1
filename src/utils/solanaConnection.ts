import { Connection } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from './constants';
import { rateLimiter } from './rateLimiter';

interface EndpointHealth {
  endpoint: string;
  lastSuccess: number;
  failures: number;
  lastAttempt: number;
}

export class SolanaConnectionManager {
  private static instance: SolanaConnectionManager;
  private connection: Connection | null;
  private healthStats: Map<string, EndpointHealth>;
  private lastRequestTime: number;
  private lastEndpointSwitch: number;
  private currentEndpointIndex: number;

  private constructor() {
    this.connection = null;
    this.healthStats = new Map();
    this.lastRequestTime = 0;
    this.lastEndpointSwitch = 0;
    this.currentEndpointIndex = 0;
    this.initializeConnection();
  }

  private initializeConnection(): void {
    this.connection = new Connection(
      SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex],
      {
        ...SOLANA_CONSTANTS.CONNECTION_CONFIG,
        wsEndpoint: SOLANA_CONSTANTS.WSS_ENDPOINT,
        fetch: (url, options) => {
          return fetch(url, {
            ...options,
            headers: {
              ...options?.headers,
              'Content-Type': 'application/json',
            },
            cache: 'no-store',
          });
        }
      }
    );

    SOLANA_CONSTANTS.RPC_ENDPOINTS.forEach(endpoint => {
      this.healthStats.set(endpoint, {
        endpoint,
        lastSuccess: 0,
        failures: 0,
        lastAttempt: 0
      });
    });
  }

  public static getInstance(): SolanaConnectionManager {
    if (!SolanaConnectionManager.instance) {
      SolanaConnectionManager.instance = new SolanaConnectionManager();
    }
    return SolanaConnectionManager.instance;
  }

  private async waitForRateLimit(): Promise<void> {
    await rateLimiter.checkRateLimit();
  }

  private switchEndpoint(): void {
    const now = Date.now();
    const currentEndpoint = SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex];
    const health = this.healthStats.get(currentEndpoint);
    
    if (health) {
      health.failures++;
      health.lastAttempt = now;
    }

    this.currentEndpointIndex = (this.currentEndpointIndex + 1) % SOLANA_CONSTANTS.RPC_ENDPOINTS.length;
    this.connection = new Connection(
      SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex],
      {
        ...SOLANA_CONSTANTS.CONNECTION_CONFIG,
        wsEndpoint: SOLANA_CONSTANTS.WSS_ENDPOINT
      }
    );
    
    this.lastEndpointSwitch = now;
    console.warn(`Switched to RPC endpoint: ${SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex]}`);
  }

  private async verifyConnection(): Promise<Connection> {
    if (!this.connection) {
      this.initializeConnection();
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), SOLANA_CONSTANTS.REQUEST_TIMEOUT);

      await this.connection!.getSlot({ signal: controller.signal });
      clearTimeout(timeoutId);

      // Update health stats for successful connection
      const currentEndpoint = SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex];
      const health = this.healthStats.get(currentEndpoint);
      if (health) {
        health.lastSuccess = Date.now();
        health.failures = 0;
      }

      rateLimiter.decreaseInterval();
      return this.connection!;
    } catch (error) {
      const now = Date.now();
      if (now - this.lastEndpointSwitch < SOLANA_CONSTANTS.MIN_ENDPOINT_SWITCH_INTERVAL) {
        throw error;
      }

      console.warn('Endpoint verification failed, switching to next endpoint');
      this.switchEndpoint();
      return this.connection!;
    }
  }

  public async executeWithRetry<T>(
    operation: (connection: Connection) => Promise<T>,
    maxRetries = SOLANA_CONSTANTS.MAX_RETRIES
  ): Promise<T> {
    await this.waitForRateLimit();

    let lastError: Error | null = null;
    let retryDelay = SOLANA_CONSTANTS.RETRY_DELAY;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const connection = await this.verifyConnection();
        return await operation(connection);
      } catch (error: any) {
        lastError = error;
        console.warn(`Attempt ${attempt + 1} failed:`, error.message);

        if (error.message.includes('rate limit') || error.message.includes('429')) {
          rateLimiter.increaseInterval();
        }

        if (error.message.includes('Invalid') || 
            error.message.includes('insufficient') ||
            error.message.includes('cancelled')) {
          throw error;
        }

        // Switch endpoint on failure if enough time has passed
        if (Date.now() - this.lastEndpointSwitch >= SOLANA_CONSTANTS.MIN_ENDPOINT_SWITCH_INTERVAL) {
          this.switchEndpoint();
        }

        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          retryDelay *= 2; // Exponential backoff
        }
      }
    }

    throw lastError || new Error('Operation failed after retries');
  }

  public resetConnection(): void {
    this.connection = null;
    this.lastRequestTime = 0;
    this.lastEndpointSwitch = 0;
    this.currentEndpointIndex = 0;
    this.healthStats.clear();
    this.initializeConnection();
    rateLimiter.reset();
  }

  public getHealthStats(): Map<string, EndpointHealth> {
    return new Map(this.healthStats);
  }

  public getCurrentEndpoint(): string {
    return SOLANA_CONSTANTS.RPC_ENDPOINTS[this.currentEndpointIndex];
  }
}