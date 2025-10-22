import { SupportedCurrencies } from 'src/enums/currency.enum';

export class UserProfileResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  isVerified: boolean;
  createdAt: Date;
  wallets?: Partial<Record<SupportedCurrencies, string>>;
}
