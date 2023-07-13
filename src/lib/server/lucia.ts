import { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } from '$env/static/private';
import lucia from 'lucia-auth';
import { sveltekit } from 'lucia-auth/middleware';
import { discord } from '@lucia-auth/oauth/providers';
import prisma from '@lucia-auth/adapter-prisma';
import { prisma as PrismaClient } from '$lib/server/prisma';
import { dev } from '$app/environment';

export const auth = lucia({
	adapter: prisma(PrismaClient),
	env: dev ? 'DEV' : 'PROD',
	middleware: sveltekit(),
	sessionExpiresIn: {
		activePeriod: 1000 * 60 * 60 * 24 * 7,
		idlePeriod: 1000 * 60 * 60 * 24 * 14
	},
	transformDatabaseUser: (userData) => {
		return {
			userId: userData.id,
			discordId: userData.discordId,
			username: userData.username,
			authorized: userData.authorized
		};
	}
});

export const discordAuth = discord(auth, {
	clientId: CLIENT_ID,
	clientSecret: CLIENT_SECRET,
	redirectUri: REDIRECT_URI
});

export type Auth = typeof auth;
