// src/app/models/google-user.model.ts

export interface GoogleCredentialResponse {
  credential?: string; // Este es el ID Token JWT
  select_by?: string;
}

export interface GooglePayload {
  iss?: string; // Issuer (e.g., "accounts.google.com")
  nbf?: number; // Not Before
  aud?: string; // Audience (your Google Client ID)
  sub?: string; // Subject (Google User ID - unique identifier for the user)
  hd?: string; // Hosted Domain (e.g., "example.com")
  email?: string;
  email_verified?: boolean;
  azp?: string; // Authorized Party
  name?: string;
  picture?: string; // URL of the user's profile picture
  given_name?: string; // First name
  family_name?: string; // Last name
  iat?: number; // Issued At
  exp?: number; // Expiration time
  jti?: string; // JWT ID
}

// Puedes crear una interfaz para el usuario que guardas de Google, si es diferente a tu User tradicional
export interface GoogleUser {
  id_google?: string; // El 'sub' de Google
  email?: string;
  name?: string;
  picture?: string;
  google_token: string; // El token JWT completo de Google
  // Puedes añadir más campos si los necesitas del payload de Google
}