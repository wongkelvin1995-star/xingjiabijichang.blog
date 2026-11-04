// 品牌卡片与品牌页顶部使用的插画：纯装饰图片（alt 留空），与品牌本身无关。
// 新增品牌时，把图片放进 public/images/brands/，再在下面补一行映射。

export const BRAND_IMAGE_MAP: Record<string, string> = {
  // 灵动云 - 经典鸟居与暮色富士山
  lingdongyun: '/images/brands/lingdong.jpg',
  // 暮光加速 - 晚霞暮光下的日本多层宝塔
  muguang: '/images/brands/muguang.jpg',
  // 微风网络 - 日式灯笼与樱花古街
  weifeng: '/images/brands/weifeng.jpg',
  // 飞猫云 - 月色下的日式传统古城天守阁
  feimaoyun: '/images/brands/feimao.jpg',
  // 大佬云 - 白雪皑皑的富士山与冬日神社寺院
  dalaoyun: '/images/brands/dalao.jpg',
  // 隐形人 - 静谧夜空与圆月下的黑夜宝塔（暗合隐秘专网特征）
  yinxingren: '/images/brands/banner-sheet1-2.jpg',
  // 飞V (FLY V) - 现代东京璀璨夜景与东京铁塔（极速AI跨境通道）
  flyv: '/images/brands/banner-sheet1-8.jpg',
  // 浪网 WaveNet - 樱花溪流上的朱红太鼓拱桥（流媒体平滑波浪）
  langwang: '/images/brands/banner-sheet1-6.jpg',
  // 梯子云 LadderCloud - 晚霞中倒映在湖面的东京都会天际线
  laddercloud: '/images/brands/banner-sheet2-8.jpg',
  // 闪跃 FlashLeap - 暮色水上鸟居与点点漂浮的莲花水灯
  flashleap: '/images/brands/banner-sheet1-4.jpg',
  // 无忧 - 日式缘侧木廊远眺紫霞富士山（悠闲宁静开箱即用）
  wuyou: '/images/brands/banner-sheet1-5.jpg',
  // 飞为（Firefly） - 暖黄色灯笼点亮的江户古街古阁（萤火夜光）
  firefly: '/images/brands/banner-sheet1-3.jpg',
  // 全球云 - 太空紫光星云与卫星环绕的数字地球（跨洲商务枢纽）
  quanqiuyun: '/images/brands/banner-sheet1-10.jpg',
  // 唯兔云（V2云） - 明月高悬的经典多重飞檐寺塔
  v2yun: '/images/brands/banner-sheet2-2.jpg',
  // 灵猫 - 临水日式茶亭与倒影富士山（灵动小巧）
  lingmao: '/images/brands/banner-sheet1-9.jpg',
  // 星岛梦 StarDream - 梦幻璀璨星空与星岛银河
  stardream: '/images/brands/scene-1.jpg',
  // 光速云 LightSpeed - 3D 全息光速轨道环绕数据地球
  lightspeed: '/images/brands/banner-sheet2-10.jpg',
  // U1S1（有一说一） - 绿柳依依的江南水乡石拱古桥
  u1s1: '/images/brands/banner-sheet2-3.jpg',
  // 极连云 - 暮色烟霞中多节点联动的全景山水
  jilianyun: '/images/brands/scene-2.jpg',
  // 光年梯 - 樱花繁茂之下的红色月影拱桥与石灯笼
  guangnianti: '/images/brands/banner-sheet2-7.jpg',
  // Sogo云 - 破晓日出金光照耀的远山与观景楼阁
  sogoyun: '/images/brands/banner-sheet2-1.jpg',
  // 宇宙云 YuZhou - 浩瀚星海、紫色星云与樱花漫漫的宇宙地球
  yuzhou: '/images/brands/scene-3.jpg',
  // 二猫云 2mao - 悬月映照下的古城高垒与山影
  ermaoyun: '/images/brands/banner-sheet2-5.jpg',
  // 一翻云 1fly - 白雪掩映下的日式木殿与雪白山巅
  yifanyun: '/images/brands/banner-sheet1-7.jpg',
  // 边缘节点 EdgeNova - 赛博朋克深紫霓虹都会与边缘计算矩阵
  edgenova: '/images/brands/scene-4.jpg',
  // 可信云 - 幽静神社的参道石阶与连绵常夜灯（踏实可信）
  kexinyun: '/images/brands/banner-sheet2-9.jpg',
  // 速界 SuJie - 极速跨越的壮阔云海山峦胜景
  sujie: '/images/brands/scene-5.jpg',
  // 快狸 KuaiLi - 水天一色的灵动朱红鸟居与澄澈湖水
  kuaili: '/images/brands/banner-sheet2-4.jpg',
  // 跨界 - 跨越古今都会与富士盛景的黄昏长卷
  kuajie: '/images/brands/banner-sheet2-6.jpg',
  // —— 2026-11 新增的 5 家：暂用站内已有插画/背景图，图片为纯装饰 ——
  // 榴莲云 - 暮色古镇灯火
  liulianyun: '/images/brands/banner-sheet1-1.jpg',
  // 闪电云 - 夜色鸟居
  shandianyun: '/images/backgrounds/bg-torii-night.jpg',
  // 环球云 - 东京全景
  huanqiuyun: '/images/backgrounds/bg-tokyo-grand.jpg',
  // 神行云 - 宫阙明月
  shenxingyun: '/images/backgrounds/bg-palace-moon.jpg',
  // 云界云 - 运河灯笼
  yunjieyun: '/images/backgrounds/bg-canal-lanterns.jpg',
};

export function getBrandImage(brandId: string): string {
  return BRAND_IMAGE_MAP[brandId] || '/images/brands/lingdong.jpg';
}
