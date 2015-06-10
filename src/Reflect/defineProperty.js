import { DEFINE_OWN_PROPERTY } from '../symbols';
import { has, tryApply, assertObject, toPropertyDescriptor } from '../helpers';
import { defineProperty as oDefineProperty } from '../Object/_original';

export function defineProperty(target, key, desc) {
	assertObject(target);
	if (target::has(DEFINE_OWN_PROPERTY)) {
		return target[DEFINE_OWN_PROPERTY](key, toPropertyDescriptor(desc));
	}
	return tryApply(oDefineProperty, Object, [target, key, desc]);
}
