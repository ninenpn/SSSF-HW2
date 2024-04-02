// TODO: mongoose schema for cat
import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const catSchema = new mongoose.Schema<Cat>({
  cat_name: {
    type: String,
    minlength: [2, 'Minimum length is 2 characters.'],
  },
  weight: {
    type: Number,
    required: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  birthdate: {
    type: Date,
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
});

catSchema.index({location: '2dsphere'});

export default mongoose.model<Cat>('Cat', catSchema);
