import React, { useEffect, useState } from 'react';

const FloatingBackground: React.FC = () => {
  const [items, setItems] = useState<{ id: number; left: string; delay: string; duration: string; type: string; size: string }[]>([]);

  useEffect(() => {
    const newItems = Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      left: `${-5 + Math.random() * 110}%`,
      delay: `${Math.random() * 5}s`,
      duration: `${10 + Math.random() * 10}s`,
      type: Math.random() > 0.5 ? '🌸' : '💖',
      size: `${1 + Math.random() * 1.5}rem`,
    }));
    setItems(newItems);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {items.map((item) => (
        <div
          key={item.id}
          className="falling-item opacity-50"
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

export default FloatingBackground;
