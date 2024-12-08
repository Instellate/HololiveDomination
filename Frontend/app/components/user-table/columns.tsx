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
import { Checkbox } from '../ui/checkbox';
import { useState } from 'react';
import Http, { type EditPost, type EditUser, type Post, type User } from '~/lib/http';
import type { CheckedState } from '@radix-ui/react-checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { DateFormatter } from '@internationalized/date';

type FormCheckboxProps = {
  checked?: CheckedState;
  onCheckedChange?: (checked: CheckedState) => void;
  children: JSX.Element[] | JSX.Element | string;
  id: string;
};

function FormCheckbox({ checked, onCheckedChange, children, id }: FormCheckboxProps) {
  return (
    <div className="flex items-center gap-2">
      <Checkbox id={id} checked={checked} onCheckedChange={onCheckedChange} />
      <label
        htmlFor={id}
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        {children}
      </label>
    </div>
  );
}

export const userColumns: ColumnDef<User>[] = [
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
              <div className="flex w-80 flex-col gap-2">
                <Input
                  placeholder="Role.."
                  value={editUser.role}
                  onChange={(e) =>
                    setEditUser((o) => {
                      return {
                        ...o,
                        role: e.target.value,
                      };
                    })
                  }
                />
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
                  checked={editUser.disallowChangingUsername}
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
                  checked={editUser.disallowCommenting}
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
                  checked={editUser.isBanned}
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
        <a href={post.url}>
          <Button variant="link" className="p-0">
            {post.id}
          </Button>
        </a>
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
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
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
