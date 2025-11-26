import mongoose from 'mongoose';
import { Publisher } from '../src/lib/server/db/models/Publisher';
import { Feed } from '../src/lib/server/db/models/Feed';

async function seed() {
	await mongoose.connect(process.env.MONGODB_URI!);

	// Create RFE/RL publisher
	const rferl = await Publisher.create({
		name: 'Radio Free Europe/Radio Liberty',
		slug: 'rferl',
		type: 'primary',
		baseUrl: 'https://www.rferl.org',
		active: true
	});

	// Add feeds - you'll need to find the actual RSS URLs
	await Feed.create([
		{
			publisher: rferl._id,
			name: 'Central Newsroom',
			languageCode: 'en',
			languageName: 'English',
			url: 'https://www.rferl.org/api'
		},
		{
			publisher: rferl._id,
			name: 'Ukrainian Service',
			languageCode: 'uk',
			languageName: 'Ukrainian',
			url: 'https://www.radiosvoboda.org/api/'
		},
		{
			publisher: rferl._id,
			name: 'Russian Service',
			languageCode: 'ru',
			languageName: 'Russian',
			url: 'https://www.svoboda.org/api/'
		}
	]);

	console.log('Seeded successfully');
	await mongoose.disconnect();
}

seed().catch(console.error);
