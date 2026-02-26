import {isConstructor} from '@oscarpalmer/atoms/is';
import {MESSAGE_CONSTRUCTOR, SCHEMATIC_NAME} from './constants';
import type {Constructor} from './models';
import type {Schematic} from './schematic';

export function instanceOf<Instance>(
	constructor: Constructor<Instance>,
): (value: unknown) => value is Instance {
	if (!isConstructor(constructor)) {
		throw new TypeError(MESSAGE_CONSTRUCTOR);
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
