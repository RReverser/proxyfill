import { PROXY_HANDLER, PROXY_TARGET, CALL, CONSTRUCT } from '../symbols';
import { setInternalMethods } from '../internalMethods';
import * as internalMethods from './_internalMethods';
import * as internalFnMethods from './_internalFnMethods';
import { assertObject } from '../helpers';
import { create, assign, hasOwnProperty } from '../Object/_original';

function getProxyHandler() {
	var handler = this[PROXY_HANDLER];
	if (handler === null) {
		throw new TypeError('Proxy was revoked.');
	}
	return handler;
}

function assertValidProxyArgument(obj) {
	assertObject(obj);
	obj::getProxyHandler();
}

export function isProxy(obj) {
	return obj::hasOwnProperty(PROXY_HANDLER);
}

export default class Proxy {
	// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-proxycreate
	constructor(target, handler) {
		assertValidProxyArgument(target);
		assertValidProxyArgument(handler);

		var proxy;

		if (typeof target === 'function') {
			proxy = Object.setPrototypeOf(function proxied(...args) {
				if (this instanceof proxied) {
					return proxy[CONSTRUCT](args, this.constructor);
				}
				return proxy[CALL](this, args);
			}, FunctionProxyProto);
		} else {
			proxy = this;
		}

		proxy[PROXY_TARGET] = target;
		proxy[PROXY_HANDLER] = handler;

		return proxy;
	}

	static revocable(target, handler) {
		// [[RevocableProxy]]
		var revocableProxy = new Proxy(target, handler);
		return {
			proxy: revocableProxy,
			revoke() {
				if (revocableProxy !== null) {
					let proxy = revocableProxy;
					revocableProxy = null;
					proxy[PROXY_TARGET] = proxy[PROXY_HANDLER] = null;
				}
			}
		};
	}
}

const ProxyProto = Proxy.prototype = create(null);

function wrapTrap(method, name) {
	return function trapWrapper(...args) {
		var handler = this::getProxyHandler();
		var target = this[PROXY_TARGET];
		args.unshift(target);
		var trap = handler[name];
		if (trap == null) {
			return Reflect[name](...args);
		}
		return method(handler::trap(...args), ...args);
	};
}

setInternalMethods(ProxyProto, internalMethods, wrapTrap);

const FunctionProxyProto = create(Function.prototype, {
	toString: {
		writable: true,
		configurable: true,
		value: function toString() {
			return this[PROXY_TARGET].toString();
		}
	}
});

assign(FunctionProxyProto, ProxyProto);

setInternalMethods(FunctionProxyProto, internalFnMethods, wrapTrap);

// using `.bind()` to remove `prototype` on function
// http://people.mozilla.org/~jorendorff/es6-draft.html#sec-properties-of-the-proxy-constructor
Proxy = Proxy.bind();
