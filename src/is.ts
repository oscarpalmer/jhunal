import {SCHEMATIC_NAME} from './constants';
import type {Constructor} from './models';
import type {Schematic} from './schematic';

export function isConstructor(value: unknown): value is Constructor<unknown> {
	return typeof value === 'function' && value.prototype !== undefined;
}

export function isInstance<Instance>(
	constructor: Constructor<Instance>,
): (value: unknown) => value is Instance {
	if (!isConstructor(constructor)) {
		throw new TypeError('Expected a constructor function');
	}

	return (value: unknown): value is Instance => {
		return value instanceof constructor;
	};
}

export function isSchematic(value: unknown): value is Schematic<never> {
	return (
		typeof value === 'object' &&
		value !== null &&
		SCHEMATIC_NAME in value &&
		value[SCHEMATIC_NAME] === true
	);
}
