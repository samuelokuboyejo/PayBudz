import { ReactElement } from 'react';

export interface MailTemplate<T = any> {
  subject: string;
  render: (data: T) => ReactElement;
}
