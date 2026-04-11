import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const faqs = [
  {
    question: "How does the 14-day free trial work?",
    answer: "Start using FloodEx immediately with full access to all features. No credit card required. At the end of your trial, choose a plan that fits your needs or continue with our free tier.",
  },
  {
    question: "What happens if I exceed my monthly limits?",
    answer: "We use a soft limit system—you can continue working without interruption. Overages are billed at the rates shown for your tier at the end of each billing period. We'll notify you when you're approaching your limits.",
  },
  {
    question: "Can I change plans at any time?",
    answer: "Absolutely! Upgrade or downgrade your plan anytime from your billing settings. When upgrading, you'll get immediate access to higher limits. When downgrading, changes take effect at your next billing cycle.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes. We use industry-standard encryption for all data in transit and at rest. Your job photos, readings, and reports are stored securely and are only accessible by your team members.",
  },
  {
    question: "Do you offer team or enterprise pricing?",
    answer: "Yes! Our Pro and Enterprise plans include team collaboration features. For large organizations with custom needs, contact us for a tailored solution with volume discounts and dedicated support.",
  },
  {
    question: "What's included in the free tier?",
    answer: "The free tier includes 2 jobs and 50 moisture readings per month—perfect for trying out FloodEx or for very small operations. All core features are included, just with lower limits.",
  },
  {
    question: "Can I export my data?",
    answer: "Yes, you can export all your job data, readings, photos, and reports at any time. We support PDF exports for reports and CSV/JSON for raw data.",
  },
  {
    question: "Is there a mobile app?",
    answer: "FloodEx is a mobile-first web application that works on any device with a browser. Simply open FloodEx in your mobile browser and add it to your home screen for an app-like experience. No app store download required!",
  },
  {
    question: "What makes FloodEx different from other restoration software?",
    answer: "FloodEx is purpose-built for water damage restoration — not adapted from generic field service software. It features automatic g/kg calculations, psychrometric data, IICRC-compliant reports, and a mobile-first design for field use. Unlike Encircle ($250+/mo), FloodEx starts free with paid plans from $49 AUD/month.",
  },
  {
    question: "Does FloodEx generate IICRC-compliant reports?",
    answer: "Yes. FloodEx reports include moisture readings with g/kg calculations, psychrometric data (dew point, vapour pressure, specific humidity), drying trend charts, equipment logs, and photo documentation — meeting IICRC S500 documentation standards.",
  },
  {
    question: "Can I track equipment with FloodEx?",
    answer: "Yes. FloodEx lets you assign dehumidifiers, air movers, sensors, and other restoration equipment to jobs. Track runtime, calculate costs, and include all equipment data in your reports automatically.",
  },
  {
    question: "How does FloodEx compare to Encircle?",
    answer: "FloodEx offers the same core features as Encircle — moisture tracking, photo documentation, IICRC-compliant reports, and team collaboration — at a fraction of the price. FloodEx starts free and plans begin at $49 AUD/month, compared to Encircle at $250+ USD/month. FloodEx is also Australian-built with local support.",
  },
];

export function FAQAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full max-w-3xl mx-auto">
      {faqs.map((faq, index) => (
        <AccordionItem key={index} value={`item-${index}`} className="border-border">
          <AccordionTrigger className="text-left hover:text-primary transition-colors">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
