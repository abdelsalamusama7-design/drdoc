import { Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-card/50 py-4 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-1 text-xs text-muted-foreground">
        <span>تنفيذ وتصميم</span>
        <a
          href="https://www.facebook.com/share/1DHbu6vRUo/"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline"
        >
          Insta-Tech Labs
        </a>
        <span className="hidden sm:inline mx-1">—</span>
        <div className="flex items-center gap-2">
          <a href="tel:+201554400044" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Phone className="h-3 w-3" />
            المبيعات: 01554400044
          </a>
          <span>-</span>
          <a href="tel:+201227080430" className="flex items-center gap-1 hover:text-foreground transition-colors">
            <Phone className="h-3 w-3" />
            الدعم الفني: 01227080430
          </a>
        </div>
      </div>
    </footer>
  );
}
