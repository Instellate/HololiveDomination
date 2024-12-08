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
              <Button variant="outline">{account.username}</Button>
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
        <div className={cn('flex justify-center')}>
          <Link to="/">
            <Button variant="link" className={cn('p-0 text-lg')}>
              <strong>{import.meta.env.VITE_SITE_TITLE}</strong>
            </Button>
          </Link>
          <div className="items-ce ml-auto flex gap-2">
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
