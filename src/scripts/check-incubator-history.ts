import { Connection, PublicKey } from '@solana/web3.js';
import { SOLANA_CONSTANTS } from '../utils/constants';

async function checkIncubatorHistory() {
  try {
    console.log('Fetching transaction history for incubator wallet...');
    console.log(`Address: ${SOLANA_CONSTANTS.INCUBATOR_WALLET.toString()}\n`);

    const connection = new Connection(SOLANA_CONSTANTS.RPC_ENDPOINTS[0], {
      commitment: 'confirmed'
    });

    let hasMore = true;
    let beforeSignature: string | undefined;
    const deposits = new Map<string, { total: number, lastDeposit: number }>();

    while (hasMore) {
      const signatures = await connection.getSignaturesForAddress(
        SOLANA_CONSTANTS.INCUBATOR_WALLET,
        { before: beforeSignature, limit: 100 },
        'confirmed'
      );

      if (signatures.length === 0) break;

      console.log(`Processing ${signatures.length} transactions...`);

      for (const { signature, blockTime } of signatures) {
        const tx = await connection.getParsedTransaction(signature, {
          maxSupportedTransactionVersion: 0,
          commitment: 'confirmed'
        });

        if (!tx?.meta) continue;

        const { meta, transaction } = tx;
        const preBalances = meta.preTokenBalances || [];
        const postBalances = meta.postTokenBalances || [];

        // Find USDT transfers to incubator
        const preIncubatorBalance = preBalances.find(
          b => b.owner === SOLANA_CONSTANTS.INCUBATOR_WALLET.toString() &&
               b.mint === SOLANA_CONSTANTS.USDT_MINT.toString()
        )?.uiTokenAmount.uiAmount || 0;

        const postIncubatorBalance = postBalances.find(
          b => b.owner === SOLANA_CONSTANTS.INCUBATOR_WALLET.toString() &&
               b.mint === SOLANA_CONSTANTS.USDT_MINT.toString()
        )?.uiTokenAmount.uiAmount || 0;

        // If there was a deposit
        if (postIncubatorBalance > preIncubatorBalance) {
          const depositAmount = postIncubatorBalance - preIncubatorBalance;
          
          // Find sender's token account
          const senderAccount = postBalances.find(account => 
            account.owner !== SOLANA_CONSTANTS.INCUBATOR_WALLET.toString() &&
            account.mint === SOLANA_CONSTANTS.USDT_MINT.toString()
          );

          if (senderAccount) {
            const sender = senderAccount.owner;
            const current = deposits.get(sender) || { total: 0, lastDeposit: 0 };
            
            deposits.set(sender, {
              total: current.total + depositAmount,
              lastDeposit: Math.max(current.lastDeposit, blockTime || 0)
            });

            const date = new Date((blockTime || 0) * 1000).toLocaleString();
            console.log(`\nDeposit found:`);
            console.log(`From: ${sender}`);
            console.log(`Amount: ${depositAmount.toLocaleString()} USDT`);
            console.log(`Date: ${date}`);
            console.log(`Transaction: ${signature}`);
          }
        }
      }

      // Prepare for next batch
      beforeSignature = signatures[signatures.length - 1].signature;
      hasMore = signatures.length === 100;

      // Add delay between requests
      if (hasMore) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Print summary
    console.log('\n=== Summary ===');
    const sortedDeposits = Array.from(deposits.entries())
      .sort(([, a], [, b]) => b.total - a.total);

    sortedDeposits.forEach(([address, { total, lastDeposit }]) => {
      const lastDepositDate = new Date(lastDeposit * 1000).toLocaleString();
      console.log(`\nWallet: ${address}`);
      console.log(`Total Deposited: ${total.toLocaleString()} USDT`);
      console.log(`Last Deposit: ${lastDepositDate}`);
    });

  } catch (error) {
    console.error('Error fetching transaction history:', error);
  }
}

// Run the check
checkIncubatorHistory();