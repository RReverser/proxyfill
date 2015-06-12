import { GET_PROTOTYPE_OF } from '../symbols';
import { assertObject } from '../helpers';
import { isProxy } from '../Proxy';
import { getPrototypeOf as oGetPrototypeOf } from '../Object/_original';

export function getPrototypeOf(target) {
	assertObject(target);
	if (isProxy(target)) {
		return target[GET_PROTOTYPE_OF]();
	}
	return oGetPrototypeOf(target);
}
