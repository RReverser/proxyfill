import { GET_PROTOTYPE_OF } from '../symbols';
import { has, assertObject } from '../helpers';
import { getPrototypeOf as oGetPrototypeOf } from '../Object/_original';

export function getPrototypeOf(target) {
	assertObject(target);
	if (target::has(GET_PROTOTYPE_OF)) {
		return target[GET_PROTOTYPE_OF]();
	}
	return oGetPrototypeOf(target);
}
