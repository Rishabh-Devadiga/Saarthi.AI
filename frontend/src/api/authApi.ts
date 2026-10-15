import { apiClient } from "@/api/apiClient";
import type {
  AuthApiResponse,
  MeApiResponse,
  SignInRequest,
  SignOutApiResponse,
  SignUpRequest,
} from "@/types/auth";

export async function signUp(payload: SignUpRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>("/auth/signup", payload);
  return response.data;
}

export async function signIn(payload: SignInRequest): Promise<AuthApiResponse> {
  const response = await apiClient.post<AuthApiResponse>("/auth/signin", payload);
  return response.data;
}

export async function signOut(): Promise<SignOutApiResponse> {
  const response = await apiClient.post<SignOutApiResponse>("/auth/signout");
  return response.data;
}

export async function getCurrentUser(): Promise<MeApiResponse> {
  const response = await apiClient.get<MeApiResponse>("/auth/me");
  return response.data;
}
