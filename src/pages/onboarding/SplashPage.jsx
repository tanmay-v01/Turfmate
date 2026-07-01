import { motion } from 'framer-motion';
import TurfMateLogo from '../../components/ui/TurfMateLogo';

export default function SplashPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-slate-900">
      {/* Aurora Mesh Gradient Background */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-sky-500 rounded-full mix-blend-screen filter blur-[120px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-[-10%] left-[20%] w-[60%] h-[50%] bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>

      <motion.div 
        initial={{ scale: 0.5, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 flex flex-col items-center text-center px-6"
      >
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        >
          <TurfMateLogo size="xl" className="mb-8" />
        </motion.div>
        
        <h1 className="text-5xl sm:text-6xl font-display font-extrabold text-white drop-shadow-lg">
          Turf<span className="text-emerald-400">Mate</span>
        </h1>
        <p className="mt-4 text-slate-300 font-medium tracking-wide">book · split · vibe · repeat</p>
        
        <div className="mt-12 flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2, ease: "easeInOut" }}
              className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
