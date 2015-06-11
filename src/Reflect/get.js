import { GET } from '../symbols';
import { isProxy, assertObject, isDataDescriptor } from '../helpers';
import { apply, getOwnPropertyDescriptor, getPrototypeOf } from './';

export function get(target, key, receiver = target) {
	assertObject(target);
	if (target::isProxy()) {
		return target[GET](key, receiver);
	}
	var desc = getOwnPropertyDescriptor(target, key);
	if (desc === undefined) {
		let parent = getPrototypeOf(target);
		if (parent === null) return;
		return get(parent, key, receiver);
	}
	if (isDataDescriptor(desc)) {
		return desc.value;
	}
	var getter = desc.get;
	if (getter === undefined) return;
	return apply(getter, receiver, []);
}
