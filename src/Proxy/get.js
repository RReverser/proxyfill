import { invariant, isDataDescriptor, isAccessorDescriptor } from '../helpers';
import { getOwnPropertyDescriptor } from '../Reflect';

export function get(trapResult, target, key, receiver) {
	var targetDesc = getOwnPropertyDescriptor(target, key);
	if (targetDesc !== undefined) {
		if (isDataDescriptor(targetDesc) && !targetDesc.configurable &&!targetDesc.writable && !Object.is(trapResult, targetDesc.value)) {
			invariant('The value reported for a property must be the same as the value of the corresponding target object property if the target object property is a non-writable, non-configurable own data property.');
		}
		if (isAccessorDescriptor(targetDesc) && !targetDesc.configurable && targetDesc.get === undefined && trapResult !== undefined) {
			invariant('The value reported for a property must be undefined if the corresponding target object property is a non-configurable own accessor property that has undefined as its [[Get]] attribute.');
		}
	}
	return trapResult;
}
