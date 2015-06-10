import { CALL } from '../symbols';
import { has } from '../helpers';
var funcApply = Function.prototype.apply;

export function apply(target, thisArg, args) {
	if (typeof target !== 'function') {
		throw new TypeError('target should be a function.');
	}
	if (target::has(CALL)) {
		return target[CALL](thisArg, [...args]);
	}
	var apply = target::has(CALL) ? target[CALL] : funcApply;
	return Reflect.apply(thisArg, [...args]);
}
