import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type UserSessionDocument = UserSession & Document;

@Schema({ timestamps: true })
export class UserSession {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true })
  sessionToken: string;

  @Prop({ type: MongooseSchema.Types.Mixed })
  deviceInfo?: any;

  @Prop()
  ipAddress?: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: Date.now })
  lastActiveAt: Date;
}

export const UserSessionSchema = SchemaFactory.createForClass(UserSession);
