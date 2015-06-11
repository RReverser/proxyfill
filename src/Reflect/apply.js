import { CALL } from '../symbols';
import { isProxy } from '../helpers';
var funcApply = Function.prototype.apply;

export function apply(target, thisArg, args) {
	if (typeof target !== 'function') {
		throw new TypeError('target should be a function.');
	}
	if (target::isProxy()) {
		return target[CALL](thisArg, [...args]);
	}
	var apply = target::isProxy() ? target[CALL] : funcApply;
	return Reflect.apply(thisArg, [...args]);
}
