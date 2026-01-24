import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const testimonials = [
  {
    quote: "FloodEx has completely transformed how we document water damage. What used to take hours now takes minutes, and our reports look incredibly professional.",
    author: "Mike Thompson",
    role: "Owner",
    company: "Thompson Restoration Services",
    rating: 5,
  },
  {
    quote: "The moisture tracking and GPP calculations alone have saved us countless hours. Our insurance claims process is now seamless.",
    author: "Sarah Chen",
    role: "Project Manager",
    company: "Rapid Response Restoration",
    rating: 5,
  },
  {
    quote: "We've reduced our documentation time by 60% since switching to FloodEx. The mobile app works flawlessly in the field.",
    author: "James Rodriguez",
    role: "Field Supervisor",
    company: "Elite Water Restoration",
    rating: 5,
  },
  {
    quote: "The real-time team collaboration features have improved our coordination dramatically. Everyone stays on the same page.",
    author: "Emily Watson",
    role: "Operations Director",
    company: "Coastal Restoration Co.",
    rating: 5,
  },
];

export function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <div 
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Quote icon */}
      <Quote className="absolute -top-4 -left-4 h-16 w-16 text-primary/20 rotate-180" />

      {/* Testimonial content */}
      <div className="relative overflow-hidden">
        <div 
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="w-full flex-shrink-0 px-8 lg:px-12"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="text-xl lg:text-2xl text-center font-medium mb-8 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>

              {/* Author */}
              <div className="text-center">
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.role}, {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 opacity-70 hover:opacity-100"
        onClick={handlePrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 opacity-70 hover:opacity-100"
        onClick={handleNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {testimonials.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all duration-300",
              index === activeIndex 
                ? "w-8 bg-primary" 
                : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
            aria-label={`Go to testimonial ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
