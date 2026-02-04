'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { TrendingUp, TrendingDown, Settings, History, LogOut, BarChart3 } from 'lucide-react';

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (!session) {
    return null;
  }

  const navItems = [
    {
      href: '/dashboard',
      icon: BarChart3,
      label: '대시보드',
    },
    {
      href: '/buy',
      icon: TrendingDown,
      label: '매수',
    },
    {
      href: '/sell',
      icon: TrendingUp,
      label: '매도',
    },
    {
      href: '/history',
      icon: History,
      label: '히스토리',
    },
    {
      href: '/settings',
      icon: Settings,
      label: '설정',
    },
  ];

  return (
    <nav className="bg-bg-card border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
            📈 <span className="hidden sm:inline">Safety Trading</span>
          </Link>

          {/* 네비게이션 아이템 */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-accent text-bg-primary font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {/* 로그아웃 버튼 */}
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-text-secondary hover:text-up hover:bg-bg-hover transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">로그아웃</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
