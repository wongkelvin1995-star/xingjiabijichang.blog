export interface ScenicBackground {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  page: string;
}

export const SCENIC_BACKGROUNDS: ScenicBackground[] = [
  {
    id: 'tokyo-grand',
    title: '盛大都会与环球全景',
    subtitle: '东京铁塔、新干线列车、富士山与全球全息数据网络',
    src: '/images/backgrounds/bg-tokyo-grand.jpg',
    page: '首页首屏 (/)'
  },
  {
    id: 'palace-moon',
    title: '月色殿宇与骨干网络',
    subtitle: '满月夜空、日本五重宝塔、传统宫殿与多节点骨干网络互联',
    src: '/images/backgrounds/bg-palace-moon.jpg',
    page: '机场推荐与品牌库 (/brands)'
  },
  {
    id: 'canal-lanterns',
    title: '江户水乡与暖光灯街',
    subtitle: '石拱古桥、依依柳树、暖色灯笼街景与日落远山',
    src: '/images/backgrounds/bg-canal-lanterns.jpg',
    page: '技术文章与避坑指南 (/blog)'
  },
  {
    id: 'torii-sunset',
    title: '水上鸟居与天幕环轨',
    subtitle: '晚霞暮光、朱红水上鸟居、漂浮水灯与几何轨道穹顶',
    src: '/images/backgrounds/bg-torii-sunset.jpg',
    page: '真实成本计算器 (/calculator)'
  },
  {
    id: 'torii-night',
    title: '暮色深邃与专网节点',
    subtitle: '深蓝夜空、静水倒影、雪顶富士山与卫星低延迟专线轨道',
    src: '/images/backgrounds/bg-torii-night.jpg',
    page: '节点线路与使用指南 (/routes & /guide)'
  },
];
