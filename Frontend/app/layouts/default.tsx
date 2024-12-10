import { AlignJustify } from 'lucide-react';
import { useMemo } from 'react';
import { Link, Outlet } from 'react-router';
import { Button } from '~/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet';
import { useAccount } from '~/lib/account';
import Http from '~/lib/http';
import { cn } from '~/lib/utils';

async function signOut() {
  try {
    const http = new Http();
    await http.signOut();
    window.location.href = '/';
  } catch (_err: unknown) {
    /* empty */
  }
}

export default function Default() {
  const account = useAccount();

  const accountComponents = useMemo(() => {
    if (account) {
      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div>
                <Button variant="outline" className="hidden md:block">
                  {account.username}
                </Button>
                <Button variant="ghost" className="block md:hidden font-bold">
                  {account.username}
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="hover:cursor-pointer" onClick={signOut}>
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    } else {
      return (
        <Link to="/login">
          <Button variant="link" className="p-0">
            Login
          </Button>
        </Link>
      );
    }
  }, [account]);

  return (
    <>
      <div className={cn('flex min-h-screen w-full flex-col bg-background p-4')}>
        <div className={cn('flex items-center')}>
          <Link to="/">
            <Button variant="link" className={cn('p-0 text-lg')}>
              <strong>{import.meta.env.VITE_SITE_TITLE}</strong>
            </Button>
          </Link>
          <div className="ml-auto flex justify-center md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost">
                  <AlignJustify />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-fit">
                <div className="mt-4 flex w-fit flex-col">
                  {accountComponents}
                  {(account?.roles.includes('Admin') ||
                    account?.roles.includes('Staff') ||
                    account?.roles.includes('Uploader')) && (
                    <Link to="/posts">
                      <Button variant="link">Posts</Button>
                    </Link>
                  )}
                  {(account?.roles.includes('Admin') || account?.roles.includes('Staff')) && (
                    <Link to="/users">
                      <Button variant="link">Users</Button>
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="items-ce ml-auto hidden gap-2 md:flex">
            {(account?.roles.includes('Admin') ||
              account?.roles.includes('Staff') ||
              account?.roles.includes('Uploader')) && (
              <Link to="/posts">
                <Button variant="link">Posts</Button>
              </Link>
            )}
            {(account?.roles.includes('Admin') || account?.roles.includes('Staff')) && (
              <Link to="/users">
                <Button variant="link">Users</Button>
              </Link>
            )}
            {accountComponents}
          </div>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
