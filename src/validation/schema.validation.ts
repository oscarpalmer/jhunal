import type {PlainObject} from '@oscarpalmer/atoms/models';
import {smush} from '@oscarpalmer/atoms/value';
import {isSchematic} from '../is';
import type {Schema, ValidatedPropertyType, ValidatedSchema, Values} from '../model';

function addPropertyType(
	to: ValidatedSchema,
	key: string,
	values: ValidatedPropertyType[],
	required: boolean,
): void {
	if (to.keys.set.has(key)) {
		const property = to.properties[key];

		property.types.push(...values);
	} else {
		to.keys.array.push(key);
		to.keys.set.add(key);

		to.properties[key] = {
			required,
			types: values,
		};
	}

	if (!required && !to.properties[key].types.includes('undefined')) {
		to.properties[key].types.push('undefined');
	}
}

function getTypes(
	value: unknown,
	validated: ValidatedSchema,
	prefix: string,
): ValidatedPropertyType[] {
	const propertyTypes: ValidatedPropertyType[] = [];

	const values = Array.isArray(value) ? value : [value];
	const {length} = values;

	for (let index = 0; index < length; index += 1) {
		const type = values[index];

		if (isSchematic(type) || (typeof type === 'string' && types.has(type as never))) {
			propertyTypes.push(type as never);

			continue;
		}

		if (typeof type !== 'object' || type === null) {
			continue;
		}

		if ('$type' in type) {
			propertyTypes.push(...getTypes(type.$type, validated, prefix));

			continue;
		}

		addPropertyType(
			validated,
			prefix,
			['object'],
			typeof type.$required === 'boolean' ? type.$required : true,
		);

		propertyTypes.push('object');

		getValidatedSchema(type as Schema, validated, prefix);
	}

	return propertyTypes;
}

function getValidatedSchema(
	schema: Schema,
	validated: ValidatedSchema,
	prefix?: string,
): ValidatedSchema {
	const smushed = smush(schema as PlainObject);
	const keys = Object.keys(smushed);
	const {length} = keys;

	const arrayKeys = new Set<string>();
	const noPrefix = prefix == null;

	prefix = noPrefix ? '' : `${prefix}.`;

	for (let index = 0; index < length; index += 1) {
		const key = keys[index];
		const value = smushed[key];

		if (Array.isArray(value)) {
			arrayKeys.add(key);
		}

		if (/\.\$(required|type)(\.|$)/.test(key)) {
			continue;
		}

		if (/\d+/.test(key) && arrayKeys.has(key.replace(/\.\d+$/, ''))) {
			continue;
		}

		let required = true;

		if (typeof value === 'object' && value !== null && '$required' in value) {
			required = typeof value.$required === 'boolean' ? value.$required : true;
		}

		const prefixedKey = `${prefix}${key}`;

		const types = getTypes(value, validated, prefixedKey);

		if (types.length > 0) {
			addPropertyType(validated, prefixedKey, types, required);
		}
	}

	if (noPrefix) {
		validated.keys.array.sort();
	}

	return validated;
}

export function validateSchema(schema: unknown): ValidatedSchema {
	const validated: ValidatedSchema = {
		keys: {
			array: [],
			set: new Set<string>(),
		},
		properties: {},
	};

	return typeof schema === 'object' && schema !== null
		? getValidatedSchema(schema as Schema, validated)
		: validated;
}

//

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
