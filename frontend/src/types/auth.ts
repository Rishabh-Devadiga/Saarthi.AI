import type { ApiSuccessResponse } from "@/types/api";

export type AuthUser = {
  id: number;
  name: string;
  email: string | null;
  created_at: string;
};

export type AuthPayload = {
  user: AuthUser;
  token: string;
  expires_at: string;
};

export type SignUpRequest = {
  name: string;
  email: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type AuthApiResponse = ApiSuccessResponse<AuthPayload>;
export type MeApiResponse = ApiSuccessResponse<AuthUser>;
export type SignOutApiResponse = ApiSuccessResponse<Record<string, never>>;
