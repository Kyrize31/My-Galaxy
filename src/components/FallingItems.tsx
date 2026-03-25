import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';

const ITEMS = ['🌸', '💖', '🧸', '🎀', '✨', '🌷'];

export default function FallingItems() {
  const [items, setItems] = useState<{id: number, char: string, left: string, delay: string, duration: string, size: string}[]>([]);

  useEffect(() => {
    const newItems = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      char: ITEMS[Math.floor(Math.random() * ITEMS.length)],
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 2}s`,
      duration: `${4 + Math.random() * 4}s`,
      size: `${1.5 + Math.random() * 2}rem`
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ y: '-10vh', opacity: 0, rotate: 0 }}
          animate={{ y: '110vh', opacity: [0, 1, 1, 0], rotate: 360 }}
          transition={{ 
            duration: parseFloat(item.duration), 
            delay: parseFloat(item.delay), 
            ease: 'linear',
            repeat: Infinity
          }}
          style={{
            position: 'absolute',
            left: item.left,
            fontSize: item.size,
          }}
        >
          {item.char}
        </motion.div>
      ))}
    </div>
  );
}
