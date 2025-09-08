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

export interface WalletCashoutTemplateData {
  amount: string;
  currency: string;
  balanceAfter: string;
  txId: string;
  occurredAt: string;
}

export const WalletCashoutTemplate: MailTemplate<WalletCashoutTemplateData> = {
  subject: '✅ Cashout Processed',
  render: ({ currency, amount, balanceAfter, txId, occurredAt }) => (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white max-w-[600px] mx-auto rounded-[8px] shadow-sm">
            {/* Header */}
            <Section className="bg-[#2c3e50] text-white text-center py-[32px] px-[24px] rounded-t-[8px]">
              <Heading className="text-[28px] font-bold m-0 leading-[1.2]">
                ✅ Cashout Processed
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-[24px] py-[32px]">
              <Text className="text-[18px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                Your wallet cashout has been successfully processed.
              </Text>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                We're writing to confirm that your cashout request has been
                completed successfully. The funds have been withdrawn from your
                wallet and are being processed for transfer to your designated
                account.
              </Text>

              {/* Transaction Details */}
              <Section className="bg-[#f8f9fa] border border-[#ddd] border-solid rounded-[8px] p-[24px] mb-[24px]">
                <Heading className="text-[20px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                  Cashout Details
                </Heading>

                <div className="space-y-[12px]">
                  <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                    <Text className="text-[14px] text-[#666] font-medium m-0">
                      {' '}
                      Transaction Type:{' '}
                    </Text>
                    <Text className="text-[14px] text-[#2c3e50] font-semibold m-0">
                      {' '}
                      Wallet Cashout{' '}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                    <Text className="text-[14px] text-[#666] font-medium m-0">
                      {' '}
                      Cashout Amount:{' '}
                    </Text>
                    <Text className="text-[16px] text-[#e74c3c] font-bold m-0">
                      -{currency} {amount}
                    </Text>
                  </div>

                  {balanceAfter !== undefined && (
                    <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                      <Text className="text-[14px] text-[#666] font-medium m-0">
                        {' '}
                        Remaining Wallet Balance:{' '}
                      </Text>
                      <Text className="text-[14px] text-[#2c3e50] font-semibold m-0">
                        {currency} {balanceAfter}
                      </Text>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-[8px] border-b border-[#eee] border-solid">
                    <Text className="text-[14px] text-[#666] font-medium m-0">
                      {' '}
                      Transaction ID:{' '}
                    </Text>
                    <Text className="text-[12px] text-[#666] font-mono m-0 break-all">
                      {' '}
                      {txId}{' '}
                    </Text>
                  </div>

                  <div className="flex justify-between items-center py-[8px]">
                    <Text className="text-[14px] text-[#666] font-medium m-0">
                      {' '}
                      Date & Time:{' '}
                    </Text>
                    <Text className="text-[14px] text-[#2c3e50] m-0">
                      {' '}
                      {occurredAt}{' '}
                    </Text>
                  </div>
                </div>
              </Section>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                The cashout is now being processed and funds will be transferred
                to your linked account within 1 - 3 business days.You will
                receive a separate notification once the transfer is complete.
              </Text>

              <Section className="bg-[#fff3cd] border border-[#f0ad4e] border-solid rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[14px] text-[#856404] m-0 leading-[1.5]">
                  <strong>⏰ Processing Time: </strong> Bank transfers typically
                  take 1-3 business days to complete. The exact timing depends
                  on your bank's processing schedule and may be delayed on
                  weekends or holidays.
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Hr className="border-[#ddd] border-solid my-[24px]" />

            <Section className="px-[24px] pb-[32px]">
              <Text className="text-[12px] text-[#888] text-center leading-[1.5] m-0">
                If you have any questions about this cashout or need to track
                the transfer status, please contact our support team.
                <br />
                This is an automated confirmation, please do not reply to this
                email.
              </Text>

              <Text className="text-[12px] text-[#888] text-center mt-[16px] m-0">
                © {new Date().getFullYear()} Pay Budz.All rights reserved.
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
