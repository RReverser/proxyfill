import { invariant } from '../helpers';
import { getOwnPropertyDescriptor, isExtensible } from '../Reflect';

export function has(trapResult, target, key) {
	if (trapResult) {
		return true;
	}
	let targetDesc = getOwnPropertyDescriptor(target, key);
	if (targetDesc !== undefined) {
		if (!targetDesc.configurable) {
			invariant('A property cannot be reported as non-existent, if it exists as a non-configurable own property of the target object.');
		}
		if (!isExtensible(target)) {
			invariant('A property cannot be reported as non-existent, if it exists as an own property of the target object and the target object is not extensible.');
		}
	}
	return false;
}
