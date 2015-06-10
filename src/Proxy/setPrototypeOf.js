import { invariant } from '../helpers';

export function setPrototypeOf(trapResult, target, value) {
	trapResult = !!trapResult;
	if (Reflect.isExtensible(target)) {
		return trapResult;
	}
	var targetProto = Reflect.getPrototypeOf(target);
	if (trapResult && !Object.is(value, targetProto)) {
		invariant('If the target object is not extensible, the argument value must be the same as the result of [[GetPrototypeOf]] applied to target object.');
	}
	return trapResult;
}
