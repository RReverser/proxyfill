import { DELETE_PROPERTY } from '../symbols';
import { isProxy, assertObject } from '../helpers';

export function deleteProperty(target, key) {
	assertObject(target);
	if (target::isProxy()) {
		return target[DELETE_PROPERTY](key);
	}
	return delete target[key];
}
