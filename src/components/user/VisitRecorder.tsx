'use client';

import { useEffect } from 'react';
import { recordVisit, type HistoryKind } from '@/lib/userCenterStore';

/**
 * 阅读记录：品牌页 / 文章页挂载后，把这一页写进本浏览器的阅读记录（个人中心“阅读记录”栏目读取）。
 * - 纯客户端副作用，不渲染任何内容；服务端与预渲染阶段什么都不做，不影响页面的静态输出。
 * - 访客在个人中心关闭了阅读记录时，recordVisit 直接返回，不写入。
 * - 读写失败（隐私模式等）由数据层 try/catch 吞掉，不会影响页面本身。
 */
export function VisitRecorder({ kind, id }: { kind: HistoryKind; id: string }) {
  useEffect(() => {
    recordVisit(kind, id);
  }, [kind, id]);
  return null;
}
