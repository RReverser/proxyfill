import { HAS_PROPERTY } from '../symbols';
import { isProxy } from '../Proxy';
import { assertObject } from '../helpers';
import { hasOwnProperty } from '../Object/_original';

export function has(target, key) {
	assertObject(target);
	if (isProxy(target)) {
		return target[HAS_PROPERTY](key);
	}
	return target::hasOwnProperty(key);
}
