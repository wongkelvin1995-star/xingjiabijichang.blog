import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import { Brand } from '@/types';
import { getBrandImage } from '@/data/brandImages';
import { FavoriteBrandButton } from './user/UserActions';

interface BrandCardProps {
  brand: Brand;
}

export function BrandCard({ brand }: BrandCardProps) {
  // 徽章只在有话要说时出现（本站优选 / 历史资料），不写任何未经核实的体验性描述（如“极速”“稳定”）。
  // 价格的核验状态不放在卡片上（品牌名称本身没有疑问），统一写在列表页顶部说明和各品牌页里。
  const shortDesc = brand.tagline;
  const imageSrc = getBrandImage(brand.id);
  const badge = brand.badge
    ? { label: brand.badge, color: 'bg-[#0F172A] text-white' }
    : brand.isHistorical
      ? { label: '历史资料', color: 'bg-slate-100 text-slate-600' }
      : null;

  return (
    <div className="reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-pink-100/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-pink-300 hover:shadow-xl hover:shadow-pink-500/10">
      {/* Top Anime Scenic Thumbnail */}
      <div className="relative overflow-hidden w-full h-28 sm:h-32 bg-[#0F172A]">
        <Image
          src={imageSrc}
          alt=""
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover transition-transform duration-500 group-hover:scale-108"
        />
        
        {/* Subtle gradient overlay at bottom of thumbnail */}
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
        
        {/* Verification Pill */}
        {brand.isVerified && (
          <div className="absolute top-2 right-2 flex items-center space-x-1 rounded-full bg-black/60 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium text-emerald-300 border border-emerald-500/30">
            <ShieldCheck className="h-3 w-3 text-emerald-400" />
            <span>已核验</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-1.5">
          {/* Brand Name & Tag Pill */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center space-x-2">
              <h3 className="text-sm sm:text-base font-black tracking-tight text-[#0F172A] group-hover:text-[#7C3AED] transition-colors truncate">
                {brand.name}
              </h3>
              {badge && (
                <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <FavoriteBrandButton brandId={brand.id} compact />
          </div>

          {/* Description */}
          <p className="text-[12px] sm:text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {shortDesc}
          </p>
        </div>

        {/* Action Buttons: Direct Registration + Technical Details */}
        <div className="space-y-1.5 pt-1">
          <Link
            href={`/brands/${brand.slug}`}
            className="flex w-full items-center justify-center rounded-xl bg-[#7C3AED] py-1.5 px-3 text-xs font-semibold text-white shadow-xs hover:bg-[#6D28D9] active:scale-98 transition-all"
          >
            <span className="min-w-0 truncate">{brand.name}套餐与资料</span>
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
          {brand.affiliateUrl ? (
            <a
              href={brand.affiliateUrl}
              target="_blank"
              rel="sponsored nofollow noopener"
              className="flex min-h-8 items-center justify-center text-[11px] text-slate-500 hover:text-[#7C3AED] transition-colors"
            >
              <span>官网注册（推广链接）</span>
              <ExternalLink className="ml-1 h-2.5 w-2.5" />
            </a>
          ) : (
            <span className="block text-center text-[11px] text-slate-500">暂无官网入口</span>
          )}
        </div>
      </div>
    </div>
  );
}
