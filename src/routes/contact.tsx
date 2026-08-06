import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, ArrowLeft, Send, CheckCircle2, AlertCircle, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { MarketingFooter } from "@/components/MarketingFooter";

export const Route = createFileRoute("/contact")({
  component: ContactPage,
});

function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "General Inquiry",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase.from("contact_messages" as any).insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          subject: formData.subject,
          message: formData.message.trim(),
          user_id: user?.id || null,
          status: "unread",
        },
      ]);

      if (error) {
        console.error("Supabase contact_messages error:", error);
        // Fallback: If table doesn't exist yet, show friendly notice
        if (error.code === "42P01") {
          toast.error("Contact database is initializing. Please email auth@capientpro.com directly.");
          return;
        }
        throw error;
      }

      setIsSubmitted(true);
      toast.success("Message sent successfully! We'll get back to you shortly.");
      setFormData({ name: "", email: "", subject: "General Inquiry", message: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020505] text-foreground flex flex-col justify-between relative overflow-hidden font-['Questrial',_sans-serif]">
      {/* Dynamic Radial Background Rays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-background to-background pointer-events-none z-0" />
      <div className="absolute top-1/4 -left-48 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-48 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Header Bar */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shadow-[0_0_20px_-5px_rgba(16,185,129,0.4)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-['Samsung_Sharp_Sans',_sans-serif] font-bold text-xl tracking-tight text-white">
            Capient<span className="text-emerald-400">Pro</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-white hover:bg-white/5 rounded-full px-4">
              <ArrowLeft className="h-4 w-4 mr-1.5" /> Home
            </Button>
          </Link>
          <Link to="/auth">
            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-full px-5 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full flex-1">
        {/* Title Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-4">
              <MessageSquare className="h-3.5 w-3.5" /> Support & Inquiries
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-['Samsung_Sharp_Sans',_sans-serif] font-bold tracking-tight text-white mb-4">
              Let&apos;s Start a Conversation
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Have questions about Capient Pro, need assistance with your budget planner, or want to discuss custom enterprise features? Send us a message below.
            </p>
          </motion.div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Contact Cards */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-5 space-y-6"
          >
            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Email Us</h3>
                  <p className="text-sm text-muted-foreground mt-1">Our support team responds within 24 hours.</p>
                  <a href="mailto:auth@capientpro.com" className="inline-block mt-3 text-emerald-400 hover:text-emerald-300 font-medium text-sm hover:underline">
                    auth@capientpro.com &rarr;
                  </a>
                </div>
              </div>
            </Card>

            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Support Hours</h3>
                  <p className="text-sm text-muted-foreground mt-1">Monday &ndash; Friday: 9:00 AM &ndash; 6:00 PM EST</p>
                  <p className="text-xs text-emerald-400 mt-2 font-medium">24/7 Automated System Monitoring</p>
                </div>
              </div>
            </Card>

            <Card className="bg-white/[0.03] border-white/10 backdrop-blur-xl rounded-2xl p-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-lg">Help & Documentation</h3>
                  <p className="text-sm text-muted-foreground mt-1">Explore our guides, tax rules, and user manuals.</p>
                  <Link to="/docs" className="inline-block mt-3 text-purple-400 hover:text-purple-300 font-medium text-sm hover:underline">
                    Read Documentation &rarr;
                  </Link>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-7"
          >
            <Card className="bg-[#0b0e0d]/90 border-white/10 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
              {isSubmitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="h-16 w-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl font-bold text-white font-['Samsung_Sharp_Sans',_sans-serif]">Message Received!</h2>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto">
                    Thank you for reaching out. One of our specialists will review your inquiry and get back to you at your email address shortly.
                  </p>
                  <Button 
                    onClick={() => setIsSubmitted(false)}
                    variant="outline" 
                    className="mt-6 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 rounded-full px-6"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <h2 className="text-xl font-bold text-white">Send Us a Message</h2>
                    <p className="text-xs text-muted-foreground">Fill out the form below and we will respond promptly.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-xs text-muted-foreground font-medium">Your Name *</Label>
                      <Input
                        id="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-emerald-500/50 rounded-xl h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-xs text-muted-foreground font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-emerald-500/50 rounded-xl h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-xs text-muted-foreground font-medium">Topic / Subject</Label>
                    <Select 
                      value={formData.subject} 
                      onValueChange={(val) => setFormData({ ...formData, subject: val })}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10 text-white rounded-xl h-11">
                        <SelectValue placeholder="Select topic" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#111413] border-white/10 text-white">
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Technical Support">Technical Support</SelectItem>
                        <SelectItem value="Billing & Subscriptions">Billing & Subscriptions</SelectItem>
                        <SelectItem value="Feature Request">Feature Request</SelectItem>
                        <SelectItem value="Enterprise & Society Partnerships">Enterprise & Society Partnerships</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-xs text-muted-foreground font-medium">Your Message *</Label>
                    <Textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us how we can help..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      className="bg-black/40 border-white/10 text-white placeholder:text-muted-foreground/50 focus:border-emerald-500/50 rounded-xl resize-none p-3.5"
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-xl text-sm transition-all shadow-[0_0_25px_rgba(16,185,129,0.3)]"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Sending Message...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="h-4 w-4" /> Send Message
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </Card>
          </motion.div>

        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
