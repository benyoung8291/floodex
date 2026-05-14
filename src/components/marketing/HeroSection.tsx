import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const stats = [
  { num: 'All-in-One', label: 'Field documentation' },
  { num: 'IICRC', label: 'Compliant reports' },
  { num: '1-Click', label: 'PDF generation' },
  { num: 'AUS', label: 'Built & hosted' },
];

export function HeroSection() {
  return (
    <section className="px-4 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28 relative overflow-hidden max-w-6xl mx-auto">
      <div className="absolute -top-[200px] -right-[200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,hsl(204_98%_37%/0.08)_0%,transparent_60%)] pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, duration: 0.5 }}>
        <div className="inline-flex items-center gap-2 bg-foreground text-white text-[13px] font-bold px-4 py-[7px] rounded-full mb-8">
          <div className="w-2 h-2 rounded-full bg-accent" />
          Australia's #1 flood restoration documentation platform
        </div>
      </motion.div>

      <h1 className="text-[clamp(44px,7vw,88px)] font-black leading-[0.98] tracking-[-0.04em] text-foreground max-w-[850px] mb-7">
        Document faster.<br />
        <span className="bg-accent text-white px-3 py-1 inline-block rounded-xl -rotate-1 my-1">Report smarter.</span><br />
        Get paid quicker.
      </h1>

      <motion.p initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[clamp(16px,1.8vw,20px)] text-muted-foreground max-w-[540px] leading-[1.7] font-medium mb-12">
        Stop wrestling with paper forms and spreadsheets. FloodEx is the mobile-first <strong>flood restoration software</strong> that helps restoration technicians track moisture readings, capture photo evidence, and generate <strong>IICRC-compliant reports</strong> — all from the field.
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28, duration: 0.5 }} className="flex items-center gap-3 flex-wrap mb-16">
        <Link to="/auth?tab=signup">
          <Button className="rounded-full shadow-none border-none bg-accent text-white font-extrabold text-base py-4 px-8 hover:opacity-85">
            Start free trial →
          </Button>
        </Link>
        <Link to="/features">
          <Button variant="outline" className="rounded-full border-border text-foreground font-bold text-base py-4 px-8 hover:bg-secondary">
            See all features
          </Button>
        </Link>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36, duration: 0.5 }} className="inline-grid grid-cols-2 md:grid-cols-4 bg-white/60 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden">
        {stats.map((s, i) => (
          <div key={i} className={`px-7 py-5 text-center ${i < stats.length - 1 ? "border-r border-border/40" : ""}`}>
            <div className="text-[28px] font-black tracking-tight text-foreground leading-none">{s.num}</div>
            <div className="text-xs text-muted-foreground mt-1 font-medium">{s.label}</div>
          </div>
        ))}
      </motion.div>

      {/* SEO-rich text below the fold */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.5 }} className="mt-16 max-w-[640px]">
        <p className="text-[13px] text-muted-foreground/60 leading-[1.7] font-medium">
          FloodEx is purpose-built <Link to="/water-damage-restoration-software" className="text-primary/60 hover:text-primary no-underline">water damage restoration software</Link> for Australian restoration companies. Track <Link to="/moisture-tracking-software" className="text-primary/60 hover:text-primary no-underline">moisture readings</Link> with automatic g/kg calculations, document damage with annotated photos, and generate <Link to="/restoration-reporting-software" className="text-primary/60 hover:text-primary no-underline">one-click IICRC-compliant PDF reports</Link>. A smarter <Link to="/encircle-alternative" className="text-primary/60 hover:text-primary no-underline">alternative to Encircle</Link> at a fraction of the price — free tier available.
        </p>
      </motion.div>
    </section>
  );
}
