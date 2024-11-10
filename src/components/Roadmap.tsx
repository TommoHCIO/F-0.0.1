import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, Rocket, Code, Smartphone, Users, Shield, Coins, Globe, Zap, Star } from 'lucide-react';

const roadmapItems = [
  {
    phase: 'Phase 1 - Q1 2024',
    title: 'Foundation',
    icon: Code,
    items: [
      'Platform Development Kickoff',
      'Smart Contract Deployment',
      'Security Audits',
      'Community Building Initiatives',
      'Website Launch & Documentation'
    ],
    status: 'completed',
    color: '#2D9CDB'
  },
  {
    phase: 'Phase 2 - Q2 2024',
    title: 'Token Launch',
    icon: Coins,
    items: [
      'CTE Token Launch (100M Supply)',
      'Initial Exchange Listings',
      'Staking Platform Release',
      'Reward System Implementation',
      'Marketing Campaign Kickoff'
    ],
    status: 'current',
    color: '#4B94DC'
  },
  {
    phase: 'Phase 3 - Q3 2024',
    title: 'Platform Growth',
    icon: Smartphone,
    items: [
      'Mobile App Beta Release',
      'Advanced Analytics Dashboard',
      'Community Governance Features',
      'Cross-chain Bridge Integration',
      'Partnership Expansion Program'
    ],
    status: 'upcoming',
    color: '#6A75DB'
  },
  {
    phase: 'Phase 4 - Q4 2024',
    title: 'Ecosystem Expansion',
    icon: Globe,
    items: [
      'DAO Governance Launch',
      'NFT Integration & Marketplace',
      'Developer SDK Release',
      'Global Marketing Campaign',
      'Enterprise Partnership Program'
    ],
    status: 'upcoming',
    color: '#7F56D9'
  }
];

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <Check className="w-5 h-5 md:w-6 md:h-6" />;
    case 'current':
      return <Clock className="w-5 h-5 md:w-6 md:h-6 animate-pulse" />;
    default:
      return <Rocket className="w-5 h-5 md:w-6 md:h-6" />;
  }
};

const getStatusStyles = (status: string, color: string) => {
  switch (status) {
    case 'completed':
      return {
        icon: 'bg-green-500/10 text-green-400',
        border: 'border-green-500/20',
        background: 'bg-green-500/5'
      };
    case 'current':
      return {
        icon: `bg-[${color}]/10 text-[${color}]`,
        border: `border-[${color}]/20`,
        background: `bg-[${color}]/5`
      };
    default:
      return {
        icon: 'bg-gray-500/10 text-gray-400',
        border: 'border-gray-500/20',
        background: 'bg-gray-500/5'
      };
  }
};

export const Roadmap = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#15202B] to-[#192734] p-4 md:p-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1639322537228-f710d846310a')] bg-cover bg-center opacity-5" />
        
        {/* Gradient Orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#2D9CDB] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#7F56D9] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
        />

        {/* Floating Stars */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              scale: Math.random() * 0.5 + 0.5,
              opacity: Math.random() * 0.5 + 0.25
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          >
            <Star className="w-3 h-3 text-[#2D9CDB]" />
          </motion.div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 md:mb-12"
        >
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-[#2D9CDB] to-[#7F56D9] bg-clip-text text-transparent mb-4">
            Project Roadmap
          </h1>
          <p className="text-gray-400 text-sm md:text-lg max-w-2xl mx-auto">
            Our journey to revolutionize social engagement through blockchain technology
          </p>
        </motion.div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-[#2D9CDB] via-[#7F56D9] to-transparent opacity-20 rounded-full" />

          <div className="space-y-8 md:space-y-12">
            {roadmapItems.map((item, index) => {
              const styles = getStatusStyles(item.status, item.color);
              const isEven = index % 2 === 0;

              return (
                <motion.div
                  key={item.phase}
                  initial={{ opacity: 0, x: isEven ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className={`relative flex flex-col md:flex-row gap-4 ${
                    isEven ? 'md:flex-row-reverse' : ''
                  }`}
                >
                  {/* Timeline Node */}
                  <motion.div
                    className="absolute left-8 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#1E2A37] border-2 border-[#2D9CDB] shadow-lg shadow-[#2D9CDB]/20"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.2 + 0.2, type: "spring" }}
                  >
                    <motion.div
                      className="absolute inset-0 rounded-full bg-[#2D9CDB]"
                      animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                    />
                  </motion.div>

                  {/* Content */}
                  <div className={`flex-1 ml-16 md:ml-0 ${isEven ? 'md:pr-16' : 'md:pl-16'}`}>
                    <motion.div
                      className={`bg-[#1E2A37] backdrop-blur-lg rounded-2xl p-6 border ${styles.border} relative overflow-hidden group hover:border-[${item.color}]/30 transition-colors duration-300`}
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <div className={`absolute inset-0 ${styles.background} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                      
                      <div className="relative">
                        {/* Header */}
                        <div className="flex items-start gap-4 mb-4">
                          <motion.div
                            className={`p-3 rounded-xl ${styles.icon}`}
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <item.icon className="w-6 h-6" />
                          </motion.div>
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg md:text-xl font-semibold text-white">
                                {item.title}
                              </h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${styles.icon}`}>
                                {item.phase}
                              </span>
                            </div>
                            <div className={`flex items-center gap-2 text-sm ${
                              item.status === 'completed' ? 'text-green-400' :
                              item.status === 'current' ? `text-[${item.color}]` :
                              'text-gray-400'
                            }`}>
                              {getStatusIcon(item.status)}
                              <span>{item.status.charAt(0).toUpperCase() + item.status.slice(1)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Milestones */}
                        <ul className="space-y-3">
                          {item.items.map((milestone, mIndex) => (
                            <motion.li
                              key={milestone}
                              initial={{ opacity: 0, x: isEven ? 20 : -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.2 + mIndex * 0.1 }}
                              className="flex items-center gap-3 text-gray-300 group/item"
                            >
                              <motion.div
                                className={`w-1.5 h-1.5 rounded-full bg-[${item.color}]`}
                                whileHover={{ scale: 1.5 }}
                              />
                              <span className="group-hover/item:text-white transition-colors">
                                {milestone}
                              </span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Future Vision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12 md:mt-16 bg-[#1E2A37] backdrop-blur-lg rounded-2xl p-6 md:p-8 border border-[#2D9CDB]/20 relative overflow-hidden group hover:border-[#2D9CDB]/40 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#2D9CDB]/5 to-[#7F56D9]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <motion.div
                className="p-3 rounded-xl bg-[#2D9CDB]/10"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Zap className="w-6 h-6 text-[#2D9CDB]" />
              </motion.div>
              <h2 className="text-xl md:text-2xl font-bold text-white">Future Vision</h2>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Beyond our roadmap, we envision Chat to Earn becoming the cornerstone of decentralized social engagement. 
              Our platform will continue to evolve with emerging technologies and community needs, always staying true to 
              our mission of rewarding meaningful interactions and fostering genuine connections in the digital space.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};