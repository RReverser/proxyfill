import { GET_OWN_PROPERTY } from '../symbols';
import { assertObject } from '../helpers';
import { isProxy } from '../Proxy';
import { getOwnPropertyDescriptor as oGetOwnPropertyDescriptor } from '../Object/_original';

export function getOwnPropertyDescriptor(target, key) {
	assertObject(target);
	if (isProxy(target)) {
		return target[GET_OWN_PROPERTY](key);
	}
	return oGetOwnPropertyDescriptor(target, key);
}
