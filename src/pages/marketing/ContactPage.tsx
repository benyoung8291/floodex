import { Link } from 'react-router-dom';
import { MarketingLayout } from '@/components/marketing/MarketingLayout';
import { ContactForm } from '@/components/marketing/ContactForm';
import { Mail, Phone, Clock, MessageCircle, HelpCircle } from 'lucide-react';

export default function ContactPage() {
  return (
    <MarketingLayout>
      {/* Hero */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              Contact Us
            </span>
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-muted-foreground">
              Have questions about FloodEx? Want to schedule a demo? Our team is here 
              to help you get started.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="pb-20 lg:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 lg:gap-20">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                <p className="text-muted-foreground mb-8">
                  Fill out the form and our team will get back to you within 24 hours.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Email</h3>
                    <p className="text-muted-foreground">support@floodex.com</p>
                    <p className="text-muted-foreground">sales@floodex.com</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Phone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Phone</h3>
                    <p className="text-muted-foreground">1-800-FLOODEX</p>
                    <p className="text-muted-foreground">(1-800-356-6339)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium mb-1">Business Hours</h3>
                    <p className="text-muted-foreground">Monday - Friday: 8am - 6pm EST</p>
                    <p className="text-muted-foreground">Weekend: Emergency support only</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="pt-8 border-t border-border">
                <h3 className="font-medium mb-4">Quick Links</h3>
                <div className="space-y-3">
                  <Link 
                    to="/pricing" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <HelpCircle className="h-4 w-4" />
                    View Pricing FAQ
                  </Link>
                  <Link 
                    to="/features" 
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Explore Features
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-card rounded-2xl border border-border p-8">
                <h2 className="text-xl font-semibold mb-6">Send us a Message</h2>
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Support Options */}
      <section className="py-20 lg:py-32 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Other Ways to Get Help</h2>
            <p className="text-muted-foreground">
              Choose the support option that works best for you.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with our support team in real-time during business hours.
              </p>
              <p className="text-sm text-primary">Available 8am - 6pm EST</p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Help Center</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Browse our knowledge base for tutorials, guides, and FAQs.
              </p>
              <Link to="/pricing" className="text-sm text-primary hover:underline">
                Visit FAQ →
              </Link>
            </div>

            <div className="text-center p-8 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Phone className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Speak directly with our support team for urgent issues.
              </p>
              <p className="text-sm text-primary">1-800-FLOODEX</p>
            </div>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
