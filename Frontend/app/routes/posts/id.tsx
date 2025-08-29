import Http, { type Comment as CommentType } from '~/lib/http';
import type { Route } from './+types/id';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Button } from '~/components/ui/button';
import { Link } from 'react-router';
import { Textarea } from '~/components/ui/textarea';
import { cn } from '~/lib/utils';
import { useAccount } from '~/lib/account';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';
import { DateFormatter } from '@internationalized/date';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const id = params.id!;

  const http = new Http();

  const post = await http.getPost(id);
  const comments = await http.getComments(id);
  return {
    post,
    comments,
  };
}

function Comment({
  comment,
  onDelete,
  onEdit,
}: {
  comment: CommentType;
  onDelete?: () => void;
  onEdit?: (content: string) => void;
}) {
  const account = useAccount();
  const [editMode, setEditMode] = useState(false);
  const textarea = useRef<HTMLTextAreaElement>(null);

  const isStaff = useMemo(
    () => (account?.roles.includes('Admin') || account?.roles.includes('Staff')) ?? false,
    [account],
  );

  if (editMode) {
    return (
      <>
        <Card>
          <CardContent className="flex flex-col gap-4">
            <Textarea defaultValue={comment.content} ref={textarea} className="resize-none" />
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onEdit?.(textarea.current?.value ?? '');
                  setEditMode(false);
                }}
              >
                Submit
              </Button>
              <Button variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className={cn('text-base')}>{comment.author.name}</CardTitle>
        <CardDescription>
          {new DateFormatter(navigator.language, {
            dateStyle: 'long',
            timeStyle: 'short',
          }).format(new Date(comment.createdAt))}
        </CardDescription>
        {(isStaff || account?.id === comment.author.id) && (
          <CardAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <span className="sr-only">Open edit modal</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {account?.id === comment.author.id && (
                  <DropdownMenuItem onClick={() => setEditMode(true)}>Edit</DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDelete?.()}>Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardAction>
        )}
      </CardHeader>
      <CardContent>
        <span>{comment.content}</span>
      </CardContent>
    </Card>
  );
}

export default function Id({ loaderData }: Route.ComponentProps) {
  const account = useAccount();
  const [commentsData, setCommentsData] = useState(loaderData.comments);
  const textarea = useRef<HTMLTextAreaElement>(null);
  const tags = useMemo(
    () =>
      loaderData.post.tags.map((tag) => {
        return (
          <Link key={tag} to={`/?tags=${tag}`}>
            <Button className="rounded-full">{tag}</Button>
          </Link>
        );
      }),
    [loaderData.post.tags],
  );
  const [disableSubmit, setDisableSubmit] = useState(false);

  const createComment = useCallback(async () => {
    try {
      setDisableSubmit(true);
      await new Http().createComment(loaderData.post.id, textarea.current!.value);
    } finally {
      setDisableSubmit(false);
      textarea.current!.value = '';
    }
  }, [loaderData, textarea, setDisableSubmit]);

  const deleteComment = useCallback(
    async (commentId: string) => {
      const index = commentsData.findIndex((c) => c.id === commentId);
      commentsData.splice(index, 1);
      setCommentsData(commentsData);

      await new Http().deleteComment(commentId);
    },
    [setCommentsData, commentsData],
  );

  const editComment = useCallback(
    async (commentId: string, content: string) => {
      const index = commentsData.findIndex((c) => c.id === commentId);
      commentsData[index].content = content;
      setCommentsData(commentsData);

      await new Http().editComment(commentId, content);
    },
    [setCommentsData, commentsData],
  );

  const comments = useMemo(
    () =>
      commentsData.map((c) => (
        <Comment
          comment={c}
          key={c.id}
          onDelete={() => deleteComment(c.id)}
          onEdit={(co) => editComment(c.id, co)}
        />
      )),
    [commentsData],
  );

  // TODO: Add pagination
  return (
    <div className="m-8 flex flex-col gap-6 lg:flex-row">
      <div className="flex h-min w-56 flex-col gap-2">
        <h2 className="text-lg font-semibold">Tags:</h2>
        <div className="flex flex-wrap gap-2">{tags}</div>
        <span className="truncate overflow-hidden">
          Source:{' '}
          <a href={loaderData.post.url} className="text-blue-400 hover:underline">
            {loaderData.post.url}
          </a>
        </span>
      </div>
      <div className="flex max-w-[44.25rem] flex-1 flex-col gap-6">
        <div className="border-border flex w-fit items-center justify-center rounded-sm border p-6">
          <img className="w-full" src={`/api/posts/${loaderData.post.id}/image`} />
        </div>
        <div className={cn('flex w-96 flex-col gap-4 text-wrap')}>
          <h2 className={cn('text-lg font-bold')}>Comments</h2>
          {account && (
            <>
              <Textarea ref={textarea} placeholder="Comment..." className={cn('resize-none')} />
              <Button
                disabled={disableSubmit}
                className={cn('w-fit')}
                variant="default"
                onClick={createComment}
              >
                Submit
              </Button>
            </>
          )}
          {comments}
        </div>
      </div>
    </div>
  );
}
