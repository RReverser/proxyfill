import {
	invariant,
	isObject,
	isCompatiblePropertyDescriptor,
	toPropertyDescriptor,
	completePropertyDescriptor
} from '../helpers';

export function getOwnPropertyDescriptor(resultDesc, target, key) {
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
