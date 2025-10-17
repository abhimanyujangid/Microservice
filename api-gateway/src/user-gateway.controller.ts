import { Controller, Get, Headers, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller()
export class UserGatewayController {
  constructor(
    @Inject('TOKEN_SERVICE') private readonly tokenClient: ClientProxy,
  ) {}

  @Get('me')
  async getMe(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing or invalid authorization header');
    }

    const token = auth.substring(7);
    
    // Verify token via token-service
    const result = await firstValueFrom(
      this.tokenClient.send({ cmd: 'token.verify' }, { token })
    );

    if (!result.valid) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Return decoded user info from token
    return result.decoded;
  }
}
