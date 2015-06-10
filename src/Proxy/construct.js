import { assertObject } from '../helpers';

export function construct(newObj) {
	assertObject(newObj);
	return newObj;
}
