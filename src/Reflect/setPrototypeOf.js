import { SET_PROTOTYPE_OF } from '../symbols';
import { isProxy, tryApply, assertObject } from '../helpers';
import { setPrototypeOf as oSetPrototypeOf } from '../Object/_original';

export function setPrototypeOf(target, proto) {
	assertObject(target);
	if (proto !== null) {
		assertObject(proto);
	}
	if (target::isProxy()) {
		return target[SET_PROTOTYPE_OF](proto);
	}
	return tryApply(oSetPrototypeOf, Object, [target, proto]);
}
