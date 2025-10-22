interface UserTransactionSummary {
  userId: string;
  walletIds: string[];
  email: string;
  totalDebit: number;
  totalCredit: number;
}
