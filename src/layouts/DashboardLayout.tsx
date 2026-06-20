import type { PropsWithChildren } from 'react';
import { Navbar } from '@/components/Navbar';
import { Screen } from '@/components/ui/Screen';

export function DashboardLayout({ children, title }: PropsWithChildren<{ title: string }>) {
  return <Screen><Navbar title={title} />{children}</Screen>;
}
