import { model } from 'mongoose';
import databaseSchema from './database.js';

const DocumentSchema = databaseSchema.clone();
DocumentSchema.add({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  type: { type: String, required: true },
  size: { type: String, required: true },
  public: { type: Boolean, default: false },
  path: { type: String },
  owner: { type: String, required: true },
});

DocumentSchema.getMinInfo = () => ({
  _id: this._id,
  name: this.name,
});

export default model('Document', DocumentSchema);
