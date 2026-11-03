import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info } from 'lucide-react';
import { cn } from '@restio/ui/cn';

const tones = {
  error: { className: 'bg-status-danger-bg text-status-danger', Icon: CircleAlert, role: 'alert' },
  info: { className: 'bg-status-info-bg text-status-info', Icon: Info, role: 'status' },
  success: { className: 'bg-status-ok-bg text-status-ok', Icon: CircleCheck, role: 'status' },
} as const;

export type AlertProps = { tone: keyof typeof tones; className?: string; children: ReactNode };

export function Alert({ tone, className, children }: AlertProps) {
  const { className: toneClass, Icon, role } = tones[tone];
  return (
    <div role={role} className={cn('flex items-start gap-2.5 rounded-md px-3.5 py-3 text-sm font-medium', toneClass, className)}>
      <Icon aria-hidden="true" className="mt-px size-[18px] shrink-0" strokeWidth={1.75} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
