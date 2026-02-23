// ========================================
// DTOs: Auth
// ========================================

export interface RegisterDTO {
  email: string;
  password: string;
  displayName: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    displayName: string;
  };
}
