"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, MapPin, Mail, Clock, MessageSquare, ChevronRight, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useTranslations } from "next-intl";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };

export default function LienHePage() {
  const t = useTranslations('contact');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactItems = [
    {
      icon: MapPin,
      title: t('infoCards.address.title'),
      lines: t.raw('infoCards.address.lines'),
      action: { label: t('infoCards.address.action'), href: "https://maps.google.com/?q=273+Nguyen+Van+Troi+Phu+Nhuan+HCMC" },
    },
    {
      icon: Phone,
      title: t('infoCards.phone.title'),
      lines: t.raw('infoCards.phone.lines'),
      action: { label: t('infoCards.phone.action'), href: "tel:0964392632" },
    },
    {
      icon: Mail,
      title: t('infoCards.email.title'),
      lines: t.raw('infoCards.email.lines'),
      action: { label: t('infoCards.email.action'), href: "mailto:v.ydhdt@tphcm.gov.vn" },
    },
    {
      icon: Clock,
      title: t('infoCards.hours.title'),
      lines: t.raw('infoCards.hours.lines'),
      action: { label: t('infoCards.hours.action'), href: "/dat-lich" },
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => { setIsSubmitting(false); setSubmitted(true); }, 1500);
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary-900 to-teal-800 text-white py-20 md:py-28">
        <div className="container-site px-4">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <MessageSquare className="h-4 w-4 text-teal-300" />
              {t('hero.badge')}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold mb-6">{t('hero.title')}</h1>
            <p className="text-white/80 text-xl leading-relaxed">
              {t('hero.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Grid */}
      <section className="py-16 -mt-8">
        <div className="container-site px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {contactItems.map((item, i) => (
              <motion.div key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-3xl p-8 shadow-md border border-stone-100 hover:shadow-xl hover:border-primary-100 transition-all group">
                <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
                  <item.icon className="h-7 w-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-stone-900 text-lg mb-3">{item.title}</h3>
                {item.lines.map((line: string) => (
                  <p key={line} className="text-stone-600 text-sm leading-relaxed">{line}</p>
                ))}
                <a href={item.action.href} target={item.action.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-1 text-primary-600 font-semibold text-sm hover:text-primary-800 transition-colors">
                  {item.action.label} <ChevronRight className="h-4 w-4" />
                </a>
              </motion.div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-white rounded-3xl shadow-md border border-stone-100 p-10">
              <h2 className="text-2xl font-bold text-stone-900 mb-2">{t('form.title')}</h2>
              <p className="text-stone-500 mb-8">{t('form.subtitle')}</p>

              {submitted ? (
                <div className="py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 mb-2">{t('form.successTitle')}</h3>
                  <p className="text-stone-600">{t('form.successMessage')}</p>
                  <Button className="mt-6 rounded-xl" onClick={() => setSubmitted(false)}>{t('form.sendAnother')}</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{t('form.nameLabel')}</label>
                      <Input required placeholder={t('form.namePlaceholder')} className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{t('form.phoneLabel')}</label>
                      <Input required type="tel" placeholder={t('form.phonePlaceholder')} className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{t('form.emailLabel')}</label>
                    <Input type="email" placeholder={t('form.emailPlaceholder')} className="h-12 rounded-xl bg-stone-50 border-stone-200" />
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{t('form.subjectLabel')}</label>
                    <select className="flex h-12 w-full rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
                      <option>{t('form.subjects.appointment')}</option>
                      <option>{t('form.subjects.services')}</option>
                      <option>{t('form.subjects.results')}</option>
                      <option>{t('form.subjects.feedback')}</option>
                      <option>{t('form.subjects.other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-stone-700 mb-1.5 block">{t('form.messageLabel')}</label>
                    <Textarea required placeholder={t('form.messagePlaceholder')} className="min-h-[140px] rounded-xl bg-stone-50 border-stone-200 resize-none" />
                  </div>
                  <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-xl bg-primary-600 hover:bg-primary-700 font-bold text-base">
                    {isSubmitting ? t('form.submitting') : t('form.submit')}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Map */}
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.6, delay: 0.2 } } }}>
              <h2 className="text-2xl font-bold text-stone-900 mb-6">{t('map.title')}</h2>
              <div className="rounded-3xl overflow-hidden shadow-md border border-stone-100 mb-6" style={{ height: 420 }}>
                <iframe
                  title={t('map.iframeTitle')}
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.5124!2d106.6802!3d10.7999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317529b77b0c6d03%3A0x19a43d7e4a218e46!2sVi%E1%BB%87n%20Y%20D%C6%B0%E1%BB%A3c%20H%E1%BB%8Dc%20D%C3%A2n%20T%E1%BB%99c!5e0!3m2!1svi!2svn!4v1713744000000"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <a href="https://maps.google.com/?q=273+Nguyen+Van+Troi+Phu+Nhuan+HCMC" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-primary-200 text-primary-700">
                    <Navigation className="mr-2 h-4 w-4" /> {t('map.directionsButton')}
                  </Button>
                </a>
                <Link href="/dat-lich">
                  <Button className="w-full h-12 rounded-xl bg-primary-600 hover:bg-primary-700">
                    {t('map.bookNow')}
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
