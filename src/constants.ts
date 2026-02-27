import type {ValueName} from './models';

export const ERROR_NAME = 'SchematicError';

export const EXPRESSION_INDEX = /\.\d+$/;

export const EXPRESSION_KEY_PREFIX = /\.\w+$/;

export const EXPRESSION_KEY_VALUE = /^.*\.(\w+)$/;

export const EXPRESSION_PROPERTY = /(^|\.)\$(required|type|validators)(\.|$)/;

export const MESSAGE_CONSTRUCTOR = 'Expected a constructor function';

export const MESSAGE_SCHEMA_INVALID_EMPTY = 'Schema must have at least one property';

export const MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_DISALLOWED =
	"'<>.$required' property is not allowed for schemas in $type";

export const MESSAGE_SCHEMA_INVALID_PROPERTY_REQUIRED_TYPE =
	"'<>.$required' property must be a boolean";

export const MESSAGE_SCHEMA_INVALID_PROPERTY_TYPE = "'<>' property must be of a valid type";

export const MESSAGE_SCHEMA_INVALID_TYPE = 'Schema must be an object';

export const MESSAGE_VALIDATOR_INVALID_KEY = "Validator '<>' does not exist";

export const MESSAGE_VALIDATOR_INVALID_TYPE = 'Validators must be an object';

export const MESSAGE_VALIDATOR_INVALID_VALUE =
	"Validator '<>' must be a function or an array of functions";

export const PROPERTY_REQUIRED = '$required';

export const PROPERTY_TYPE = '$type';

export const PROPERTY_VALIDATORS = '$validators';

export const SCHEMATIC_NAME = '$schematic';

export const TEMPLATE_PATTERN = '<>';

export const TYPE_OBJECT = 'object';

export const TYPE_UNDEFINED = 'undefined';

export const VALIDATABLE_TYPES = new Set<ValueName>([
	'array',
	'bigint',
	'boolean',
	'date',
	'function',
	'number',
	'string',
	'symbol',
	TYPE_OBJECT,
]);

export const TYPE_ALL = new Set<ValueName>([...VALIDATABLE_TYPES, 'null', TYPE_UNDEFINED]);
