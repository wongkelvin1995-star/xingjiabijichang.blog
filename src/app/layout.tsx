import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import {
  DEFAULT_OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_HOST,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
  SOCIAL_LINKS,
  absoluteUrl,
} from '@/data/site';

// Bing Webmaster Tools 的 HTML 标签验证码：部署时在环境变量里填入即可（不填则不输出）。
const BING_VERIFICATION = process.env.BING_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s｜${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: '凯文', url: absoluteUrl('/about#author') }],
  creator: '凯文',
  publisher: SITE_NAME,
  // 注意：这里不要写全站 canonical。canonical 必须由各页面自己声明，
  // 否则没有声明的页面（含 404）会继承首页地址。首页的 canonical 在 app/page.tsx。
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: SITE_NAME,
    // 不在这里写 title/description：没有自定义 openGraph 的页面会自动用各自的 title/description
    // 默认分享图；自己写了 openGraph 的页面（首页、品牌页）会整体覆盖这里，所以它们各自也要写 images
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: 'summary_large_image',
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    // 通用的预览指令：Bing 和其他搜索引擎也读这几项（googleBot 里那份只有 Google 读）
    'max-video-preview': -1,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  ...(BING_VERIFICATION ? { verification: { other: { 'msvalidate.01': BING_VERIFICATION } } } : {}),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0F172A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLdWebSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    alternateName: ['性价比机场推荐', SITE_HOST],
    headline: SITE_TITLE,
    url: absoluteUrl('/'),
    description: SITE_DESCRIPTION,
    inLanguage: 'zh-CN',
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      alternateName: SITE_HOST,
      url: absoluteUrl('/'),
      logo: absoluteUrl('/icon.svg'),
      email: SOCIAL_LINKS.email,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: absoluteUrl('/blog?q={search_term_string}'),
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="zh-CN" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebSite) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#FFF9FD] text-[#0F172A] antialiased">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
