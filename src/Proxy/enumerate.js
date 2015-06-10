import { invariant, isObject } from '../helpers';

export function enumerate(trapResult) {
	if (!isObject(trapResult)) {
		invariant('The result of [[Enumerate]] must be an Object.');
	}
	return trapResult;
}
