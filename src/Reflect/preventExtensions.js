import { PREVENT_EXTENSIONS } from '../symbols';
import { isProxy } from '../Proxy';
import { tryApply, assertObject } from '../helpers';
import { preventExtensions as oPreventExtensions } from '../Object/_original';

export function preventExtensions(target) {
	assertObject(target);
	if (isProxy(target)) {
		return target[PREVENT_EXTENSIONS]();
	}
	return tryApply(oPreventExtensions, Object, []);
}
