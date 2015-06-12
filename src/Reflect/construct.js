import { CONSTRUCT } from '../symbols';
import { isObject, assertCallable, createListFromArrayLike } from '../helpers';
import { isProxy } from '../Proxy';
import { create } from '../Object/_original';

var funcApply = Function.prototype.apply;

export function construct(target, args, newTarget = target) {
	assertCallable(target);
	assertCallable(newTarget);
	args = createListFromArrayLike(args);
	if (isProxy(target)) {
		return target[CONSTRUCT](args, newTarget);
	}
	var { prototype } = newTarget;
	var obj = isObject(prototype) ? create(prototype) : {};
	var newObj = target::funcApply(obj, args);
	return isObject(newObj) ? newObj : obj;
}
