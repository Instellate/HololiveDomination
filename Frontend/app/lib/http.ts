export type User = {
  id: string;
  username: string;
  email: string;
  roles: string[];
};

/** The difference between StaffUser and User is StaffUser contains information only staff should know */
export interface StaffUser extends User {
  canChangeUsername: boolean;
  canComment: boolean;
  isBanned: boolean;
}

export type EditUser = {
  role: string;
  removeUsername: boolean;
  disallowChangingUsername: boolean;
  disallowCommenting: boolean;
  isBanned: boolean;
};

export type GetUsers = {
  users: StaffUser[];
  pageCount: number;
};

export type Post = {
  id: string;
  author: string;
  tags: string[];
  isLewd: boolean;
  url: string;
  createdAt: number;
};

export type GetPosts = {
  posts: Post[];
  pageCount: number;
};

export type EditPost = {
  tags: string;
  author: string;
  isLewd: boolean;
};

type HttpMethods = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export class HttpError {
  error: number;
  extraData?: unknown;

  constructor(error: number, extraData: unknown = undefined) {
    this.error = error;
    this.extraData = extraData;
  }
}

export default class Http {
  private async baseRequest(url: string, method: HttpMethods): Promise<void>;

  private async baseRequest<T>(url: string, method: HttpMethods, body?: unknown): Promise<T>;

  private async baseRequest<T>(
    url: string,
    method: HttpMethods,
    body?: unknown,
  ): Promise<T | void> {
    const response = await fetch(url, {
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new HttpError(response.status);
    }

    if (response.status !== 204) {
      return await response.json();
    } else {
      return;
    }
  }

  public async confirmUser(): Promise<void> {
    return this.baseRequest('/api/authentication/confirm', 'POST');
  }

  public signOut() {
    return this.baseRequest('/api/authentication/signout', 'DELETE');
  }

  public editUser(userId: string, body: Partial<EditUser>): Promise<User> {
    return this.baseRequest<User>(`/api/users/${userId}`, 'PATCH', body);
  }

  public getCurrentUser() {
    return this.baseRequest<User>('/api/users/current', 'GET');
  }

  public getUsers(search: string | undefined, page: number = 0) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    searchParams.set('search', search ?? '');

    return this.baseRequest<GetUsers>(`/api/users?${searchParams.toString()}`, 'GET');
  }

  public getUser(userId: string) {
    return this.baseRequest<StaffUser>(`/api/users/${userId}`, 'GET');
  }

  public getPosts(tags: string | undefined, page: number = 0, keepLewd: boolean = true) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('tags', tags ?? '');
    searchParams.set('keepLewd', String(keepLewd));

    return this.baseRequest<GetPosts>(`/api/posts?${searchParams.toString()}`, 'GET');
  }

  public getPost(postId: string) {
    return this.baseRequest<Post>(`/api/posts/${postId}`, 'GET');
  }

  public editPost(postId: string, body: Partial<EditPost>) {
    return this.baseRequest(`/api/posts/${postId}`, 'PATCH', body);
  }

  public deletePost(postId: string) {
    return this.baseRequest(`/api/posts/${postId}`, 'DELETE');
  }

  public getProviders() {
    return this.baseRequest<string[]>('/api/authentication/providers', 'GET');
  }

  public searchTags(query: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('query', query);

    return this.baseRequest<string[]>(`/api/posts/tags?${searchParams.toString()}`, 'GET');
  }
}
