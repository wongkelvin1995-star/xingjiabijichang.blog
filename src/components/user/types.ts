import type { BillingCycle } from '@/types';

/** 个人中心页从服务端拿到的公开资料快照（只含页面需要的字段，可序列化） */
export interface MeBrand {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  isHistorical: boolean;
  dataDate: string;
  entryPlanId: string | null;
}

export interface MePlan {
  id: string;
  brandId: string;
  brandName: string;
  brandSlug: string;
  planName: string;
  cycle: BillingCycle;
  cycleLabel: string;
  price: number;
  monthlyGB: number | null;
  totalGB: number;
  perMonthLabel: string;
  savingsLabel: string;
  resetRule: string;
  deviceLimit: string;
  multiplier: string;
  lineInfo: string;
  dataDate: string;
  nominalPerGB: number;
  /** 周期月数；不限时包为 0 */
  months: number;
}

export interface MeArticle {
  slug: string;
  title: string;
  category: string;
  publishDate: string;
  modifiedDate: string;
  summary: string;
}

/** 真实存在的联系渠道（来自 data/site.ts 的 SOCIAL_LINKS），“评论与反馈”“消息与订阅”用它代替不存在的接口 */
export interface MeContact {
  email: string;
  telegram: string;
}

export interface MeData {
  brands: MeBrand[];
  plans: MePlan[];
  articles: MeArticle[];
  featuredBrandId: string;
  dataDateRange: string;
  contact: MeContact;
}

/** 个人中心的栏目；id 同时用作 /me#xxx 深链接（/me#compare 已被站内多处引用，不要改名） */
export type Tab = 'overview' | 'favorites' | 'compare' | 'prefs' | 'history' | 'feedback' | 'messages' | 'account';

/** 把浏览器里保存的 id 还原成可读信息用的索引 */
export interface Lookups {
  planById: Map<string, MePlan>;
  brandById: Map<string, MeBrand>;
  articleBySlug: Map<string, MeArticle>;
  plansByBrand: Map<string, MePlan[]>;
}

export interface SectionProps {
  data: MeData;
  lookups: Lookups;
  go: (tab: Tab) => void;
}
