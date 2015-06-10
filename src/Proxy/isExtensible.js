import { invariant } from '../helpers';

export function isExtensible(trapResult, target) {
	trapResult = !!trapResult;
	if (!Object.is(trapResult, Reflect.isExtensible(target))) {
		invariant('[[IsExtensible]] applied to the proxy object must return the same value as [[IsExtensible]] applied to the proxy object’s target object with the same argument.');
	}
	return trapResult;
}
