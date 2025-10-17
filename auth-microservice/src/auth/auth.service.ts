import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { InjectModel } from '@nestjs/mongoose';
import { AuthProvider, AuthProviderDocument } from './schemas/auth-provider.schema';
import { Model } from 'mongoose';
import { UserDocument } from 'src/users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { AuthProviderType } from './schemas/auth-provider.schema';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    @Inject('TOKEN_SERVICE') private tokenClient: ClientProxy,
    @InjectModel(AuthProvider.name)
    private authProviderModel: Model<AuthProviderDocument>,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne({ email });
    if (user) {
      const authProvider = await this.authProviderModel.findOne({ userId: user._id });
      if (authProvider && authProvider.passwordHash && (await bcrypt.compare(pass, authProvider.passwordHash))) {
        return user.toObject();
      }
    }
    return null;
  }

  async login(user: UserDocument) {
    const payload = { 
      username: user.email, 
      sub: user._id,
      email: user.email,
      name: user.name 
    };
    
    // Call token-service to create JWT
    const result = await firstValueFrom(
      this.tokenClient.send({ cmd: 'token.create' }, { payload })
    );
    
    return {
      access_token: result.token,
    };
  }

  async loginWithCredentials(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) return null;
    return this.login(user);
  }

  async registerLocal(dto: RegisterDto) {
    // Create user
    const user = await this.usersService.create({
      email: dto.email,
      phone: dto.phone,
      name: dto.name,
    });

    // Create auth provider with password hash
    const passwordHash = await bcrypt.hash(dto.password, 10);
    await this.authProviderModel.create({
      userId: user._id,
      provider: AuthProviderType.LOCAL,
      providerUserId: dto.email,
      passwordHash,
      lastLoginAt: new Date(),
    });

    return this.login(user);
  }
}
