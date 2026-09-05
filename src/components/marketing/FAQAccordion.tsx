import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const faqs = [
  {
    question: "Is FloodEx free to use?",
    answer: "Yes. Creating jobs, chambers, readings, photos, equipment logs, and previewing reports in-app is free. You only pay when you need to get data out — downloading a PDF unlocks that job.",
  },
  {
    question: "How much does a report unlock cost?",
    answer: "AUD $29.00 one-time per job. Your first job unlock is free. Once a job is unlocked, you can re-download PDFs for that same job forever at no extra cost.",
  },
  {
    question: "Can I change an unlocked job to a different customer?",
    answer: "No. After unlock we lock identity fields (customer name, address, city, state, postcode, claim ID, and start date) so a paid report cannot be reused for a different loss. Readings, photos, equipment, and notes stay editable.",
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
    question: "What's included for free?",
    answer: "Everything you need to run a job in FloodEx: unlimited jobs, moisture readings, photos, equipment tracking, and in-app report previews. You pay only when you unlock a job to download or export a PDF.",
  },
  {
    question: "Can I export my data?",
    answer: "In-app report preview is always free. Downloading a clean PDF requires unlocking that job (AUD $29, first unlock free). After unlock, re-downloads of the same job stay free.",
  },
  {
    question: "Is there a mobile app?",
    answer: "FloodEx is a mobile-first web application that works on any device with a browser. Simply open FloodEx in your mobile browser and add it to your home screen for an app-like experience. No app store download required!",
  },
  {
    question: "What makes FloodEx different from other restoration software?",
    answer: "FloodEx is purpose-built for water damage restoration — not adapted from generic field service software. It features automatic g/kg calculations, psychrometric data, IICRC-compliant reports, and a mobile-first design for field use. Unlike Encircle ($250+/mo), FloodEx is free to use and PDFs unlock for AUD $29 per job.",
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
    answer: "FloodEx offers the same core features as Encircle — moisture tracking, photo documentation, IICRC-compliant reports, and team collaboration — at a fraction of the price. FloodEx is free to use and job report unlocks are AUD $29, compared to Encircle at $250+ USD/month. FloodEx is also Australian-built with local support.",
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
