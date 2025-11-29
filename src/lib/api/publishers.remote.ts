import { query } from '$app/server';
import { prisma } from '$lib/server/db/connection';

export const getPublishers = query(async () => {
	const publishers = await prisma.publisher.findMany({
		include: {
			language: true
		},
		orderBy: {
			name: 'asc'
		}
	});
	return publishers;
});
