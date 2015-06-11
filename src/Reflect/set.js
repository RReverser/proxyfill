import { SET } from '../symbols';
import { isProxy, isObject, assertObject, isDataDescriptor } from '../helpers';
import { apply, defineProperty, getOwnPropertyDescriptor, getPrototypeOf } from './';

export function set(target, key, value, receiver = target) {
	assertObject(target);
	if (target::isProxy()) {
		return target[SET](key, value, receiver);
	}
	var desc = getOwnPropertyDescriptor(target, key);
	if (desc === undefined) {
		let parent = getPrototypeOf(target);
		if (parent !== null) {
			return set(parent, key, value, receiver);
		}
		desc = {
			value: undefined,
			writable: true,
			enumerable: true,
			configurable: true
		};
	}
	if (isDataDescriptor(desc)) {
		if (!desc.writable || !isObject(receiver)) return false;
		let hasOwnKey = getOwnPropertyDescriptor(receiver, key) !== undefined;
		return defineProperty(receiver, key, hasOwnKey ? { value } : {
			value,
			writable: true,
			enumerable: true,
			configurable: true
		});
	}
	var setter = desc.set;
	if (setter === undefined) return false;
	apply(setter, receiver, []);
	return true;
}
