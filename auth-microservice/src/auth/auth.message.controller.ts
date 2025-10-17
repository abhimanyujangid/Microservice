import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller()
export class AuthMessageController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern({ cmd: 'auth.login' })
  async login(@Payload() payload: LoginDto) {
    return this.authService.loginWithCredentials(payload.email, payload.password);
  }

  @MessagePattern({ cmd: 'auth.register' })
  async register(@Payload() payload: RegisterDto) {
    return this.authService.registerLocal(payload);
  }
}
