import { invariant } from '../helpers';
import { isExtensible, getPrototypeOf } from '../Reflect';

export function setPrototypeOf(trapResult, target, value) {
	trapResult = !!trapResult;
	if (isExtensible(target)) {
		return trapResult;
	}
	var targetProto = getPrototypeOf(target);
	if (trapResult && !Object.is(value, targetProto)) {
		invariant('If the target object is not extensible, the argument value must be the same as the result of [[GetPrototypeOf]] applied to target object.');
	}
	return trapResult;
}
