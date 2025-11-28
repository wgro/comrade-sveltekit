import { prisma } from '../src/lib/server/db/connection';

async function seed(): Promise<void> {
	console.log('Seeding database...');

	// Upsert RFE/RL publisher
	const rferl = await prisma.publisher.upsert({
		where: { slug: 'rferl' },
		update: {},
		create: {
			name: 'Radio Free Europe/Radio Liberty',
			slug: 'rferl',
			type: 'primary',
			baseUrl: 'https://www.rferl.org',
			active: true
		}
	});

	console.log(`Created/found publisher: ${rferl.name} (${rferl.id})`);

	// Upsert feeds
	const feedsData = [
		{
			name: 'Central Newsroom',
			languageCode: 'en',
			languageName: 'English',
			url: 'https://www.rferl.org/api/'
		},
		{
			name: 'Ukrainian Service',
			languageCode: 'uk',
			languageName: 'Ukrainian',
			url: 'https://www.radiosvoboda.org/api/'
		},
		{
			name: 'Russian Service',
			languageCode: 'ru',
			languageName: 'Russian',
			url: 'https://www.svoboda.org/api/'
		}
	];

	for (const feedData of feedsData) {
		const feed = await prisma.feed.upsert({
			where: {
				publisherId_url: {
					publisherId: rferl.id,
					url: feedData.url
				}
			},
			update: {},
			create: {
				publisherId: rferl.id,
				...feedData,
				active: true
			}
		});
		console.log(`Created/found feed: ${feed.name}`);
	}

	console.log('Seeding completed successfully');
	await prisma.$disconnect();
}

seed().catch((error) => {
	console.error('Seeding failed:', error);
	process.exit(1);
});
