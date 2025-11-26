import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IPublisher extends Document {
	name: string;
	slug: string;
	type: 'primary' | 'competitor';
	baseUrl: string;
	active: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const publisherSchema = new Schema<IPublisher>(
	{
		name: { type: String, required: true },
		slug: { type: String, required: true, unique: true },
		type: { type: String, enum: ['primary', 'competitor'], required: true },
		baseUrl: { type: String, required: true },
		active: { type: Boolean, default: true }
	},
	{ timestamps: true }
);

export const Publisher: Model<IPublisher> =
	mongoose.models.Publisher || mongoose.model<IPublisher>('Publisher', publisherSchema);
