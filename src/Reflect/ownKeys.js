import { OWN_PROPERTY_KEYS } from '../symbols';
import { isProxy } from '../Proxy';
import { assertObject } from '../helpers';
import { getOwnPropertyNames, getOwnPropertySymbols } from '../Object/_original';

export function ownKeys(target) {
	assertObject(target);
	if (isProxy(target)) {
		return target[OWN_PROPERTY_KEYS]();
	}
	return getOwnPropertyNames(target).concat(getOwnPropertySymbols(target));
}
