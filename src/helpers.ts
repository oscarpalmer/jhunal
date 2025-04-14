import {isSchematic} from './is';
import type {ValidatedPropertyType, Values} from './model';
import {validateSchema} from './validation/schema.validation';

export function getTypes(value: unknown): ValidatedPropertyType[] {
	const returned: ValidatedPropertyType[] = [];
	const values = Array.isArray(value) ? value : [value];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const type = values[index];

		switch (true) {
			case isSchematic(type):
				returned.push(type);
				break;

			case typeof type === 'string' && types.has(type as never):
				returned.push(type as never);
				break;

			case typeof type === 'object' && type !== null: {
				returned.push(validateSchema(type));
				break;
			}

			default:
				break;
		}
	}

	return returned;
}

const types = new Set<keyof Values>([
	'array',
	'bigint',
	'boolean',
	'date',
	'date-like',
	'function',
	'null',
	'number',
	'numerical',
	'object',
	'string',
	'symbol',
	'undefined',
]);
