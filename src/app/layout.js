import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: 'RBSS/RBSSS Officer Database - Railway Board',
  description: 'Railway Board Secretariat Service (RBSS) and Railway Board Secretariat Service (Superior) Officer Database and Dashboard',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <footer className="bg-railway-dark text-gray-400 text-center py-4 text-sm border-t border-gray-700">
          <div className="max-w-7xl mx-auto px-4">
            <p>RBSS/RBSSS Officer Database &mdash; Railway Board, Govt. of India</p>
          </div>
        </footer>
      </body>
    </html>
  );
}
