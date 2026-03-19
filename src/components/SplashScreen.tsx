import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 800);
    const t2 = setTimeout(() => setPhase(2), 2000);
    const t3 = setTimeout(() => setPhase(3), 7200);
    const t4 = setTimeout(() => onComplete(), 8000);
    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4);
    };
  }, [onComplete]);



  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(135deg, hsl(222 47% 4%), hsl(222 47% 8%), hsl(217 50% 12%))" }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        >
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.06]" style={{
            backgroundImage: `linear-gradient(hsl(217 91% 60% / 0.4) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(217 91% 60% / 0.4) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }} />

          {/* Orbs */}
          <motion.div
            className="absolute w-[500px] h-[500px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.15), transparent 70%)" }}
            animate={{ x: [0, 80, -40, 0], y: [0, -60, 30, 0], scale: [1, 1.2, 0.9, 1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute w-[350px] h-[350px] rounded-full"
            style={{ background: "radial-gradient(circle, hsl(199 89% 48% / 0.12), transparent 70%)" }}
            animate={{ x: [0, -60, 40, 0], y: [0, 40, -30, 0], scale: [1, 0.8, 1.1, 1] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Scan line */}
          <motion.div
            className="absolute inset-x-0 h-[1px]"
            style={{ background: "linear-gradient(90deg, transparent, hsl(217 91% 60% / 0.5), transparent)" }}
            animate={{ top: ["-5%", "105%"] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />

          {/* Rotating rings */}
          <motion.div
            className="absolute w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] rounded-full border border-primary/10"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary/60" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1.5 h-1.5 rounded-full bg-accent/50" />
          </motion.div>
          <motion.div
            className="absolute w-[200px] h-[200px] sm:w-[260px] sm:h-[260px] rounded-full border border-accent/5"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary/40" />
          </motion.div>

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-6">
            {/* Logo - Medical Cross + Pulse */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 1, ease: [0.2, 0, 0, 1], delay: 0.2 }}
              className="relative"
            >
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center relative"
                style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(199 89% 48%))" }}
              >
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" className="sm:w-14 sm:h-14">
                  {/* Medical cross */}
                  <rect x="18" y="10" width="12" height="28" rx="3" fill="white" fillOpacity="0.95"/>
                  <rect x="10" y="18" width="28" height="12" rx="3" fill="white" fillOpacity="0.95"/>
                  {/* Heartbeat pulse line */}
                  <motion.path
                    d="M8 30 L16 30 L19 22 L22 34 L25 18 L28 30 L31 26 L34 30 L40 30"
                    stroke="hsl(217 91% 60%)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, delay: 0.8, ease: "easeInOut" }}
                  />
                </svg>
                <div className="absolute inset-0 rounded-3xl" style={{
                  boxShadow: "0 0 60px hsl(217 91% 60% / 0.4), 0 0 120px hsl(217 91% 60% / 0.1)"
                }} />
              </div>

              {/* Pulse rings */}
              <motion.div
                className="absolute inset-0 rounded-3xl border-2 border-primary/30"
                animate={{ scale: [1, 1.6], opacity: [0.5, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
              <motion.div
                className="absolute inset-0 rounded-3xl border border-primary/20"
                animate={{ scale: [1, 2], opacity: [0.3, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
              />
            </motion.div>

            {/* App name */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: [0.2, 0, 0, 1] }}
                  className="flex flex-col items-center gap-2"
                >
                  <h1 className="text-3xl sm:text-4xl font-bold tracking-tight" style={{
                    background: "linear-gradient(135deg, hsl(0 0% 100%), hsl(217 91% 80%))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    Smart Clinic
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className="text-sm sm:text-base tracking-[0.3em] uppercase"
                    style={{ color: "hsl(215 20% 55%)" }}
                  >
                    Clinic Management System
                  </motion.p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading bar */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: "200px" }}
                  transition={{ duration: 0.4 }}
                  className="mt-4"
                >
                  <div className="h-[2px] w-[200px] rounded-full overflow-hidden" style={{ background: "hsl(217 33% 17%)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(199 89% 48%))" }}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "easeInOut" }}
                    />
                  </div>
                  <motion.div
                    className="flex justify-between mt-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <LoadingText />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner decorations */}
          <div className="absolute top-6 left-6 w-12 h-12 border-t border-l border-primary/20 rounded-tl-lg" />
          <div className="absolute top-6 right-6 w-12 h-12 border-t border-r border-primary/20 rounded-tr-lg" />
          <div className="absolute bottom-6 left-6 w-12 h-12 border-b border-l border-primary/20 rounded-bl-lg" />
          <div className="absolute bottom-6 right-6 w-12 h-12 border-b border-r border-primary/20 rounded-br-lg" />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 2.5 }}
            className="absolute bottom-8 text-xs font-mono"
            style={{ color: "hsl(215 20% 45%)" }}
          >
            v2.0.0
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingText() {
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["جاري التحميل...", "تهيئة النظام...", "جاري الاتصال...", "جاهز!"];

  useEffect(() => {
    const t1 = setTimeout(() => setTextIndex(1), 1500);
    const t2 = setTimeout(() => setTextIndex(2), 3000);
    const t3 = setTimeout(() => setTextIndex(3), 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.span
      key={textIndex}
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-xs w-full text-center"
      style={{ color: "hsl(215 20% 55%)" }}
    >
      {texts[textIndex]}
    </motion.span>
  );
}
