import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
	if (isConnected) {
		return;
	}

	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error('MONGODB_URI environment variable is required');
	}

	try {
		await mongoose.connect(mongoUri);
		isConnected = true;
		console.log('MongoDB connected successfully');
	} catch (error) {
		console.error('MongoDB connection failed:', error);
		throw error;
	}
}

export async function disconnectDB(): Promise<void> {
	if (!isConnected) {
		return;
	}

	await mongoose.disconnect();
	isConnected = false;
	console.log('MongoDB disconnected');
}
