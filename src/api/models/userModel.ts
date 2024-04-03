// TODO: mongoose schema for user
import mongoose from 'mongoose';
import {User} from '../../types/DBTypes';

const Schema = mongoose.Schema;

const userSchema = new Schema<User>({
  user_name: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  password: String,
});

export default mongoose.model<User>('User', userSchema);
