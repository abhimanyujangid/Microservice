import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';

@Controller()
export class TokenController {
  constructor(private readonly jwt: JwtService) {}

  @MessagePattern({ cmd: 'token.verify' })
  verify(@Payload() payload: { token: string }) {
    try {
      const decoded = this.jwt.verify(payload.token);
      return { valid: true, decoded };
    } catch (e) {
      return { valid: false, error: 'Invalid token' };
    }
  }

  @MessagePattern({ cmd: 'token.create' })
  create(@Payload() payload: { payload: any; expiresIn?: string | number }) {
    const token = payload.expiresIn
      ? this.jwt.sign(payload.payload, { expiresIn: payload.expiresIn as any })
      : this.jwt.sign(payload.payload);
    return { token };
  }
}
