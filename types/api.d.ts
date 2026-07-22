export type MetaPagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type LegacyMetaPagination = {
  currentPage: number;
  perPage: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type QueryParams = {
  page?: number;
  limit?: number;
  search?: string;
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginatedResponse<T, TMeta = MetaPagination> = {
  data: T[];
  meta: TMeta;
};

export type ValidationErrorResponse<TField extends PropertyKey> = {
  message: string;
  errors?: Partial<Record<TField, string[]>>;
};

export type DeleteResponse = {
  message: string;
};

export type DeleteErrorResponse = {
  message: string;
  error?: string;
};

export type MutationVariables<TPayload, TLocator extends string> = {
  payload: TPayload;
} & Record<TLocator, string>;

export type RouteContext<TParams extends Record<string, string>> = {
  params: Promise<TParams>;
};
