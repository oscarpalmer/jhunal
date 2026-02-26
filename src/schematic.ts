import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {MESSAGE_SCHEMA_INVALID_TYPE, SCHEMATIC_NAME} from './constants';
import {isSchematic} from './is';
import {
	SchematicError,
	type Infer,
	type Schema,
	type TypedSchema,
	type ValidatedProperty,
} from './models';
import {getProperties} from './validation/property.validation';
import {validateObject} from './validation/value.validation';

/**
 * A schematic for validating objects
 */
export class Schematic<Model> {
	declare private readonly $schematic: true;

	#properties: ValidatedProperty[];

	constructor(properties: ValidatedProperty[]) {
		Object.defineProperty(this, SCHEMATIC_NAME, {
			value: true,
		});

		this.#properties = properties;
	}

	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model {
		return validateObject(value, this.#properties);
	}
}

/**
 * Create a schematic from a schema
 */
export function schematic<Model extends Schema>(schema: Model): Schematic<Infer<Model>>;

/**
 * Create a schematic from a typed schema
 */
export function schematic<Model extends PlainObject>(schema: TypedSchema<Model>): Schematic<Model>;

export function schematic<Model extends Schema>(schema: Model): Schematic<Model> {
	if (isSchematic(schema)) {
		return schema;
	}

	if (!isPlainObject(schema)) {
		throw new SchematicError(MESSAGE_SCHEMA_INVALID_TYPE);
	}

	return new Schematic<Model>(getProperties(schema));
}
