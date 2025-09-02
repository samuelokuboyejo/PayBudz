import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
let app: admin.app.App;
@Injectable()
export class FirebaseAdmin implements OnApplicationBootstrap {
  constructor(private readonly configService: ConfigService) {}

  async onApplicationBootstrap() {
    if (!app) {
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          privateKey: this.configService
            .get<string>('FIREBASE_PRIVATE_KEY')
            ?.replace(/\\n/g, '\n'),
        }),
      });
    }
  }
}
