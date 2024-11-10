import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from '../utils/constants';
import { rateLimiter } from '../utils/rateLimiter';
import { walletRegistry } from './walletRegistry';

interface Depositor {
  address: string;
  amount: number;
  lastDeposit: number;
}

interface CacheEntry {
  depositors: Depositor[];
  timestamp: number;
}

const CACHE_DURATION = 20000; // 20 seconds cache duration
let cache: CacheEntry | null = null;

async function fetchTransactionWithRetry(
  connection: Connection,
  signature: string,
  retries = 3
): Promise<any> {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      await rateLimiter.checkRateLimit();
      
      console.log(`Fetching transaction ${signature} (attempt ${attempt + 1}/${retries})`);
      
      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed'
      });
      
      if (tx) {
        console.log(`Successfully fetched transaction ${signature}`);
        return tx;
      }
      
      if (attempt === retries - 1) {
        console.warn(`Failed to fetch transaction ${signature} after ${retries} attempts`);
        return null;
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    } catch (error) {
      console.error(`Error fetching transaction ${signature} (attempt ${attempt + 1}):`, error);
      if (attempt === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
  return null;
}

function convertToUiAmount(amount: number | bigint): number {
  return Number(amount) / Math.pow(10, SOLANA_CONSTANTS.USDT_DECIMALS);
}

export async function getTopDepositors(
  connection: Connection,
  limit: number = 5
): Promise<Depositor[]> {
  try {
    console.log('Starting getTopDepositors...');
    
    // Check cache first
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      console.log('Returning cached depositors data');
      return cache.depositors.slice(0, limit);
    }

    const depositors = new Map<string, Depositor>();
    let beforeSignature: string | undefined;
    let totalProcessed = 0;
    const MAX_TRANSACTIONS = 1000;
    const knownWallets = new Set([
      '2gDt1UgUCRFJBfQRzkjnvXYmTRWMok1fgbQjC3WzCeeR',
      'H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv'
    ]);

    while (totalProcessed < MAX_TRANSACTIONS) {
      await rateLimiter.checkRateLimit();
      
      console.log(`Fetching signatures (before: ${beforeSignature || 'initial'})`);
      
      const signatures = await connection.getSignaturesForAddress(
        SOLANA_CONSTANTS.INCUBATOR_WALLET,
        { 
          before: beforeSignature,
          limit: SOLANA_CONSTANTS.MAX_SIGNATURE_BATCH_SIZE 
        },
        'confirmed'
      );

      if (signatures.length === 0) {
        console.log('No more signatures found');
        break;
      }

      console.log(`Processing ${signatures.length} signatures...`);

      // Process transactions in smaller batches
      for (let i = 0; i < signatures.length; i += SOLANA_CONSTANTS.BATCH_SIZE) {
        const batch = signatures.slice(i, i + SOLANA_CONSTANTS.BATCH_SIZE);
        
        const transactions = await Promise.all(
          batch.map(({ signature, blockTime }) => 
            fetchTransactionWithRetry(connection, signature)
              .then(tx => ({ tx, blockTime }))
          )
        );

        for (const txData of transactions) {
          if (!txData?.tx?.meta) continue;

          const { meta, transaction } = txData.tx;
          const preBalances = meta.preTokenBalances || [];
          const postBalances = meta.postTokenBalances || [];

          // Track all USDT accounts involved in the transaction
          const usdtAccounts = new Map<string, { pre: number, post: number, owner: string }>();

          // Process pre-balances
          preBalances.forEach(balance => {
            if (balance.mint === SOLANA_CONSTANTS.USDT_MINT.toString()) {
              usdtAccounts.set(balance.accountIndex.toString(), {
                pre: Number(balance.uiTokenAmount.amount),
                post: 0,
                owner: balance.owner
              });
            }
          });

          // Process post-balances
          postBalances.forEach(balance => {
            if (balance.mint === SOLANA_CONSTANTS.USDT_MINT.toString()) {
              const account = usdtAccounts.get(balance.accountIndex.toString()) || {
                pre: 0,
                post: 0,
                owner: balance.owner
              };
              account.post = Number(balance.uiTokenAmount.amount);
              usdtAccounts.set(balance.accountIndex.toString(), account);
            }
          });

          // Find the incubator's balance change
          const incubatorAccount = Array.from(usdtAccounts.values())
            .find(acc => acc.owner === SOLANA_CONSTANTS.INCUBATOR_WALLET.toString());

          if (incubatorAccount && incubatorAccount.post > incubatorAccount.pre) {
            const depositAmount = convertToUiAmount(incubatorAccount.post - incubatorAccount.pre);

            // Find the sender (account with decreased balance)
            const sender = Array.from(usdtAccounts.values())
              .find(acc => 
                acc.owner !== SOLANA_CONSTANTS.INCUBATOR_WALLET.toString() && 
                acc.pre > acc.post
              );

            if (sender) {
              const currentDepositor = depositors.get(sender.owner) || {
                address: sender.owner,
                amount: 0,
                lastDeposit: 0
              };

              if (knownWallets.has(sender.owner)) {
                console.log(`Found transaction for known wallet ${sender.owner}:`);
                console.log(`- Amount: ${depositAmount} USDT`);
                console.log(`- Timestamp: ${new Date(txData.blockTime * 1000).toISOString()}`);
              }

              depositors.set(sender.owner, {
                ...currentDepositor,
                amount: currentDepositor.amount + depositAmount,
                lastDeposit: Math.max(currentDepositor.lastDeposit, txData.blockTime || 0)
              });

              // Update wallet registry
              walletRegistry.updateWalletDeposit(sender.owner, depositAmount);
            }
          }
        }

        totalProcessed += batch.length;
        
        // Add delay between batches to respect rate limits
        if (i + SOLANA_CONSTANTS.BATCH_SIZE < signatures.length) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      // Prepare for next iteration
      beforeSignature = signatures[signatures.length - 1].signature;

      // Add delay between signature fetches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Sort by amount and get top depositors
    const sortedDepositors = Array.from(depositors.values())
      .sort((a, b) => b.amount - a.amount || b.lastDeposit - a.lastDeposit)
      .slice(0, limit);

    console.log('Final depositors list:');
    sortedDepositors.forEach((depositor, index) => {
      console.log(`${index + 1}. ${depositor.address}: ${depositor.amount} USDT`);
    });

    // Update cache
    cache = {
      depositors: sortedDepositors,
      timestamp: Date.now()
    };

    return sortedDepositors;
  } catch (error) {
    console.error('Error fetching top depositors:', error);
    if (cache) {
      return cache.depositors.slice(0, limit);
    }
    throw error;
  }
}