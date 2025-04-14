import type {Schematic} from './model';

export function isDateLike(value: unknown): value is Date {
	if (value instanceof Date) {
		return true;
	}

	if (typeof value === 'number') {
		return value >= -8_640e12 && value <= 8_640e12;
	}

	return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function isSchematic(value: unknown): value is Schematic<never> {
	return (
		typeof value === 'object' &&
		value !== null &&
		'$schematic' in value &&
		value.$schematic === true
	);
}
