import { GET } from '../symbols';
import { isProxy, assertObject, isDataDescriptor } from '../helpers';
import { getOwnPropertyDescriptor, getPrototypeOf } from './';

export function get(target, key, receiver = target) {
	assertObject(target);
	if (target::isProxy()) {
		return target[GET](key, receiver);
	}
	var desc = getOwnPropertyDescriptor(target, key);
	if (desc === undefined) {
		let parent = getPrototypeOf(target);
		return parent !== null ? get(parent, key, receiver) : undefined;
	}
	if (isDataDescriptor(desc)) {
		return desc.value;
	}
	var getter = desc.get;
	return getter !== undefined ? receiver::getter() : undefined;
}
