import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import * as admin from 'firebase-admin';
import { UserService } from 'src/services/user.service';
@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(private userService: UserService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid auth header');
    }

    const idToken = authHeader.split(' ')[1];

    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      const user = await this.userService.findByEmail(decodedToken.email);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
