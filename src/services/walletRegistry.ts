import { PublicKey } from '@solana/web3.js';

interface WalletData {
  address: string;
  firstSeen: number;
  lastSeen: number;
  totalDeposits: number;
  lastDepositAmount: number;
  lastDepositTime: number;
}

class WalletRegistry {
  private static instance: WalletRegistry;
  private wallets: Map<string, WalletData>;
  private storageKey = 'cte_wallet_registry';

  private constructor() {
    this.wallets = new Map();
    this.loadFromStorage();
  }

  public static getInstance(): WalletRegistry {
    if (!WalletRegistry.instance) {
      WalletRegistry.instance = new WalletRegistry();
    }
    return WalletRegistry.instance;
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const data = JSON.parse(stored);
        this.wallets = new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('Error loading wallet registry:', error);
    }
  }

  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.wallets);
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving wallet registry:', error);
    }
  }

  public registerWallet(address: string | PublicKey): void {
    const walletAddress = address.toString();
    const now = Date.now();
    
    const existing = this.wallets.get(walletAddress);
    if (existing) {
      this.wallets.set(walletAddress, {
        ...existing,
        lastSeen: now
      });
    } else {
      this.wallets.set(walletAddress, {
        address: walletAddress,
        firstSeen: now,
        lastSeen: now,
        totalDeposits: 0,
        lastDepositAmount: 0,
        lastDepositTime: 0
      });
    }

    this.saveToStorage();
  }

  public updateWalletDeposit(address: string | PublicKey, amount: number): void {
    const walletAddress = address.toString();
    const now = Date.now();
    
    const existing = this.wallets.get(walletAddress);
    if (existing) {
      this.wallets.set(walletAddress, {
        ...existing,
        lastSeen: now,
        totalDeposits: existing.totalDeposits + amount,
        lastDepositAmount: amount,
        lastDepositTime: now
      });
    } else {
      this.wallets.set(walletAddress, {
        address: walletAddress,
        firstSeen: now,
        lastSeen: now,
        totalDeposits: amount,
        lastDepositAmount: amount,
        lastDepositTime: now
      });
    }

    this.saveToStorage();
  }

  public getWalletData(address: string | PublicKey): WalletData | null {
    return this.wallets.get(address.toString()) || null;
  }

  public getAllWallets(): WalletData[] {
    return Array.from(this.wallets.values());
  }

  public getTopDepositors(limit: number = 10): WalletData[] {
    return Array.from(this.wallets.values())
      .sort((a, b) => b.totalDeposits - a.totalDeposits)
      .slice(0, limit);
  }

  public getRecentWallets(limit: number = 10): WalletData[] {
    return Array.from(this.wallets.values())
      .sort((a, b) => b.lastSeen - a.lastSeen)
      .slice(0, limit);
  }

  public clearOldData(maxAge: number = 30 * 24 * 60 * 60 * 1000): void {
    const now = Date.now();
    for (const [address, data] of this.wallets.entries()) {
      if (now - data.lastSeen > maxAge) {
        this.wallets.delete(address);
      }
    }
    this.saveToStorage();
  }
}

export const walletRegistry = WalletRegistry.getInstance();