// ###################
// Works out a calculator line with mathjs, without eval
// Only + − × ÷ %, mod, √ ² ^, π ℯ, brackets and numbers are allowed; anything else gives null
// ###################

import {
	create,
	parseDependencies,
	addDependencies,
	subtractDependencies,
	multiplyDependencies,
	divideDependencies,
	unaryMinusDependencies,
	unaryPlusDependencies,
	sqrtDependencies,
	powDependencies,
	modDependencies,
	piDependencies,
	eDependencies
} from "mathjs";

// ###################
// A small mathjs: only the parts Orbit needs, numbers as exact decimals (0.1 + 0.2 = 0.3)
// ###################
const math = create(
	{
		parseDependencies,
		addDependencies,
		subtractDependencies,
		multiplyDependencies,
		divideDependencies,
		unaryMinusDependencies,
		unaryPlusDependencies,
		sqrtDependencies,
		powDependencies,
		modDependencies,
		piDependencies,
		eDependencies
	},
	{ number: "BigNumber", precision: 64 }
);

// ###################
// Percent: mathjs's own % rule breaks on 200 + 10% + 10% (it reads 10 % (+10 / 100), a remainder),
// so % is sent to mathjs as ! (only ever a postfix there), and work() does the percent itself:
//   50% → 0.5        200 × 10% → 20        200 + 10% → 220        80 − 25% → 60
// A typed ! is refused first, so it never means factorial
// ###################
// ###################
// Scientific keys, as mathjs reads them:
//   π ℯ → (pi) (e): in brackets, so 2π is 2(pi), and 2ℯ+3 never reads as the number 2e+3
//   ² → ^2        √ → sqrt(…) around the number, constant, bracket or √ right after it
//   ⊘ (the mod key, one symbol in the line) → mod
// ###################
export const MOD = "⊘";
const NUMBER = /^[0-9.]+/;

// where the thing √ applies to ends: a number, a bracket (to its partner), or sqrt(…); -1 when nothing
const operandEnd = (text, i) => {
	const open = text.startsWith("sqrt(", i) ? i + 4 : text[i] === "(" ? i : -1;
	if (open >= 0) {
		for (let depth = 0, j = open; j < text.length; j++) {
			if (text[j] === "(") depth++;
			if (text[j] === ")" && --depth === 0) return j + 1;
		}
		return text.length;   // not closed yet: up to the end
	}
	const number = text.slice(i).match(NUMBER);
	return number ? i + number[0].length : -1;
};

// the last √ first, so √√16 becomes sqrt(sqrt(16))
const roots = (text) => {
	for (let at = text.lastIndexOf("√"); at >= 0; at = text.lastIndexOf("√")) {
		const end = operandEnd(text, at + 1);
		if (end < 0) return null;   // √ with nothing after it
		text = `${text.slice(0, at)}sqrt(${text.slice(at + 1, end)})${text.slice(end)}`;
	}
	return text;
};

const normalize = (line) =>
	roots(
		line
			.replace(/×/g, "*")
			.replace(/÷/g, "/")
			.replace(/−/g, "-")
			.replace(/%/g, "!")
			.replace(/²/g, "^2")
			.replace(/π/g, "(pi)")
			.replace(/ℯ/g, "(e)")
			.replace(/⊘/g, " mod ")
			.trim()
	);

const HUNDRED = 100;
const isPercent = (node) => node.type === "OperatorNode" && node.fn === "factorial";

const OPERATORS = {
	add: math.add,
	subtract: math.subtract,
	multiply: math.multiply,
	divide: math.divide,
	unaryMinus: math.unaryMinus,
	unaryPlus: math.unaryPlus,
	pow: math.pow,
	// 7 mod 0 has no answer, like 7 ÷ 0
	mod: (a, b) => (b.isZero() ? math.divide(a, 0) : math.mod(a, b))
};
const CONSTANTS = { pi: math.pi, e: math.e };

// what may follow a number with no × between: 2(3), 2π, 3√4, 2π², 2(3)²
const joins = (node) =>
	node.type === "ParenthesisNode" || node.type === "FunctionNode" || (node.type === "OperatorNode" && node.fn === "pow" && joins(node.args[0]));

// a real number, or the line has no answer (√−4 and (−8)^(1/3) give complex numbers)
const real = (value) => {
	if (!math.isBigNumber(value)) throw new Error("not a real number");
	return value;
};

// ###################
// Walk the parsed line; a node that isn't a number, a bracket or an allowed operator stops it
// ###################
const work = (node) => {
	if (node.type === "ConstantNode" && math.isBigNumber(node.value)) return node.value;
	if (node.type === "ParenthesisNode") return work(node.content);
	if (node.type === "SymbolNode" && CONSTANTS[node.name]) return CONSTANTS[node.name];
	if (node.type === "FunctionNode" && node.fn.name === "sqrt" && node.args.length === 1) return real(math.sqrt(work(node.args[0])));
	if (node.type !== "OperatorNode") throw new Error(`not allowed: ${node.type}`);

	const [left, right] = node.args;
	// a ± b%: b percent of a
	if ((node.fn === "add" || node.fn === "subtract") && isPercent(right)) {
		const base = work(left);
		const part = math.divide(math.multiply(base, work(right.args[0])), HUNDRED);
		return OPERATORS[node.fn](base, part);
	}
	// b% anywhere else: b / 100
	if (isPercent(node)) return math.divide(work(left), HUNDRED);
	// 2 3 and 7 % 3 parse as an implicit ×; only 2(3), 2π, 3√4 and the like are meant
	if (node.implicit && !joins(right)) throw new Error("not allowed: implicit ×");
	if (OPERATORS[node.fn]) return real(OPERATORS[node.fn](...node.args.map(work)));
	throw new Error(`not allowed: ${node.fn}`);
};

// ###################
// The result as text ("0.3", "-12", "1.5e+21"), or null when the line isn't finished or isn't allowed
// decimals "auto": 15 significant digits, so 1 ÷ 3 shows 0.333333333333333
// decimals 0–10: rounded to that many places, zeros kept (10 ÷ 4 with 2 → 2.50)
// ###################
export const calc = (line, { decimals = "auto" } = {}) => {
	const raw = String(line ?? "");
	// a typed ! or letters (pi, sqrt) are refused: the keys write π and √; only 1.5e+21 keeps its e
	if (raw.includes("!") || /[a-z]/i.test(raw.replace(/(?<=[0-9.])e[+−-]?(?=[0-9])/g, ""))) return null;
	const text = normalize(raw);
	if (!text) return null;   // empty, or √ with nothing after it
	try {
		const value = work(math.parse(text));
		if (!value.isFinite()) return null;   // 1 ÷ 0
		const out = Number.isInteger(decimals) ? value.toFixed(decimals) : value.toSignificantDigits(15).toString();
		return out.replace(/^-(0(\.0*)?)$/, "$1");   // -0, -0.00 → 0, 0.00
	} catch {
		return null;
	}
};
