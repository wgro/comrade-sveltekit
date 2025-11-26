import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IFeed extends Document {
	publisher: Types.ObjectId;
	name: string;
	languageCode: string;
	languageName: string;
	url: string;
	active: boolean;
	lastPolledAt?: Date;
	lastError?: string;
	createdAt: Date;
	updatedAt: Date;
}

const feedSchema = new Schema<IFeed>(
	{
		publisher: { type: Schema.Types.ObjectId, ref: 'Publisher', required: true },
		name: { type: String, required: true },
		languageCode: { type: String, required: true },
		languageName: { type: String, required: true },
		url: { type: String, required: true },
		active: { type: Boolean, default: true },
		lastPolledAt: { type: Date },
		lastError: { type: String }
	},
	{ timestamps: true }
);

feedSchema.index({ publisher: 1, url: 1 }, { unique: true });

export const Feed: Model<IFeed> = mongoose.models.Feed || mongoose.model<IFeed>('Feed', feedSchema);
