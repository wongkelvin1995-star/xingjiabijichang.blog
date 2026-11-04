'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQItem } from '@/types';

interface FAQAccordionProps {
  faqs: FAQItem[];
}

export function FAQAccordion({ faqs }: FAQAccordionProps) {
  const [openIds, setOpenIds] = useState<string[]>([faqs[0]?.id || '']);

  const toggle = (id: string) => {
    if (openIds.includes(id)) {
      setOpenIds(openIds.filter((item) => item !== id));
    } else {
      setOpenIds([...openIds, id]);
    }
  };

  // Generate FAQPage JSON-LD schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="space-y-3">
      {/* Schema for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {faqs.map((faq) => {
        const isOpen = openIds.includes(faq.id);
        return (
          <div
            key={faq.id}
            className="rounded-2xl border border-slate-200 bg-white transition-all overflow-hidden"
          >
            <button
              onClick={() => toggle(faq.id)}
              className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-[#18243B] hover:bg-slate-50 transition-colors focus:outline-hidden"
              aria-expanded={isOpen}
            >
              <span className="flex items-center space-x-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-50 text-[#6955E8] shrink-0 text-xs">
                  问
                </span>
                <span className="leading-snug">{faq.question}</span>
              </span>
              <ChevronDown
                className={`ml-4 h-4 w-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180 text-[#6955E8]' : ''
                }`}
              />
            </button>
            {/* 答案始终渲染在 HTML 里（只是折叠），保证爬虫能读到全部问答正文；展开时平滑滑出 */}
            <div
              aria-hidden={!isOpen}
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="min-h-0 overflow-hidden">
                <div className="border-t border-slate-100 bg-[#F5F7FB]/50 px-5 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <div className="flex items-start space-x-2.5">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-emerald-800 shrink-0 text-xs font-bold mt-0.5">
                      答
                    </span>
                    <div className="space-y-2">{faq.answer}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
