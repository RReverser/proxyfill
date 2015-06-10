import { invariant } from '../helpers';

export function deleteProperty(trapResult, target, key) {
	if (!trapResult) {
		return false;
	}
	var targetDesc = Reflect.getOwnPropertyDescriptor(target, key);
	if (targetDesc !== undefined && !targetDesc.configurable) {
		invariant('A property cannot be reported as deleted, if it exists as a non-configurable own property of the target object.');
	}
	return true;
}
