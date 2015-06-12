import { SET_PROTOTYPE_OF } from '../symbols';
import { tryApply, assertObject, assertObjectOrNull } from '../helpers';
import { isProxy } from '../Proxy';
import { setPrototypeOf as oSetPrototypeOf } from '../Object/_original';

export function setPrototypeOf(target, proto) {
	assertObject(target);
	assertObjectOrNull(proto);
	if (isProxy(target)) {
		return target[SET_PROTOTYPE_OF](proto);
	}
	return tryApply(oSetPrototypeOf, Object, [target, proto]);
}
