export interface Brand {
  id: string;
  slug: string;
  /** 站内统一使用的中文简称（与首页 34 家名单一致） */
  name: string;
  /** 英文名、别名：只用于搜索和页面标题，不代替 name */
  aliases?: string[];
  /** 目录默认排序用的拼音（小写、无空格；英文名按字母） */
  pinyin: string;
  /** 一句话简介：由价格表自动生成（见 brands.ts），不手写 */
  tagline: string;
  /** 角标文字：目前只有“本站优选”使用，其余品牌不显示角标 */
  badge?: string;
  description: string;
  editorialOrder: number;
  affiliateUrl: string | null; // 只放有效的推广（邀请）链接；没有就是 null
  affiliateLabel?: string;
  officialSite?: string;
  isVerified: boolean;
  /** 资料为历史参考、不代表当前在售（页面会明确标注） */
  isHistorical?: boolean;
  /** 逐项核验之后才填写的技术参数；未核验的品牌不要填，页面也不会展示 */
  attributes?: {
    establishedYear: string;
    protocols: string[];
    lineTypes: string[];
    entryNodes: string;
    refundPolicy: string;
    paymentMethods: string[];
    deviceLimit: string;
    supportChannels: string[];
  };
  pros: string[];
  cons: string[];
  targetAudience: string;
  lastVerifiedDate: string;
  verificationNotes: string;
}

export type BillingCycle =
  | 'monthly'
  | 'quarterly'
  | 'semiannual'
  | 'yearly'
  | 'biennial'
  | 'triennial'
  | 'unlimited';

export interface Plan {
  id: string;
  brandId: string;
  brandName: string;
  brandOrder: number; // 品牌展示顺序，来自 Brand.editorialOrder；首页对比表按它排序
  planName: string;
  actualPrice: number; // 实际付款金额
  currency: string; // 币种，如 "¥"
  billingCycle: BillingCycle;
  billingCycleLabel: '月付' | '季付' | '半年付' | '年付' | '两年付' | '三年付' | '不限时按量';
  monthlyGB: number | null; // 每月额度（一次性流量包为 null）
  trafficGB: number; // 周期内总流量
  trafficResetRule: string; // 重置规则
  trafficMultiplier: string; // 流量倍率
  deviceLimit: string; // 设备限制
  nominalPerGB: number; // 每 GB 标称成本 = actualPrice / trafficGB
  referenceCostPerEffectiveGB: number; // 按倍率折算的参考成本（倍率为 1 时与标称成本相同）
  perMonthLabel: string; // 折合月价，例如 “折合 ¥8.25/月”
  savingsLabel: string; // 较月付的节省说明，没有则为空字符串
  lineInfo: string; // 线路说明
  verifyStatus: string; // 核验状态
  dataDate: string; // 价格资料日期
  affiliateUrl: string | null;
  isEntryPlan: boolean; // 该品牌的最低月付档，首页默认排在最前
  recommendedTag?: string;
}

export interface Article {
  slug: string;
  title: string;
  seoTitle: string;
  metaDescription: string;
  h1: string;
  searchIntent?: string;
  category:
    | '选购指南'
    | '成本分析'
    | '技术科普'
    | '流媒体与AI'
    | '测速与风控'
    | '深度横评'
    | '品牌评测';
  publishDate: string;
  modifiedDate: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  readTimeMinutes: number;
  wordCount: number;
  summary: string;
  tags: string[];
  toc: { id: string; title: string; level: number }[];
  content: string; // Full Markdown or rich text
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
