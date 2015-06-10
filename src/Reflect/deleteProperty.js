import { DELETE_PROPERTY } from '../symbols';
import { has, assertObject } from '../helpers';

export function deleteProperty(target, key) {
	assertObject(target);
	if (target::has(DELETE_PROPERTY)) {
		return target[DELETE_PROPERTY](key);
	}
	return delete target[key];
}
