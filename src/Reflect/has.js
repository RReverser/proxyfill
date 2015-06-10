import { HAS_PROPERTY } from '../symbols';
import { has as oHas, assertObject } from '../helpers';

export function has(target, key) {
	assertObject(target);
	if (target::oHas(HAS_PROPERTY)) {
		return target[HAS_PROPERTY](key);
	}
	return target::oHas(key);
}
