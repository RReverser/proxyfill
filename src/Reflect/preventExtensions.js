import { PREVENT_EXTENSIONS } from '../symbols';
import { isProxy, tryApply, assertObject } from '../helpers';
import { preventExtensions as oPreventExtensions } from '../Object/_original';

export function preventExtensions(target) {
	assertObject(target);
	if (target::isProxy()) {
		return target[PREVENT_EXTENSIONS]();
	}
	return tryApply(oPreventExtensions, Object, []);
}
