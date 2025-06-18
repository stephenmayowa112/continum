'use client';

import Footer from './Footer';
import { usePathname } from 'next/navigation';

export default function ConditionalFooter() {
  const pathname = usePathname() || '';
  // Hide footer on meeting pages
  if (pathname.startsWith('/meeting')) {
    return null;
  }
  return <Footer />;
}
