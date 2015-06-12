import { DELETE_PROPERTY } from '../symbols';
import { isProxy } from '../Proxy';
import { assertObject } from '../helpers';

export function deleteProperty(target, key) {
	assertObject(target);
	if (isProxy(target)) {
		return target[DELETE_PROPERTY](key);
	}
	return delete target[key];
}
