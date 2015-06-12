import { IS_EXTENSIBLE } from '../symbols';
import { assertObject } from '../helpers';
import { isProxy } from '../Proxy';
import { isExtensible as oIsExtensible } from '../Object/_original';

export function isExtensible(target) {
	assertObject(target);
	if (isProxy(target)) {
		return target[IS_EXTENSIBLE]();
	}
	return oIsExtensible(target);
}
