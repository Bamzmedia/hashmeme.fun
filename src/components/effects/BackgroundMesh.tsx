'use client';

import { motion } from 'framer-motion';

/**
 * Animated Gradient Mesh Background
 * Uses Framer Motion to create slow-moving, ethereal glow blobs.
 */
export default function BackgroundMesh() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Primary Blue Blob */}
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

      {/* Secondary White/Cyan Blob */}
      <motion.div 
        animate={{
          x: [0, -150, 100, 0],
          y: [0, 100, -100, 0],
          scale: [1, 0.8, 1.1, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear"
        }}
        className="absolute bottom-1/4 right-1/4 w-[700px] h-[700px] bg-blue-400/5 blur-[120px] rounded-full"
      />

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
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#ffffff]/3 blur-[180px] rounded-full"
      />
    </div>
  );
}
