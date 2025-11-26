// jobs/EmailJob.js
import { Job } from 'sidequest';

export class HelloWorldJob extends Job {
	async run() {
		console.log(`Hello World from Sidequest`);
		return { message: 'Hello World from Sidequest' };
	}
}
