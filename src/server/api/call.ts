import { User } from '../../models/entities/user';
import endpoints from './endpoints';
import { ApiError } from './error';
import { apiLogger } from './logger';
import { Metas } from '../../models';

export default async (endpoint: string, user: User | null | undefined, data: any, file?: any) => {
	const ep = endpoints.find(e => e.name === endpoint);

	if (ep == null) {
		throw new ApiError({
			message: 'No such endpoint.',
			code: 'NO_SUCH_ENDPOINT',
			id: 'f7485321-0e2b-458d-a6ce-ebfa0e944a48',
			httpStatusCode: 404
		});
	}

	if (ep.meta.requireCredential && user == null) {
		throw new ApiError({
			message: 'Credential required.',
			code: 'CREDENTIAL_REQUIRED',
			id: '663d5361-25f8-4973-ac18-f5e2e291b594',
			httpStatusCode: 401
		});
	}

	const wiki = await Metas.fetch();

	const isAdmin = user ? user.isAdmin : false;
	const userPermissions = user ? user.permissions : wiki.guestPermissions;

	if (ep.meta.kind && !userPermissions.some(p => p === ep.meta.kind) && !isAdmin) {
		throw new ApiError({
			message: 'Your app does not have the necessary permissions to use this endpoint.',
			code: 'PERMISSION_DENIED',
			id: 'c25a8e51-227e-4af8-aa38-de219897fef0',
		});
	}

	// API invoking
	return await ep.exec(data, user, file).catch((e: Error) => {
		if (e instanceof ApiError) {
			throw e;
		} else {
			apiLogger.error(`Internal error occurred in ${ep.name}`, {
				ep: ep.name,
				ps: data,
				e: {
					message: e.message,
					code: e.name,
					stack: e.stack
				}
			});
			throw new ApiError(null, {
				e: {
					message: e.message,
					code: e.name,
					stack: e.stack
				}
			});
		}
	});
};
