import { GET_OWN_PROPERTY } from '../symbols';
import { isProxy, assertObject } from '../helpers';
import { getOwnPropertyDescriptor as oGetOwnPropertyDescriptor } from '../Object/_original';

export function getOwnPropertyDescriptor(target, key) {
	assertObject(target);
	if (target::isProxy()) {
		return target[GET_OWN_PROPERTY](key);
	}
	return oGetOwnPropertyDescriptor(target, key);
}
