import type {PlainObject, Simplify} from '@oscarpalmer/atoms/models';
import type {Schematic} from './schematic';

/**
 * Infer the TypeScript type from a schema definition
 */
export type Infer<Model extends Schema> = Simplify<
	{
		[Key in InferRequiredKeys<Model>]: Model[Key] extends Schematic<infer SchematicModel>
			? SchematicModel
			: Model[Key] extends SchemaProperty
				? InferPropertyValue<Model[Key]>
				: InferEntryValue<Model[Key]>;
	} & {
		[Key in InferOptionalKeys<Model>]?: Model[Key] extends Schematic<infer SchematicModel>
			? SchematicModel
			: Model[Key] extends SchemaProperty
				? InferPropertyValue<Model[Key]>
				: never;
	}
>;

type InferEntryValue<Value> = Value extends ValueName
	? Values[Value]
	: Value extends ValueName[]
		? Values[Value[number]]
		: never;

type InferOptionalKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? Key : never]: never;
};

type InferPropertyType<Value> = Value extends (infer Item)[]
	? InferTypeValue<Item>[]
	: InferTypeValue<Value>;

type InferPropertyValue<Prop> = Prop extends SchemaProperty
	? InferPropertyType<Prop['$type']>
	: never;

type InferRequiredKeys<Model extends Schema> = keyof {
	[Key in keyof Model as IsOptionalProperty<Model[Key]> extends true ? never : Key]: never;
};

type InferTypeValue<Value> = Value extends SchemaPropertyType
	? Value extends Schema
		? Infer<Value>
		: Value extends Schematic<infer Model>
			? Model
			: Value extends ValueName
				? Values[Value]
				: Value extends (infer Nested)[]
					? InferTypeValue<Nested>[]
					: Value
	: never;

type IsOptionalProperty<Value> = Value extends SchemaProperty
	? Value['$required'] extends false
		? true
		: false
	: false;

type LastOfUnion<Value> =
	UnionToIntersection<Value extends unknown ? () => Value : never> extends () => infer Item
		? Item
		: never;

/**
 * A nested schema with optional requirement flag
 */
export type NestedSchema = {
	$required?: boolean;
} & Schema;

type OptionalKeys<Value> = {
	[Key in keyof Value]-?: {} extends Pick<Value, Key> ? Key : never;
}[keyof Value];

type RequiredKeys<Value> = Exclude<keyof Value, OptionalKeys<Value>>;

/**
 * A schema for validating objects
 */
export type Schema = SchemaIndex;

type SchemaEntry = NestedSchema | SchemaProperty | Schematic<unknown> | ValueName | ValueName[];

interface SchemaIndex {
	[key: string]: SchemaEntry;
}

/**
 * A property definition with explicit type(s) and optional requirement flag
 */
export type SchemaProperty = {
	$required?: boolean;
	$type: SchemaPropertyType | SchemaPropertyType[];
};

type SchemaPropertyType = Schema | Schematic<unknown> | ValueName;

type ToSchemaPropertyType<Value> = UnwrapSingle<UnionToTuple<ToSchemaPropertyTypeEach<Value>>>;

type ToSchemaPropertyTypeEach<Value> = Value extends PlainObject
	? TypedSchema<Value>
	: ToValueName<Value>;

type ToSchemaType<Value> = UnwrapSingle<UnionToTuple<ToValueName<Value>>>;

type ToValueName<Value> = {
	[Key in Exclude<ValueName, ValueNameFallbacks>]: Value extends Values[Key] ? Key : never;
}[Exclude<ValueName, ValueNameFallbacks>] extends infer Specific
	? Specific extends never
		? {[Key in ValueNameFallbacks]: Value extends Values[Key] ? Key : never}[ValueNameFallbacks]
		: Specific
	: never;

export type TypedPropertyOptional<Value> = {
	$required: false;
	$type: ToSchemaPropertyType<Value>;
};

export type TypedPropertyRequired<Value> = {
	$required?: true;
	$type: ToSchemaPropertyType<Value>;
};

/**
 * Create a schema type constrained to match a TypeScript type
 */
export type TypedSchema<Model extends PlainObject> = Simplify<
	{
		[Key in RequiredKeys<Model>]: Model[Key] extends PlainObject
			? TypedSchemaRequired<Model[Key]>
			: ToSchemaType<Model[Key]> | TypedPropertyRequired<Model[Key]>;
	} & {
		[Key in OptionalKeys<Model>]: Exclude<Model[Key], undefined> extends PlainObject
			? TypedSchemaOptional<Exclude<Model[Key], undefined>>
			: TypedPropertyOptional<Model[Key]>;
	}
>;

type TypedSchemaOptional<Model extends PlainObject> = {
	$required: false;
} & TypedSchema<Model>;

type TypedSchemaRequired<Model extends PlainObject> = {
	$required?: boolean;
} & TypedSchema<Model>;

type UnionToIntersection<Value> = (Value extends unknown ? (x: Value) => void : never) extends (
	x: infer Item,
) => void
	? Item
	: never;

type UnionToTuple<Value, Items extends unknown[] = []> = [Value] extends [never]
	? Items
	: UnionToTuple<Exclude<Value, LastOfUnion<Value>>, [LastOfUnion<Value>, ...Items]>;

type UnwrapSingle<Value extends unknown[]> = Value extends [infer Only] ? Only : Value;

export type ValidatedProperty = {
	required: boolean;
	types: ValidatedPropertyType[];
};

export type ValidatedPropertyType = Schematic<unknown> | ValueName;

export type ValidatedSchema = {
	keys: {
		array: string[];
		set: Set<string>;
	};
	properties: Record<string, ValidatedProperty>;
};

/**
 * Valid type name strings
 */
export type ValueName = keyof Values;

type ValueNameFallbacks = 'date-like' | 'numerical';

/**
 * Map of type names to their TypeScript/validatable equivalents
 */
export type Values = {
	array: unknown[];
	bigint: bigint;
	boolean: boolean;
	date: Date;
	'date-like': number | string | Date;
	function: Function;
	null: null;
	number: number;
	numerical: bigint | number;
	object: object;
	string: string;
	symbol: symbol;
	undefined: undefined;
};
