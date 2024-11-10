import React from 'react';
import { motion } from 'framer-motion';
import { Users, ArrowUpRight, Clock, Coins } from 'lucide-react';
import { useIncubatorBalance } from '../hooks/useIncubatorBalance';

const stats = [
  {
    icon: Users,
    title: 'Active Users',
    value: '1.2K+',
    change: '+12%',
    description: 'Growing community'
  },
  {
    icon: Coins,
    title: 'Total Staked',
    value: '$33K+',
    change: '+25%',
    description: 'In USDT deposits'
  },
  {
    icon: ArrowUpRight,
    title: 'APY',
    value: '120%',
    change: '+5%',
    description: 'Estimated returns'
  },
  {
    icon: Clock,
    title: 'Time Left',
    value: '142d',
    change: '',
    description: 'Until launch'
  }
];

export const PlatformStats = () => {
  const { balance } = useIncubatorBalance();

  return (
    <div className="bg-gradient-to-br from-[#1E2A37]/80 to-[#1E2A37]/50 backdrop-blur-lg rounded-xl md:rounded-3xl p-4 md:p-6 lg:p-8 text-white relative overflow-hidden border border-white/5 h-full shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-[#2D9CDB]/5 to-transparent" />
      
      <div className="relative">
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] bg-clip-text text-transparent mb-1 md:mb-2">
            Platform Statistics
          </h2>
          <p className="text-xs md:text-sm text-gray-400">Real-time metrics of our ecosystem</p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#1E2A37] rounded-lg p-4 border border-white/5 hover:border-[#2D9CDB]/20 transition-all duration-300 group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="bg-[#2D9CDB]/10 p-2 rounded-lg group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="w-4 h-4 md:w-5 md:h-5 text-[#2D9CDB]" />
                </div>
                {stat.change && (
                  <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                    {stat.change}
                  </span>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm text-gray-400">{stat.title}</h3>
                <div className="text-lg md:text-xl font-bold text-white">
                  {stat.title === 'Total Staked' 
                    ? `$${balance.toLocaleString()}+`
                    : stat.value
                  }
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>

              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: index * 0.2 }}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-[#2D9CDB]/10 rounded-lg border border-[#2D9CDB]/20">
          <div className="flex items-center gap-2 text-sm text-[#2D9CDB]">
            <Clock className="w-4 h-4" />
            <span>Next Milestone</span>
          </div>
          <div className="mt-2 text-lg font-bold">Mobile App Launch</div>
          <div className="text-sm text-gray-400">Expected Q3 2024</div>
        </div>
      </div>
    </div>
  );
};