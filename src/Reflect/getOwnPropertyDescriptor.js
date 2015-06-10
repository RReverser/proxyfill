import { GET_OWN_PROPERTY } from '../symbols';
import { has, tryApply, assertObject } from '../helpers';
import { getOwnPropertyDescriptor as oGetOwnPropertyDescriptor } from '../Object/_original';

export function getOwnPropertyDescriptor(target, key) {
	assertObject(target);
	if (target::has(GET_OWN_PROPERTY)) {
		return target[GET_OWN_PROPERTY](key);
	}
	return tryApply(oGetOwnPropertyDescriptor, Object, [key]);
}
