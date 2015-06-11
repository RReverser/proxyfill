import {
	oDefineProperty
} from './_original';

oDefineProperty(Object.prototype, '__proto__', {
	enumerable: false,
	configurable: true,
	get() {
		return Object.getPrototypeOf(this);
	},
	set(proto) {
		Object.setPrototypeOf(this, proto);
	}
});
