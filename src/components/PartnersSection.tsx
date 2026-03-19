import { motion } from "framer-motion";
import logoClinic1 from "@/assets/logo-clinic-1.png";
import logoClinic2 from "@/assets/logo-clinic-2.png";
import logoClinic3 from "@/assets/logo-clinic-3.png";
import logoClinic4 from "@/assets/logo-clinic-4.png";
import logoClinic5 from "@/assets/logo-clinic-5.png";
import logoClinic6 from "@/assets/logo-clinic-6.png";
import partnersContract from "@/assets/partners-contract.jpg";
import partnersTeam from "@/assets/partners-team.jpg";
import partnersConference from "@/assets/partners-conference.jpg";
import partnersTraining from "@/assets/partners-training.jpg";
import { Handshake } from "lucide-react";

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const logos = [
  { src: logoClinic1, name: "عيادة النور" },
  { src: logoClinic2, name: "مركز الحياة الطبي" },
  { src: logoClinic3, name: "صيدلية الشفاء" },
  { src: logoClinic4, name: "عيادة الأمل" },
  { src: logoClinic5, name: "مركز السلام التخصصي" },
  { src: logoClinic6, name: "عيادات البسمة" },
];

const contractPhotos = [
  { src: partnersContract, alt: "توقيع عقد شراكة" },
  { src: partnersTeam, alt: "فريق العمل مع العملاء" },
  { src: partnersConference, alt: "مؤتمر الشركاء" },
  { src: partnersTraining, alt: "تدريب فريق العيادة" },
];

export default function PartnersSection() {
  return (
    <section className="py-20 sm:py-28 border-y border-border/40 bg-gradient-to-b from-background via-card/30 to-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-semibold mb-6">
            <Handshake className="h-4 w-4" />
            شركاؤنا في النجاح
          </motion.div>
          <motion.h2 variants={fadeUp} className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            أكثر من <span className="text-primary">150+</span> عيادة تثق بنا
          </motion.h2>
          <motion.p variants={fadeUp} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            نفخر بشراكتنا مع عيادات ومراكز طبية وصيدليات في جميع أنحاء مصر
          </motion.p>
        </motion.div>

        {/* Logos Grid */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="grid grid-cols-3 sm:grid-cols-6 gap-6 mb-16"
        >
          {logos.map((logo, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              className="group flex flex-col items-center gap-3"
            >
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-white/90 border border-border/50 flex items-center justify-center p-3 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                <img src={logo.src} alt={logo.name} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs text-muted-foreground font-medium">{logo.name}</span>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
