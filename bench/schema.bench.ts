import {bench, describe} from 'vitest';
import {schema, type Schematic} from '../src';

class Item {}

const benchOptions = {};

const schematic = {
	array: 'array',
	boolean: 'boolean',
	date: 'date',
	instance: Item,
	nested: {
		message: 'string',
		count: 'number',
	},
	number: 'number',
	optional: {
		$required: false,
		$type: 'string',
	},
	string: 'string',
} satisfies Schematic;

const instance = schema(schematic);

const valid = {
	array: [1, 2, 3],
	boolean: true,
	date: new Date(),
	instance: new Item(),
	nested: {
		message: 'hello',
		count: 42,
	},
	number: 1,
	optional: 'present',
	string: 'world',
};

const invalid = {
	array: 'not an array',
	boolean: 123,
	date: 'not a date',
	instance: {},
	nested: {
		message: 456,
		count: 'not a number',
	},
	number: true,
	string: null,
};

const validWithExtra = {
	...valid,
	extra: 'unexpected',
	nested: {
		...valid.nested,
		surprise: true,
	},
};

// #region get

describe('get: none', () => {
	bench('valid', () => {
		instance.get(valid);
	}, benchOptions);

	bench('invalid', () => {
		instance.get(invalid);
	}, benchOptions);

	bench('valid, clone: false', () => {
		instance.get(valid, {clone: false});
	}, benchOptions);

	bench('valid, strict', () => {
		instance.get(validWithExtra, true);
	}, benchOptions);

	bench('valid, strict (options)', () => {
		instance.get(validWithExtra, {strict: true});
	}, benchOptions);
});

describe('get: first', () => {
	bench('valid', () => {
		instance.get(valid, 'first');
	}, benchOptions);

	bench('invalid', () => {
		instance.get(invalid, 'first');
	}, benchOptions);

	bench('valid (options)', () => {
		instance.get(valid, {errors: 'first'});
	}, benchOptions);

	bench('invalid (options)', () => {
		instance.get(invalid, {errors: 'first'});
	}, benchOptions);
});

describe('get: all', () => {
	bench('valid', () => {
		instance.get(valid, 'all');
	}, benchOptions);

	bench('invalid', () => {
		instance.get(invalid, 'all');
	}, benchOptions);

	bench('valid (options)', () => {
		instance.get(valid, {errors: 'all'});
	}, benchOptions);

	bench('invalid (options)', () => {
		instance.get(invalid, {errors: 'all'});
	}, benchOptions);
});

describe('get: throw', () => {
	bench('valid', () => {
		instance.get(valid, 'throw');
	}, benchOptions);

	bench('invalid', () => {
		try {
			instance.get(invalid, 'throw');
		} catch {}
	}, benchOptions);

	bench('valid (options)', () => {
		instance.get(valid, {errors: 'throw'});
	}, benchOptions);

	bench('invalid (options)', () => {
		try {
			instance.get(invalid, {errors: 'throw'});
		} catch {}
	}, benchOptions);
});

// #endregion

// #region is

describe('is: none', () => {
	bench('valid', () => {
		instance.is(valid);
	}, benchOptions);

	bench('invalid', () => {
		instance.is(invalid);
	}, benchOptions);

	bench('valid, strict', () => {
		instance.is(validWithExtra, true);
	}, benchOptions);

	bench('valid, strict (options)', () => {
		instance.is(validWithExtra, {strict: true});
	}, benchOptions);
});

describe('is: first', () => {
	bench('valid', () => {
		instance.is(valid, 'first');
	}, benchOptions);

	bench('invalid', () => {
		instance.is(invalid, 'first');
	}, benchOptions);

	bench('valid (options)', () => {
		instance.is(valid, {errors: 'first'});
	}, benchOptions);

	bench('invalid (options)', () => {
		instance.is(invalid, {errors: 'first'});
	}, benchOptions);
});

describe('is: all', () => {
	bench('valid', () => {
		instance.is(valid, 'all');
	}, benchOptions);

	bench('invalid', () => {
		instance.is(invalid, 'all');
	}, benchOptions);

	bench('valid (options)', () => {
		instance.is(valid, {errors: 'all'});
	}, benchOptions);

	bench('invalid (options)', () => {
		instance.is(invalid, {errors: 'all'});
	}, benchOptions);
});

describe('is: throw', () => {
	bench('valid', () => {
		void instance.is(valid, 'throw');
	}, benchOptions);

	bench('invalid', () => {
		try {
			void instance.is(invalid, 'throw');
		} catch {}
	}, benchOptions);

	bench('valid (options)', () => {
		void instance.is(valid, {errors: 'throw'});
	}, benchOptions);

	bench('invalid (options)', () => {
		try {
			void instance.is(invalid, {errors: 'throw'});
		} catch {}
	}, benchOptions);
});

// #endregion
