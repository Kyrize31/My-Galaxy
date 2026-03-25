import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import PinScreen from './components/PinScreen';
import GreetingScreen from './components/GreetingScreen';
import BookScreen from './components/BookScreen';
import EndingScreen from './components/EndingScreen';
import FloatingBackground from './components/FloatingBackground';
import { Volume2, VolumeX } from 'lucide-react';

type ScreenState = 'pin' | 'greeting' | 'book' | 'ending';

export default function App() {
  const [screen, setScreen] = useState<ScreenState>('pin');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const targetPin = '0326'; // Naee's birthdate

  // Handle audio transition
  useEffect(() => {
    if (screen === 'ending' && audioRef.current) {
      const audio = audioRef.current;
      
      // Fade out
      const fadeOut = setInterval(() => {
        if (audio.volume > 0.05) {
          audio.volume = Math.max(0, audio.volume - 0.05);
        } else {
          clearInterval(fadeOut);
          audio.volume = 0;
          // Change track to a more cinematic/space one for the ending
          audio.src = "assets/tothebone.mp3";
          audio.play().catch(e => console.log('Autoplay prevented:', e));
          
          // Fade in
          const fadeIn = setInterval(() => {
            if (audio.volume < 0.95) {
              audio.volume = Math.min(1, audio.volume + 0.05);
            } else {
              clearInterval(fadeIn);
              audio.volume = 1;
            }
          }, 150);
        }
      }, 100);
    }
  }, [screen]);

  // Attempt to play audio on load or first interaction
  useEffect(() => {
    const playAudio = () => {
      if (audioRef.current && !isMuted) {
        audioRef.current.play().catch(e => console.log('Autoplay prevented:', e));
      }
    };
    
    // Try playing immediately
    playAudio();
    
    // Also try on first click anywhere
    document.addEventListener('click', playAudio, { once: true });
    return () => document.removeEventListener('click', playAudio);
  }, [isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-black relative overflow-hidden flex flex-col items-center justify-center">
      {/* Liquid Background for Pin Screen */}
      <div 
        className={`absolute inset-0 bg-liquid-gradient transition-opacity duration-1000 ease-in-out ${
          screen === 'pin' ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Pastel Background for Greeting and Book */}
      <div 
        className={`absolute inset-0 bg-pastel-gradient transition-opacity duration-1000 ease-in-out ${
          (screen === 'greeting' || screen === 'book') ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Background Music */}
      <audio 
        ref={audioRef} 
        src="assets/gonegonegone.mp3" 
        loop 
        autoPlay
      />
      
      {/* Audio Control */}
      <button 
        onClick={toggleMute}
        className={`absolute top-4 right-4 z-50 p-3 backdrop-blur-sm rounded-full shadow-sm transition-colors ${
          screen === 'ending' 
            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
            : 'bg-white/50 text-pink-400 hover:bg-white/80'
        }`}
      >
        {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
      </button>

      <AnimatePresence>
        {(screen === 'greeting' || screen === 'book') && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 pointer-events-none z-0"
          >
            <FloatingBackground />
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        {screen === 'pin' && (
          <PinScreen 
            key="pin" 
            targetPin={targetPin} 
            onSuccess={() => setScreen('greeting')} 
          />
        )}
        
        {screen === 'greeting' && (
          <GreetingScreen 
            key="greeting" 
            onComplete={() => setScreen('book')} 
          />
        )}
        
        {screen === 'book' && (
          <BookScreen 
            key="book" 
            onComplete={() => setScreen('ending')} 
          />
        )}
        
        {screen === 'ending' && (
          <EndingScreen key="ending" />
        )}
      </AnimatePresence>
    </div>
  );
}
