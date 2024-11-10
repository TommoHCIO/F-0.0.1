import { useState, useEffect } from 'react';
import { walletRegistry } from '../services/walletRegistry';
import { useWallet } from '../context/WalletContext';

export function useWalletRegistry() {
  const { publicKey } = useWallet();
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (publicKey) {
      walletRegistry.registerWallet(publicKey);
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  }, [publicKey]);

  return {
    isRegistered,
    getWalletData: () => publicKey ? walletRegistry.getWalletData(publicKey) : null,
    updateDeposit: (amount: number) => {
      if (publicKey) {
        walletRegistry.updateWalletDeposit(publicKey, amount);
      }
    }
  };
}