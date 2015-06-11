import { DEFINE_OWN_PROPERTY } from '../symbols';
import { isProxy, tryApply, assertObject, toPropertyDescriptor } from '../helpers';
import { defineProperty as oDefineProperty } from '../Object/_original';

export function defineProperty(target, key, desc) {
	assertObject(target);
	if (target::isProxy()) {
		return target[DEFINE_OWN_PROPERTY](key, toPropertyDescriptor(desc));
	}
	return tryApply(oDefineProperty, Object, [target, key, desc]);
}
