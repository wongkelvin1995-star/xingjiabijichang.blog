'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { BookOpen, Download, History as HistoryIcon, KeyRound, Trash2, Upload } from 'lucide-react';
import {
  AVATAR_COLORS,
  EMAIL_MAX,
  NICKNAME_MAX,
  STORAGE_KEY,
  type AvatarColor,
  type Profile,
  clearAll,
  exportJSON,
  getStatus,
  importJSON,
  isEmailLike,
  saveProfile,
  setHistoryEnabled,
  useUserCenter,
} from '@/lib/userCenterStore';
import type { SectionProps } from '../types';
import { AVATAR_COLOR_CLASS, AVATAR_COLOR_LABEL, Avatar, Card, Field, FlashLine, InlineConfirm, Switch, type Tone, btn, inputCls, useFlash } from '../ui';

/** 账户设置：资料（昵称 / 头像 / 本地邮箱）、阅读记录开关、导出导入、隐私说明、清空全部数据 */
export function Account({ go }: SectionProps) {
  const uc = useUserCenter();
  const profileFlash = useFlash();
  const dataFlash = useFlash();
  const dangerFlash = useFlash();
  const fileRef = useRef<HTMLInputElement>(null);

  // 当前数据大小（UTF-8 字节数，只用来告诉访客占了多少）
  const bytes = new TextEncoder().encode(JSON.stringify(uc)).length;
  const sizeLabel = bytes < 1024 ? `${bytes} 字节` : `${(bytes / 1024).toFixed(1)} KB`;

  const doExport = () => {
    try {
      const blob = new Blob([exportJSON()], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `xingjiabijichang-personal-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      dataFlash.ok('已生成文件，浏览器会提示保存');
    } catch {
      dataFlash.err('导出失败：浏览器没有允许生成下载');
    }
  };
  const doImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const r = importJSON(String(reader.result ?? ''));
      if (r.ok) dataFlash.ok(r.message);
      else dataFlash.err(r.message);
    };
    reader.onerror = () => dataFlash.err('读取文件失败');
    reader.readAsText(f);
  };
  const toggleHistory = (next: boolean) => {
    if (!setHistoryEnabled(next)) {
      profileFlash.err(getStatus().lastError ?? '保存失败，设置没有生效');
      return;
    }
    if (next) profileFlash.ok('已开启阅读记录');
    else profileFlash.info('已关闭阅读记录：之后的浏览不再写入，已有记录保留');
  };
  const doClear = () => {
    const ok = clearAll();
    if (ok) dangerFlash.ok('已清除本浏览器里的全部个人数据');
    else dangerFlash.err(getStatus().lastError ?? '清除失败');
  };

  return (
    <div className="space-y-5">
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A]">资料</h3>
        <p className="text-[11px] text-slate-500">昵称、头像和邮箱只用于本浏览器里的显示，不上传、不发送邮件。</p>
        {/* key：保存 / 导入 / 清除后用存储里的值重新初始化表单 */}
        <ProfileForm
          key={`${uc.nickname}|${uc.email}|${uc.avatarLetter}|${uc.avatarColor}`}
          initial={uc}
          onMessage={(t, tone) => (tone === 'ok' ? profileFlash.ok(t) : tone === 'err' ? profileFlash.err(t) : profileFlash.info(t))}
        />
        <FlashLine flash={profileFlash.flash} />
      </Card>

      <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
            <HistoryIcon className="h-4 w-4 text-[#7C3AED]" /> 阅读记录
          </h3>
          <p className="mt-0.5 text-xs text-slate-600">
            {uc.historyEnabled ? `正在记录浏览过的品牌页和文章（当前 ${uc.history.length} 条）。` : `已关闭，不再记录新的浏览（保留 ${uc.history.length} 条旧记录）。`}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Switch id="account-history-switch" checked={uc.historyEnabled} onChange={toggleHistory} label={uc.historyEnabled ? '正在记录' : '已关闭'} />
          <button type="button" onClick={() => go('history')} className={btn.link}>
            管理记录 →
          </button>
        </div>
      </Card>

      <Card tone="muted" className="space-y-2 text-xs leading-relaxed text-slate-700">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-[#0F172A]">
          <KeyRound className="h-4 w-4 text-slate-500" /> 登录、密码与第三方账号
        </h3>
        <p>
          本站<strong>没有账号系统</strong>：没有注册、登录、密码，也没有微信 / Google 等第三方登录和跨设备同步，所以这里不会出现这些入口。公开文章和套餐资料无需登录即可阅读。
        </p>
        <p>想在另一台设备上接着用，可用下面的“导出 / 导入”把数据手动带过去。以后如果接入账号系统，这里会提供真实的登录管理。</p>
      </Card>

      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#0F172A]">导出 / 导入（跨设备的手动办法）</h3>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={doExport} className={btn.secondary}>
            <Download className="h-3.5 w-3.5" /> 导出为 JSON
          </button>
          <button type="button" onClick={() => fileRef.current?.click()} className={btn.secondary}>
            <Upload className="h-3.5 w-3.5" /> 从 JSON 导入
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" onChange={doImport} aria-label="选择要导入的 JSON 文件" />
        </div>
        <FlashLine flash={dataFlash.flash} />
        <p className="text-[11px] text-slate-500">导入会覆盖本浏览器里现有的全部个人数据（收藏、对比、偏好、阅读记录、资料）。当前数据约 {sizeLabel}。</p>
      </Card>

      <Card className="space-y-2 text-xs leading-relaxed text-slate-700">
        <h3 className="text-sm font-bold text-[#0F172A]">隐私说明</h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>保存内容：昵称、头像字母与颜色、你填写的邮箱、收藏的品牌 ID 与文章 ID、对比中的套餐 ID、预算 / 流量 / 设备 / 地区 / 计费偏好、阅读记录（品牌 ID 或文章 ID 与时间）及其开关，以及各自的时间。</li>
          <li>
            保存位置：仅当前浏览器的本地存储（localStorage），键名 <code className="break-all">{STORAGE_KEY}</code>；这些数据不写入 Cookie，不发送到服务器，也不交给第三方。
          </li>
          <li>浏览器的“清除站点数据”、隐私模式关闭窗口，都会清掉这些内容。</li>
        </ul>
      </Card>

      <Card tone="danger" className="space-y-2">
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-rose-800">
          <Trash2 className="h-4 w-4" /> 清空本浏览器里的全部个人数据
        </h3>
        <p className="text-xs text-slate-700">会删除上面列出的全部内容并恢复默认设置（阅读记录开关重新打开），不可恢复。没有账号，所以也没有“注销账号”这一步。</p>
        <div className="flex flex-wrap items-center gap-2">
          <InlineConfirm label="清空全部数据…" confirmLabel="确认清空，不可恢复" hint="再确认一次：" onConfirm={doClear} icon={<Trash2 className="h-3.5 w-3.5" />} />
        </div>
        <FlashLine flash={dangerFlash.flash} />
      </Card>

      <p className="flex items-center gap-1 text-[11px] text-slate-500">
        <BookOpen className="h-3 w-3" /> 关于本站与推广关系见
        <Link href="/disclosure" className="ml-0.5 text-[#7C3AED] hover:underline">
          推广合作与资料说明
        </Link>
        。
      </p>
    </div>
  );
}

function ProfileForm({ initial, onMessage }: { initial: Profile; onMessage: (text: string, tone: Tone) => void }) {
  const [nick, setNick] = useState(initial.nickname);
  const [email, setEmail] = useState(initial.email);
  const [letter, setLetter] = useState(initial.avatarLetter);
  const [color, setColor] = useState<AvatarColor>(initial.avatarColor);
  const [emailErr, setEmailErr] = useState<string | null>(null);

  const preview = letter.trim() || nick.trim().slice(0, 1) || '访';
  const dirty = nick !== initial.nickname || email !== initial.email || letter !== initial.avatarLetter || color !== initial.avatarColor;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const em = email.trim();
    if (em && !isEmailLike(em)) {
      setEmailErr('邮箱格式看起来不对，例如 name@example.com；不想填可以留空');
      return;
    }
    setEmailErr(null);
    const saved = saveProfile({ nickname: nick, email: em, avatarLetter: letter, avatarColor: color });
    onMessage(saved ? '资料已保存到本浏览器' : (getStatus().lastError ?? '保存失败，请重试'), saved ? 'ok' : 'err');
  };
  const revert = () => {
    setNick(initial.nickname);
    setEmail(initial.email);
    setLetter(initial.avatarLetter);
    setColor(initial.avatarColor);
    setEmailErr(null);
  };

  return (
    // noValidate：邮箱格式由下面的 submit() 统一校验并用页面内的中文提示，不让浏览器自带的气泡提示抢先拦截
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex items-center gap-3 sm:flex-col">
          <Avatar letter={preview} color={color} size="xl" />
          <span className="whitespace-nowrap text-[11px] text-slate-500">头像预览</span>
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <fieldset>
            <legend className="mb-1.5 text-xs font-semibold text-slate-700">头像颜色</legend>
            <div role="radiogroup" aria-label="头像颜色" className="flex flex-wrap gap-1.5 sm:gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={AVATAR_COLOR_LABEL[c]}
                  title={AVATAR_COLOR_LABEL[c]}
                  onClick={() => setColor(c)}
                  className={`h-8 w-8 cursor-pointer rounded-xl ring-offset-2 transition-shadow ${AVATAR_COLOR_CLASS[c]} ${color === c ? 'ring-2 ring-[#0F172A]' : 'hover:ring-2 hover:ring-pink-300'}`}
                />
              ))}
            </div>
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field id="pf-letter" label="头像文字（1–2 个字，可留空）" hint="留空时用昵称首字">
              <input id="pf-letter" value={letter} onChange={(e) => setLetter(e.target.value.slice(0, 2))} maxLength={2} className={inputCls} placeholder={nick.trim().slice(0, 1) || '访'} />
            </Field>
            <Field id="pf-nick" label="昵称">
              <input id="pf-nick" value={nick} onChange={(e) => setNick(e.target.value)} maxLength={NICKNAME_MAX} className={inputCls} placeholder="只显示在本浏览器" autoComplete="off" />
            </Field>
            <div className="sm:col-span-2">
              <Field id="pf-email" label="邮箱（可选）" hint="只保存在本浏览器，方便你自己辨认；本站不会向它发送任何邮件" error={emailErr}>
                <input
                  id="pf-email"
                  type="email"
                  inputMode="email"
                  autoComplete="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  maxLength={EMAIL_MAX}
                  className={`${inputCls} ${emailErr ? 'border-rose-400' : ''}`}
                  placeholder="可留空"
                  aria-invalid={!!emailErr}
                  aria-describedby={emailErr ? 'pf-email-err' : undefined}
                />
              </Field>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button type="submit" className={btn.primary}>
          保存资料
        </button>
        <button type="button" onClick={revert} disabled={!dirty} className={btn.secondary}>
          还原未保存的修改
        </button>
      </div>
    </form>
  );
}
