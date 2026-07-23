export type AuthUser = {
  id: number;
  name: string;
  username: string;
  email: string;
};

export type LoginInput = {
  username: string;
  password: string;
  remember: boolean;
  next?: string;
};

export type LoginResponse = {
  message: string;
  data: {
    user: AuthUser;
    redirectTo: string;
  };
};
