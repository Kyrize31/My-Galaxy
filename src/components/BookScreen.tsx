import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronRight, ChevronLeft } from 'lucide-react';

interface BookScreenProps {
  onComplete: () => void;
  onStartClosing?: () => void;
}

const pages = [
  "Haloo Naee, selamatt ulangg tahunnn~!!! 🎉\n\n Semogaa hari inii dan setiap harinyaa Naee dipenuhi dengan tawa, kebahagiaan, dan hal-hal maniss yang bikin senyum terus yaaa 🌸",
  "Selamat hari raya Idul Fitrii, Naee~🌙\n Mohon maaf lahir dan batinn\n\n Terus jugaa, semangatt yaa skripsian-nyaa\n Harusnyaa sekarang udah semester 8 kann?\n Zii harap semuaa yang lagi Naee usahakann, terutama skripsinya lancarr teruss yaa\n\n Wish u all the besttt, AAAAMIIINNN 😤",
  "Naekooo~ Zii cuma mau nitip sedikit yaa...\n Jan sering telat makann, sama jan lupaa minum airr yang cukup jugaa, apalagi kalo lagi sibuk main game tuhh wkwk 🎮\n\n Zii tau Naee kuat bangett, tapi tetep ajaa harus lebih sayang sama diri sendirii jugaa\n Kalo lagi capek atau lagi ngerasa down, jan dipendam sendirii yaaw\n\n Cerita ke orang lain itu gapapaa kokk, ga harus kuat sendiriann teruss, dan yaa... kalau suatu saat Naee bingung mau cerita kemana, Zii selaluu adaa kokk ✌🏻",
  "Naee... Zii tau, Zii pernah jadi alasan kenapa Naee ngerasa sakit, dan itu kesalahan yang masih Zii ingat 🫧\n\n Zii ga akan ngelak atau cari alasan karena memang itu sepenuhnya salah\n Sekarang Zii belajar cara jadi lebih baik\n Karena memang Zii harus berubah\n\n Dan... entah kenapa, sampai sekarang Zii masih ngerasain hal yang sama ke Naee\n Aneh yaa... makin kesini malah makin terasa",
  "Naee... sekarang semuanya terasa beda yaa\n\n Tapi Zii ga akann berubah soal satu hall\n Zii tetap akan jadi Zii yang samaa yang sukaa gangguinn Naee, tukang yapping, bikin kesell, jahil, gapernah mau kalah sama Naee\n Dan lainnyaa yang Zii bangettt wkwk 😋\n\n Bedanya... sekarangg Zii tauu haruss adaa batasnyaa, Zii akan tetapp jalann ke depann sambill nyimpenn semuaa inii dengann baikkkk",
  "Naekoopiill~\n\n terimakasih yaa untuk semuanyaa\n\n dan tetap jadi Naee yang Zii kenal yaa...\n walaupun kadang nyebelinn juga sih wkwk 😆",
];

export default function BookScreen({ onComplete, onStartClosing }: BookScreenProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isClosing, setIsClosing] = useState(false);

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    setIsClosing(true);
    setCurrentPage(0);
    onStartClosing?.();
    
    // Animate closing the book
    setTimeout(() => {
      setIsOpen(false);
      
      // Wait for cover to close, then trigger onComplete
      setTimeout(() => {
        onComplete();
      }, 1500);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }}
      animate={{ 
        opacity: isClosing && !isOpen ? 0 : 1, 
        y: isClosing && !isOpen ? 50 : 0,
        scale: isClosing ? 0.9 : 1
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 1.5, ease: "easeInOut" }}
      className="flex flex-col items-center justify-center min-h-[100dvh] z-10 relative px-4 w-full perspective-1000"
    >
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div
            key="cover"
            initial={{ opacity: 0, rotateY: -90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: 90 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center"
          >
            {/* Closed Book Cover */}
            <div className={`relative w-64 h-80 md:w-80 md:h-96 bg-pink-200 rounded-r-2xl rounded-l-md shadow-2xl border-4 border-pink-300 flex flex-col items-center justify-center overflow-hidden transition-all duration-1000 ${isClosing ? 'bg-pink-300' : ''}`}>
              <div className="absolute left-0 top-0 bottom-0 w-6 bg-pink-300 opacity-50 border-r border-pink-400"></div>
              <div className="absolute inset-4 border-2 border-dashed border-pink-300 rounded-xl"></div>
              {!isClosing && (
                <>
                  <h2 className="font-script text-4xl md:text-5xl text-pink-600 text-center px-6 drop-shadow-sm z-10">
                    Untuk Naee
                  </h2>
                  <Heart className="text-pink-400 mt-6 fill-pink-400 animate-pulse z-10" size={32} />
                </>
              )}
            </div>
            
            {!isClosing && (
              <button
                onClick={() => setIsOpen(true)}
                className="mt-8 px-8 py-3 bg-white/80 backdrop-blur-sm text-pink-500 rounded-full font-handwriting text-2xl shadow-md hover:bg-pink-50 hover:shadow-lg transition-all active:scale-95 border border-pink-200"
              >
                Buka Halaman
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="open-book-container"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md md:max-w-2xl flex flex-col items-center relative"
          >
            <div className="w-full bg-[#fffaf0] rounded-r-3xl rounded-l-md shadow-2xl border-2 border-pink-100 overflow-hidden flex flex-col aspect-[3/4] md:aspect-[4/3] relative">
              {/* Book spine binding effect */}
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-200/50 to-transparent opacity-50 z-20 border-r border-gray-300/30"></div>
              
              <div className="flex-1 overflow-y-auto p-8 md:p-12 pb-24 md:pb-24 flex flex-col items-center relative z-10">
                <div className="my-auto w-full">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentPage}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.4 }}
                      className="text-center w-full"
                    >
                      <p className="font-handwriting text-xl md:text-4xl text-gray-700 leading-relaxed whitespace-pre-line">
                        {pages[currentPage]}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 flex flex-col gap-4 z-20 bg-gradient-to-t from-[#fffaf0] via-[#fffaf0]/95 to-transparent pt-12">
                <div className="flex justify-between items-center w-full">
                  <button
                    onClick={handleBack}
                    disabled={currentPage === 0 || isClosing}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full font-sans text-sm md:text-base transition-all ${
                      currentPage === 0 || isClosing
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-pink-500 hover:bg-pink-100 active:scale-95'
                    }`}
                  >
                    <ChevronLeft size={18} />
                    Back
                  </button>
                  
                  <div className="text-pink-300 font-handwriting text-xl flex items-center gap-1">
                    <Heart size={14} className="fill-pink-300" />
                    <span>{currentPage + 1} / {pages.length}</span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={currentPage === pages.length - 1 || isClosing}
                    className={`flex items-center gap-1 px-4 py-2 rounded-full font-sans text-sm md:text-base transition-all ${
                      currentPage === pages.length - 1 || isClosing
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-pink-500 hover:bg-pink-100 active:scale-95'
                    }`}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-20 left-0 right-0 flex justify-center">
              <AnimatePresence>
                {currentPage === pages.length - 1 && (
                  <motion.button
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    onClick={handleComplete}
                    disabled={isClosing}
                    className={`w-full max-w-sm py-3 px-6 text-white rounded-full font-sans font-medium transition-colors shadow-md ${
                      isClosing ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-400 hover:bg-pink-500 hover:shadow-lg active:scale-95'
                    }`}
                  >
                    Lanjut ke Pertunjukan Terakhir
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
