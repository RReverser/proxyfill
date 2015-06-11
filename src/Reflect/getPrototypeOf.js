import { GET_PROTOTYPE_OF } from '../symbols';
import { isProxy, assertObject } from '../helpers';
import { getPrototypeOf as oGetPrototypeOf } from '../Object/_original';

export function getPrototypeOf(target) {
	assertObject(target);
	if (target::isProxy()) {
		return target[GET_PROTOTYPE_OF]();
	}
	return oGetPrototypeOf(target);
}
