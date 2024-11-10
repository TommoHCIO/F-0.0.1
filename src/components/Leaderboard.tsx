import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, RefreshCw } from 'lucide-react';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { walletRegistry } from '../services/walletRegistry';

export const Leaderboard = () => {
  const { topDepositors, isLoading, error, refetch } = useLeaderboard(5);
  const registeredWallets = walletRegistry.getTopDepositors(5);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 md:w-6 md:h-6 text-yellow-400" />;
      case 2:
        return <Medal className="w-4 h-4 md:w-6 md:h-6 text-gray-300" />;
      case 3:
        return <Medal className="w-4 h-4 md:w-6 md:h-6 text-amber-700" />;
      default:
        return <Trophy className="w-4 h-4 md:w-6 md:h-6 text-blue-400 opacity-50" />;
    }
  };

  const getRankStyles = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/20',
          text: 'text-yellow-400',
          hover: 'hover:border-yellow-500/40 hover:bg-yellow-500/5'
        };
      case 2:
        return {
          bg: 'bg-gray-300/10',
          border: 'border-gray-300/20',
          text: 'text-gray-300',
          hover: 'hover:border-gray-300/40 hover:bg-gray-300/5'
        };
      case 3:
        return {
          bg: 'bg-amber-700/10',
          border: 'border-amber-700/20',
          text: 'text-amber-700',
          hover: 'hover:border-amber-700/40 hover:bg-amber-700/5'
        };
      default:
        return {
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/10',
          text: 'text-blue-400',
          hover: 'hover:border-blue-500/30 hover:bg-blue-500/5'
        };
    }
  };

  const formatLastActivity = (timestamp: number) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const formatId = (id: string) => {
    if (!id) return '';
    return `${id.slice(0, 4)}...${id.slice(-4)}`;
  };

  // Merge on-chain data with registered wallet data
  const mergedDepositors = topDepositors.map(depositor => {
    const registeredData = walletRegistry.getWalletData(depositor.address);
    return {
      ...depositor,
      firstSeen: registeredData?.firstSeen || 0,
      lastSeen: registeredData?.lastSeen || depositor.lastDeposit * 1000
    };
  });

  return (
    <div className="bg-gradient-to-br from-[#1E2A37]/80 to-[#1E2A37]/50 backdrop-blur-lg rounded-xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden border border-white/5 h-full shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D9CDB]/5 to-transparent" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4 md:mb-8">
          <div className="text-center flex-1">
            <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] bg-clip-text text-transparent mb-1 md:mb-2">
              Top Contributors
            </h2>
            <p className="text-xs md:text-sm text-gray-400">Leading members of our community</p>
          </div>
          <button
            onClick={refetch}
            disabled={isLoading}
            className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-4 h-4 md:w-5 md:h-5 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-2 md:space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div 
                key={i} 
                className="bg-[#1E2A37] rounded-lg md:rounded-xl p-3 md:p-4 animate-pulse"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-8 h-8 md:w-12 md:h-12 bg-[#2D9CDB]/10 rounded-lg md:rounded-xl" />
                  <div className="flex-1">
                    <div className="h-3 md:h-4 bg-[#2D9CDB]/10 rounded w-16 md:w-24 mb-2" />
                    <div className="h-2 md:h-3 bg-[#2D9CDB]/10 rounded w-24 md:w-32" />
                  </div>
                  <div className="text-right">
                    <div className="h-3 md:h-4 bg-[#2D9CDB]/10 rounded w-14 md:w-20 mb-2" />
                    <div className="h-2 md:h-3 bg-[#2D9CDB]/10 rounded w-12 md:w-16" />
                  </div>
                </div>
              </div>
            ))
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 md:p-4 text-red-400 text-xs md:text-sm flex items-center justify-between">
              <span>Failed to load rankings</span>
              <button
                onClick={refetch}
                className="p-1 hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3 h-3 md:w-4 md:h-4" />
              </button>
            </div>
          ) : mergedDepositors.length === 0 ? (
            <div className="bg-[#1E2A37] rounded-lg md:rounded-xl p-6 md:p-8 text-center">
              <p className="text-gray-400 mb-1 md:mb-2 text-sm md:text-base">No contributions yet</p>
              <p className="text-xs md:text-sm text-gray-500">Be the first to participate!</p>
            </div>
          ) : (
            mergedDepositors.map((contributor, index) => {
              const styles = getRankStyles(index + 1);
              return (
                <motion.div
                  key={contributor.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`bg-[#1E2A37] rounded-lg md:rounded-xl p-3 md:p-4 flex items-center gap-3 md:gap-4 border ${styles.border} transition-all duration-200 ${styles.hover} shadow-lg`}
                >
                  <div className={`w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl flex items-center justify-center ${styles.bg}`}>
                    {getRankIcon(index + 1)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                      <span className={`text-sm md:text-base font-semibold ${styles.text}`}>
                        #{index + 1}
                      </span>
                      <div className="truncate text-xs md:text-sm text-gray-300">
                        {formatId(contributor.address)}
                      </div>
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-500">
                      Last active: {formatLastActivity(contributor.lastSeen)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-sm md:text-base font-bold ${styles.text}`}>
                      {contributor.amount.toLocaleString(undefined, { 
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2 
                      })} USDT
                    </div>
                    <div className="text-[10px] md:text-xs text-gray-400">
                      Total Deposited
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};