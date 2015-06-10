import { invariant } from '../helpers';
import { isExtensible } from '../Reflect';

export function preventExtensions(trapResult, target) {
	trapResult = !!trapResult;
	if (trapResult && isExtensible(target)) {
		invariant('[[PreventExtensions]] applied to the proxy object only returns true if [[IsExtensible]] applied to the proxy object’s target object is false.');
	}
	return trapResult;
}
