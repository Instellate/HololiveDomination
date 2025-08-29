import { AlignJustify } from 'lucide-react';
import { useCallback, useMemo } from 'react';
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
import { useAccount, useSignOut } from '~/lib/account';
import Http from '~/lib/http';
import { cn } from '~/lib/utils';
import { getArticleInformation } from '~/articles/import';
import type { Route } from './+types/default';
import React from 'react';

export async function clientLoader() {
  return await getArticleInformation();
}

export default function Default({ loaderData }: Route.ComponentProps) {
  const account = useAccount();
  const signOutFunc = useSignOut();

  const articles = useMemo(
    () =>
      loaderData.map((article) => (
        <DropdownMenuItem key={article.path} asChild>
          <Link to={article.path}>{article.name}</Link>
        </DropdownMenuItem>
      )),
    [loaderData],
  );

  const signOut = useCallback(async () => {
    try {
      const http = new Http();
      await http.signOut();
      window.location.href = '/';
    } catch (_err: unknown) {
      /* empty */
    }
    signOutFunc();
  }, [signOutFunc]);

  const accountComponents = useMemo(() => {
    if (account) {
      return (
        <DropdownMenu key="account">
          <DropdownMenuTrigger asChild>
            <div>
              <Button variant="outline" className="hidden md:block">
                {account.username}
              </Button>
              <Button variant="ghost" className="block font-bold md:hidden">
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
      );
    } else {
      return (
        <Link to="/login" key="account">
          <Button variant="link" className="p-0">
            Login
          </Button>
        </Link>
      );
    }
  }, [account]);

  const navBarContent = useMemo(
    () => [
      accountComponents,
      <React.Fragment key="posts">
        {(account?.roles.includes('Admin') ||
          account?.roles.includes('Staff') ||
          account?.roles.includes('Uploader')) && (
          <Link to="/posts">
            <Button variant="link">Posts</Button>
          </Link>
        )}
      </React.Fragment>,
      <React.Fragment key="users">
        {(account?.roles.includes('Admin') || account?.roles.includes('Staff')) && (
          <Link to="/users">
            <Button variant="link">Users</Button>
          </Link>
        )}
      </React.Fragment>,
      <DropdownMenu key="articles">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="link">Articles</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>{articles}</DropdownMenuContent>
        </DropdownMenu>
      </DropdownMenu>,
    ],
    [account?.roles, accountComponents, articles],
  );

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
                <div className="mt-4 flex w-fit flex-col">{navBarContent}</div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="items-ce ml-auto hidden gap-2 md:flex">
            {navBarContent.slice().reverse()}
          </div>
        </div>
        <div>
          <Outlet />
        </div>
      </div>
    </>
  );
}
