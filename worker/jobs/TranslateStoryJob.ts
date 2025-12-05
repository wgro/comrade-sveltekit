import { Job } from 'sidequest';

export class TranslateStoryJob extends Job {
	async run(storyId: string) {
		console.log(`[TranslateStoryJob] Stub for story: ${storyId}`);
		// TODO: Implement translation in next phase
	}
}
