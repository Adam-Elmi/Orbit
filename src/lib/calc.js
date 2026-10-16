// ###################
// Works out a calculator line with mathjs, without eval
// Only + − × ÷ %, brackets and numbers are allowed; anything else gives null
// ###################

import {
	create,
	parseDependencies,
	addDependencies,
	subtractDependencies,
	multiplyDependencies,
	divideDependencies,
	unaryMinusDependencies,
	unaryPlusDependencies
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
		unaryPlusDependencies
	},
	{ number: "BigNumber", precision: 64 }
);

// ###################
// Percent: mathjs's own % rule breaks on 200 + 10% + 10% (it reads 10 % (+10 / 100), a remainder),
// so % is sent to mathjs as ! (only ever a postfix there), and work() does the percent itself:
//   50% → 0.5        200 × 10% → 20        200 + 10% → 220        80 − 25% → 60
// A typed ! is refused first, so it never means factorial
// ###################
const normalize = (line) => line.replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/%/g, "!").trim();

const HUNDRED = 100;
const isPercent = (node) => node.type === "OperatorNode" && node.fn === "factorial";

const OPERATORS = {
	add: math.add,
	subtract: math.subtract,
	multiply: math.multiply,
	divide: math.divide,
	unaryMinus: math.unaryMinus,
	unaryPlus: math.unaryPlus
};

// ###################
// Walk the parsed line; a node that isn't a number, a bracket or an allowed operator stops it
// ###################
const work = (node) => {
	if (node.type === "ConstantNode" && math.isBigNumber(node.value)) return node.value;
	if (node.type === "ParenthesisNode") return work(node.content);
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
	// 2 3 and 7 % 3 parse as an implicit ×; only 2(3) and (1 + 2)(3) are meant
	if (node.implicit && right.type !== "ParenthesisNode") throw new Error("not allowed: implicit ×");
	if (OPERATORS[node.fn]) return OPERATORS[node.fn](...node.args.map(work));
	throw new Error(`not allowed: ${node.fn}`);
};

// ###################
// The result as text ("0.3", "-12", "1.5e+21"), or null when the line isn't finished or isn't allowed
// decimals "auto": 15 significant digits, so 1 ÷ 3 shows 0.333333333333333
// decimals 0–10: rounded to that many places, zeros kept (10 ÷ 4 with 2 → 2.50)
// ###################
export const calc = (line, { decimals = "auto" } = {}) => {
	const raw = String(line ?? "");
	if (raw.includes("!")) return null;
	const text = normalize(raw);
	if (!text) return null;
	try {
		const value = work(math.parse(text));
		if (!value.isFinite()) return null;   // 1 ÷ 0
		const out = Number.isInteger(decimals) ? value.toFixed(decimals) : value.toSignificantDigits(15).toString();
		return out.replace(/^-(0(\.0*)?)$/, "$1");   // -0, -0.00 → 0, 0.00
	} catch {
		return null;
	}
};
