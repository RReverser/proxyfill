import { IS_EXTENSIBLE } from '../symbols';
import { has, assertObject } from '../helpers';
import { isExtensible as oIsExtensible } from '../Object/_original';

export function isExtensible(target) {
	assertObject(target);
	if (target::has(IS_EXTENSIBLE)) {
		return target[IS_EXTENSIBLE]();
	}
	return oIsExtensible(target);
}
