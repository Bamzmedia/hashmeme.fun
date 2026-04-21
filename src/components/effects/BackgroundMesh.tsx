'use client';

import { motion } from 'framer-motion';

/**
 * GlowSwap Radiant Gradient Mesh
 * Uses Framer Motion to create slow-moving, ethereal blue and purple glow volumes.
 */
export default function BackgroundMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary Blue Glow */}
      <motion.div 
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -100, 50, 0],
          scale: [1, 1.2, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/4 left-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"
      />

      {/* Radiant Purple Accent */}
      <motion.div 
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 150, -100, 0],
          scale: [1, 1.3, 0.8, 1],
        }}
        transition={{
          duration: 35,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute top-1/3 right-1/4 w-[900px] h-[900px] bg-purple-600/5 blur-[180px] rounded-full"
      />

      {/* Fixed Deep Purple Glow */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[1000px] h-[1000px] bg-purple-900/10 blur-[200px] rounded-full" />

      {/* Tertiary Accent Blob */}
      <motion.div 
        animate={{
          x: [-50, 50, 0, -50],
          y: [50, -50, 50, 50],
          opacity: [0.1, 0.2, 0.1]
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-400/5 blur-[180px] rounded-full"
      />
    </div>
  );
}
