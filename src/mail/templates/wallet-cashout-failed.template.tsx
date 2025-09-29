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
} from '@react-email/components';

export interface WalletCashoutFailedTemplateData {
  amount: string;
  currency: string;
  balanceAfter: string;
  txId: string;
  occurredAt: string;
  reason?: string;
}

export const WalletCashoutFailedTemplate: MailTemplate<WalletCashoutFailedTemplateData> =
  {
    subject: '❌ Cashout Failed',
    render: ({ currency, amount, balanceAfter, txId, occurredAt, reason }) => (
      <Html lang="en" dir="ltr">
        <Tailwind>
          <Head />
          <Body className="bg-gray-100 font-sans py-[40px]">
            <Container className="bg-white max-w-[600px] mx-auto rounded-[8px] shadow-sm">
              {/* Header */}
              <Section className="bg-[#c0392b] text-white text-center py-[32px] px-[24px] rounded-t-[8px]">
                <Heading className="text-[28px] font-bold m-0 leading-[1.2]">
                  ❌ Cashout Failed
                </Heading>
              </Section>

              {/* Main Content */}
              <Section className="px-[24px] py-[32px]">
                <Text className="text-[18px] text-[#c0392b] font-semibold mb-[16px] mt-0">
                  Your wallet cashout could not be processed.
                </Text>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                  Unfortunately, we were unable to complete your cashout
                  request.
                  {reason && ` Reason: ${reason}`}
                  The amount remains in your wallet.
                </Text>

                {/* Transaction Details */}
                <Section className="bg-[#f8f9fa] border border-[#ddd] border-solid rounded-[8px] p-[24px] mb-[24px]">
                  <Heading className="text-[20px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                    Cashout Details
                  </Heading>

                  <div className="space-y-[12px]">
                    <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        Transaction Type:
                      </Text>
                      <Text className="text-[14px] text-[#2c3e50] font-semibold m-0">
                        Wallet Cashout
                      </Text>
                    </div>

                    <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        Cashout Amount:
                      </Text>
                      <Text className="text-[16px] text-[#e74c3c] font-bold m-0">
                        -{currency} {amount}
                      </Text>
                    </div>

                    <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        Remaining Wallet Balance:
                      </Text>
                      <Text className="text-[14px] text-[#2c3e50] font-semibold m-0">
                        {currency} {balanceAfter}
                      </Text>
                    </div>

                    <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        Transaction ID:
                      </Text>
                      <Text className="text-[12px] text-[#666] font-mono m-0 break-all">
                        {txId}
                      </Text>
                    </div>

                    <div className="flex justify-between items-center py-[8px]">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        Date & Time:
                      </Text>
                      <Text className="text-[14px] text-[#2c3e50] m-0">
                        {occurredAt}
                      </Text>
                    </div>
                  </div>
                </Section>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                  Please try again or contact our support team if the issue
                  persists.
                </Text>
              </Section>

              {/* Footer */}
              <Hr className="border-[#ddd] border-solid my-[24px]" />
              <Section className="px-[24px] pb-[32px]">
                <Text className="text-[12px] text-[#888] text-center leading-[1.5] m-0">
                  This is an automated notification. Do not reply to this email.
                </Text>

                <Text className="text-[12px] text-[#888] text-center mt-[16px] m-0">
                  © {new Date().getFullYear()} Pay Budz. All rights reserved.
                  <br />
                  Lagos, Nigeria
                </Text>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    ),
  };
