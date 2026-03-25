import React, { useEffect, useState } from 'react';

const FallingConfetti: React.FC = () => {
  const [items, setItems] = useState<{ id: number; left: string; delay: string; duration: string; type: string; size: string }[]>([]);

  useEffect(() => {
    const newItems = Array.from({ length: 50 }).map((_, i) => {
      const types = ['🌸', '💖', '✨', '🎉', '🎀'];
      return {
        id: i,
        left: `${Math.random() * 100}vw`,
        delay: `${Math.random() * 5}s`,
        duration: `${5 + Math.random() * 5}s`,
        type: types[Math.floor(Math.random() * types.length)],
        size: `${1 + Math.random() * 2}rem`,
      };
    });
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="falling-item"
          style={{
            left: item.left,
            animationDelay: item.delay,
            animationDuration: item.duration,
            fontSize: item.size,
          }}
        >
          {item.type}
        </div>
      ))}
    </div>
  );
};

export default FallingConfetti;
