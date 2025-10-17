import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { AuthProvider, AuthProviderSchema } from './schemas/auth-provider.schema';
import { AuthMessageController } from './auth.message.controller';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: AuthProvider.name, schema: AuthProviderSchema },
    ]),
    ClientsModule.registerAsync([
      {
        name: 'TOKEN_SERVICE',
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://localhost:5672')],
            queue: 'token_queue',
            queueOptions: { durable: true },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [AuthMessageController],
  providers: [AuthService],
})
export class AuthModule {}
