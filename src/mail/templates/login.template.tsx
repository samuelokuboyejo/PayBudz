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

export interface LoginAlertTemplateData {
  firstName: string;
  loginTime: string;
  deviceInfo: string;
  location: string;
}

export const LoginAlertTemplate: MailTemplate<LoginAlertTemplateData> = {
  subject: '🔔 New Login Alert for Your Account',
  render: ({ firstName, loginTime, deviceInfo, location }) => (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white max-w-[600px] mx-auto rounded-[8px] shadow-sm">
            {/* Header */}
            <Section className="bg-[#e67e22] text-white text-center py-[32px] px-[24px] rounded-t-[8px]">
              <Heading className="text-[28px] font-bold m-0 leading-[1.2]">
                🔔 Login Alert
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-[24px] py-[32px]">
              <Text className="text-[24px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                Hello {firstName},
              </Text>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                We noticed a login to your account on Pay Budz. Please review
                the details below:
              </Text>

              {/* Login Details Box */}
              <Section className="bg-[#f8f9fa] border border-[#ddd] border-solid rounded-[8px] p-[24px] mb-[24px]">
                <Heading className="text-[20px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                  Login Details
                </Heading>

                <ul className="text-[16px] text-[#555] leading-[1.6] m-0 pl-[20px]">
                  <li className="mb-[8px]">
                    <strong>Date & Time:</strong> {loginTime}
                  </li>
                  <li className="mb-[8px]">
                    <strong>Device / Browser:</strong> {deviceInfo}
                  </li>
                  <li className="mb-[8px]">
                    <strong>Location:</strong> {location}
                  </li>
                </ul>
              </Section>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                If this was you, no further action is required. If you did NOT
                log in, please secure your account immediately by changing your
                password and reviewing recent activity.
              </Text>

              <Section className="bg-[#f9e79f] border border-[#f4d03f] border-solid rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[14px] text-[#7d6608] m-0 leading-[1.5]">
                  ⚠️ Security Tip: Always log out from shared devices and avoid
                  clicking suspicious links to protect your account.
                </Text>
              </Section>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[0] mt-0">
                Thank you for staying vigilant and using Pay Budz.
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-[#ddd] border-solid my-[24px]" />

            <Section className="px-[24px] pb-[32px]">
              <Text className="text-[12px] text-[#888] text-center leading-[1.5] m-0">
                Need help? Contact our support team anytime.
                <br />
                This alert was sent to notify you of a recent login to your
                account.
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
