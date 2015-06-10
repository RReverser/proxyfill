import { OWN_PROPERTY_KEYS } from '../symbols';
import { has, assertObject } from '../helpers';
import { getOwnPropertyNames, getOwnPropertySymbols } from '../Object/_original';

export function ownKeys(target) {
	assertObject(target);
	if (target::has(OWN_PROPERTY_KEYS)) {
		return target[OWN_PROPERTY_KEYS]();
	}
	return getOwnPropertyNames(target).concat(getOwnPropertySymbols(target));
}
