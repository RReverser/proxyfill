import {
	isObject,
	isObjectOrNull,
	assertObject,
	assertObjectOrNull,
	toObject,
	toPropertyDescriptor,
	isAccessorDescriptor
} from '../helpers';

import * as O from './_original';
import R from '../Reflect';
import { isProxy } from '../Proxy';

function testIntegrityLevel(target, frozen) {
	if (!isObject(target)) {
		return true;
	}
	if (R.isExtensible(target)) {
		return false;
	}
	for (let key of R.ownKeys(target)) {
		let desc = R.getOwnPropertyDescriptor(target, key);
		if (desc !== undefined) {
			if (desc.configurable || frozen && desc.writable) {
				return false;
			}
		}
	}
	return true;
}

O.assign(Object, {
	assign(target, ...sources) {
		target = toObject(target);
		if (!sources.length) {
			return target;
		}
		for (let source of sources) {
			if (source == null) {
				continue;
			}
			let from = toObject(source);
			for (let key of R.ownKeys(from)) {
				let desc = R.getOwnPropertyDescriptor(from, key);
				if (desc !== undefined && desc.enumerable) {
					let value = R.get(from, key);
					if (!R.set(target, key, value)) {
						throw new TypeError('can\'t set value "${key}" on this object');
					}
				}
			}
		}
	},

	create(proto, props = undefined) {
		assertObjectOrNull(proto);
		var obj = O.create(proto);
		return props !== undefined ? Object.defineProperties(obj, props) : obj;
	},

	defineProperties(target, props) {
		assertObject(target);
		props = toObject(props);
		var descriptors = [];
		for (let key of R.ownKeys(props)) {
			descriptors.push({
				key,
				desc: toPropertyDescriptor(R.get(props, key))
			});
		}
		for (let { key, desc } of descriptors) {
			Object.defineProperty(key, desc);
		}
		return target;
	},

	defineProperty(target, key, desc) {
		assertObject(target);
		if (isProxy(target)) {
			let result = R.defineProperty(target, key, desc);
			if (!result) {
				throw new TypeError('can\'t define property "${key}" on this object');
			}
		} else {
			O.defineProperty(target, key, desc);
		}
		return target;
	},

	freeze(target) {
		if (!R.preventExtensions(target)) {
			return false;
		}
		for (let key of R.ownKeys(target)) {
			let desc = R.getOwnPropertyDescriptor(target, key);
			if (desc === undefined) {
				continue;
			}
			if (isAccessorDescriptor(desc)) {
				desc = { configurable: false };
			} else {
				desc = { configurable: false, writable: false };
			}
			Object.defineProperty(target, key, desc);
		}
	},

	getOwnPropertyDescriptor: R.getOwnPropertyDescriptor,

	getOwnPropertyNames(target) {
		assertObject(target);
		if (isProxy(target)) {
			return R.ownKeys(target).filter(key => typeof key === 'string');
		}
		return O.getOwnPropertyNames(target);
	},

	getOwnPropertySymbols(target) {
		assertObject(target);
		if (isProxy(target)) {
			return R.ownKeys(target).filter(key => typeof key === 'symbol');
		}
		return O.getOwnPropertySymbols(target);
	},

	getPrototypeOf: R.getPrototypeOf,

	isExtensible: R.isExtensible,

	isFrozen(target) {
		return testIntegrityLevel(target, true);
	},

	isSealed(target) {
		return testIntegrityLevel(target, false);
	},

	keys(target) {
		target = toObject(target);
		var names = [];
		for (let key of R.ownKeys(target)) {
			if (typeof key !== 'string') {
				continue;
			}
			let desc = R.getOwnPropertyDescriptor(target, key);
			if (desc !== undefined && desc.enumerable) {
				names.push(key);
			}
		}

		// TODO: Order the elements of names so they are in the same relative order as would be produced by the Iterator that would be returned if the [[Enumerate]] internal method was invoked on O.

		return names;
	},

	preventExtensions(target) {
		assertObject(target);
		if (isProxy(target)) {
			let result = R.preventExtensions(target);
			if (!result) {
				throw new TypeError('can\'t prevent extensions of this object');
			}
		} else {
			O.preventExtensions(target);
		}
	},

	seal(target) {
		if (!R.preventExtensions(target)) {
			return false;
		}
		for (let key of R.ownKeys(target)) {
			Object.defineProperty(target, key, { configurable: false });
		}
	},

	setPrototypeOf(target, proto) {
		assertObject(target);
		if (isProxy(target)) {
			let result = R.setPrototypeOf(target, proto);
			if (!result) {
				throw new TypeError('can\'t set prototype of this object');
			}
		} else {
			O.setPrototypeOf(target, proto);
		}
	}
});

O.assign(Object.prototype, {
	hasOwnProperty(key) {
		return R.getOwnPropertyDescriptor(this, key) !== undefined;
	},

	isPrototypeOf(other) {
		if (!isObject(other)) {
			return false;
		}
		var target = toObject(this);
		while ((other = R.getPrototypeOf(other)) !== null) {
			if (Object.is(target, other)) {
				return true;
			}
		}
		return false;
	},

	propertyIsEnumerable(key) {
		var desc = R.getOwnPropertyDescriptor(this, key);
		return desc !== undefined ? desc.enumerable : false;
	}
});

O.defineProperty(Object.prototype, '__proto__', {
	get() {
		return R.getPrototypeOf(this);
	},
	set(proto) {
		toObject(this);
		if (!isObjectOrNull(proto) || !isObject(this)) {
			return;
		}
		Object.setPrototypeOf(this, proto);
	}
});

export default Object;
