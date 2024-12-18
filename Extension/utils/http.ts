export type User = {
  id: string;
  username: string;
  email: string;
  roles: string[];
};

export type EditUser = {
  role: string;
  removeUsername: boolean;
  disallowChangingUsername: boolean;
  disallowCommenting: boolean;
  isBanned: boolean;
};

export type GetUsers = {
  users: User[];
  pageCount: number;
};

export type Post = {
  id: string;
  author: string;
  tags: string[];
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

let apiUrl: string | undefined;
export async function getApiUrl(): Promise<string | undefined> {
  if (apiUrl) {
    return apiUrl;
  } else {
    const storage = await browser.storage.sync.get();
    apiUrl = storage['api-url'];
    return apiUrl;
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
    const response = await fetch((await getApiUrl()) + url, {
      body: body !== undefined ? JSON.stringify(body) : undefined,
      method: method,
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
    return await this.baseRequest<User>(`/api/users/${userId}`, 'GET');
  }

  public async getPosts(tags: string | undefined, page: number = 0) {
    const searchParams = new URLSearchParams();
    searchParams.set('page', String(page));
    searchParams.set('tags', tags ?? '');

    return await this.baseRequest<GetPosts>(`/api/posts?${searchParams.toString()}`, 'GET');
  }

  public async getPost(postId: number) {
    return await this.baseRequest<Post>(`/api/posts/${postId}`, 'GET');
  }

  public async editPost(postId: string, body: Partial<EditPost>) {
    return await this.baseRequest(`/api/posts/${postId}`, 'PATCH', body);
  }

  public async getProviders() {
    return await this.baseRequest<string[]>('/api/authentication/providers', 'GET');
  }
}
