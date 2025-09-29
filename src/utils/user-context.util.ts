import { Request } from 'express';
import * as UAParser from 'ua-parser-js';
import * as geoip from 'geoip-lite';

export interface UserContext {
  deviceInfo: string;
  location: string;
}

export function getUserContext(req: Request): UserContext {
  const parser = new UAParser.UAParser(req.headers['user-agent']);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  const device = parser.getDevice();
  const deviceInfo = `${browser.name ?? 'Unknown Browser'} ${
    browser.version ?? ''
  } on ${os.name ?? 'Unknown OS'} ${os.version ?? ''} (${
    device.type || 'desktop'
  })`;

  const ip =
    req.headers['x-forwarded-for']?.toString().split(',')[0] ||
    req.socket.remoteAddress ||
    '127.0.0.1';
  const geo = geoip.lookup(ip);
  const location = geo
    ? `${geo.city}, ${geo.region}, ${geo.country}`
    : 'Unknown location';

  return { deviceInfo, location };
}
