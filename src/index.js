import {
	PROXY_HANDLER,
	PROXY_TARGET,

	GET_PROTOTYPE_OF,
	SET_PROTOTYPE_OF,
	IS_EXTENSIBLE,
	PREVENT_EXTENSIONS,
	GET_OWN_PROPERTY,
	HAS_PROPERTY,
	GET,
	SET,
	DELETE,
	DEFINE_OWN_PROPERTY,
	ENUMERATE,
	OWN_PROPERTY_KEYS,
	CALL,
	CONSTRUCT
} from './symbols';

function getProxyHandler() {
	var handler = this[PROXY_HANDLER];
	if (handler === null) {
		throw new TypeError('Proxy was revoked.');
	}
	return handler;
}

function isObjectOrNull(obj) {
	return typeof obj === 'object' || typeof obj === 'function';
}

function isObject(obj) {
	return isObjectOrNull(obj) && obj !== null;
}

function assertObject(obj) {
	if (!isObject(obj)) {
		throw new TypeError('Value is not an Object.');
	}
}

function assertValidProxyArgument(obj) {
	assertObject(obj);
	obj::getProxyHandler();
}

function invariant(message) {
	throw new TypeError(`Invariant violation: ${message}`);
}

function toPropertyDescriptor(obj) {
	var desc = {};
	if ('value' in obj) {
		desc.value = obj.value;
	}
	for (let key of ['enumerable', 'configurable', 'writable']) {
		if (key in obj) {
			desc[key] = Boolean(obj[key]);
		}
	}
	for (let key of ['get', 'set']) {
		if (key in obj) {
			var func = obj[key];
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

var isDataDescriptor = desc => 'value' in desc || 'writable' in desc;
var isAccessorDescriptor = desc => 'get' in desc || 'set' in desc;
var isGenericDescriptor = desc => !isAccessorDescriptor(desc) && !isDataDescriptor(desc);

function completePropertyDescriptor(desc) {
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

function isCompatiblePropertyDescriptor(extensible, desc, current) {
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
	if (!current.configurable && (desc.configurable || (desc.enumerable === !current.enumerable))) {
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
				if ('value' in desc && !Object.is(current.value, desc.value)) return false;
			}
		} else if (isAccessorDescriptor(desc) && isAccessorDescriptor(current)) {
			if ('get' in desc && !Object.is(desc.get, current.get)) return false;
			if ('set' in desc && !Object.is(desc.set, current.set)) return false;
		}
	}
	return true;
}

export default class Proxy {
	// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-proxycreate
	constructor(target, handler) {
		assertValidProxyArgument(target);
		assertValidProxyArgument(handler);

		this[PROXY_TARGET] = target;
		this[PROXY_HANDLER] = handler;

		if (typeof target === 'function') {
			let proxy = this;

			function proxiedFunction(...args) {
				if (this instanceof proxiedFunction) {
					return proxy[CONSTRUCT](args, this);
				} else {
					return proxy[CALL](this, args);
				}
			}

			// exotic function returned by `.bind()` has dedicated
			// instanceof semantics which allow us to distinguish
			// `new F()` from `F.call(Object.create(F.prototype))`
			proxiedFunction = proxiedFunction.bind();
			
			if ('prototype' in target) {
				Object.defineProperty(proxiedFunction, 'prototype', Object.getOwnPropertyDescriptor(target, 'prototype'));
			}

			return proxiedFunction;
		}
	}

	static revocable(target, handler) {
		// [[RevocableProxy]]
		var revocableProxy = new Proxy(target, handler);
		return {
			proxy: revocableProxy,
			revoke() {
				if (revocableProxy !== null) {
					let proxy = revocableProxy;
					revocableProxy = null;
					proxy[PROXY_TARGET] = proxy[PROXY_HANDLER] = null;
				}
			}
		};
	}

	[GET_PROTOTYPE_OF]() {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.getPrototypeOf;
		if (trap == null) {
			return Reflect.getPrototypeOf(target);
		}
		var handlerProto = handler::trap(target);
		if (!isObjectOrNull(handlerProto)) {
			invariant('The result of [[GetPrototypeOf]] must be either an Object or null.');
		}
		if (Object.isExtensible(target)) {
			return handlerProto;
		}
		var targetProto = Reflect.getPrototypeOf(target);
		if (!Object.is(handlerProto, targetProto)) {
			invariant('If the target object is not extensible, [[GetPrototypeOf]] applied to the proxy object must return the same value as [[GetPrototypeOf]] applied to the proxy object’s target object.');
		}
		return handlerProto;
	}

	[SET_PROTOTYPE_OF](value) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.setPrototypeOf;
		if (trap == null) {
			return Reflect.setPrototypeOf(target);
		}
		var trapResult = Boolean(handler::trap(target, value));
		if (Reflect.isExtensible(target)) {
			return trapResult;
		}
		var targetProto = Reflect.getPrototypeOf(target);
		if (trapResult && !Object.is(value, targetProto)) {
			invariant('If the target object is not extensible, the argument value must be the same as the result of [[GetPrototypeOf]] applied to target object.');
		}
		return trapResult;
	}

	[IS_EXTENSIBLE]() {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.isExtensible;
		if (trap == null) {
			return Reflect.isExtensible(target);
		}
		var trapResult = Boolean(handler::trap(target));
		var targetResult = Reflect.isExtensible(target);
		if (!Object.is(trapResult, targetResult)) {
			invariant('[[IsExtensible]] applied to the proxy object must return the same value as [[IsExtensible]] applied to the proxy object’s target object with the same argument.');
		}
		return trapResult;
	}

	[PREVENT_EXTENSIONS]() {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.preventExtensions;
		if (trap == null) {
			return Reflect.preventExtensions(target);
		}
		var trapResult = Boolean(handler::trap(target));
		if (trapResult && Reflect.isExtensible(target)) {
			invariant('[[PreventExtensions]] applied to the proxy object only returns true if [[IsExtensible]] applied to the proxy object’s target object is false.');
		}
		return trapResult;
	}

	[GET_OWN_PROPERTY](key) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.getOwnPropertyDescriptor;
		if (trap == null) {
			return Reflect.getOwnPropertyDescriptor(target, key);
		}
		var resultDesc = handler::trap(target, key);
		if (!isObject(resultDesc) && resultDesc !== undefined) {
			invariant('The result of [[GetOwnProperty]] must be either an Object or undefined.');
		}
		var targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
		if (resultDesc === undefined) {
			if (targetDesc === undefined) return;
			if (!targetDesc.configurable) {
				invariant('A property cannot be reported as non-existent, if it exists as a non-configurable own property of the target object.');
			}
			if (!Reflect.isExtensible(target)) {
				invariant('A property cannot be reported as non-existent, if it exists as an own property of the target object and the target object is not extensible.');
			}
			return;
		}
		resultDesc = completePropertyDescriptor(toPropertyDescriptor(resultDesc));
		if (!isCompatiblePropertyDescriptor(Reflect.isExtensible(target), resultDesc, targetDesc)) {
			invariant('A property cannot be reported as existent, if it does not exists as an own property of the target object and the target object is not extensible.');
		}
		if (!resultDesc.configurable && (targetDesc === undefined || targetDesc.configurable)) {
			invariant('A property cannot be reported as non-configurable, if it does not exists as an own property of the target object or if it exists as a configurable own property of the target object.');
		}
		return resultDesc;
	}

	[DEFINE_OWN_PROPERTY](key, desc) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.defineProperty;
		if (trap == null) {
			return Reflect.defineProperty(target, key, desc);
		}
		var trapResult = handler::trap(target, key, desc);
		if (!trapResult) {
			return false;
		}
		var targetDesc = Reflect.getOwnPropertyDescriptor(target, key, desc);
		var extensibleTarget = Reflect.isExtensible(target);
		var settingConfigFalse = 'configurable' in desc && !desc.configurable;
		if (targetDesc === undefined) {
			if (!extensibleTarget) {
				invariant('A property cannot be added, if the target object is not extensible.');
			}
			if (settingConfigFalse) {
				invariant('A property cannot be non-configurable, unless there exists a corresponding non-configurable own property of the target object.');
			}
		} else {
			if (!isCompatiblePropertyDescriptor(extensibleTarget, desc, targetDesc) || settingConfigFalse && targetDesc.configurable) {
				invariant('If a property has a corresponding target object property then applying the Property Descriptor of the property to the target object using [[DefineOwnProperty]] will not throw an exception.');
			}
		}
		return true;
	}

	[HAS_PROPERTY](key) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.has;
		if (trap == null) {
			return Reflect.has(target, key);
		}
		var trapResult = Boolean(handler::trap(target));
		if (!trapResult) {
			let targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
			if (targetDesc !== undefined) {
				if (!targetDesc.configurable) {
					invariant('A property cannot be reported as non-existent, if it exists as a non-configurable own property of the target object.');
				}
				if (!Reflect.isExtensible(target)) {
					invariant('A property cannot be reported as non-existent, if it exists as an own property of the target object and the target object is not extensible.');
				}
			}
		}
		return trapResult;
	}

	[GET](key, receiver) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.get;
		if (trap == null) {
			return Reflect.get(target, key, receiver);
		}
		var trapResult = handler::trap(target, key, receiver);
		var targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
		if (targetDesc !== undefined) {
			if (isDataDescriptor(targetDesc) && !targetDesc.configurable &&!targetDesc.writable && !Object.is(trapResult, targetDesc.value)) {
				invariant('The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable own data property.');
			}
			if (isAccessorDescriptor(targetDesc) && !targetDesc.configurable && targetDesc.get === undefined && trapResult !== undefined) {
				invariant('The value reported for a property must be undefined if the corresponding target object property is a non-configurable own accessor property that has undefined as its [[Get]] attribute.');
			}
		}
		return trapResult;
	}

	[SET](key, value, receiver) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.set;
		if (trap == null) {
			return Reflect.set(target, key, value, receiver);
		}
		var trapResult = Boolean(handler::trap(target, key, value, receiver));
		if (!trapResult) {
			return false;
		}
		var targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
		if (targetDesc !== undefined) {
			if (isDataDescriptor(targetDesc) && !targetDesc.configurable &&!targetDesc.writable && !Object.is(value, targetDesc.value)) {
				invariant('Cannot change the value of a property to be different from the value of the corresponding target object property if the corresponding target object property is a non-writable, non-configurable own data property.');
			}
			if (isAccessorDescriptor(targetDesc) && !targetDesc.configurable && targetDesc.set === undefined) {
				invariant('Cannot set the value of a property if the corresponding target object property is a non-configurable own accessor property that has undefined as its [[Set]] attribute.');
			}
		}
		return trapResult;
	}

	[DELETE](key) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.deleteProperty;
		if (trap == null) {
			return Reflect.deleteProperty(target, key);
		}
		var trapResult = Boolean(handler::trap(target, key));
		if (!trapResult) {
			return false;
		}
		var targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
		if (targetDesc !== undefined && !targetDesc.configurable) {
			invariant('A property cannot be reported as deleted, if it exists as a non-configurable own property of the target object.');
		}
		return true;
	}

	[ENUMERATE]() {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.enumerate;
		if (trap == null) {
			return Reflect.enumerate(target);
		}
		var trapResult = handler::trap(target);
		if (!isObject(trapResult)) {
			invariant('The result of [[Enumerate]] must be an Object.');
		}
		return trapResult;
	}

	[OWN_PROPERTY_KEYS]() {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.ownKeys;
		if (trap == null) {
			return Reflect.ownKeys(target);
		}
		var trapResult = handler::trap(target);
		assertObject(trapResult);
		trapResult = Array.from(trapResult, value => {
			if (typeof value !== "string" && typeof value !== "symbol") {
				invariant('The Type of each result List element is either String or Symbol.');
			}
		});
		var extensibleTarget = Object.isExtensible(target);
		var targetKeys = Reflect.ownKeys(target);
		var targetConfigurableKeys = [], targetNonConfigurableKeys = [];
		for (let key of targetKeys) {
			let desc = Reflect.getOwnPropertyDescriptor(target, key);
			if (desc !== undefined && !desc.configurable) {
				targetNonConfigurableKeys.push(key);
			} else {
				targetConfigurableKeys.push(key);
			}
		}
		if (extensibleTarget && !targetNonConfigurableKeys.length) {
			return trapResult;
		}
		var uncheckedResultKeys = trapResult.slice();
		for (let key of targetNonConfigurableKeys) {
			let index = uncheckedResultKeys.indexOf(key);
			if (index === -1) {
				invariant('The result List must contain the keys of all non-configurable own properties of the target object.');
			}
			uncheckedResultKeys.splice(index, 1);
		}
		if (extensibleTarget) {
			return trapResult;
		}
		var error = false;
		for (let key of targetConfigurableKeys) {
			let index = uncheckedResultKeys.indexOf(key);
			if (index === -1) {
				error = true;
				break;
			}
			uncheckedResultKeys.splice(index, 1);
		}
		if (error || uncheckedResultKeys.length) {
			invariant('If the target object is not extensible, then the result List must contain all the keys of the own properties of the target object and no other values.');
		}
		return trapResult;
	}

	[CALL](thisArg, args) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.apply;
		if (trap == null) {
			return Reflect.apply(target, thisArg, args);
		}
		return handler::trap(target, thisArg, Array.from(args));
	}

	[CONSTRUCT](args, newTarget) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		var trap = handler.construct;
		if (trap == null) {
			return Reflect.construct(target, args, newTarget);
		}
		var newObj = handler::trap(target, Array.from(args), newTarget);
		assertObject(newObj);
		return newObj;
	}
}

// using `.bind()` to remove `prototype` on function
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-proxy-constructor
Proxy = Proxy.bind();