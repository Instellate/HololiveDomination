import Http from '~/lib/http';
import type { Route } from './+types/id';
import { useMemo } from 'react';
import { Button } from '~/components/ui/button';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id!;
  return await new Http().getPost(id);
}

export default function Id({ loaderData }: Route.ComponentProps) {
  const tags = useMemo(
    () =>
      loaderData.tags.map((tag) => {
        return (
          <Button className="rounded-full" key={tag}>
            {tag}
          </Button>
        );
      }),
    [loaderData.tags],
  );

  return (
    <div className="m-8 flex flex-col lg:flex-row gap-6">
      <div className="flex h-min w-56 flex-col gap-2">
        <h2 className="text-lg font-semibold">Tags:</h2>
        <div className="flex flex-wrap gap-2">{tags}</div>
        <span className="overflow-hidden truncate">
          Source:{' '}
          <a href={loaderData.url} className="text-blue-400 hover:underline">
            {loaderData.url}
          </a>
        </span>
      </div>
      <div className="flex-1 max-w-[44.25rem]">
        <div className="flex w-fit items-center justify-center rounded-sm border border-border p-6">
          <img
            className="w-full"
            src={`/api/posts/${loaderData.id}/image`}
          />
        </div>
      </div>
    </div>
  );
}
