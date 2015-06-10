import { CONSTRUCT } from '../symbols';
import { has, isObject } from '../helpers';
import { get } from './';
var funcApply = Function.prototype.apply;

export function construct(target, args, newTarget = target) {
	if (typeof target !== 'function') {
		throw new TypeError('target should be a constructor.');
	}
	if (typeof newTarget !== 'function') {
		throw new TypeError('newTarget should be a constructor.');
	}
	if (target::has(CONSTRUCT)) {
		return target[CONSTRUCT]([...args], newTarget);
	}
	var {prototype} = newTarget;
	var obj = isObject(prototype) ? Object.create(prototype) : {};
	var newObj = target::funcApply(obj, [...args]);
	return isObject(newObj) ? newObj : obj;
}
