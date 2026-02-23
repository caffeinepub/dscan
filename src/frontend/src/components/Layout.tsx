import { Link, Outlet, useRouterState } from '@tanstack/react-router';
import { FileText, ScanLine } from 'lucide-react';
import { Button } from './ui/button';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

export default function Layout() {
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2 text-xl font-bold text-foreground">
                <ScanLine className="w-7 h-7 text-primary" />
                <span>DocScan</span>
              </Link>
              <nav className="hidden md:flex items-center gap-1">
                <Link to="/">
                  <Button
                    variant={currentPath === '/' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <ScanLine className="w-4 h-4" />
                    Scan
                  </Button>
                </Link>
                <Link to="/library">
                  <Button
                    variant={currentPath === '/library' ? 'default' : 'ghost'}
                    size="sm"
                    className="gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Library
                  </Button>
                </Link>
              </nav>
            </div>
            <div>
              {identity ? (
                <Button onClick={clear} variant="outline" size="sm">
                  Logout
                </Button>
              ) : (
                <Button onClick={login} disabled={isLoggingIn} size="sm">
                  {isLoggingIn ? 'Connecting...' : 'Login'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  window.location.hostname
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                caffeine.ai
              </a>
            </p>
            <p className="mt-1">© {new Date().getFullYear()} DocScan. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
