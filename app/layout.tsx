import './globals.css';
import Header from '@/components/Header';
import { StoreProvider } from '@/lib/store';

export const metadata = { title: 'Pink Velvet Nails & Beauty' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <Header />
          <main className="mx-auto max-w-6xl p-4">{children}</main>
        </StoreProvider>
      </body>
    </html>
  );
}
