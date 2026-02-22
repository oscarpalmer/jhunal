import type {PlainObject} from '@oscarpalmer/atoms/models';
import {smush} from '@oscarpalmer/atoms/value';
import {
	EXPRESSION_HAS_NUMBER,
	EXPRESSION_INDEX,
	EXPRESSION_PROPERTY,
	PROPERTY_REQUIRED,
	PROPERTY_TYPE,
	TYPE_ALL,
	TYPE_OBJECT,
	TYPE_UNDEFINED,
} from '../constants';
import {isConstructor, isInstance, isSchematic} from '../is';
import type {Schema, ValidatedPropertyType, ValidatedSchema} from '../models';

function addPropertyType(
	to: ValidatedSchema,
	key: string,
	values: ValidatedPropertyType[],
	required: boolean,
): void {
	if (to.keys.set.has(key)) {
		const property = to.properties[key];

		for (const type of values) {
			if (!property.types.includes(type)) {
				property.types.push(type);
			}
		}
	} else {
		to.keys.array.push(key);
		to.keys.set.add(key);

		to.properties[key] = {
			required,
			types: values,
		};
	}

	if (!required && !to.properties[key].types.includes(TYPE_UNDEFINED)) {
		to.properties[key].types.push(TYPE_UNDEFINED);
	}
}

export function getSchema(schema: unknown): ValidatedSchema {
	const validated: ValidatedSchema = {
		enabled: false,
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
		const typeOfType = typeof type;

		if (isSchematic(type) || (typeOfType === 'string' && TYPE_ALL.has(type as never))) {
			propertyTypes.push(type as never);

			continue;
		}

		if (typeOfType === 'function') {
			propertyTypes.push(isConstructor(type) ? isInstance(type) : type);

			continue;
		}

		if (typeOfType !== 'object' || type === null) {
			continue;
		}

		if (PROPERTY_TYPE in type) {
			propertyTypes.push(...getTypes(type[PROPERTY_TYPE], validated, prefix));

			continue;
		}

		addPropertyType(validated, prefix, [TYPE_OBJECT], type[PROPERTY_REQUIRED] !== false);

		propertyTypes.push(TYPE_OBJECT);

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

		if (EXPRESSION_PROPERTY.test(key)) {
			continue;
		}

		if (EXPRESSION_HAS_NUMBER.test(key) && arrayKeys.has(key.replace(EXPRESSION_INDEX, ''))) {
			continue;
		}

		let required = true;

		if (typeof value === 'object' && value !== null && PROPERTY_REQUIRED in value) {
			required = typeof value[PROPERTY_REQUIRED] === 'boolean' ? value[PROPERTY_REQUIRED] : true;
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
