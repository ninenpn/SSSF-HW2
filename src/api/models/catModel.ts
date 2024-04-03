// TODO: mongoose schema for cat
import mongoose from 'mongoose';
import {Cat} from '../../types/DBTypes';

const Schema = mongoose.Schema;

const catSchema = new Schema<Cat>({
  cat_name: String,
  owner: {type: Schema.Types.ObjectId, ref: 'User'},
  weight: Number,
  filename: String,
  birthdate: Date,
  location: {
    type: {type: String, enum: ['Point']},
    coordinates: {type: [Number]},
  },
});

export default mongoose.model<Cat>('Cat', catSchema);
