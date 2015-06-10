import { SET_PROTOTYPE_OF } from '../symbols';
import { has, tryApply, assertObject } from '../helpers';
import { setPrototypeOf as oSetPrototypeOf } from '../Object/_original';

export function setPrototypeOf(target, proto) {
	assertObject(target);
	if (proto !== null) {
		assertObject(proto);
	}
	if (target::has(SET_PROTOTYPE_OF)) {
		return target[SET_PROTOTYPE_OF](proto);
	}
	return tryApply(oSetPrototypeOf, Object, [target, proto]);
}
