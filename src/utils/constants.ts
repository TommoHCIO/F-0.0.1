import { PublicKey } from '@solana/web3.js';

export const SOLANA_CONSTANTS = {
  USDT_MINT: new PublicKey('Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB'),
  INCUBATOR_WALLET: new PublicKey('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv'),
  RPC_ENDPOINTS: [
    'https://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com'
  ],
  WSS_ENDPOINT: 'wss://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
  CONNECTION_CONFIG: {
    commitment: 'confirmed',
    wsEndpoint: 'wss://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/',
    useWs: true,
    disableRetryOnRateLimit: true,
    confirmTransactionInitialTimeout: 60000,
    httpHeaders: {
      'Content-Type': 'application/json',
    }
  },
  CACHE_DURATION: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  REQUEST_TIMEOUT: 10000,
  USDT_DECIMALS: 6,
  REQUEST_INTERVAL: 1000,
  MIN_ENDPOINT_SWITCH_INTERVAL: 5000,
  BATCH_SIZE: 2,
  MAX_SIGNATURE_BATCH_SIZE: 5,
  ERROR_MESSAGES: {
    INSUFFICIENT_BALANCE: 'Insufficient USDT balance',
    WALLET_NOT_CONNECTED: 'Wallet not connected',
    TRANSACTION_FAILED: 'Transaction failed',
    INVALID_AMOUNT: 'Invalid amount',
    RPC_ERROR: 'RPC endpoint error',
    TIMEOUT: 'Request timed out',
    RATE_LIMIT: 'Rate limit exceeded'
  }
};