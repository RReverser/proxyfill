import { invariant, assertObject, createListFromArrayLike } from '../helpers';
import { getOwnPropertyDescriptor } from '../Reflect';

const stringOrSymbol = ['string', 'symbol'];

export function ownKeys(trapResult, target) {
	assertObject(trapResult);
	trapResult = createListFromArrayLike(trapResult, stringOrSymbol);
	var extensibleTarget = Object.isExtensible(target);
	var targetKeys = ownKeys(target);
	var targetConfigurableKeys = [];
	var targetNonConfigurableKeys = [];
	for (let key of targetKeys) {
		let desc = getOwnPropertyDescriptor(target, key);
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
