import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Implementation Pro — AI-Powered Implementation Management',
  description:
    'AI agents that run your SaaS implementations. Manage engagements, detect risks, automate deliverables, and execute repeatable tasks — all in one platform that learns your patterns.',
  keywords: [
    'implementation management',
    'saas implementation',
    'ai project management',
    'professional services automation',
    'implementation templates',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
