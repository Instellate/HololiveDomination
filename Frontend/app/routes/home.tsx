import Paginator from '~/components/paginator';
import { cn } from '~/lib/utils';
import { Link, useNavigate, useSearchParams } from 'react-router';
import type { Route } from './+types/home';
import { useCallback, useMemo, useState } from 'react';
import Http from '~/lib/http';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import debounce from 'lodash.debounce';
import { functionalUpdate, type Updater } from '@tanstack/react-table';
import FormCheckbox from '~/components/form-checkbox';

function getNoLewds(searchParams: URLSearchParams): boolean {
  const isLewdStr = searchParams.get('noLewds');
  if (!isLewdStr) {
    return true;
  }

  if (isLewdStr === 'false') {
    return false;
  } else {
    return true;
  }
}

export function meta() {
  return [{ title: 'Posts' }, { name: 'description', content: 'Hololive domination!' }];
}

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
  const searchParams = new URLSearchParams(new URL(request.url).search);
  const pageStr = searchParams.get('page');
  const pageOrNaN = Number(pageStr ?? '0');
  const page = Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;
  const noLewds = getNoLewds(searchParams);

  return await new Http().getPosts(searchParams.get('tags') ?? undefined, page, !noLewds);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  const posts = loaderData.posts;
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTags = (() => {
    const searchParams = new URLSearchParams(window.location.search);
    const tags = searchParams.get('tags');
    if (tags?.trim()) {
      return tags.trim().split(' ');
    } else {
      return [];
    }
  })();
  const [searchTags, setSearchTags] = useState<string[]>([]);
  const noLewds = Boolean(getNoLewds(searchParams));
  const [searchInput, setSearchInput] = useState<string>('');

  const postsData = useMemo(() => {
    return posts.map((p) => (
      <Link
        className="border-border flex items-center justify-center rounded-sm border p-6"
        to={`/posts/${p.id}`}
        key={p.id}
        onClick={(e) => {
          if (e.altKey) {
            if (e.ctrlKey || e.shiftKey) {
              window.open(p.url, e.ctrlKey ? 'mozillaTab' : '_blank')?.focus();
            } else {
              window.location.href = p.url;
            }

            e.preventDefault();
            e.stopPropagation();
          }
        }}
      >
        <img src={`/api/posts/${p.id}/image`} className="rounded-sm" />
      </Link>
    ));
  }, [posts]);

  const setSelectedTags = useCallback(
    (updater: Updater<string[]>) => {
      const value = functionalUpdate(updater, selectedTags);
      setSearchParams((o) => {
        o.set('tags', value.join(' '));
        return o;
      });
    },
    [selectedTags, setSearchParams],
  );

  const selectedTagsComponents = useMemo(() => {
    const components = [];

    for (const tag of selectedTags) {
      components.push(
        <Button
          className="rounded-full"
          key={tag}
          onClick={() =>
            setSelectedTags((o) => {
              const index = o.indexOf(tag);
              if (index >= 0) {
                o.splice(index, 1);
              }
              return [...o];
            })
          }
        >
          {tag}
        </Button>,
      );
    }

    for (const tag of searchTags) {
      components.push(
        <Button
          className="rounded-full"
          variant="secondary"
          key={tag}
          onClick={() => {
            setSelectedTags([...selectedTags, tag]);
            setSearchTags((o) => {
              const index = o.indexOf(tag);
              if (index >= 0) {
                o.splice(index, 1);
              }
              return [...o];
            });
            setSearchInput('');
          }}
        >
          {tag}
        </Button>,
      );
    }

    return components;
  }, [searchTags, selectedTags, setSelectedTags]);

  const debouncedSearch = useMemo(
    () =>
      debounce(async (query: string) => {
        if (query) {
          const http = new Http();
          const results = await http.searchTags(query);

          const filteredTags = results.filter((t) => !selectedTags.includes(t));
          setSearchTags(filteredTags);
        } else {
          setSearchTags([]);
        }
      }, 250),
    [selectedTags],
  );

  const page = (() => {
    const pageStr = searchParams.get('page');
    const pageOrNaN = Number(pageStr);
    return Number.isNaN(pageOrNaN) ? 0 : pageOrNaN;
  })();

  return (
    <>
      <div
        className={cn(
          '2xl:max-w[55%] flex flex-col items-center gap-4 pt-4 lg:m-auto lg:max-w-[70%]',
        )}
      >
        <h2 className="text-3xl font-bold">Posts</h2>
        <Input
          placeholder="Search for tags..."
          className="w-64"
          onChange={(e) => {
            setSearchInput(e.target.value);
            debouncedSearch(e.target.value);
          }}
          value={searchInput}
        />
        <FormCheckbox
          id="noLewds"
          checked={noLewds}
          onCheckedChange={(c) =>
            setSearchParams((s) => {
              s.set('noLewds', String(c));
              return s;
            })
          }
        >
          No lewds
        </FormCheckbox>
        <div className="flex flex-wrap justify-center gap-2">{selectedTagsComponents}</div>
        <Paginator
          currentPage={page + 1}
          totalPages={loaderData.pageCount}
          onPageChange={(pageNumber) =>
            setSearchParams((s) => {
              s.set('page', String(pageNumber - 1));
              return s;
            })
          }
          showPreviousNext
        />
        <div className="grid gap-6 p-4 md:grid-cols-2 xl:grid-cols-3">{postsData}</div>
        <Paginator
          currentPage={page + 1}
          totalPages={loaderData.pageCount}
          onPageChange={(pageNumber) => {
            setSearchParams((s) => {
              s.set('page', String(pageNumber - 1));
              return s;
            });
          }}
          showPreviousNext
        />
      </div>
    </>
  );
}
