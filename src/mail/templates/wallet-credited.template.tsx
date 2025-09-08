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
export interface WalletCreditedTemplateData {
  recipientName: string;
  senderUsername: string;
  creditAmount: string;
  currency: string;
  updatedBalance: string;
  transactionId: string;
  formattedDateTime: string;
}

export const WalletCreditedTemplate: MailTemplate<WalletCreditedTemplateData> =
  {
    subject: 'Wallet Credited Successfully',
    render: ({
      recipientName,
      senderUsername,
      creditAmount,
      updatedBalance,
      transactionId,
      formattedDateTime,
    }) => (
      <Html lang="en" dir="ltr">
        <Tailwind>
          <Head />
          <Preview>Your wallet has been credited with {creditAmount}!</Preview>
          <Body className="bg-gray-100 font-sans py-[40px]">
            <Container className="bg-white rounded-[8px] shadow-sm max-w-[600px] mx-auto p-[40px]">
              {/* Header */}
              <Section className="text-center mb-[32px]">
                <Heading className="text-[28px] font-bold text-gray-900 m-0 mb-[16px]">
                  💰 Wallet Credited!
                </Heading>
                <Text className="text-[16px] text-gray-600 m-0">
                  Hi {recipientName}, great news! Your wallet has been credited.
                </Text>
              </Section>

              {/* Credit Details Section */}
              <Section className="mb-[32px]">
                <Heading className="text-[20px] font-bold text-gray-900 mb-[20px] m-0">
                  Credit Details
                </Heading>

                <div className="bg-gray-50 rounded-[8px] p-[24px] border border-gray-200">
                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Sender
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-900 m-0">
                      @{senderUsername}
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Transaction Type
                    </Text>
                    <Text className="text-[16px] font-semibold text-gray-900 m-0">
                      Wallet Credit
                    </Text>
                  </div>

                  <div className="mb-[16px]">
                    <Text className="text-[14px] text-gray-600 m-0 mb-[4px]">
                      Credit Amount
                    </Text>
                    <Text className="text-[24px] font-bold text-green-600 m-0">
                      {creditAmount}
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
                  The funds have been successfully added to your wallet and are
                  now available for use. You can start using your updated
                  balance immediately for any transactions or purchases.
                </Text>
              </Section>

              {/* Tip Box */}
              <Section className="mb-[32px]">
                <div className="bg-blue-50 border border-blue-200 rounded-[8px] p-[20px]">
                  <Text className="text-[14px] text-blue-800 font-semibold m-0 mb-[8px]">
                    💡 Quick Tip
                  </Text>
                  <Text className="text-[14px] text-blue-700 m-0">
                    Want to keep track of all your transactions? Check your
                    transaction history in your account dashboard to view
                    detailed records of all your wallet activities.
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
