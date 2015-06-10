import { invariant, isCompatiblePropertyDescriptor } from '../helpers';

export function defineProperty(trapResult, target, key, desc) {
	if (!trapResult) {
		return false;
	}
	var targetDesc = Reflect.getOwnPropertyDescriptor(target, key, desc);
	var extensibleTarget = Reflect.isExtensible(target);
	var settingConfigFalse = 'configurable' in desc && !desc.configurable;
	if (targetDesc === undefined) {
		if (!extensibleTarget) {
			invariant('A property cannot be added, if the target object is not extensible.');
		}
		if (settingConfigFalse) {
			invariant('A property cannot be non-configurable, unless there exists a corresponding non-configurable own property of the target object.');
		}
	} else {
		if (!isCompatiblePropertyDescriptor(extensibleTarget, desc, targetDesc) || settingConfigFalse && targetDesc.configurable) {
			invariant('If a property has a corresponding target object property then applying the Property Descriptor of the property to the target object using [[DefineOwnProperty]] will not throw an exception.');
		}
	}
	return true;
}
