import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';

export const metadata: Metadata = {
  title: 'Akieni PMO',
  description: 'Outil de gestion de projet et de pilotage financier Akieni.',
};

export default function RootLayout({ children }: { readonly children: ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
