import React from 'react'
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "../components/Navbar";
import ConditionalFooter from "../components/ConditionalFooter";
import { UserProvider } from "../lib/auth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SupabaseProvider from '@/components/SupabaseProvider';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const montserrat = Montserrat({
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap'
});

export const metadata: Metadata = {
  title: "Roshe Mentorship",
  description: "Change the world through mentorship",
  icons: {
    icon: [
      '/images/roshementorship.ico',
      {
        url: '/images/roshementorship.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        url: '/images/roshementorship.png',
        sizes: '192x192',
        type: 'image/png',
      },
    ],
    shortcut: '/images/roshementorship.ico',
    apple: {
      url: "/images/roshementorship.png",
      sizes: "180x180",
      type: "image/png",
    },
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Create Supabase server-side client and get initial session
  const supabase = createServerComponentClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return (
    <html lang="en" className={`${montserrat.variable}`}>  
      <body className={`${montserrat.className}`}>  
        <SupabaseProvider initialSession={session}>
          <UserProvider>
            <Navbar />
            <ToastContainer position="top-right" />
            {children}
            <ConditionalFooter />
          </UserProvider>
        </SupabaseProvider>
      </body>
    </html>
  );
}
