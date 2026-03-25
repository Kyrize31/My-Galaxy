import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, Unlock } from 'lucide-react';

interface PinScreenProps {
  onSuccess: () => void;
  targetPin: string;
}

const PinScreen: React.FC<PinScreenProps> = ({ onSuccess, targetPin }) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      if (newPin.length === 4) {
        if (newPin === targetPin) {
          setTimeout(onSuccess, 500);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 1000);
        }
      }
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="flex flex-col items-center justify-center min-h-[100dvh] z-10 relative px-4"
    >
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border border-white/40 max-w-sm w-full text-center">
        <div className="mb-6 flex justify-center">
          <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 shadow-inner">
            {pin.length === 4 && !error ? <Unlock size={32} /> : <Lock size={32} />}
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-700 mb-2 font-handwriting text-3xl">Brankas Rahasia</h2>
        <p className="text-gray-500 mb-6 text-sm">Masukkan PIN (Tanggal Lahirmu)</p>
        
        <div className="flex justify-center gap-3 mb-8">
          {[0, 1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`w-12 h-14 rounded-xl flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                pin[i] 
                  ? 'bg-pink-400 text-white shadow-md transform scale-105' 
                  : 'bg-gray-100 text-transparent border-2 border-gray-200'
              } ${error ? 'bg-red-400 border-red-400 animate-shake' : ''}`}
            >
              {pin[i] ? '*' : ''}
            </div>
          ))}
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 font-handwriting text-xl mb-4"
          >
            PIN salah! Coba lagi 💔
          </motion.p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm border border-gray-100 text-xl font-semibold text-gray-700 hover:bg-pink-50 hover:text-pink-500 hover:shadow-md transition-all active:scale-95"
            >
              {num}
            </button>
          ))}
          <div className="col-start-2">
            <button
              onClick={() => handleNumberClick('0')}
              className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm border border-gray-100 text-xl font-semibold text-gray-700 hover:bg-pink-50 hover:text-pink-500 hover:shadow-md transition-all active:scale-95"
            >
              0
            </button>
          </div>
          <div className="col-start-3 flex items-center justify-center">
            <button
              onClick={handleDelete}
              className="w-12 h-12 rounded-full text-gray-400 hover:text-pink-500 transition-colors active:scale-95"
            >
              ⌫
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PinScreen;
