import { GET } from '../symbols';
import { assertObject, isDataDescriptor } from '../helpers';
import { isProxy } from '../Proxy';
import { getOwnPropertyDescriptor, getPrototypeOf } from './_methods';

export function get(target, key, receiver = target) {
	assertObject(target);
	if (isProxy(target)) {
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
