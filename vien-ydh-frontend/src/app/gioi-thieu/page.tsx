"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2, Award, Users, Heart, BookOpen, Leaf,
  CheckCircle2, ChevronRight, Phone, MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const fadeIn = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } };
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

export default function GioiThieuPage() {
  const t = useTranslations('about');

  const stats = [
    { number: "50+", label: t('stats.years'), icon: Building2 },
    { number: "253+", label: t('stats.doctors'), icon: Users },
    { number: "100k+", label: t('stats.patients'), icon: Heart },
    { number: "30+", label: t('stats.awards'), icon: Award },
  ];

  const milestones = t.raw('milestones');

  const departments = t.raw('departments');
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-teal-800 text-white py-24 md:py-36 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal-300 blur-3xl" />
        </div>
        <div className="container-site px-4 relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur rounded-full px-4 py-2 text-sm font-medium mb-6 border border-white/20">
              <Leaf className="h-4 w-4 text-teal-300" />
              {t('instituteName')}
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6" dangerouslySetInnerHTML={{ __html: t('hero.title') }} />
            <p className="text-xl text-white/80 leading-relaxed mb-8">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/dat-lich">
                <Button size="lg" className="rounded-xl bg-white text-primary-800 hover:bg-white/90 font-bold h-14 px-8 text-base">
                  {t('cta.bookAppointment')} <ChevronRight className="ml-1 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/lien-he">
                <Button size="lg" variant="outline" className="rounded-xl border-white/40 text-white hover:bg-white/10 h-14 px-8 text-base">
                  {t('cta.contactUs')}
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-b border-stone-100">
        <div className="container-site px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <motion.div key={s.label} variants={fadeIn} className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center">
                    <s.icon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="text-4xl font-extrabold text-primary-700 mb-1">{s.number}</div>
                <div className="text-sm text-stone-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-stone-50">
        <div className="container-site px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{t('sections.missionVision')}</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">{t('sections.missionVisionSub')}</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
              className="bg-white rounded-3xl p-10 shadow-sm border border-stone-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mb-6">
                <Heart className="h-7 w-7 text-primary-600" />
              </div>
              <h3 className="text-2xl font-bold text-stone-900 mb-4">{t('sections.mission')}</h3>
              <p className="text-stone-600 leading-relaxed">
                {t('sections.missionDesc')}
              </p>
              <ul className="mt-6 space-y-3">
                {t.raw('sections.missionItems').map((item: string) => (
                  <li key={item} className="flex items-center gap-3 text-stone-700">
                    <CheckCircle2 className="h-5 w-5 text-primary-500 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={{ ...fadeIn, visible: { ...fadeIn.visible, transition: { duration: 0.6, delay: 0.15 } } }}
              className="bg-gradient-to-br from-primary-600 to-teal-600 rounded-3xl p-10 shadow-xl text-white">
              <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">{t('sections.vision')}</h3>
              <p className="text-white/90 leading-relaxed">
                {t('sections.visionDesc')}
              </p>
              <ul className="mt-6 space-y-3">
                {t.raw('sections.visionItems').map((item: string) => (
                  <li key={item} className="flex items-center gap-3 text-white/90">
                    <CheckCircle2 className="h-5 w-5 text-teal-200 flex-shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="container-site px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{t('sections.history')}</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">{t('sections.historySub')}</p>
          </motion.div>
          <div className="max-w-3xl mx-auto">
            {milestones.map((m: { year: string; title: string; desc: string }, i: number) => (
              <motion.div key={m.year}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                viewport={{ once: true }}
                className="flex gap-6 mb-8 group">
                <div className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 text-white font-bold text-sm flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
                    {m.year}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-full bg-stone-200 mt-2" />}
                </div>
                <div className="pb-8 pt-2">
                  <h3 className="text-lg font-bold text-stone-900 mb-2">{m.title}</h3>
                  <p className="text-stone-600 leading-relaxed">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Departments */}
      <section className="py-20 bg-stone-50">
        <div className="container-site px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-4">{t('sections.departments')}</h2>
            <p className="text-stone-500 max-w-2xl mx-auto">{t('sections.departmentsSub')}</p>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {departments.map((dept: { name: string; desc: string }) => (
              <motion.div key={dept.name} variants={fadeIn}
                className="bg-white rounded-2xl p-6 border border-stone-200 hover:border-primary-200 hover:shadow-lg transition-all group">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                  <Leaf className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="font-bold text-stone-900 mb-2">{dept.name}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{dept.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary-600 text-white">
        <div className="container-site px-4 text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t('ctaSection.title')}</h2>
            <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg">
              {t('ctaSection.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dat-lich">
                <Button size="lg" className="bg-white text-primary-700 hover:bg-white/90 font-bold h-14 px-10 rounded-xl text-base">
                  {t('ctaSection.bookNow')}
                </Button>
              </Link>
              <a href="tel:0964392632">
                <Button size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 h-14 px-10 rounded-xl text-base">
                  <Phone className="mr-2 h-5 w-5" /> 0964 392 632
                </Button>
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
