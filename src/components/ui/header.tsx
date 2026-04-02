import { Home } from 'lucide-react';
import Link from 'next/link';

function Header({ children }: { children: React.ReactNode }) {
    return (
        <header className="max-w-3xl mx-auto sticky top-0 z-10 bg-white border-b border-stone-200 border-x-2">
            <div className="px-4 sm:px-6 h-14 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
                >
                    <Home className="size-8" />
                </Link>
                {children}
            </div>
        </header>
    );
}

export default Header;
