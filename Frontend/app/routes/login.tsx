import { useAccount } from '~/lib/account';
import type { Route } from './+types/login';
import { Link, useNavigate } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card';
import { useMemo } from 'react';
import { Button } from '~/components/ui/button';
import { cn } from '~/lib/utils';
import Http from '~/lib/http';

export async function clientLoader(_: Route.ClientLoaderArgs) {
  const providers = await new Http().getProviders();
  return {
    providers,
  };
}

export default function SignIn({ loaderData }: Route.ComponentProps) {
  const navigate = useNavigate();
  const providers = useMemo(() => {
    const components = [];

    for (const provider of loaderData.providers) {
      const link =
        import.meta.env.VITE_DOMINATION_API_URL +
        '/api/authentication/challenge?' +
        new URLSearchParams({
          provider,
        }).toString();

      components.push(
        <>
          <Link to={link}>
            <Button variant="secondary">Login with {provider}</Button>
          </Link>
        </>,
      );
    }

    return components;
  }, [loaderData.providers]);

  const account = useAccount();

  if (account) {
    navigate('/');
    return <></>;
  }

  return (
    <>
      <div className={cn('flex h-screen w-full items-center justify-center bg-background')}>
        <Card>
          <CardHeader>
            <CardTitle>Login to {import.meta.env.VITE_SITE_TITLE}</CardTitle>
            <CardDescription>Choose the service you want to use to login</CardDescription>
          </CardHeader>
          <CardContent className={cn('flex flex-col gap-2')}>{providers}</CardContent>
        </Card>
      </div>
    </>
  );
}
