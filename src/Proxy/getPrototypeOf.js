import { invariant, isObjectOrNull } from '../helpers';
import { getPrototypeOf as rGetPrototypeOf } from '../Reflect';

export function getPrototypeOf(handlerProto, target) {
	if (!isObjectOrNull(handlerProto)) {
		invariant('The result of [[GetPrototypeOf]] must be either an Object or null.');
	}
	if (Object.isExtensible(target)) {
		return handlerProto;
	}
	var targetProto = rGetPrototypeOf(target);
	if (!Object.is(handlerProto, targetProto)) {
		invariant('If the target object is not extensible, [[GetPrototypeOf]] applied to the proxy object must return the same value as [[GetPrototypeOf]] applied to the proxy object’s target object.');
	}
	return handlerProto;
}
