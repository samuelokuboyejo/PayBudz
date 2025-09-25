export type WalletTopupNotificationParams = {
  userEmail: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  txId: string;
  occurredAt: Date;
};

export type WalletCreditNotificationParams = {
  userEmail: string;
  recipientName: string;
  senderUsername: string;
  creditAmount: number;
  currency: string;
  updatedBalance: number;
  transactionId: string;
  occurredAt: Date;
};

export type WalletDebitNotificationParams = {
  userEmail: string;
  recipientName: string;
  beneficiaryUsername: string;
  debitAmount: number;
  currency: string;
  updatedBalance: number;
  transactionId: string;
  occurredAt: Date;
};

export type WalletCashoutNotificationParams = {
  userEmail: string;
  amount: number;
  currency: string;
  balanceAfter: number;
  txId: string;
  occurredAt: string;
};
