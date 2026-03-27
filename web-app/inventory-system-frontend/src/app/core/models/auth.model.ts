export interface LoginRequest {
    email: string;
    password: string;
}

// export interface LoginResponse {
//     accessToken: string;
//     user: AuthUser;
// }

export interface AuthUser {
    id: string;
    email: string;
    name: string;
    role: "MANAGER" | 'WORKER';
}

export type LoginResponse = AuthUser;