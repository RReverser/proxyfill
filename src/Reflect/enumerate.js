import { ENUMERATE } from '../symbols';
import { assertObject } from '../helpers';
import { isProxy } from '../Proxy';
import { getPrototypeOf, ownKeys, getOwnPropertyDescriptor } from './_methods';

function* oEnumerate(obj) {
	var visited = new Set();
	for (let key of ownKeys(obj)) {
		if (typeof key !== 'string') {
			continue;
		}
		let desc = getOwnPropertyDescriptor(obj, key);
		if (desc) {
			visited.add(key);
			if (desc.enumerable) {
				yield key;
			}
		}
	}
	let proto = getPrototypeOf(obj);
	if (proto === null) {
		return;
	}
	for (let protoName of enumerate(proto)) {
		if (!visited.has(protoName)) {
			yield protoName;
		}
	}
}

export function enumerate(target) {
	assertObject(target);
	if (isProxy(target)) {
		return target[ENUMERATE]();
	}
	return oEnumerate(target);
}
