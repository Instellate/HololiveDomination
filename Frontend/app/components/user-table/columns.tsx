import type { ColumnDef } from '@tanstack/react-table';
import {
  AlertDialog,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogDescription,
} from '../ui/alert-dialog';
import { Button, buttonVariants } from '../ui/button';
import { MoreHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { useState } from 'react';
import Http, { type EditPost, type EditUser, type Post, type StaffUser } from '~/lib/http';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DateFormatter } from '@internationalized/date';
import FormCheckbox from '../form-checkbox';
import { Tooltip, TooltipProvider } from '../ui/tooltip';
import { TooltipContent, TooltipTrigger } from '@radix-ui/react-tooltip';

export const userColumns: ColumnDef<StaffUser>[] = [
  {
    accessorKey: 'username',
    header: 'Username',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => {
      const roles: string[] = row.getValue('roles');
      if (roles.length) {
        return <div className="font-medium">{roles.join(', ')}</div>;
      } else {
        return <div className="font-medium">No roles assigned</div>;
      }
    },
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => {
      // This is should work
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [editUser, setEditUser] = useState<Partial<EditUser>>({});
      const user = row.original;

      const http = new Http();

      return (
        <>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <div className="flex justify-end">
                <Button variant="ghost">
                  <span className="sr-only">Open edit modal</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Edit user {user.username}</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="flex w-80 flex-col gap-4">
                <div>
                  <Input
                    placeholder="Role..."
                    value={editUser.role ?? user.roles}
                    onChange={(e) =>
                      setEditUser((o) => {
                        return {
                          ...o,
                          role: e.target.value,
                        };
                      })
                    }
                  />
                  <small className="opacity-50">Only enter one role if you edit this field</small>
                </div>
                <FormCheckbox
                  id="removeUsername"
                  checked={editUser.removeUsername}
                  onCheckedChange={(c) =>
                    setEditUser((o) => {
                      return {
                        ...o,
                        removeUsername: c as boolean,
                      };
                    })
                  }
                >
                  Remove Username
                </FormCheckbox>
                <FormCheckbox
                  id="disallowChangingUsername"
                  checked={editUser.disallowChangingUsername ?? !user.canChangeUsername}
                  onCheckedChange={(c) =>
                    setEditUser((o) => {
                      return {
                        ...o,
                        disallowChangingUsername: c as boolean,
                      };
                    })
                  }
                >
                  Disallow changing username
                </FormCheckbox>
                <FormCheckbox
                  id="disallowCommenting"
                  checked={editUser.disallowCommenting ?? !user.canComment}
                  onCheckedChange={(c) =>
                    setEditUser((o) => {
                      return {
                        ...o,
                        disallowCommenting: c as boolean,
                      };
                    })
                  }
                >
                  Disallow commenting
                </FormCheckbox>
                <FormCheckbox
                  id="isBanned"
                  checked={editUser.isBanned ?? user.isBanned}
                  onCheckedChange={(c) =>
                    setEditUser((o) => {
                      return {
                        ...o,
                        isBanned: c as boolean,
                      };
                    })
                  }
                >
                  Is banned
                </FormCheckbox>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => {
                    await http.editUser(user.id, editUser);
                    setEditUser({});
                  }}
                >
                  Save
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      );
    },
  },
];

export const postsColumns: ColumnDef<Post>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    cell: ({ row }) => {
      const post = row.original;
      return (
        <TooltipProvider delayDuration={200} disableHoverableContent>
          <Tooltip>
            <TooltipTrigger asChild>
              <a href={post.url}>
                <Button variant="link" className="select-text p-0">
                  {post.id}
                </Button>
              </a>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              <div className="w-64 rounded-sm border border-border bg-background p-4">
                <img className="rounded-sm" src={`/api/posts/${post.id}/image`} loading="lazy" />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: 'author',
    header: 'Author',
  },
  {
    accessorKey: 'tags',
    header: 'Tags',
    cell: ({ row }) => {
      const tags: string[] = row.getValue('tags');
      if (tags.length) {
        return <div className="font-medium">{tags.join(' ')}</div>;
      } else {
        return <div className="font-medium">No tags assigned</div>;
      }
    },
  },
  {
    accessorKey: 'createdAt',
    header: 'Created at',
    cell: ({ row }) => {
      const createdAt: number = row.getValue('createdAt');
      const df = new DateFormatter(navigator.language, {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      return <div className="font-medium">{df.format(new Date(createdAt))}</div>;
    },
  },
  {
    accessorKey: 'isLewd',
    header: 'Is lewd',
    cell: ({ row }) => {
      const isLewd = row.getValue('isLewd');

      return <div className="font-medium">{isLewd ? 'Yes' : 'No'}</div>;
    },
  },
  {
    accessorKey: 'actions',
    header: '',
    cell: ({ row }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [editPost, setEditPost] = useState<Partial<EditPost>>({});
      const post = row.original;

      return (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex justify-end">
                <Button variant="ghost">
                  <span className="sr-only">Open edit modal</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Edit</DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Edit post {post.id}</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="flex w-80 flex-col gap-4">
                    <Input
                      placeholder="Tags..."
                      value={editPost.tags ?? post.tags.join(' ')}
                      onChange={(e) =>
                        setEditPost((o) => {
                          return {
                            ...o,
                            tags: e.target.value,
                          };
                        })
                      }
                    />
                    <Input
                      placeholder="Author..."
                      value={editPost.author ?? post.author}
                      onChange={(e) =>
                        setEditPost((o) => {
                          return {
                            ...o,
                            author: e.target.value,
                          };
                        })
                      }
                    />
                    <FormCheckbox
                      id="isLewd"
                      checked={editPost.isLewd ?? post.isLewd}
                      onCheckedChange={(c) =>
                        setEditPost((o) => {
                          return {
                            ...o,
                            isLewd: c as boolean,
                          };
                        })
                      }
                    >
                      Is Lewd
                    </FormCheckbox>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setEditPost({})}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () => {
                        await new Http().editPost(post.id, editPost);
                        setEditPost({});
                      }}
                    >
                      Save
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Delete</DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete post {post.id}</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete post {post.id}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      type="button"
                      className={buttonVariants({ variant: 'destructive' })}
                      onClick={() => {
                        new Http().deletePost(post.id);
                      }}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
