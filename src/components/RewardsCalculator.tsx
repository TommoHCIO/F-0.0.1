import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coins, ArrowRight, Star, MessageCircle, Share2, ThumbsUp } from 'lucide-react';

const REWARDS = [
  { icon: Star, action: 'Views', amount: 1, color: '#2D9CDB' },
  { icon: ThumbsUp, action: 'Likes', amount: 2, color: '#4B94DC' },
  { icon: MessageCircle, action: 'Comments', amount: 5, color: '#6A75DB' },
  { icon: Share2, action: 'Reposts', amount: 10, color: '#7F56D9' }
];

export const RewardsCalculator = () => {
  const [selectedMetrics, setSelectedMetrics] = useState(new Set([REWARDS[0].action]));
  const [amount, setAmount] = useState('100');
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    setIsCalculating(true);
    const timer = setTimeout(() => setIsCalculating(false), 500);
    return () => clearTimeout(timer);
  }, [amount, selectedMetrics]);

  const toggleMetric = (action: string) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(action)) {
      if (newSelected.size > 1) {
        newSelected.delete(action);
      }
    } else {
      newSelected.add(action);
    }
    setSelectedMetrics(newSelected);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || (/^\d*$/.test(value) && parseInt(value) <= 1000000)) {
      setAmount(value);
    }
  };

  const numericAmount = parseInt(amount) || 0;
  const totalRewards = numericAmount * REWARDS.reduce((sum, reward) => 
    sum + (selectedMetrics.has(reward.action) ? reward.amount : 0), 0
  );

  const getSelectedRewardsText = () => {
    const selectedTypes = Array.from(selectedMetrics);
    return selectedTypes.map(type => {
      const reward = REWARDS.find(r => r.action === type);
      return `${numericAmount} ${type.toLowerCase()} at ${reward?.amount} $CTE each`;
    }).join(' + ');
  };

  return (
    <div className="bg-gradient-to-br from-[#1E2A37]/80 to-[#1E2A37]/50 backdrop-blur-lg rounded-xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden border border-white/5 h-full shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D9CDB]/5 to-transparent" />
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a')] opacity-5 bg-cover bg-center mix-blend-overlay" />
      
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] bg-clip-text text-transparent mb-2">
            Rewards Calculator
          </h2>
          <p className="text-sm text-gray-300">
            Select multiple metrics to combine rewards
          </p>
        </motion.div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          {REWARDS.map((reward) => (
            <motion.button
              key={reward.action}
              onClick={() => toggleMetric(reward.action)}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                selectedMetrics.has(reward.action)
                  ? 'border-white/20 bg-white/10'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${reward.color}20` }}
                >
                  <reward.icon
                    className="w-5 h-5"
                    style={{ color: reward.color }}
                  />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium text-white">{reward.action}</div>
                  <div className="text-xs" style={{ color: reward.color }}>
                    +{reward.amount} $CTE
                  </div>
                </div>
              </div>
              {selectedMetrics.has(reward.action) && (
                <motion.div
                  layoutId={`active-indicator-${reward.action}`}
                  className="absolute inset-0 border-2 rounded-xl"
                  style={{ borderColor: reward.color }}
                  initial={false}
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-[#1E2A37] rounded-xl p-4 border border-white/10">
            <label className="block text-sm text-gray-300 mb-2">
              Number of interactions
            </label>
            <div className="relative">
              <input
                type="text"
                value={amount}
                onChange={handleAmountChange}
                placeholder="Enter amount"
                className="w-full bg-[#141F2A] border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB]/50 transition-all duration-200"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-300">
                interactions
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-400">
              Maximum: 1,000,000 interactions
            </div>
          </div>

          <motion.div
            layout
            className="bg-gradient-to-br from-[#141F2A] to-[#1E2A37] rounded-xl p-4 border border-white/10 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#2D9CDB]/10 to-[#7F56D9]/10 opacity-50" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Coins className="w-5 h-5 text-[#2D9CDB]" />
                <h3 className="text-sm font-medium text-white">Combined Rewards</h3>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={totalRewards}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="flex items-baseline gap-2"
                >
                  <span className="text-2xl font-bold bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] bg-clip-text text-transparent">
                    {isCalculating ? '...' : totalRewards.toLocaleString()}
                  </span>
                  <span className="text-sm text-white">$CTE</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 text-xs text-gray-300">
                Based on {getSelectedRewardsText()}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-6 flex items-center justify-between text-sm text-gray-300">
          <span>Updated in real-time</span>
          <div className="flex items-center gap-1">
            <ArrowRight className="w-4 h-4" />
            <span>Enter amount to calculate</span>
          </div>
        </div>
      </div>
    </div>
  );
};