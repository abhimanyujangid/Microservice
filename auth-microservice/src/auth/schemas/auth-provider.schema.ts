import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type AuthProviderDocument = AuthProvider & Document;

export enum AuthProviderType {
  LOCAL = 'local',
  GOOGLE = 'google',
  FACEBOOK = 'facebook',
  APPLE = 'apple',
}

@Schema({ timestamps: true })
export class AuthProvider {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({
    type: String,
    enum: Object.values(AuthProviderType),
    required: true,
  })
  provider: AuthProviderType;

  @Prop({ required: true })
  providerUserId: string;

  @Prop()
  passwordHash?: string;

  @Prop()
  lastLoginAt?: Date;
}

export const AuthProviderSchema = SchemaFactory.createForClass(AuthProvider);
