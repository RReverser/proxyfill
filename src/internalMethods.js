import {
	CALL,
	CONSTRUCT,
	DEFINE_OWN_PROPERTY,
	DELETE,
	ENUMERATE,
	GET,
	GET_OWN_PROPERTY,
	GET_PROTOTYPE_OF,
	HAS_PROPERTY,
	IS_EXTENSIBLE,
	OWN_PROPERTY_KEYS,
	PREVENT_EXTENSIONS,
	SET,
	SET_PROTOTYPE_OF
} from './symbols';

export const internalMethods = Object.freeze({
	__proto__: null,

	apply: CALL,
	construct: CONSTRUCT,
	defineProperty: DEFINE_OWN_PROPERTY,
	deleteProperty: DELETE,
	enumerate: ENUMERATE,
	get: GET,
	getOwnPropertyDescriptor: GET_OWN_PROPERTY,
	getPrototypeOf: GET_PROTOTYPE_OF,
	has: HAS_PROPERTY,
	isExtensible: IS_EXTENSIBLE,
	ownKeys: OWN_PROPERTY_KEYS,
	preventExtensions: PREVENT_EXTENSIONS,
	set: SET,
	setPrototypeOf: SET_PROTOTYPE_OF
});

const methodEntries = Object.keys(internalMethods).map(function (key) {
	return {
		name,
		symbol: internalMethods[key]
	};
}, internalMethods);

export function setInternalMethods(obj, impl, transform) {
	for (let { name, symbol } of methodEntries) {
		if (!(name in impl)) {
			continue;
		}
		var method = impl[name];
		if (transform !== undefined) {
			method = transform(method, name);
		}
		if (typeof method !== 'function') {
			throw new TypeError(`impl.${name} is not a function`);
		}
		obj[symbol] = method;
	}
}
