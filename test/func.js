var func2 = new Proxy(func, {
	construct(target, args, newTarget) {
		console.log('construct', {target, args, isOwn: newTarget.__proto__ === func2.prototype});
	},

	apply(target, receiver, args) {
		console.log('apply', {target, receiver, args});
	}
});

func2(1, 2, 3);
new func2('a', 'b', 'c');

class A extends func2 {
}

new A('x', 'y', 'z');