import { useState, useEffect, useCallback, useRef } from 'react';
import { Connection } from '@solana/web3.js';
import { SolanaConnectionManager } from '../utils/solanaConnection';
import { getTopDepositors } from '../services/leaderboardService';
import { SOLANA_CONSTANTS } from '../utils/constants';

export function useLeaderboard(limit: number = 5) {
  const [topDepositors, setTopDepositors] = useState<Depositor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef<boolean>(true);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const retryCountRef = useRef<number>(0);
  const lastFetchRef = useRef<number>(0);
  const MAX_RETRIES = 3;
  const UPDATE_INTERVAL = 20000; // 20 seconds between requests

  const fetchLeaderboard = useCallback(async (force: boolean = false) => {
    if (!mountedRef.current) return;

    const now = Date.now();
    if (!force && now - lastFetchRef.current < UPDATE_INTERVAL) {
      return;
    }

    try {
      lastFetchRef.current = now;
      const connectionManager = SolanaConnectionManager.getInstance();
      
      const depositors = await connectionManager.executeWithRetry(async (connection: Connection) => {
        return getTopDepositors(connection, limit);
      });
      
      if (mountedRef.current) {
        setTopDepositors(depositors);
        setError(null);
        retryCountRef.current = 0;
      }
    } catch (err: any) {
      console.error('Leaderboard fetch error:', err);
      
      if (mountedRef.current) {
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current++;
          timeoutRef.current = setTimeout(
            () => fetchLeaderboard(true),
            UPDATE_INTERVAL * Math.pow(2, retryCountRef.current)
          );
          return;
        }
        setError('Failed to fetch leaderboard');
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        
        // Schedule next update
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          fetchLeaderboard();
        }, UPDATE_INTERVAL);
      }
    }
  }, [limit]);

  useEffect(() => {
    mountedRef.current = true;
    fetchLeaderboard(true);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchLeaderboard]);

  const refetch = useCallback(() => {
    setIsLoading(true);
    retryCountRef.current = 0;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return fetchLeaderboard(true);
  }, [fetchLeaderboard]);

  return { topDepositors, isLoading, error, refetch };
}