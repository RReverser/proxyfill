import { invariant, isDataDescriptor, isAccessorDescriptor } from '../helpers';
import { getOwnPropertyDescriptor } from '../Reflect';

export function set(trapResult, target, key, value, receiver) {
	trapResult = !!trapResult;
	if (!trapResult) {
		return false;
	}
	var targetDesc = getOwnPropertyDescriptor(target, key);
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
