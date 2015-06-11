import { assert } from 'chai';

var fnProxy = new Proxy(function () { return 42 }, {
	construct(target, args, newTarget) {
		return {
			type: 'construct',
			args
		};
	},

	apply(target, receiver, args) {
		return {
			type: 'apply',
			args,
			result: target.apply(receiver, args)
		};
	}
});

it('should call `construct` trap on `new fnProxy()`', () => {
	assert.deepEqual(new fnProxy(1, 2, 3), {
		type: 'construct',
		args: [1, 2, 3]
	});
});

it('should call `call` trap on `fnProxy()`', () => {
	assert.deepEqual(fnProxy(1, 2, 3), {
		type: 'apply',
		args: [1, 2, 3],
		result: 42
	});
});
