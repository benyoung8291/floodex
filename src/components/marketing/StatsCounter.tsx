import { useEffect, useRef, useState } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCounterProps {
  value: number;
  suffix?: string;
  label: string;
  icon: LucideIcon;
  duration?: number;
  delay?: number;
}

function useCountUp(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasStarted]);

  useEffect(() => {
    if (!hasStarted) return;

    const timeout = setTimeout(() => {
      let startTime: number | null = null;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        setCount(Math.floor(easeOutQuart * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timeout);
  }, [hasStarted, end, duration, delay]);

  return { count, ref };
}

export function StatsCounter({ value, suffix = '', label, icon: Icon, duration = 2000, delay = 0 }: StatCounterProps) {
  const { count, ref } = useCountUp(value, duration, delay);

  return (
    <div ref={ref} className="text-center group">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon className="h-7 w-7" />
      </div>
      <div className="text-4xl lg:text-5xl font-bold mb-2">
        {count.toLocaleString()}{suffix}
      </div>
      <p className="text-muted-foreground">{label}</p>
    </div>
  );
}
