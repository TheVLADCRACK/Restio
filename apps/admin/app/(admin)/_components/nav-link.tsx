'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

export function NavLink({ href, className, children }: { href: string; className: string; children: ReactNode }) {
  const path = usePathname() ?? '/';
  const active = href === '/' ? path === '/' : path === href || path.startsWith(`${href}/`);
  return (
    <Link href={href} aria-current={active ? 'page' : undefined} className={className}>
      {children}
    </Link>
  );
}
