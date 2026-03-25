import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface GreetingScreenProps {
  onComplete: () => void;
}

export default function GreetingScreen({ onComplete }: GreetingScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4500); // 4.5 seconds duration
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1 } }}
      className="absolute inset-0 flex flex-col items-center justify-center z-20"
    >
      {/* Blooming Flower Background */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
        animate={{ scale: 1, opacity: 0.2, rotate: 0 }}
        transition={{ duration: 3, ease: "easeOut" }}
        className="absolute w-[80vw] h-[80vw] max-w-[600px] max-h-[600px]"
      >
        {/* White Camellia & Forget-Me-Not representation */}
        <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
          <defs>
            <radialGradient id="camelliaGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="60%" stopColor="#fdfbfb" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ffe6fa" stopOpacity="0.4" />
            </radialGradient>
            <radialGradient id="forgetMeNotGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="40%" stopColor="#b5eaea" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#82c4c4" stopOpacity="0.8" />
            </radialGradient>
          </defs>
          
          {/* Outer Camellia Petals */}
          <motion.path
            d="M100,10 C140,10 170,40 170,80 C170,120 140,150 100,150 C60,150 30,120 30,80 C30,40 60,10 100,10 Z"
            fill="url(#camelliaGrad)"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1.1 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.path
            d="M100,50 C140,50 170,80 170,120 C170,160 140,190 100,190 C60,190 30,160 30,120 C30,80 60,50 100,50 Z"
            fill="url(#camelliaGrad)"
            initial={{ scale: 0.8, rotate: 45 }}
            animate={{ scale: 1.1, rotate: 45 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 0.5 }}
          />
          <motion.path
            d="M50,100 C50,60 80,30 120,30 C160,30 190,60 190,100 C190,140 160,170 120,170 C80,170 50,140 50,100 Z"
            fill="url(#camelliaGrad)"
            initial={{ scale: 0.8, rotate: -45 }}
            animate={{ scale: 1.1, rotate: -45 }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse", delay: 1 }}
          />
          
          {/* Inner Camellia Petals */}
          <motion.circle 
            cx="100" cy="100" r="40" 
            fill="url(#camelliaGrad)" 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1.2 }}
            transition={{ duration: 3, repeat: Infinity, repeatType: "reverse", delay: 1.5 }}
          />
          
          {/* Forget-Me-Not Center */}
          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, duration: 1, type: "spring" }}
          >
            <circle cx="100" cy="85" r="12" fill="url(#forgetMeNotGrad)" />
            <circle cx="115" cy="95" r="12" fill="url(#forgetMeNotGrad)" />
            <circle cx="110" cy="110" r="12" fill="url(#forgetMeNotGrad)" />
            <circle cx="90" cy="110" r="12" fill="url(#forgetMeNotGrad)" />
            <circle cx="85" cy="95" r="12" fill="url(#forgetMeNotGrad)" />
            <circle cx="100" cy="100" r="6" fill="#ffd1dc" />
            <circle cx="100" cy="100" r="3" fill="#ffffff" />
          </motion.g>
        </svg>
      </motion.div>

      {/* Greeting Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 1.5 }}
        className="relative z-10 text-center px-6"
      >
        <h1 className="font-script text-5xl md:text-7xl text-pink-500 drop-shadow-md mb-4">
          Selamat Ulang Tahun
        </h1>
        <motion.h2 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 2, duration: 5 }}
          className="font-handwriting text-4xl md:text-6xl text-purple-500 drop-shadow-sm"
        >
          Naekoopiill~!!!
        </motion.h2>
        
      </motion.div>
    </motion.div>
  );
}
