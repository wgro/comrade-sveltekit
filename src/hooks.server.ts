import { Sidequest } from 'sidequest';
import { building } from '$app/environment';
import { HelloWorldJob } from '../worker/jobs/HelloWorldJob.ts';
// Quick start Sidequest with default settings and Dashboard enabled
if (!building) {
	const mongoUri = process.env.MONGODB_URI;
	if (!mongoUri) {
		throw new Error('MONGODB_URI environment variable is required');
	}
	await Sidequest.start({
		backend: {
			driver: '@sidequest/mongo-backend',
			config: mongoUri
		}
	});
	console.log('Sidequest started! Dashboard: http://localhost:8678');
	await Sidequest.build(HelloWorldJob).enqueue();
}
