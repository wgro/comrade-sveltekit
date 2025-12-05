import { prisma } from '../src/lib/server/db/connection';

async function seed(): Promise<void> {
	console.log('Seeding database...');

	// Seed languages
	const languagesData = [
		{ code: 'prs', name: 'دری', name_en: 'Dari' },
		{ code: 'ps', name: 'پښتو', name_en: 'Pashto' },
		{ code: 'hy', name: 'Հայերեն', name_en: 'Armenian' },
		{ code: 'en', name: 'English', name_en: 'English' },
		{ code: 'ru', name: 'Русский', name_en: 'Russian' },
		{ code: 'az', name: 'Azərbaycan', name_en: 'Azerbaijani' },
		{ code: 'bs', name: 'Bosanski', name_en: 'Bosnian' },
		{ code: 'sr', name: 'Српски', name_en: 'Serbian' },
		{ code: 'be', name: 'Беларуская', name_en: 'Belarusian' },
		{ code: 'bg', name: 'Български', name_en: 'Bulgarian' },
		{ code: 'ka', name: 'ქართული', name_en: 'Georgian' },
		{ code: 'kk', name: 'Қазақша', name_en: 'Kazakh' },
		{ code: 'sq', name: 'Shqip', name_en: 'Albanian' },
		{ code: 'ky', name: 'Кыргызча', name_en: 'Kyrgyz' },
		{ code: 'ro', name: 'Română', name_en: 'Romanian' },
		{ code: 'ce', name: 'Нохчийн', name_en: 'Chechen' },
		{ code: 'mk', name: 'Македонски', name_en: 'Macedonian' },
		{ code: 'fa', name: 'فارسی', name_en: 'Persian' },
		{ code: 'tg', name: 'Тоҷикӣ', name_en: 'Tajik' },
		{ code: 'ba', name: 'Башҡортса', name_en: 'Bashkir' },
		{ code: 'tt', name: 'Татарча', name_en: 'Tatar' },
		{ code: 'tk', name: 'Türkmençe', name_en: 'Turkmen' },
		{ code: 'crh', name: 'Qırımtatar', name_en: 'Crimean Tatar' },
		{ code: 'uk', name: 'Українська', name_en: 'Ukrainian' },
		{ code: 'uz', name: 'Oʻzbekcha', name_en: 'Uzbek' }
	];

	console.log('Seeding languages...');
	for (const langData of languagesData) {
		await prisma.language.upsert({
			where: { code: langData.code },
			update: {},
			create: langData
		});
	}
	console.log(`Seeded ${languagesData.length} languages`);

	// Get language IDs for publishers
	const englishLang = await prisma.language.findUnique({ where: { code: 'en' } });
	const ukrainianLang = await prisma.language.findUnique({ where: { code: 'uk' } });
	const russianLang = await prisma.language.findUnique({ where: { code: 'ru' } });

	if (!englishLang || !ukrainianLang || !russianLang) {
		throw new Error('Required languages not found');
	}

	// Upsert RFE/RL publishers (one per language service)
	const publishersData = [
		{
			name: 'Radio Free Europe/Radio Liberty - Central Newsroom',
			languageId: englishLang.id,
			baseUrl: 'https://www.rferl.org'
		},
		{
			name: 'Radio Free Europe/Radio Liberty - Ukrainian Service',
			languageId: ukrainianLang.id,
			baseUrl: 'https://www.radiosvoboda.org'
		},
		{
			name: 'Radio Free Europe/Radio Liberty - Russian Service',
			languageId: russianLang.id,
			baseUrl: 'https://www.svoboda.org'
		}
	];

	console.log('Seeding publishers...');
	const publishers: Array<{
		id: string;
		name: string;
		type: string;
		baseUrl: string;
		languageId: string;
		active: boolean;
		createdAt: Date;
		updatedAt: Date;
	}> = [];
	for (const pubData of publishersData) {
		const publisher = await prisma.publisher.upsert({
			where: { baseUrl: pubData.baseUrl },
			update: {},
			create: {
				...pubData,
				type: 'rferl',
				active: true
			}
		});
		publishers.push(publisher);
		console.log(`Created/found publisher: ${publisher.name} (${publisher.id})`);
	}

	// Upsert feeds for each publisher
	const feedsData = [
		{
			publisherBaseUrl: 'https://www.rferl.org',
			name: 'Central Newsroom',
			url: 'https://www.rferl.org/api/'
		},
		{
			publisherBaseUrl: 'https://www.radiosvoboda.org',
			name: 'Ukrainian Service',
			url: 'https://www.radiosvoboda.org/api/'
		},
		{
			publisherBaseUrl: 'https://www.svoboda.org',
			name: 'Russian Service',
			url: 'https://www.svoboda.org/api/'
		}
	];

	console.log('Seeding feeds...');
	for (const feedData of feedsData) {
		const publisher = publishers.find((p) => p.baseUrl === feedData.publisherBaseUrl);
		if (!publisher) {
			console.warn(`Publisher not found for baseUrl: ${feedData.publisherBaseUrl}`);
			continue;
		}

		const feed = await prisma.feed.upsert({
			where: {
				publisherId_url: {
					publisherId: publisher.id,
					url: feedData.url
				}
			},
			update: {},
			create: {
				publisherId: publisher.id,
				name: feedData.name,
				url: feedData.url,
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
