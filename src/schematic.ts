import type {PlainObject} from '@oscarpalmer/atoms/models';
import {SCHEMATIC_NAME} from './constants';
import type {Infer, Schema, TypedSchema, ValidatedSchema} from './models';
import {getSchema} from './validation/schema.validation';
import {validateValue} from './validation/value.validation';

/**
 * A schematic for validating objects
 */
export class Schematic<Model> {
	declare private readonly $schematic: true;

	#schema: ValidatedSchema;

	get enabled(): boolean {
		return this.#schema.enabled;
	}

	constructor(schema: Model) {
		Object.defineProperty(this, SCHEMATIC_NAME, {
			value: true,
		});

		this.#schema = getSchema(schema);

		this.#schema.enabled = this.#schema.keys.array.length > 0;
	}

	/**
	 * Does the value match the schema?
	 */
	is(value: unknown): value is Model {
		return this.#schema.enabled && validateValue(this.#schema, value);
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
	return new Schematic<Model>(schema);
}
