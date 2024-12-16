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
    const response = await fetch(import.meta.env.VITE_DOMINATION_API_URL + url, {
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

  public async editUser(userId: string, body: Partial<EditUser>): Promise<User> {
    return await this.baseRequest<User>(`/api/users/${userId}`, 'PATCH', body);
  }

  public async signOut() {
    return await this.baseRequest('/api/authentication/signout', 'DELETE');
  }

  public async getCurrentUser() {
    return await this.baseRequest<User>('/api/users/current', 'GET');
  }

  public async getUsers(search: string | undefined, page: number = 0) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', page.toString());
    searchParams.set('search', search ?? '');

    return await this.baseRequest<GetUsers>(`/api/users?${searchParams.toString()}`, 'GET');
  }

  public async getUser(userId: string) {
    return await this.baseRequest<StaffUser>(`/api/users/${userId}`, 'GET');
  }

  public async getPosts(tags: string | undefined, page: number = 0, keepLewd: boolean = true) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('tags', tags ?? '');
    searchParams.set('keepLewd', String(keepLewd));

    return await this.baseRequest<GetPosts>(`/api/posts?${searchParams.toString()}`, 'GET');
  }

  public async getPost(postId: string) {
    return await this.baseRequest<Post>(`/api/posts/${postId}`, 'GET');
  }

  public async editPost(postId: string, body: Partial<EditPost>) {
    return await this.baseRequest(`/api/posts/${postId}`, 'PATCH', body);
  }

  public async deletePost(postId: string) {
    return await this.baseRequest(`/api/posts/${postId}`, 'DELETE');
  }

  public async getProviders() {
    return await this.baseRequest<string[]>('/api/authentication/providers', 'GET');
  }

  public async searchTags(query: string) {
    const searchParams = new URLSearchParams();
    searchParams.set('query', query);

    return await this.baseRequest<string[]>(`/api/posts/tags?${searchParams.toString()}`, 'GET');
  }
}
