import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TokenController } from './token.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET', 'defaultSecret'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [TokenController],
})
export class AppModule {}
