import { CALL } from '../symbols';
import { assertCallable, createListFromArrayLike } from '../helpers';
import { isProxy } from '../Proxy';

var funcApply = Function.prototype.apply;

export function apply(target, thisArg, args) {
	assertCallable(target);
	args = createListFromArrayLike(args);
	if (isProxy(target)) {
		return target[CALL](thisArg, args);
	}
	var targetApply = isProxy(target) ? target[CALL] : funcApply;
	return target::targetApply(thisArg, args);
}
