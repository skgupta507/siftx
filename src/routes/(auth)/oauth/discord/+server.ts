import type { RequestHandler } from './$types';
import { auth, discordAuth } from '$lib/server/lucia';
import { redirect } from 'sveltekit-flash-message/server';
import { error } from '@sveltejs/kit';
import { OWNER_ID } from '$env/static/private';

export const GET: RequestHandler = async (event) => {
	let { cookies, url, locals } = event;

	const code = url.searchParams.get('code')!;
	const state = url.searchParams.get('state');

	const storedState = cookies.get('discord_oauth_state');

	if (!code) {
		throw error(404, 'code missing');
	}

	if (!state || !storedState || state !== storedState) {
		throw error(404, 'state missing/invalid');
	}

	try {
		const { existingUser, providerUser, createUser } = await discordAuth.validateCallback(code);

		const getUser = async () => {
			if (existingUser) return existingUser;
			return await createUser({
				discordId: providerUser.id,
				username: providerUser.username,
				authorized: providerUser.id == OWNER_ID ? true : false
			});
		};
		const user = await getUser();
		const session = await auth.createSession(user.userId);
		locals.auth.setSession(session);
	} catch (e) {
		console.log(e);
		throw error(404, 'invalid code');
	}

	throw redirect(302, '/', { type: 'success', message: 'Logged in' }, event);
};