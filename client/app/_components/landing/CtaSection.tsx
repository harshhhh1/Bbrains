"use client";

import { useState } from "react";
import { HandButton } from "@/components/hand-drawn/button";
import { landingData } from "@/data/landing";
import { toast } from "sonner";
import { Mail, User, Building2 } from "lucide-react";

export function CtaSection() {
  const { titleLine1, titleLine2, subtitle, namePlaceholder, emailPlaceholder, organizationPlaceholder, buttonText } = landingData.ctaSection;
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    organization: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.organization) {
      toast.error("Please fill in all fields");
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      toast.success("Demo request sent! We'll contact you soon.");
      setFormData({ name: "", email: "", organization: "" });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <section id="contact" className="py-24 px-6 max-w-6xl mx-auto relative z-20">
      <div className="relative max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-hand-red rounded-[20px_20px_30px_10px_/_15px_15px_20px_25px] translate-x-2 translate-y-2 lg:translate-x-3 lg:translate-y-3 -rotate-1"></div>
        
        <div className="relative rounded-[20px_20px_30px_10px_/_15px_15px_20px_25px] border-[3px] border-hand-pencil bg-hand-pencil text-white p-10 md:p-16 text-center shadow-lg -rotate-1 hover:rotate-0 transition-transform duration-300">
          <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-dashed border-white/30 rounded-tl-full"></div>
          
          <h2 className="font-kalam text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-white leading-[1.1]">
            {titleLine1}<br className="hidden sm:block" /> {titleLine2}
          </h2>
          
          <p className="font-patrick text-xl text-white/95 mb-10 max-w-2xl mx-auto">
            {subtitle}
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto space-y-4">
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
              <input 
                type="text"
                placeholder={namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full h-12 pl-12 pr-6 bg-transparent border-2 border-white/60 text-white rounded-wobbly font-patrick text-lg placeholder:text-white/40 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
              <input 
                type="email"
                placeholder={emailPlaceholder}
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full h-12 pl-12 pr-6 bg-transparent border-2 border-white/60 text-white rounded-wobbly font-patrick text-lg placeholder:text-white/40 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 pointer-events-none" />
              <input 
                type="text"
                placeholder={organizationPlaceholder}
                value={formData.organization}
                onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                className="w-full h-12 pl-12 pr-6 bg-transparent border-2 border-white/60 text-white rounded-wobbly font-patrick text-lg placeholder:text-white/40 focus:outline-none focus:border-white focus:ring-2 focus:ring-white/20 transition-all"
              />
            </div>
            
            <HandButton 
              type="submit"
              size="lg" 
              variant="default" 
              className="w-full h-14 bg-white text-hand-pencil hover:bg-white/90 font-kalam text-xl rotate-1 mt-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : buttonText}
            </HandButton>
          </form>
        </div>
      </div>
    </section>
  );
}