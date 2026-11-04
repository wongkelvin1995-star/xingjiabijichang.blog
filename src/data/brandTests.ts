/**
 * 站长测试记录：只收录站长自己跑过、有截图和完整测试条件的记录。
 * - 一次测试只代表那个时间、那条网络、那台设备；页面上必须和“本站没有测试数据”的品牌区分开。
 * - 数字按截图原样整理，不补、不算平均；解锁判定以工具显示为准。
 * - 这里不 import brands.ts，避免循环依赖。
 */

export interface BrandTestRegion {
  region: string;
  nodes: number;
  /** 到入口服务器的 TLS 握手往返时间范围 */
  tlsRtt: string;
  /** 经节点完整请求一次 HTTPS 的耗时范围 */
  httpsLatency: string;
  youtube: string;
  netflix: string;
  disney: string;
  tiktok: string;
  openai: string;
  /** Steam 商店显示的货币 */
  steam: string;
}

export interface BrandTestRecord {
  brandId: string;
  /** 截图里的测试时间 */
  date: string;
  tester: string;
  tool: string;
  network: string;
  scope: string;
  image: {
    /** public/ 下的路径；文件不存在时页面只显示表格，不显示图 */
    src: string;
    alt: string;
  };
  regions: BrandTestRegion[];
  howToRead: string[];
  caveats: string[];
}

export const BRAND_TESTS: BrandTestRecord[] = [
  {
    brandId: 'lingdongyun',
    date: '2026-11-01 19:12（CST）',
    tester: '站长',
    tool: 'MiaoKo 4.3.3（内核 MiaoSpeed 4.7.0），自定义测试“基础流媒体”',
    network: '珠海联通家用宽带（工具标注 9Gbps、32 线程）',
    scope:
      '订阅里的 60 个节点全部测完（日本 10、新加坡 10、美国 10、香港 20、台湾 10）：TLS RTT、HTTPS 延迟，以及 YouTube、Netflix、Disney+、Bilibili、TikTok、DAZN、Abema、巴哈姆特、OpenAI、Steam 的地区判定。没有测下载 / 上传速率。',
    image: {
      src: '/images/tests/lingdongyun-miaoko-2026-11-01.jpg',
      alt: '灵动云 60 个节点的 MiaoKo 测试截图：每行一个节点，列出 TLS RTT、HTTPS 延迟和各流媒体、AI 服务的解锁判定',
    },
    regions: [
      { region: '日本', nodes: 10, tlsRtt: '50–68 ms', httpsLatency: '1045–2584 ms', youtube: '解锁（JP）', netflix: '解锁（JP）', disney: '解锁（JP）', tiktok: '解锁（JP）', openai: '解锁（JP）', steam: 'JPY' },
      { region: '新加坡', nodes: 10, tlsRtt: '2–9 ms', httpsLatency: '1094–2523 ms', youtube: '送中（CN）', netflix: '解锁（SG）', disney: '解锁（HK）', tiktok: '解锁（SG）', openai: '解锁（SG）', steam: 'CNY' },
      { region: '美国', nodes: 10, tlsRtt: '91–99 ms', httpsLatency: '1468–2556 ms', youtube: '解锁（US）', netflix: '解锁（HK）', disney: '解锁（HK）', tiktok: '解锁（US）', openai: '解锁（US）', steam: 'USD' },
      { region: '香港', nodes: 20, tlsRtt: '21–30 ms', httpsLatency: '1220–2982 ms', youtube: '解锁（HK）', netflix: '解锁（HK）', disney: '解锁（HK）', tiktok: '解锁（HK）', openai: '解锁（TW）', steam: 'HKD' },
      { region: '台湾', nodes: 10, tlsRtt: '11–19 ms', httpsLatency: '1179–2683 ms', youtube: '送中（CN）', netflix: '解锁（ES）', disney: '解锁（ES）', tiktok: '解锁（TW）', openai: '解锁（TW）', steam: 'GBP' },
    ],
    howToRead: [
      'TLS RTT 是到入口服务器的握手往返时间：新加坡、台湾节点只有 2–19 ms，说明入口在国内附近，这个数字不代表到境外出口的延迟。',
      'HTTPS 延迟是经该节点完整请求一次 HTTPS 的耗时，1–3 秒之间，受当时网络状况影响很大，不能当作日常打开网页的速度。',
      '“解锁（JP）”表示该服务把出口判定为日本；“送中（CN）”表示 YouTube 把该节点判定为中国地区，不能当作已解锁。',
      '判定地区和节点名称所在地可能不一致（例如台湾节点的 Netflix 判定为 ES、香港节点的 OpenAI 判定为 TW），本页按工具显示原样整理，不做解释。',
    ],
    caveats: [
      '单次测试：2026-11-01 晚间、珠海联通一条宽带、一台设备，不代表其他时段、地区和运营商的表现。',
      '没有下载 / 上传速率、丢包率和持续稳定性数据，所以本站仍然不对灵动云的线路质量下结论。',
      '解锁判定会随服务商和节点 IP 变化，购买前请按《机场测速怎么做？》在自己的网络里复测。',
      '截图由站长提供，本站只做原样整理；图上的水印是测试工具自带的。',
    ],
  },
];

export function getBrandTest(brandId: string): BrandTestRecord | undefined {
  return BRAND_TESTS.find((t) => t.brandId === brandId);
}
