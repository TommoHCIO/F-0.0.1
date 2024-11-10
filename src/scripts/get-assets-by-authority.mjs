import { Connection } from '@solana/web3.js';

const RPC_ENDPOINT = 'https://bitter-necessary-fire.solana-mainnet.quiknode.pro/9f2b94fd2a64eca4308bfe2c78043465443a1c54/';

async function getAssetsByAuthority(authorityAddress) {
  try {
    const connection = new Connection(RPC_ENDPOINT, {
      commitment: 'confirmed',
      httpHeaders: {
        'Content-Type': 'application/json',
      }
    });

    // Make direct RPC request using underlying transport
    const response = await connection._rpcRequest('getAssetsByAuthority', [authorityAddress]);

    if (response.error) {
      throw new Error(`RPC Error: ${response.error.message}`);
    }

    console.log('Assets found:', JSON.stringify(response.result, null, 2));
    return response.result;

  } catch (error) {
    console.error('Error fetching assets:', error);
    throw error;
  }
}

// Example usage with the incubator wallet address
const AUTHORITY_ADDRESS = 'H8oTGbCNLRXu844GBRXCAfWTxt6Sa9vB9gut9bLrPdWv';

console.log(`Fetching assets for authority: ${AUTHORITY_ADDRESS}\n`);
getAssetsByAuthority(AUTHORITY_ADDRESS);