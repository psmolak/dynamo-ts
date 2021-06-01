export type RangeOperator = 'between';
export type ArrayOperator = 'in';
export type SingleOperator = '=' | '<=' | '<' | '>=' | '>' | 'begins_with';
export type Operator = SingleOperator | RangeOperator | ArrayOperator;
export const rangeOperatorValues: Operator[] = ['between'];
export const arrayOperatorValues: Operator[] = ['in'];
export const singleOperatorValues: Operator[] = ['=', '<=', '<', '>=', '>', 'begins_with'];

export type SingleComparison<T, U extends T[keyof T]> = [SingleOperator, U];
export type RangeComparison<T, U extends T[keyof T]> = [RangeOperator, U, U];
export type ArrayComparison<T, U extends T[keyof T]> = [ArrayOperator, U[]];

export type RangeCompareExpression<T> = {
    key: Extract<keyof T, string>,
    comparison: RangeComparison<T, T[keyof T]>;
};
export type SingleCompareExpression<T> = {
    key: Extract<keyof T, string>,
    comparison: SingleComparison<T, T[keyof T]>;
};
export type ArrayCompareExpression<T> = {
    key: Extract<keyof T, string>,
    comparison: ArrayComparison<T, T[keyof T]>;
};

export type AndCompareExpression<T> = AndGroup<SimpleExpression<T>>;
export type OrCompareExpression<T> = OrGroup<SimpleExpression<T>>;
export type KeyExpression<T> = RangeCompareExpression<T> | SingleCompareExpression<T>;
export type FilterExpression<T> = RangeCompareExpression<T> | SingleCompareExpression<T> | ArrayCompareExpression<T>;
export type SimpleExpression<T> = RangeCompareExpression<T> | SingleCompareExpression<T> | ArrayCompareExpression<T>;


type ExpressionInfoTag = { tag: 'single' | 'range' | 'array'; };

type id = string;
type ID<T> = [id, T[keyof T]];
type SingleIdValues<T> = ID<T>;
type RangeIdValues<T> = [ID<T>, ID<T>];
type ArrayIdValues<T> = ID<T>[];
type IdValues<T> = SingleIdValues<T> | RangeIdValues<T> | ArrayIdValues<T>;


export type Condition<T> = ExpressionInfoTag & {
    key: Extract<keyof T, string>,
    operator: Operator,
    idValueKeys: IdValues<T>;
};
export type RangeConditionExpressionInfo<T> = ExpressionInfoTag & {
    key: Extract<keyof T, string>,
    tag: 'range',
    operator: RangeOperator,
    idValueKeys: RangeIdValues<T>;
};
export type SingleConditionExpressionInfo<T> = ExpressionInfoTag & {
    key: Extract<keyof T, string>,
    tag: 'single',
    operator: SingleOperator,
    idValueKeys: SingleIdValues<T>;
};
export type ArrayConditionExpressionInfo<T> = ExpressionInfoTag & {
    key: Extract<keyof T, string>,
    tag: 'array',
    operator: ArrayOperator,
    idValueKeys: ArrayIdValues<T>;
};

export type KeyConditionExpressionInfo<T> = SingleConditionExpressionInfo<T> | RangeConditionExpressionInfo<T>;
export type FilterConditionExpressionInfo<T> = SingleConditionExpressionInfo<T> | RangeConditionExpressionInfo<T> | ArrayConditionExpressionInfo<T>;
export type SimpleConditionExpressionInfo<T> = SingleConditionExpressionInfo<T> | RangeConditionExpressionInfo<T> | ArrayConditionExpressionInfo<T>;

export type AndGroup<T> = {
    $and: ConditionMap<T>[];
};

export type OrGroup<T> = {
    $or: ConditionMap<T>[];
};

export type ConditionGroup<T> = AndGroup<T> | OrGroup<T>;

export type ConditionMap<T> = T | ConditionGroup<T>;

export type Conditions<T> = ConditionMap<SimpleExpression<T>>;
export type ExpressionInfo<T> = ConditionMap<SimpleConditionExpressionInfo<T>>;
export type KeyConditions<T> = KeyExpression<T> | AndGroup<KeyExpression<T>>;
export type KeyExpressionInfo<T> = KeyConditionExpressionInfo<T> | AndGroup<KeyConditionExpressionInfo<T>>;