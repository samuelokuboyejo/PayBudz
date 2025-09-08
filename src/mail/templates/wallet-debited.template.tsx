import * as React from 'react';

import { MailTemplate } from './types';
import {
  Html,
  Head,
  Body,
  Container,
  Heading,
  Hr,
  Tailwind,
  Section,
  Text,
  Link,
  Preview,
} from '@react-email/components';

export interface WalletDebitedTemplateTemplateData {
  recipientName: string;
  beneficiaryUsername: string;
  debitAmount: string;
  currency: string;
  updatedBalance: string;
  transactionId: string;
  formattedDateTime: string;
}

export const WalletDebitedTemplate: MailTemplate<WalletDebitedTemplateTemplateData> =
  {
    subject: '📤 Wallet Debited',
    render: ({
      recipientName,
      beneficiaryUsername,
      debitAmount,
      updatedBalance,
      transactionId,
      formattedDateTime,
    }) => (
      <Html lang="en" dir="ltr">
        <Tailwind>
          <Head />
          <Preview>Your wallet has been debited {debitAmount}</Preview>
          <Body className="bg-gray-100 font-sans py-[40px]">
            <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
              {/* Header */}
              <Section className="text-center mb-[32px]">
                <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[16px]">
                  💸 Wallet Debited!
                </Heading>
                <Text className="text-[16px] text-gray-600 m-0">
                  Hi {recipientName}, this is to notify you that a transaction
                  has been processed from your wallet.
                </Text>
              </Section>

              {/* Debit Details Section */}
              <Section className="mb-[32px]">
                <Heading className="text-[20px] font-bold text-gray-900 mb-[20px] m-0">
                  Debit Details
                </Heading>

                <div className="bg-gray-50 rounded-[8px] p-[24px] border border-gray-200">
                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Recipient
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-900 m-0">
                      @{beneficiaryUsername}
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Transaction Type
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-900 m-0">
                      Wallet Debit
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Debit Amount
                    </Text>
                    <Text className="text-[24px] font-bold text-red-600 m-0">
                      {debitAmount}
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Updated Wallet Balance
                    </Text>
                    <Text className="text-[18px] font-semibold text-gray-900 m-0">
                      {updatedBalance}
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Transaction ID
                    </Text>
                    <Text className="text-[14px] font-mono text-gray-800 m-0 break-all">
                      {transactionId}
                    </Text>
                  </div>

                  <div>
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Date & Time
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-900 m-0">
                      {formattedDateTime}
                    </Text>
                  </div>
                </div>
              </Section>

              {/* Body Text */}
              <Section className="mb-[32px]">
                <Text className="text-[16px] text-gray-700 leading-[24px] m-0">
                  The funds have been successfully deducted from your wallet and
                  transferred to the recipient. Your updated wallet balance
                  reflects this transaction and is available for viewing in your
                  account dashboard.
                </Text>
              </Section>

              {/* Tip Box */}
              <Section className="mb-[32px]">
                <div className="bg-red-50 border border-red-200 rounded-[8px] p-[20px]">
                  <Text className="text-[14px] text-red-800 font-semibold m-0 mb-[8px]">
                    💡 Quick Tip
                  </Text>
                  <Text className="text-[14px] text-red-700 m-0">
                    Keep track of your spending and ensure you maintain a
                    sufficient balance for future transactions. You can monitor
                    all your wallet activities and set up balance alerts in your
                    account settings.
                  </Text>
                </div>
              </Section>

              <Hr className="border-gray-200 my-[32px]" />

              {/* Footer */}
              <Section>
                <Text className="text-[14px] text-gray-600 m-0 mb-[16px]">
                  Need help? Contact our support team at{' '}
                  <Link
                    href="mailto:support@company.com"
                    className="text-blue-600 underline"
                  >
                    support@company.com
                  </Link>{' '}
                  or visit our help center.
                </Text>

                <Text className="text-[12px] text-gray-500 m-0 mb-[8px]">
                  © {new Date().getFullYear()} Pay Budz. All rights reserved.{' '}
                </Text>

                <Text className="text-[12px] text-gray-500 m-0">
                  123 Business Street, Suite 100
                  <br />
                  Lagos, Nigeria
                </Text>

                <Text className="text-[12px] text-gray-500 m-0 mt-[16px]">
                  <Link href="#" className="text-gray-500 underline">
                    Unsubscribe
                  </Link>{' '}
                  |{' '}
                  <Link href="#" className="text-gray-500 underline">
                    Privacy Policy
                  </Link>{' '}
                  |{' '}
                  <Link href="#" className="text-gray-500 underline">
                    Terms of Service
                  </Link>
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    ),
  };
