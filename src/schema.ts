import {isPlainObject} from '@oscarpalmer/atoms/is';
import type {PlainObject} from '@oscarpalmer/atoms/models';
import {PROPERTY_SCHEMA, SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE} from './constants';
import {getObjectHandler} from './handler/object.handler';
import {isSchema} from './helpers/misc.helper';
import {getResult, isResult} from './helpers/result.helper';
import type {Infer} from './models/infer.model';
import type {Schema} from './models/schema.model';
import type {Schematic} from './models/schematic.plain.model';
import type {TypedSchematic} from './models/schematic.typed.model';
import {SchematicError, type ValidationHandler} from './models/validation.model';

/**
 * Create a schema from a schematic
 * @template Model Schema type
 * @param schema Schematic to create the schema from
 * @throws Throws {@link SchematicError} if the schematic can not be converted into a schema
 * @returns A schema for the given schematic
 */
export function schema<Model extends Schematic>(schema: Model): Schema<Infer<Model>>;

/**
 * Create a schema from a typed schematic
 * @template Model Existing type
 * @param schema Typed schematic to create the schema from
 * @throws Throws {@link SchematicError} if the schematic can not be converted into a schema
 * @returns A schema for the given typed schematic
 */
export function schema<Model extends PlainObject>(schema: TypedSchematic<Model>): Schema<Model>;

export function schema(input: unknown): unknown {
	if (isSchema(input)) {
		return input;
	}

	if (!isPlainObject(input)) {
		throw new SchematicError(SCHEMATIC_MESSAGE_SCHEMA_INVALID_TYPE);
	}

	const handler = getObjectHandler(input);

	const instance = {
		get: (value: unknown, options?: unknown) => getResult(handler, value, options),
		is: (value: unknown, options?: unknown) => isResult(handler, value, options),
	};

	Object.defineProperty(instance, PROPERTY_SCHEMA, {
		value: true,
	});

	schemaHandlers.set(instance as Schema<unknown>, handler);

	return Object.freeze(instance);
}

export const schemaHandlers = new WeakMap<Schema<unknown>, ValidationHandler>();
