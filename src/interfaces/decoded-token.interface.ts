export interface DecodedToken {
  firebase?: {
    sign_in_provider?: string;
  };
  uid: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}
