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

export interface WelcomeTemplateData {
  firstName: string;
}

export const WelcomeTemplate: MailTemplate<WelcomeTemplateData> = {
  subject: 'Welcome to Our App',
  render: ({ firstName }) => (
    <Html lang="en" dir="ltr">
      <Tailwind>
        <Head />
        <Body className="bg-gray-100 font-sans py-[40px]">
          <Container className="bg-white max-w-[600px] mx-auto rounded-[8px] shadow-sm">
            {/* Header */}
            <Section className="bg-[#27ae60] text-white text-center py-[32px] px-[24px] rounded-t-[8px]">
              <Heading className="text-[28px] font-bold m-0 leading-[1.2]">
                🎉 Welcome Aboard!
              </Heading>
            </Section>

            {/* Main Content */}
            <Section className="px-[24px] py-[32px]">
              <Text className="text-[24px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                Hello {firstName}!
              </Text>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                We're thrilled to have you join our community! Your account has
                been successfully created and you're all set to get started on
                an amazing journey with us.
              </Text>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                Our platform is designed to make your experience seamless and
                enjoyable. Whether you're here to manage your finances, explore
                new features, or connect with others, we've got everything you
                need to succeed.
              </Text>

              {/* Welcome Message Box */}
              <Section className="bg-[#f8f9fa] border border-[#ddd] border-solid rounded-[8px] p-[24px] mb-[24px]">
                <Heading className="text-[20px] text-[#2c3e50] font-semibold mb-[16px] mt-0">
                  What's Next?
                </Heading>

                <Text className="text-[16px] text-[#555] leading-[1.6] mb-[16px] mt-0">
                  Now that your account is ready, here are some things you can
                  do:
                </Text>

                <ul className="text-[14px] text-[#555] leading-[1.6] m-0 pl-[20px]">
                  <li className="mb-[8px]">
                    Complete your profile to personalize your experience
                  </li>
                  <li className="mb-[8px]">
                    Explore our features and discover what we have to offer
                  </li>
                  <li className="mb-[8px]">
                    Set up your preferences to get the most out of our platform
                  </li>
                  <li className="mb-0">
                    Connect with our community and start engaging
                  </li>
                </ul>
              </Section>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[24px] mt-0">
                We're here to support you every step of the way. If you have any
                questions or need assistance getting started, don't hesitate to
                reach out to our friendly support team.
              </Text>

              <Section className="bg-[#d4edda] border border-[#c3e6cb] border-solid rounded-[8px] p-[16px] mb-[24px]">
                <Text className="text-[14px] text-[#155724] m-0 leading-[1.5]">
                  <strong>💡 Pro Tip:</strong> Take a few minutes to explore
                  your dashboard and familiarize yourself with the interface.
                  The more you explore, the more you'll discover how our
                  platform can work for you!
                </Text>
              </Section>

              <Text className="text-[16px] text-[#555] leading-[1.6] mb-[0] mt-0">
                Once again, welcome to the family, {firstName}! We can't wait to
                see what you'll accomplish with us.
              </Text>
            </Section>

            {/* Footer */}
            <Hr className="border-[#ddd] border-solid my-[24px]" />

            <Section className="px-[24px] pb-[32px]">
              <Text className="text-[12px] text-[#888] text-center leading-[1.5] m-0">
                Need help getting started? Contact our support team - we're
                always happy to help!
                <br />
                This welcome message was sent because you recently created an
                account with us.
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
