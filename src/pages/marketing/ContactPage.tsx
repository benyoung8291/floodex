import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { ContactForm } from '@/components/marketing/ContactForm';
import { MessageCircle, HelpCircle, Clock } from 'lucide-react';

export default function ContactPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-28 sm:pt-32 pb-16 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Contact Us
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              Have questions about FloodEx? Want to schedule a demo? Fill out the form below and we'll get back to you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-16 sm:pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-10 lg:gap-20">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-6">
                  Fill out the form and we'll get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Preferred Contact</h3>
                    <p className="text-sm text-muted-foreground">
                      Use the contact form to reach us. We respond to every enquiry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Response Time</h3>
                    <p className="text-sm text-muted-foreground">We aim to respond within 24 hours, Monday to Friday.</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-6 border-t border-border">
                <h3 className="font-medium mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link 
                    to="/pricing" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    <HelpCircle className="h-4 w-4" />
                    View Pricing FAQ
                  </Link>
                  <Link 
                    to="/features" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Explore Features
                  </Link>
                </div>
              </div>

              {/* Business info */}
              <div className="pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground/70">
                  Local Carpet Cleaning Pty Ltd<br />
                  ABN 15 682 871 192
                </p>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-6 sm:p-8">
                <h2 className="text-lg sm:text-xl font-semibold mb-6">Send us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
