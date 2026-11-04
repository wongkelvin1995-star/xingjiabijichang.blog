/**
 * 优惠码：站长提供的清单（2026-11-04 收到的《优惠码.txt》），一家一个，照抄原字符串（含大小写）。
 *
 * - 站长 2026-11-04 说明：清单里的优惠码折扣为 8 折、有效期为一次性（见下面的常量）。适用哪些套餐和周期、是否限新用户、
 *   能否和年付折扣叠加，站长没有说明；本站没有逐项核验，页面只转述站长的说明，不再往下推算——不算“用码后的价格”。
 *   用户在官网结算页输入后，只看“最终付款金额”，以结算页为准。
 * - 码失效、写错或有变化：直接改这里，机场优惠页和品牌资料页会一起更新。
 * - 无忧：清单里原来写的是“79元mini”（像套餐名），站长 2026-11-04 更正为 wuyou666。
 *   以后某一条再有存疑，就给它加 note：页面会标“待确认”并去掉复制按钮。
 */
export const PROMO_CODES_DATE = '2026-11-04';

/** 站长对清单里优惠码的说明（2026-11-04）：折扣 8 折，有效期一次性。 */
export const PROMO_DISCOUNT_LABEL = '8 折';
export const PROMO_VALIDITY_LABEL = '一次性';
/** 页面上标在每个码旁边的短标签：“8 折 · 一次性” */
export const PROMO_TERMS = `${PROMO_DISCOUNT_LABEL} · ${PROMO_VALIDITY_LABEL}`;

export interface PromoCode {
  code: string;
  /** 有 note 的条目页面标“待确认”，不提供复制按钮 */
  note?: string;
}

const PROMO_CODES: Record<string, PromoCode> = {
  lingdongyun: { code: 'ld888' },
  muguang: { code: 'mm88' },
  flyv: { code: 'fly20' },
  laddercloud: { code: 'tzy888' },
  langwang: { code: 'lw888' },
  yinxingren: { code: 'yxr888' },
  feimaoyun: { code: 'flycat888' },
  stardream: { code: 'nmw888' },
  lightspeed: { code: 'AMM' },
  v2yun: { code: 'rabbit' },
  u1s1: { code: 'U1S1' },
  jilianyun: { code: 'JLY888' },
  quanqiuyun: { code: 'qq88' },
  guangnianti: { code: 'GN888' },
  sogoyun: { code: 'SOGO10000' },
  yuzhou: { code: 'YUZHOU553' },
  ermaoyun: { code: 'ermao888' },
  yifanyun: { code: '1FLYYUN' },
  edgenova: { code: 'VA888' },
  kexinyun: { code: 'kxy80' },
  sujie: { code: 'sujie888' },
  kuaili: { code: 'kuaili996' },
  weifeng: { code: 'weifeng90' },
  wuyou: { code: 'wuyou666' },
  lingmao: { code: 'lingmao' },
  flashleap: { code: 'shanyue' },
  firefly: { code: 'firefly' },
  kuajie: { code: 'kuajie' },
  liulianyun: { code: 'll88' },
  dalaoyun: { code: 'dly88' },
  shandianyun: { code: 'sd88' },
  huanqiuyun: { code: 'HQ66' },
  shenxingyun: { code: 'sx0077' },
  yunjieyun: { code: 'yjx888' },
};

export function getPromoCode(brandId: string): PromoCode | null {
  return PROMO_CODES[brandId] ?? null;
}

/** 清单里的品牌数（含待确认的条目） */
export const PROMO_LISTED_COUNT = Object.keys(PROMO_CODES).length;
