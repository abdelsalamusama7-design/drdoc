import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import splashImage from "@/assets/splash-doctor.png";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(false), 9300);
    const t2 = setTimeout(() => onComplete(), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0, 1] }}
        >
          <motion.img
            src={splashImage}
            alt="Prof. Dr. Khaled Gadalla - Consultant of Andrology & Men's Health"
            className="max-w-full max-h-full object-contain"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
