import { get } from './Reflect';

export function toObject(value) {
	if (value == null) {
		throw new TypeError(`can't convert ${value} to object`);
	}
	return Object(value);
}

export function tryApply(func, context, args) {
	try {
		func.apply(context, args);
		return true;
	} catch (e) {
		return false;
	}
}

export function type(obj) {
	if (obj === null) {
		return 'null';
	}
	var result = typeof obj;
	return result === 'function' ? 'object' : result;
}

export function isCallable(obj) {
	return typeof obj === 'function';
}

export function assertCallable(obj) {
	if (!isCallable(obj)) {
		throw new TypeError(`${type(obj)} is not a function`);
	}
}

export function createListFromArrayLike(obj, elementTypes) {
	assertObject(obj);
	var length = get(obj, 'length');
	var list = new Array(length);
	for (let i = 0; i < length; i++) {
		let item = get(obj, i);
		if (elementTypes !== undefined) {
			assertType(obj, elementTypes);
		}
		list[i] = item;
	}
	return list;
}

export function isType(obj, allowedTypes) {
	var objType = type(obj);
	if (typeof allowedTypes === 'string') {
		return objType === allowedTypes;
	}
	return allowedTypes.indexOf(objType) >= 0;
}

export function assertType(obj, allowedTypes) {
	if (!isType(obj)) {
		throw new TypeError(`${type(obj)} is not supported (${allowedTypes})`);
	}
}

export function assertObject(obj) {
	assertType(obj, 'object');
}

const objectOrNull = ['object', 'null'];

export function assertObjectOrNull(obj) {
	assertType(obj, objectOrNull);
}

export function invariant(message) {
	throw new TypeError(`Invariant violation: ${message}`);
}

export function toPropertyDescriptor(obj) {
	var desc = {};
	if ('value' in obj) {
		desc.value = obj.value;
	}
	for (let key of [ 'enumerable', 'configurable', 'writable' ]) {
		if (key in obj) {
			desc[key] = Boolean(obj[key]);
		}
	}
	for (let key of ['get', 'set']) {
		if (key in obj) {
			let func = obj[key];
			if (typeof func !== 'function' && func !== undefined) {
				throw new TypeError(`descriptor.${key} should be a function`);
			}
			desc[key] = obj[key];
		}
	}
	if (('get' in desc || 'set' in desc) && ('value' in desc || 'writable' in desc)) {
		throw new TypeError('Descriptor cannot have both get/set and value/writable');
	}
	return desc;
}

export function isDataDescriptor(desc) {
	return 'value' in desc || 'writable' in desc;
}

export function isAccessorDescriptor(desc) {
	return 'get' in desc || 'set' in desc;
}

export function isGenericDescriptor(desc) {
	return !isAccessorDescriptor(desc) && !isDataDescriptor(desc);
}

export function completePropertyDescriptor(desc) {
	if (isGenericDescriptor(desc) || isDataDescriptor(desc)) {
		if (!('value' in desc)) {
			desc.value = undefined;
		}
		desc.writable = desc.writable || false;
	} else {
		if (!('get' in desc)) {
			desc.get = undefined;
		}
		if (!('set' in desc)) {
			desc.set = undefined;
		}
	}
	desc.enumerable = desc.enumerable || false;
	desc.configurable = desc.configurable || false;
	return desc;
}

export function isCompatiblePropertyDescriptor(extensible, desc, current) {
	if (current === undefined) {
		return extensible;
	}
	var isSubSetOfCurrent = true;
	for (let key in desc) {
		if (!(key in current) || !Object.is(current[key], desc[key])) {
			isSubSetOfCurrent = false;
			break;
		}
	}
	if (isSubSetOfCurrent) {
		return true;
	}
	if (!current.configurable && (desc.configurable || desc.enumerable === !current.enumerable)) {
		return false;
	}
	if (isGenericDescriptor(desc)) {
		return true;
	}
	if (isDataDescriptor(desc) !== isDataDescriptor(current) && !current.configurable) {
		return false;
	}
	if (!current.configurable) {
		if (isDataDescriptor(desc) && isDataDescriptor(current)) {
			if (!current.writable) {
				if (desc.writable) {
					return false;
				}
				if ('value' in desc && !Object.is(current.value, desc.value)) {
					return false;
				}
			}
		} else if (isAccessorDescriptor(desc) && isAccessorDescriptor(current)) {
			if ('get' in desc && !Object.is(desc.get, current.get)) {
				return false;
			}
			if ('set' in desc && !Object.is(desc.set, current.set)) {
				return false;
			}
		}
	}
	return true;
}
