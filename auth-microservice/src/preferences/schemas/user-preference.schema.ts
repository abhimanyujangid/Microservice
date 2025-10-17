import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { User } from '../../users/schemas/user.schema';

export type UserPreferenceDocument = UserPreference & Document;

@Schema({ timestamps: true })
export class UserPreference {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: User;

  @Prop({ required: true })
  key: string;

  @Prop({ type: MongooseSchema.Types.Mixed, required: true })
  value: any;
}

export const UserPreferenceSchema = SchemaFactory.createForClass(UserPreference);
