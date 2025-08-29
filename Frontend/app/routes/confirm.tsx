import { cn } from '~/lib/utils';
import type { Route } from './+types/confirm';
import { Card, CardContent } from '~/components/ui/card';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '~/components/ui/form';
import Http from '~/lib/http';
import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { useNavigate, Link } from 'react-router';

export async function clientLoader(_: Route.ClientLoaderArgs) {
  return {};
}

const formSchema = z.object({
  confirm: z.boolean().refine((v) => v),
});

export default function Confirm() {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      confirm: false,
    },
  });

  async function onSubmit() {
    const http = new Http();
    try {
      await http.confirmUser();
    } catch (e: unknown) {
      console.log('Got error when trying to confirm account:', e);
    }
    navigate('/');
  }

  return (
    <>
      <div className={cn('flex h-screen w-full items-center justify-center bg-background')}>
        <Card>
          <CardContent className={cn('my-4')}>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirm"
                  render={() => {
                    return (
                      <>
                        <FormLabel>Privacy Policy and Terms Of Service</FormLabel>
                        <FormField
                          control={form.control}
                          name="confirm"
                          render={({ field }) => {
                            return (
                              <>
                                <FormItem
                                  className={cn('flex flex-row items-center gap-2 space-y-0')}
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={(c) => field.onChange(c)}
                                    />
                                  </FormControl>
                                  <FormLabel className="text-sm font-normal">
                                    You have read and agreed to our{' '}
                                    <Button variant="link" className={cn('p-0 text-sm')}>
                                      <Link to="/articles/privacyPolicy">Privacy Policy</Link>
                                    </Button>{' '}
                                    and{' '}
                                    <Button variant="link" className={cn('p-0 text-sm')}>
                                      <Link to="/articles/termsOfService">Terms Of Service</Link>
                                    </Button>
                                  </FormLabel>
                                </FormItem>
                              </>
                            );
                          }}
                        />
                      </>
                    );
                  }}
                />
                <Button type="submit">Confirm</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
