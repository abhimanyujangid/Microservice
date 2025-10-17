import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('auth')
export class AuthGatewayController {
  constructor(@Inject('AUTH_SERVICE') private readonly authClient: ClientProxy) {}

  @Post('login')
  async login(@Body() body: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.login' }, body));
  }

  @Post('register')
  async register(@Body() body: any) {
    return firstValueFrom(this.authClient.send({ cmd: 'auth.register' }, body));
  }
}
