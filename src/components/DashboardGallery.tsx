import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Monitor } from "lucide-react";

import gallery1 from "@/assets/gallery/gallery-1.jpg";
import gallery2 from "@/assets/gallery/gallery-2.jpg";
import gallery3 from "@/assets/gallery/gallery-3.jpg";
import gallery4 from "@/assets/gallery/gallery-4.jpg";
import gallery5 from "@/assets/gallery/gallery-5.jpg";
import gallery6 from "@/assets/gallery/gallery-6.jpg";
import gallery7 from "@/assets/gallery/gallery-7.jpg";
import gallery8 from "@/assets/gallery/gallery-8.jpg";

const slides = [
  { src: gallery1, label: "لوحة التحكم الرئيسية" },
  { src: gallery2, label: "إدارة المرضى" },
  { src: gallery3, label: "جدول المواعيد" },
  { src: gallery4, label: "السجل الطبي الإلكتروني" },
  { src: gallery5, label: "الإدارة المالية" },
  { src: gallery6, label: "كتابة الروشتة" },
  { src: gallery7, label: "إدارة قائمة الانتظار" },
  { src: gallery8, label: "التقارير والتحليلات" },
];

export default function DashboardGallery() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const next = () => setCurrent((p) => (p + 1) % slides.length);
  const prev = () => setCurrent((p) => (p - 1 + slides.length) % slides.length);

  useEffect(() => {
    if (isHovered) return;
    intervalRef.current = setInterval(next, 3500);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isHovered, current]);

  return (
    <section className="py-20 sm:py-28 bg-gradient-to-b from-muted/20 via-background to-muted/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Monitor className="h-4 w-4" />
            جولة داخل النظام
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            شاهد النظام من الداخل
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            تصفّح شاشات لوحة التحكم وتعرّف على واجهة الاستخدام السهلة والاحترافية
          </p>
        </motion.div>

        {/* Slider */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative group"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Browser frame */}
          <div className="rounded-2xl border border-border overflow-hidden shadow-2xl bg-card">
            {/* Title bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/60 border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70" />
                <div className="w-3 h-3 rounded-full bg-warning/70" />
                <div className="w-3 h-3 rounded-full bg-success/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="px-6 py-1 rounded-md bg-background/80 text-xs text-muted-foreground border border-border/50 font-mono">
                  app.smartclinic.com
                </div>
              </div>
            </div>

            {/* Slide container */}
            <div className="relative aspect-[16/9] overflow-hidden bg-muted/30">
              {slides.map((slide, i) => (
                <img
                  key={i}
                  src={slide.src}
                  alt={slide.label}
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                    i === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
                  }`}
                />
              ))}

              {/* Label overlay */}
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-6">
                <span className="text-white font-bold text-lg sm:text-xl">
                  {slides[current].label}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={prev}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground hover:border-primary z-10"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-card/90 backdrop-blur border border-border shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-primary-foreground hover:border-primary z-10"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </motion.div>

        {/* Thumbnails */}
        <div className="flex gap-2 justify-center mt-6 overflow-x-auto pb-2 scrollbar-none">
          {slides.map((slide, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                i === current
                  ? "border-primary shadow-lg shadow-primary/20 scale-105"
                  : "border-border/50 opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={slide.src}
                alt={slide.label}
                className="w-20 h-12 sm:w-28 sm:h-16 object-cover"
              />
            </button>
          ))}
        </div>

        {/* Dots for mobile */}
        <div className="flex gap-2 justify-center mt-4 sm:hidden">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === current ? "bg-primary w-6" : "bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
