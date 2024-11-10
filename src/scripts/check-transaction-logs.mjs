import { Connection, PublicKey } from '@solana/web3.js';

const QUICKNODE_RPC = 'https://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/';
const INCUBATOR_WALLET = new PublicKey('H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv');

async function getTransactionLogs() {
  try {
    console.log('Fetching detailed transaction logs for incubator wallet...\n');
    
    const connection = new Connection(QUICKNODE_RPC, {
      commitment: 'confirmed',
      httpHeaders: {
        'Content-Type': 'application/json',
      }
    });

    // Get recent signatures
    const signatures = await connection.getSignaturesForAddress(
      INCUBATOR_WALLET,
      { limit: 10 },
      'confirmed'
    );

    console.log(`Found ${signatures.length} recent transactions\n`);

    for (const { signature } of signatures) {
      // Get transaction logs using QuickNode's enhanced RPC method
      const logs = await connection._rpcRequest('getTransactionLogs', [signature]);
      
      if (logs.error) {
        console.error(`Error fetching logs for ${signature}:`, logs.error);
        continue;
      }

      console.log(`\nTransaction: ${signature}`);
      console.log('Logs:');
      
      if (logs.result && logs.result.logs) {
        logs.result.logs.forEach((log, index) => {
          console.log(`  ${index + 1}. ${log}`);
        });
      }

      // Get parsed transaction details
      const tx = await connection.getParsedTransaction(signature, {
        maxSupportedTransactionVersion: 0,
        commitment: 'confirmed'
      });

      if (tx?.meta) {
        const { preTokenBalances = [], postTokenBalances = [] } = tx.meta;
        
        console.log('\nToken Balance Changes:');
        postTokenBalances.forEach(post => {
          const pre = preTokenBalances.find(p => p.accountIndex === post.accountIndex);
          if (pre) {
            const preAmount = pre.uiTokenAmount.uiAmount || 0;
            const postAmount = post.uiTokenAmount.uiAmount || 0;
            const change = postAmount - preAmount;
            
            if (change !== 0) {
              console.log(`  Account: ${post.owner}`);
              console.log(`  Change: ${change > 0 ? '+' : ''}${change.toLocaleString()} tokens`);
            }
          }
        });
      }

      console.log('\n' + '-'.repeat(80));
    }

  } catch (error) {
    console.error('Error fetching transaction logs:', error);
  }
}

// Run the check
getTransactionLogs();