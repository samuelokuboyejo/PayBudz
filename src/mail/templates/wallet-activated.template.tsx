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

export interface WalletActivatedTemplateData {
  firstName: string;
}

export const WalletActivatedTemplate: MailTemplate<WalletActivatedTemplateData> =
  {
    subject: 'Your Wallet is Now Active!',
    render: ({ firstName }) => (
      <Html lang="en" dir="ltr">
        <Tailwind>
          <Head />
          <Body className="bg-gray-100 font-sans py-[40px]">
            <Container className="bg-white max-w-[600px] mx-auto rounded-[8px] shadow-sm">
              {/* Header */}
              <Section className="bg-[#27ae60] text-white text-center py-[32px] px-[24px] rounded-t-[8px]">
                <Heading className="text-[28px] font-bold m-0 leading-[1.2]">
                  🎉 Wallet Activated!
                </Heading>
              </Section>

              {/* Main Content */}
              <Section className="px-[24px] py-[32px]">
                <Text className="text-[24px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                  Hi {firstName},
                </Text>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                  Your wallet has been successfully activated! You can now start
                  sending and receiving funds seamlessly.
                </Text>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                  Keep your wallet secure and explore all the features available
                  to manage your finances effortlessly.
                </Text>

                {/* Highlight Box */}
                <Section className="bg-[#f8f9fa] border border-[#ddd] border-solid rounded-[8px] p-[24px] mb-[24px]">
                  <Heading className="text-[20px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                    Next Steps
                  </Heading>

                  <Text className="text-[16px] text-[#555] leading-[1.6] mb-[16px] mt-0">
                    Here’s what you can do next:
                  </Text>

                  <ul className="text-[14px] text-[#555] leading-[1.6] m-0 pl-[20px]">
                    <li className="mb-[8px]">Add funds to your wallet</li>
                    <li className="mb-[8px]">Make your first transaction</li>
                    <li className="mb-[8px]">
                      Set up notifications for your account
                    </li>
                    <li className="mb-0">Explore wallet features and offers</li>
                  </ul>
                </Section>

                <Section className="bg-[#d4edda] border border-[#c3e6cb] border-solid rounded-[8px] p-[16px] mb-[24px]">
                  <Text className="text-[14px] text-[#155724] m-0 leading-[1.5]">
                    <strong>💡 Tip:</strong> Always keep your wallet credentials
                    secure and check your transaction history regularly for
                    accuracy.
                  </Text>
                </Section>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[0] mt-0">
                  Welcome to a smoother financial experience, {firstName}! Enjoy
                  using your new wallet.
                </Text>
              </Section>

              {/* Footer */}
              <Hr className="border-[#ddd] border-solid my-[24px]" />

              <Section className="px-[24px] pb-[32px]">
                <Text className="text-[12px] text-[#888] text-center leading-[1.5] m-0">
                  Need help? Contact our support team, we're always happy to
                  assist!
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
