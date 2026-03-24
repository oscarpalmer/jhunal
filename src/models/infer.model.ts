import type {Constructor, Simplify} from '@oscarpalmer/atoms/models';
import type {Schematic} from '../schematic';
import type {IsOptionalProperty, ValueName, Values} from './misc.model';
import type {PlainSchema, Schema, SchemaProperty} from './schema.plain.model';

/**
 * Infers the TypeScript type from a {@link Schema} definition
 *
 * @template Model Schema to infer types from
 *
 * @example
 * ```ts
 * const userSchema = {
 *   name: 'string',
 *   age: 'number',
 *   address: { $required: false, $type: 'string' },
 * } satisfies Schema;
 *
 * type User = Infer<typeof userSchema>;
 * // { name: string; age: number; address?: string }
 * ```
 */
export type Infer<Model extends Schema> = Simplify<
	{
		[Key in InferRequiredKeys<Model>]: InferSchemaEntry<Model[Key]>;
	} & {
		[Key in InferOptionalKeys<Model>]?: InferSchemaEntry<Model[Key]>;
	}
>;

/**
 * Extracts keys from a {@link Schema} whose entries are optional _(i.e., `$required` is `false`)_
 *
 * @template Model - {@link Schema} to extract optional keys from
 */
export type InferOptionalKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? Key : never]: never;
};

/**
 * Infers the TypeScript type from a {@link SchemaProperty}'s `$type` field
 *
 * @template Value `$type` value _(single or array)_
 */
export type InferPropertyType<Value> = Value extends (infer Item)[]
	? InferPropertyValue<Item>
	: InferPropertyValue<Value>;

/**
 * Maps a single `$type` definition to its TypeScript equivalent
 *
 * Resolves, in order: {@link Constructor} instances, {@link Schematic} models, {@link ValueName} strings, and nested {@link PlainSchema} objects
 *
 * @template Value single type definition
 */
export type InferPropertyValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schematic<infer Model>
			? Model
			: Value extends ValueName
				? Values[Value & ValueName]
				: Value extends Schema
					? Infer<Value>
					: never;

/**
 * Extracts keys from a {@link Schema} whose entries are required _(i.e., `$required` is not `false`)_
 *
 * @template Model Schema to extract required keys from
 */
export type InferRequiredKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? never : Key]: never;
};

/**
 * Infers the TypeScript type from a top-level {@link Schema} entry
 *
 * @template Value Schema entry value _(single or array)_
 */
export type InferSchemaEntry<Value> = Value extends (infer Item)[]
	? InferSchemaEntryValue<Item>
	: InferSchemaEntryValue<Value>;

/**
 * Maps a single top-level schema entry to its TypeScript type
 *
 * Resolves, in order: {@link Constructor} instances, {@link Schematic} models, {@link SchemaProperty} objects, {@link PlainSchema} objects, and {@link ValueName} strings
 *
 * @template Value single schema entry
 */
export type InferSchemaEntryValue<Value> =
	Value extends Constructor<infer Instance>
		? Instance
		: Value extends Schematic<infer Model>
			? Model
			: Value extends SchemaProperty
				? InferPropertyType<Value['$type']>
				: Value extends PlainSchema
					? Infer<Value & Schema>
					: Value extends ValueName
						? Values[Value & ValueName]
						: Value extends Schema
							? Infer<Value>
							: never;
