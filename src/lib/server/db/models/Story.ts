import mongoose, { Schema, type Document, type Model, type Types } from 'mongoose';

export interface IStory extends Document {
	feed: Types.ObjectId;
	guid: string;
	sourceUrl: string;

	// Original content (in source language)
	originalTitle: string;
	originalContent?: string;
	originalLanguage: string;

	// Translated content (English)
	translatedTitle?: string;
	translatedContent?: string;

	// Summary
	summary?: string;

	// Processing state
	status: 'pending' | 'fetched' | 'translated' | 'summarized' | 'failed';
	errorMessage?: string;

	// Metadata
	contentType: 'article' | 'video' | 'newsletter';
	publishedAt?: Date;
	author?: string;
	imageUrl?: string;

	createdAt: Date;
	updatedAt: Date;
}

const storySchema = new Schema<IStory>(
	{
		feed: { type: Schema.Types.ObjectId, ref: 'Feed', required: true },
		guid: { type: String, required: true },
		sourceUrl: { type: String, required: true },

		originalTitle: { type: String, required: true },
		originalContent: { type: String },
		originalLanguage: { type: String, required: true },

		translatedTitle: { type: String },
		translatedContent: { type: String },

		summary: { type: String },

		status: {
			type: String,
			enum: ['pending', 'fetched', 'translated', 'summarized', 'failed'],
			default: 'pending'
		},
		errorMessage: { type: String },

		contentType: {
			type: String,
			enum: ['article', 'video', 'newsletter'],
			default: 'article'
		},
		publishedAt: { type: Date },
		author: { type: String },
		imageUrl: { type: String }
	},
	{ timestamps: true }
);

storySchema.index({ feed: 1, guid: 1 }, { unique: true });
storySchema.index({ status: 1 });
storySchema.index({ createdAt: -1 });

export const Story: Model<IStory> =
	mongoose.models.Story || mongoose.model<IStory>('Story', storySchema);
