import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 1400);
    const t3 = setTimeout(() => setPhase(3), 5500);
    const t4 = setTimeout(() => onComplete(), 6200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
    };
    resize();

    const particles: { x: number; y: number; vx: number; vy: number; size: number; alpha: number; pulse: number }[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        if (p.x < 0) p.x = window.innerWidth;
        if (p.x > window.innerWidth) p.x = 0;
        if (p.y < 0) p.y = window.innerHeight;
        if (p.y > window.innerHeight) p.y = 0;
        const a = p.alpha * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(96, 165, 250, ${a})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(96, 165, 250, ${0.06 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <AnimatePresence>
      {phase < 3 && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: "linear-gradient(160deg, #030712 0%, #0a1628 40%, #0c1a30 70%, #060e1a 100%)" }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0, 1] }}
        >
          <canvas ref={canvasRef} className="absolute inset-0" />

          {/* Radial glow behind logo */}
          <div className="absolute w-[600px] h-[600px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60% / 0.3), transparent 70%)" }}
          />

          {/* Center content */}
          <div className="relative z-10 flex flex-col items-center gap-8">
            {/* Logo */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0, 0.7, 0.3, 1], delay: 0.1 }}
              className="relative"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[1.75rem] flex items-center justify-center relative overflow-hidden"
                style={{ background: "linear-gradient(135deg, hsl(217 91% 55%), hsl(199 89% 45%))" }}
              >
                {/* Glass overlay */}
                <div className="absolute inset-0 opacity-20"
                  style={{ background: "linear-gradient(180deg, rgba(255,255,255,0.3) 0%, transparent 50%)" }}
                />
                <svg width="52" height="52" viewBox="0 0 48 48" fill="none" className="relative z-10 sm:w-[60px] sm:h-[60px]">
                  {/* Heart shape */}
                  <motion.path
                    d="M24 40 C20 36, 8 28, 8 18 C8 12, 12 8, 18 8 C21 8, 23 10, 24 12 C25 10, 27 8, 30 8 C36 8, 40 12, 40 18 C40 28, 28 36, 24 40Z"
                    fill="white"
                    fillOpacity="0.95"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: [0.8, 1, 0.8], opacity: 1 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Pulse/heartbeat line over the heart */}
                  <motion.path
                    d="M10 24 L17 24 L19 18 L22 30 L25 14 L28 24 L30 20 L33 24 L38 24"
                    stroke="rgba(96, 165, 250, 0.9)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, delay: 0.6, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              {/* Glow ring */}
              <motion.div
                className="absolute -inset-1 rounded-[2rem]"
                style={{ background: "linear-gradient(135deg, hsl(217 91% 60% / 0.4), hsl(199 89% 48% / 0.2))", filter: "blur(12px)" }}
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              />

              {/* Pulse rings */}
              <motion.div
                className="absolute -inset-2 rounded-[2.2rem] border border-primary/20"
                animate={{ scale: [1, 1.5], opacity: [0.4, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeOut" }}
              />
            </motion.div>

            {/* Brand text */}
            <AnimatePresence>
              {phase >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.7, ease: [0, 0.7, 0.3, 1] }}
                  className="flex flex-col items-center gap-3"
                >
                  <h1 className="text-4xl sm:text-5xl font-bold tracking-tight"
                    style={{
                      background: "linear-gradient(180deg, #f8fafc 0%, #94a3b8 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    د. خالد جادالله
                  </h1>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "3rem" }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="h-[2px] rounded-full"
                    style={{ background: "linear-gradient(90deg, hsl(217 91% 60%), hsl(199 89% 48%))" }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Loading indicator */}
            <AnimatePresence>
              {phase >= 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 flex flex-col items-center gap-4"
                >
                  {/* Dots loader */}
                  <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: "hsl(217 91% 60%)" }}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                      />
                    ))}
                  </div>
                  <LoadingText />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            transition={{ delay: 2 }}
            className="absolute bottom-8 flex flex-col items-center gap-1"
          >
            <p className="text-[10px] font-mono tracking-widest" style={{ color: "hsl(215 20% 40%)" }}>
              POWERED BY AI
            </p>
            <p className="text-[10px] font-mono" style={{ color: "hsl(215 20% 30%)" }}>v2.0</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function LoadingText() {
  const [idx, setIdx] = useState(0);
  const texts = ["جاري التحميل...", "تهيئة النظام...", "جاري الاتصال...", "جاهز!"];

  useEffect(() => {
    const t1 = setTimeout(() => setIdx(1), 1200);
    const t2 = setTimeout(() => setIdx(2), 2400);
    const t3 = setTimeout(() => setIdx(3), 3600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <motion.span
      key={idx}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 0.6, y: 0 }}
      className="text-xs text-center"
      style={{ color: "hsl(215 20% 55%)" }}
    >
      {texts[idx]}
    </motion.span>
  );
}
