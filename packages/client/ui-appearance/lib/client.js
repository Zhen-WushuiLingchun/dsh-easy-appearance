window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-appearance",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		//#region ../../../vendor/cosmokit/src/misc.ts
		/** Return true when a value is `null` or `undefined`. */
		function isNullable(value) {
			return value === null || value === void 0;
		}
		/** Return true for non-array object values. */
		function isPlainObject(data) {
			return data && typeof data === "object" && !Array.isArray(data);
		}
		/** Filter object entries and return a new object. */
		function filterKeys(object, filter) {
			return Object.fromEntries(Object.entries(object).filter(([key, value]) => filter(key, value)));
		}
		/** Map object values while preserving the original key set. */
		function mapValues(object, transform) {
			return Object.fromEntries(Object.entries(object).map(([key, value]) => [key, transform(value, key)]));
		}
		/** Pick selected keys from an object, optionally including `undefined` values. */
		function pick(source, keys, forced) {
			if (!keys) return { ...source };
			const result = {};
			for (const key of keys) if (forced || source[key] !== void 0) result[key] = source[key];
			return result;
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/types.ts
		/** Test values using `instanceof` with a `toStringTag` fallback. */
		function is(type, value) {
			if (arguments.length === 1) return (value) => is(type, value);
			return type in globalThis && value instanceof globalThis[type] || Object.prototype.toString.call(value).slice(8, -1) === type;
		}
		function isArrayBufferLike(value) {
			return is("ArrayBuffer", value) || is("SharedArrayBuffer", value);
		}
		function isArrayBufferSource(value) {
			return isArrayBufferLike(value) || ArrayBuffer.isView(value);
		}
		let Binary;
		(function(_Binary) {
			_Binary.is = isArrayBufferLike;
			_Binary.isSource = isArrayBufferSource;
			function fromSource(source) {
				if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
				else return source;
			}
			_Binary.fromSource = fromSource;
			function toBase64(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("base64");
				let binary = "";
				const bytes = new Uint8Array(source);
				for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
				return btoa(binary);
			}
			_Binary.toBase64 = toBase64;
			function fromBase64(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "base64"));
				return Uint8Array.from(atob(source), (c) => c.charCodeAt(0));
			}
			_Binary.fromBase64 = fromBase64;
			function toHex(source) {
				source = fromSource(source);
				if (typeof Buffer !== "undefined") return Buffer.from(source).toString("hex");
				return Array.from(new Uint8Array(source), (byte) => byte.toString(16).padStart(2, "0")).join("");
			}
			_Binary.toHex = toHex;
			function fromHex(source) {
				if (typeof Buffer !== "undefined") return fromSource(Buffer.from(source, "hex"));
				const hex = source.length % 2 === 0 ? source : source.slice(0, source.length - 1);
				const buffer = [];
				for (let i = 0; i < hex.length; i += 2) buffer.push(parseInt(`${hex[i]}${hex[i + 1]}`, 16));
				return Uint8Array.from(buffer).buffer;
			}
			_Binary.fromHex = fromHex;
		})(Binary || (Binary = {}));
		Binary.fromBase64;
		Binary.toBase64;
		Binary.fromHex;
		Binary.toHex;
		/** Deep-clone common JavaScript values while preserving prototypes and cycles. */
		function clone(source, refs = /* @__PURE__ */ new Map()) {
			if (!source || typeof source !== "object") return source;
			if (is("Date", source)) return new Date(source.valueOf());
			if (is("RegExp", source)) return new RegExp(source.source, source.flags);
			if (isArrayBufferLike(source)) return source.slice(0);
			if (ArrayBuffer.isView(source)) return source.buffer.slice(source.byteOffset, source.byteOffset + source.byteLength);
			const cached = refs.get(source);
			if (cached) return cached;
			if (Array.isArray(source)) {
				const result = [];
				refs.set(source, result);
				source.forEach((value, index) => {
					result[index] = Reflect.apply(clone, null, [value, refs]);
				});
				return result;
			}
			const result = Object.create(Object.getPrototypeOf(source));
			refs.set(source, result);
			for (const key of Reflect.ownKeys(source)) {
				const descriptor = { ...Reflect.getOwnPropertyDescriptor(source, key) };
				if ("value" in descriptor) descriptor.value = Reflect.apply(clone, null, [descriptor.value, refs]);
				Reflect.defineProperty(result, key, descriptor);
			}
			return result;
		}
		/** Deeply compare arrays, dates, regexps, buffers, and plain object fields. */
		function deepEqual(a, b, strict) {
			if (a === b) return true;
			if (!strict && isNullable(a) && isNullable(b)) return true;
			if (typeof a !== typeof b) return false;
			if (typeof a !== "object") return false;
			if (!a || !b) return false;
			function check(test, then) {
				return test(a) ? test(b) ? then(a, b) : false : test(b) ? false : void 0;
			}
			return check(Array.isArray, (a, b) => a.length === b.length && a.every((item, index) => deepEqual(item, b[index]))) ?? check(is("Date"), (a, b) => a.valueOf() === b.valueOf()) ?? check(is("RegExp"), (a, b) => a.source === b.source && a.flags === b.flags) ?? check(isArrayBufferLike, (a, b) => {
				if (a.byteLength !== b.byteLength) return false;
				const viewA = new Uint8Array(a);
				const viewB = new Uint8Array(b);
				for (let i = 0; i < viewA.length; i++) if (viewA[i] !== viewB[i]) return false;
				return true;
			}) ?? Object.keys({
				...a,
				...b
			}).every((key) => deepEqual(a[key], b[key], strict));
		}
		//#endregion
		//#region ../../../vendor/cosmokit/src/time.ts
		let Time;
		(function(_Time) {
			_Time.millisecond = 1;
			const second = _Time.second = 1e3;
			const minute = _Time.minute = second * 60;
			const hour = _Time.hour = minute * 60;
			const day = _Time.day = hour * 24;
			const week = _Time.week = day * 7;
			let timezoneOffset = (/* @__PURE__ */ new Date()).getTimezoneOffset();
			function setTimezoneOffset(offset) {
				timezoneOffset = offset;
			}
			_Time.setTimezoneOffset = setTimezoneOffset;
			function getTimezoneOffset() {
				return timezoneOffset;
			}
			_Time.getTimezoneOffset = getTimezoneOffset;
			function getDateNumber(date = /* @__PURE__ */ new Date(), offset) {
				if (typeof date === "number") date = new Date(date);
				if (offset === void 0) offset = timezoneOffset;
				return Math.floor((date.valueOf() / minute - offset) / 1440);
			}
			_Time.getDateNumber = getDateNumber;
			function fromDateNumber(value, offset) {
				const date = new Date(value * day);
				if (offset === void 0) offset = timezoneOffset;
				return new Date(+date + offset * minute);
			}
			_Time.fromDateNumber = fromDateNumber;
			const numeric = /\d+(?:\.\d+)?/.source;
			const timeRegExp = new RegExp(`^${[
				"w(?:eek(?:s)?)?",
				"d(?:ay(?:s)?)?",
				"h(?:our(?:s)?)?",
				"m(?:in(?:ute)?(?:s)?)?",
				"s(?:ec(?:ond)?(?:s)?)?"
			].map((unit) => `(${numeric}${unit})?`).join("")}$`);
			function parseTime(source) {
				const capture = timeRegExp.exec(source);
				if (!capture) return 0;
				return (parseFloat(capture[1]) * week || 0) + (parseFloat(capture[2]) * day || 0) + (parseFloat(capture[3]) * hour || 0) + (parseFloat(capture[4]) * minute || 0) + (parseFloat(capture[5]) * second || 0);
			}
			_Time.parseTime = parseTime;
			function parseDate(date) {
				const parsed = parseTime(date);
				if (parsed) date = Date.now() + parsed;
				else if (/^\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).toLocaleDateString()}-${date}`;
				else if (/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2}){1,2}$/.test(date)) date = `${(/* @__PURE__ */ new Date()).getFullYear()}-${date}`;
				return date ? new Date(date) : /* @__PURE__ */ new Date();
			}
			_Time.parseDate = parseDate;
			function format(ms) {
				const abs = Math.abs(ms);
				if (abs >= day - hour / 2) return Math.round(ms / day) + "d";
				else if (abs >= hour - minute / 2) return Math.round(ms / hour) + "h";
				else if (abs >= minute - second / 2) return Math.round(ms / minute) + "m";
				else if (abs >= second) return Math.round(ms / second) + "s";
				return ms + "ms";
			}
			_Time.format = format;
			function toDigits(source, length = 2) {
				return source.toString().padStart(length, "0");
			}
			_Time.toDigits = toDigits;
			function template(template, time = /* @__PURE__ */ new Date()) {
				return template.replace("yyyy", time.getFullYear().toString()).replace("yy", time.getFullYear().toString().slice(2)).replace("MM", toDigits(time.getMonth() + 1)).replace("dd", toDigits(time.getDate())).replace("hh", toDigits(time.getHours())).replace("mm", toDigits(time.getMinutes())).replace("ss", toDigits(time.getSeconds())).replace("SSS", toDigits(time.getMilliseconds(), 3));
			}
			_Time.template = template;
		})(Time || (Time = {}));
		//#endregion
		//#region ../../../vendor/schemastery/src/index.ts
		const kSchema = Symbol.for("schemastery");
		const kValidationError = Symbol.for("ValidationError");
		globalThis.__schemastery_index__ ??= 0;
		globalThis.__schemastery_refs__ = void 0;
		var ValidationError = class extends TypeError {
			options;
			name = "ValidationError";
			constructor(message, options) {
				let prefix = "$";
				for (const segment of options.path || []) if (typeof segment === "string") prefix += "." + segment;
				else if (typeof segment === "number") prefix += "[" + segment + "]";
				else if (typeof segment === "symbol") prefix += `[Symbol(${segment.toString()})]`;
				if (prefix.startsWith(".")) prefix = prefix.slice(1);
				super((prefix === "$" ? "" : `${prefix} `) + message);
				this.options = options;
			}
			static is(error) {
				return !!error?.[kValidationError];
			}
		};
		Object.defineProperty(ValidationError.prototype, kValidationError, { value: true });
		const Schema = function(options) {
			const schema = function(data, options = {}) {
				return Schema.resolve(data, schema, options)[0];
			};
			if (options.refs) {
				const refs = mapValues(options.refs, (options) => new Schema(options));
				const getRef = (uid) => refs[uid];
				for (const key in refs) {
					const options = refs[key];
					options.sKey = getRef(options.sKey);
					options.inner = getRef(options.inner);
					options.list = options.list && options.list.map(getRef);
					options.dict = options.dict && mapValues(options.dict, getRef);
				}
				return refs[options.uid];
			}
			Object.assign(schema, options);
			if (typeof schema.callback === "string") try {
				schema.callback = new Function("return " + schema.callback)();
			} catch {}
			Object.defineProperty(schema, "uid", { value: globalThis.__schemastery_index__++ });
			Object.setPrototypeOf(schema, Schema.prototype);
			schema.meta ||= {};
			schema.toString = schema.toString.bind(schema);
			return schema;
		};
		Schema.prototype = Object.create(Function.prototype);
		Schema.prototype[kSchema] = true;
		Object.defineProperty(Schema.prototype, "~standard", { get() {
			return {
				version: 1,
				vendor: "schemastery",
				validate: (value) => {
					try {
						return { value: Schema.resolve(value, this, {})[0] };
					} catch (error) {
						if (ValidationError.is(error)) return { issues: [{
							message: error.message,
							path: error.options.path
						}] };
						throw error;
					}
				}
			};
		} });
		Schema.ValidationError = ValidationError;
		Schema.prototype.toJSON = function toJSON() {
			if (globalThis.__schemastery_refs__) {
				globalThis.__schemastery_refs__[this.uid] ??= JSON.parse(JSON.stringify({ ...this }));
				return this.uid;
			}
			globalThis.__schemastery_refs__ = { [this.uid]: { ...this } };
			globalThis.__schemastery_refs__[this.uid] = JSON.parse(JSON.stringify({ ...this }));
			const result = {
				uid: this.uid,
				refs: globalThis.__schemastery_refs__
			};
			globalThis.__schemastery_refs__ = void 0;
			return result;
		};
		Schema.prototype.set = function set(key, value) {
			this.dict[key] = value;
			return this;
		};
		Schema.prototype.push = function push(value) {
			this.list.push(value);
			return this;
		};
		function mergeDesc(original, messages) {
			const result = typeof original === "string" ? { "": original } : { ...original };
			for (const locale in messages) {
				const value = messages[locale];
				if (value?.$description || value?.$desc) result[locale] = value.$description || value.$desc;
				else if (typeof value === "string") result[locale] = value;
			}
			return result;
		}
		function getInner(value) {
			return value?.$value ?? value?.$inner;
		}
		function extractKeys(data) {
			return filterKeys(data ?? {}, (key) => !key.startsWith("$"));
		}
		Schema.prototype.i18n = function i18n(messages) {
			const schema = Schema(this);
			const desc = mergeDesc(schema.meta.description, messages);
			if (Object.keys(desc).length) schema.meta.description = desc;
			if (schema.dict) schema.dict = mapValues(schema.dict, (inner, key) => {
				return inner.i18n(mapValues(messages, (data) => getInner(data)?.[key] ?? data?.[key]));
			});
			if (schema.list) schema.list = schema.list.map((inner, index) => {
				return inner.i18n(mapValues(messages, (data = {}) => {
					if (Array.isArray(getInner(data))) return getInner(data)[index];
					if (Array.isArray(data)) return data[index];
					return extractKeys(data);
				}));
			});
			if (schema.inner) schema.inner = schema.inner.i18n(mapValues(messages, (data) => {
				if (getInner(data)) return getInner(data);
				return extractKeys(data);
			}));
			if (schema.sKey) schema.sKey = schema.sKey.i18n(mapValues(messages, (data) => data?.$key));
			return schema;
		};
		Schema.prototype.extra = function extra(key, value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		};
		for (const key of [
			"required",
			"disabled",
			"collapse",
			"hidden",
			"loose"
		]) Object.assign(Schema.prototype, { [key](value = true) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		Schema.prototype.deprecated = function deprecated() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "deprecated",
				type: "danger"
			});
			return schema;
		};
		Schema.prototype.experimental = function experimental() {
			const schema = Schema(this);
			schema.meta.badges ||= [];
			schema.meta.badges.push({
				text: "experimental",
				type: "warning"
			});
			return schema;
		};
		Schema.prototype.pattern = function pattern(regexp) {
			const schema = Schema(this);
			const pattern = pick(regexp, ["source", "flags"]);
			schema.meta = {
				...schema.meta,
				pattern
			};
			return schema;
		};
		Schema.prototype.simplify = function simplify(value) {
			if (deepEqual(value, this.meta.default, this.type === "dict")) return null;
			if (isNullable(value)) return value;
			if (this.type === "object" || this.type === "dict") {
				const result = {};
				for (const key in value) {
					const item = (this.type === "object" ? this.dict[key] : this.inner)?.simplify(value[key]);
					if (this.type === "dict" || !isNullable(item)) result[key] = item;
				}
				if (deepEqual(result, this.meta.default, this.type === "dict")) return null;
				return result;
			} else if (this.type === "array" || this.type === "tuple") {
				const result = [];
				value.forEach((value, index) => {
					const schema = this.type === "array" ? this.inner : this.list[index];
					const item = schema ? schema.simplify(value) : value;
					result.push(item);
				});
				return result;
			} else if (this.type === "intersect") {
				const result = {};
				for (const item of this.list) Object.assign(result, item.simplify(value));
				return result;
			} else if (this.type === "union") for (const schema of this.list) try {
				Schema.resolve(value, schema, {});
				return schema.simplify(value);
			} catch {}
			return value;
		};
		Schema.prototype.toString = function toString(inline) {
			return formatters[this.type]?.(this, inline) ?? `Schema<${this.type}>`;
		};
		Schema.prototype.role = function role(role, extra) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				role,
				extra
			};
			return schema;
		};
		for (const key of [
			"default",
			"link",
			"comment",
			"description",
			"max",
			"min",
			"step"
		]) Object.assign(Schema.prototype, { [key](value) {
			const schema = Schema(this);
			schema.meta = {
				...schema.meta,
				[key]: value
			};
			return schema;
		} });
		const resolvers = {};
		Schema.extend = function extend(type, resolve) {
			resolvers[type] = resolve;
		};
		Schema.resolve = function resolve(data, schema, options = {}, strict = false) {
			if (!schema) return [data];
			if (options.ignore?.(data, schema)) return [data];
			if (isNullable(data) && schema.type !== "lazy") {
				if (schema.meta.required) throw new ValidationError(`missing required value`, options);
				let current = schema;
				let fallback = schema.meta.default;
				while (current?.type === "intersect" && isNullable(fallback)) {
					current = current.list[0];
					fallback = current?.meta.default;
				}
				if (isNullable(fallback)) return [data];
				data = clone(fallback);
			}
			const callback = resolvers[schema.type];
			if (!callback) throw new ValidationError(`unsupported type "${schema.type}"`, options);
			try {
				return callback(data, schema, options, strict);
			} catch (error) {
				if (!schema.meta.loose) throw error;
				return [schema.meta.default];
			}
		};
		Schema.from = function from(source) {
			if (isNullable(source)) return Schema.any();
			else if ([
				"string",
				"number",
				"boolean"
			].includes(typeof source)) return Schema.const(source).required();
			else if (source[kSchema]) return source;
			else if (typeof source === "function") switch (source) {
				case String: return Schema.string().required();
				case Number: return Schema.number().required();
				case Boolean: return Schema.boolean().required();
				case Function: return Schema.function().required();
				default: return Schema.is(source).required();
			}
			else throw new TypeError(`cannot infer schema from ${source}`);
		};
		Schema.lazy = function lazy(builder) {
			const toJSON = () => {
				if (!schema.inner[kSchema]) {
					schema.inner = schema.builder();
					schema.inner.meta = {
						...schema.meta,
						...schema.inner.meta
					};
				}
				return schema.inner.toJSON();
			};
			const schema = new Schema({
				type: "lazy",
				builder,
				inner: { toJSON }
			});
			return schema;
		};
		Schema.natural = function natural() {
			return Schema.number().step(1).min(0);
		};
		Schema.percent = function percent() {
			return Schema.number().step(.01).min(0).max(1).role("slider");
		};
		Schema.date = function date() {
			return Schema.union([Schema.is(Date), Schema.transform(Schema.string().role("datetime"), (value, options) => {
				const date = new Date(value);
				if (isNaN(+date)) throw new ValidationError(`invalid date "${value}"`, options);
				return date;
			}, true)]);
		};
		Schema.regExp = function regExp(flag = "") {
			return Schema.union([Schema.is(RegExp), Schema.transform(Schema.string().role("regexp", { flag }), (value, options) => {
				try {
					return new RegExp(value, flag);
				} catch (e) {
					throw new ValidationError(e.message, options);
				}
			}, true)]);
		};
		Schema.arrayBuffer = function arrayBuffer(encoding) {
			return Schema.union([
				Schema.is(ArrayBuffer),
				Schema.is(SharedArrayBuffer),
				Schema.transform(Schema.any(), (value, options) => {
					if (Binary.isSource(value)) return Binary.fromSource(value);
					throw new ValidationError(`expected ArrayBufferSource but got ${value}`, options);
				}, true),
				...encoding ? [Schema.transform(Schema.string(), (value, options) => {
					try {
						return encoding === "base64" ? Binary.fromBase64(value) : Binary.fromHex(value);
					} catch (e) {
						throw new ValidationError(e.message, options);
					}
				}, true)] : []
			]);
		};
		Schema.extend("lazy", (data, schema, options, strict) => {
			if (!schema.inner[kSchema]) {
				schema.inner = schema.builder();
				schema.inner.meta = {
					...schema.meta,
					...schema.inner.meta
				};
			}
			return Schema.resolve(data, schema.inner, options, strict);
		});
		Schema.extend("any", (data) => {
			return [data];
		});
		Schema.extend("never", (data, _, options) => {
			throw new ValidationError(`expected nullable but got ${data}`, options);
		});
		Schema.extend("const", (data, { value }, options) => {
			if (deepEqual(data, value)) return [value];
			throw new ValidationError(`expected ${value} but got ${data}`, options);
		});
		function checkWithinRange(data, meta, description, options, skipMin = false) {
			const { max = Infinity, min = -Infinity } = meta;
			if (data > max) throw new ValidationError(`expected ${description} <= ${max} but got ${data}`, options);
			if (data < min && !skipMin) throw new ValidationError(`expected ${description} >= ${min} but got ${data}`, options);
		}
		Schema.extend("string", (data, { meta }, options) => {
			if (typeof data !== "string") throw new ValidationError(`expected string but got ${data}`, options);
			if (meta.pattern) {
				const regexp = new RegExp(meta.pattern.source, meta.pattern.flags);
				if (!regexp.test(data)) throw new ValidationError(`expect string to match regexp ${regexp}`, options);
			}
			checkWithinRange(data.length, meta, "string length", options);
			return [data];
		});
		function decimalShift(data, digits) {
			const str = data.toString();
			if (str.includes("e")) return data * Math.pow(10, digits);
			const index = str.indexOf(".");
			if (index === -1) return data * Math.pow(10, digits);
			const frac = str.slice(index + 1);
			const integer = str.slice(0, index);
			if (frac.length <= digits) return +(integer + frac.padEnd(digits, "0"));
			return +(integer + frac.slice(0, digits) + "." + frac.slice(digits));
		}
		function isMultipleOf(data, min, step) {
			step = Math.abs(step);
			if (!/^\d+\.\d+$/.test(step.toString())) return (data - min) % step === 0;
			const index = step.toString().indexOf(".");
			const digits = step.toString().slice(index + 1).length;
			return Math.abs(decimalShift(data, digits) - decimalShift(min, digits)) % decimalShift(step, digits) === 0;
		}
		Schema.extend("number", (data, { meta }, options) => {
			if (typeof data !== "number") throw new ValidationError(`expected number but got ${data}`, options);
			checkWithinRange(data, meta, "number", options);
			const { step } = meta;
			if (step && !isMultipleOf(data, meta.min ?? 0, step)) throw new ValidationError(`expected number multiple of ${step} but got ${data}`, options);
			return [data];
		});
		Schema.extend("boolean", (data, _, options) => {
			if (typeof data === "boolean") return [data];
			throw new ValidationError(`expected boolean but got ${data}`, options);
		});
		Schema.extend("bitset", (data, { bits, meta }, options) => {
			let value = 0, keys = [];
			if (typeof data === "number") {
				value = data;
				for (const key in bits) if (data & bits[key]) keys.push(key);
			} else if (Array.isArray(data)) {
				keys = data;
				for (const key of keys) {
					if (typeof key !== "string") throw new ValidationError(`expected string but got ${key}`, options);
					if (key in bits) value |= bits[key];
				}
			} else throw new ValidationError(`expected number or array but got ${data}`, options);
			if (value === meta.default) return [value];
			return [value, keys];
		});
		Schema.extend("function", (data, _, options) => {
			if (typeof data === "function") return [data];
			throw new ValidationError(`expected function but got ${data}`, options);
		});
		Schema.extend("is", (data, { constructor }, options) => {
			if (typeof constructor === "function") {
				if (data instanceof constructor) return [data];
				throw new ValidationError(`expected ${constructor.name} but got ${data}`, options);
			} else {
				if (isNullable(data)) throw new ValidationError(`expected ${constructor} but got ${data}`, options);
				let prototype = Object.getPrototypeOf(data);
				while (prototype) {
					if (prototype.constructor?.name === constructor) return [data];
					prototype = Object.getPrototypeOf(prototype);
				}
				throw new ValidationError(`expected ${constructor} but got ${data}`, options);
			}
		});
		function property(data, key, schema, options) {
			try {
				const [value, adapted] = Schema.resolve(data[key], schema, {
					...options,
					path: [...options.path || [], key]
				});
				if (adapted !== void 0) data[key] = adapted;
				return value;
			} catch (e) {
				if (!options?.autofix) throw e;
				delete data[key];
				return schema.meta.default;
			}
		}
		Schema.extend("array", (data, { inner, meta }, options) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			checkWithinRange(data.length, meta, "array length", options, !isNullable(inner.meta.default));
			return [data.map((_, index) => property(data, index, inner, options))];
		});
		Schema.extend("dict", (data, { inner, sKey }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in data) {
				let rKey;
				try {
					rKey = Schema.resolve(key, sKey, options)[0];
				} catch (error) {
					if (strict) continue;
					throw error;
				}
				result[rKey] = property(data, key, inner, options);
				data[rKey] = data[key];
				if (key !== rKey) delete data[key];
			}
			return [result];
		});
		Schema.extend("tuple", (data, { list }, options, strict) => {
			if (!Array.isArray(data)) throw new ValidationError(`expected array but got ${data}`, options);
			const result = list.map((inner, index) => property(data, index, inner, options));
			if (strict) return [result];
			result.push(...data.slice(list.length));
			return [result];
		});
		function merge(result, data) {
			for (const key in data) {
				if (key in result) continue;
				result[key] = data[key];
			}
		}
		Schema.extend("object", (data, { dict }, options, strict) => {
			if (!isPlainObject(data)) throw new ValidationError(`expected object but got ${data}`, options);
			const result = {};
			for (const key in dict) {
				const value = property(data, key, dict[key], options);
				if (!isNullable(value) || key in data) result[key] = value;
			}
			if (!strict) merge(result, data);
			return [result];
		});
		Schema.extend("union", (data, { list, toString }, options, strict) => {
			const messages = [];
			for (const inner of list) try {
				return Schema.resolve(data, inner, options, strict);
			} catch (error) {
				messages.push(error);
			}
			throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
		});
		Schema.extend("intersect", (data, { list, toString }, options, strict) => {
			if (!list.length) return [data];
			let result;
			for (const inner of list) {
				const value = Schema.resolve(data, inner, options, true)[0];
				if (isNullable(value)) continue;
				if (isNullable(result)) result = value;
				else if (typeof result !== typeof value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
				else if (typeof value === "object") merge(result ??= {}, value);
				else if (result !== value) throw new ValidationError(`expected ${toString()} but got ${JSON.stringify(data)}`, options);
			}
			if (!strict && isPlainObject(data)) merge(result, data);
			return [result];
		});
		Schema.extend("transform", (data, { inner, callback, preserve }, options) => {
			const [result, adapted = data] = Schema.resolve(data, inner, options, true);
			if (preserve) return [callback(result)];
			else return [callback(result), callback(adapted)];
		});
		const formatters = {};
		function defineMethod(name, keys, format) {
			formatters[name] = format;
			Object.assign(Schema, { [name](...args) {
				const schema = new Schema({ type: name });
				keys.forEach((key, index) => {
					switch (key) {
						case "sKey":
							schema.sKey = args[index] ?? Schema.string();
							break;
						case "inner":
							schema.inner = Schema.from(args[index]);
							break;
						case "list":
							schema.list = args[index].map(Schema.from);
							break;
						case "dict":
							schema.dict = mapValues(args[index], Schema.from);
							break;
						case "bits":
							schema.bits = {};
							for (const key in args[index]) {
								if (typeof args[index][key] !== "number") continue;
								schema.bits[key] = args[index][key];
							}
							break;
						case "callback": {
							const callback = schema.callback = args[index];
							callback["toJSON"] ||= () => callback.toString();
							break;
						}
						case "constructor": {
							const constructor = schema.constructor = args[index];
							if (typeof constructor === "function") constructor["toJSON"] ||= () => constructor["name"];
							break;
						}
						default: schema[key] = args[index];
					}
				});
				if (name === "object" || name === "dict") schema.meta.default = {};
				else if (name === "array" || name === "tuple") schema.meta.default = [];
				else if (name === "bitset") schema.meta.default = 0;
				return schema;
			} });
		}
		defineMethod("is", ["constructor"], ({ constructor }) => {
			if (typeof constructor === "function") return constructor.name;
			else return constructor;
		});
		defineMethod("any", [], () => "any");
		defineMethod("never", [], () => "never");
		defineMethod("const", ["value"], ({ value }) => typeof value === "string" ? JSON.stringify(value) : value);
		defineMethod("string", [], () => "string");
		defineMethod("number", [], () => "number");
		defineMethod("boolean", [], () => "boolean");
		defineMethod("bitset", ["bits"], () => "bitset");
		defineMethod("function", [], () => "function");
		defineMethod("array", ["inner"], ({ inner }) => `${inner.toString(true)}[]`);
		defineMethod("dict", ["inner", "sKey"], ({ inner, sKey }) => `{ [key: ${sKey.toString()}]: ${inner.toString()} }`);
		defineMethod("tuple", ["list"], ({ list }) => `[${list.map((inner) => inner.toString()).join(", ")}]`);
		defineMethod("object", ["dict"], ({ dict }) => {
			if (Object.keys(dict).length === 0) return "{}";
			return `{ ${Object.entries(dict).map(([key, inner]) => {
				return `${key}${inner.meta.required ? "" : "?"}: ${inner.toString()}`;
			}).join(", ")} }`;
		});
		defineMethod("union", ["list"], ({ list }, inline) => {
			const result = list.map(({ toString: format }) => format()).join(" | ");
			return inline ? `(${result})` : result;
		});
		defineMethod("intersect", ["list"], ({ list }) => {
			return `${list.map((inner) => inner.toString(true)).join(" & ")}`;
		});
		defineMethod("transform", [
			"inner",
			"callback",
			"preserve"
		], ({ inner }, isInner) => inner.toString(isInner));
		//#endregion
		//#region src/settings.ts
		/** Durable appearance settings shared by the Host schema and the browser scope. */
		/** Settings namespace owned by the appearance plugin. */
		const APPEARANCE_SETTINGS_NAMESPACE = "ui-appearance";
		Schema.object({ config: Schema.string().default("") });
		/** Default config applied when no persisted document exists. */
		const DEFAULT_CONFIG = {
			colors: {
				light: {
					accent: "#3964fe",
					background: "#ffffff",
					foreground: "#0f1115",
					secondary: "#61666b",
					sidebar: "#f5f6f7"
				},
				dark: {
					accent: "#6e8bff",
					background: "#0b0d10",
					foreground: "#e7e9ec",
					secondary: "#9ba1a8",
					sidebar: "#101317"
				}
			},
			contrast: 0,
			surfaceOpacity: 1,
			wallpaper: {
				url: "",
				scrim: .45
			},
			fonts: {
				ui: "",
				code: ""
			},
			customCss: ""
		};
		/**
		* Serialize the config for the settings document.
		* @param config - appearance configuration to serialize.
		* @returns one JSON string suitable for `ui-appearance.config`.
		*/
		function encodeConfig(config) {
			return JSON.stringify(config);
		}
		/**
		* Parse a persisted config, merging partial documents over the defaults.
		* @param raw - JSON string read from `ui-appearance.config`.
		* @returns a complete appearance configuration.
		*/
		function decodeConfig(raw) {
			try {
				const parsed = JSON.parse(raw);
				return {
					colors: {
						light: {
							...DEFAULT_CONFIG.colors.light,
							...parsed.colors?.light ?? {}
						},
						dark: {
							...DEFAULT_CONFIG.colors.dark,
							...parsed.colors?.dark ?? {}
						}
					},
					contrast: typeof parsed.contrast === "number" ? parsed.contrast : DEFAULT_CONFIG.contrast,
					surfaceOpacity: typeof parsed.surfaceOpacity === "number" ? parsed.surfaceOpacity : DEFAULT_CONFIG.surfaceOpacity,
					wallpaper: {
						...DEFAULT_CONFIG.wallpaper,
						...parsed.wallpaper ?? {}
					},
					fonts: {
						...DEFAULT_CONFIG.fonts,
						...parsed.fonts ?? {}
					},
					customCss: typeof parsed.customCss === "string" ? parsed.customCss : DEFAULT_CONFIG.customCss
				};
			} catch {
				return {
					...DEFAULT_CONFIG,
					colors: {
						light: { ...DEFAULT_CONFIG.colors.light },
						dark: { ...DEFAULT_CONFIG.colors.dark }
					}
				};
			}
		}
		//#endregion
		//#region src/client/appearance-style.ts
		function clamp01(value) {
			return Math.max(0, Math.min(1, value));
		}
		function clamp255(value) {
			return Math.max(0, Math.min(255, Math.round(value)));
		}
		function twoDigitHex(value) {
			return clamp255(value).toString(16).padStart(2, "0");
		}
		function rgbToHex(red, green, blue) {
			return `#${twoDigitHex(red)}${twoDigitHex(green)}${twoDigitHex(blue)}`;
		}
		function hexToRgb(hex) {
			let normalized = hex.trim().replace(/^#/, "");
			if (normalized.length === 3) normalized = normalized.split("").map((part) => part + part).join("");
			if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return void 0;
			return {
				r: Number.parseInt(normalized.slice(0, 2), 16),
				g: Number.parseInt(normalized.slice(2, 4), 16),
				b: Number.parseInt(normalized.slice(4, 6), 16)
			};
		}
		function lerpHex(from, to, amount) {
			const start = hexToRgb(from);
			const end = hexToRgb(to);
			if (start === void 0 || end === void 0) return from;
			return rgbToHex(start.r + (end.r - start.r) * amount, start.g + (end.g - start.g) * amount, start.b + (end.b - start.b) * amount);
		}
		function hexToRgba(hex, alpha) {
			const rgb = hexToRgb(hex);
			if (rgb === void 0) return hex;
			return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${clamp01(alpha)})`;
		}
		function cssUrl(raw) {
			return `url(${JSON.stringify(raw)})`;
		}
		function wallpaperRule(selector, background, opacity, scrim, wallpaper) {
			const tint = hexToRgba(background, opacity);
			const shade = `rgba(0, 0, 0, ${clamp01(scrim)})`;
			return `${selector} { background-color: ${background} !important; background-image: linear-gradient(${tint}, ${tint}), linear-gradient(${shade}, ${shade}), ${cssUrl(wallpaper)} !important; background-size: cover !important; background-position: center !important; background-repeat: no-repeat !important; background-attachment: fixed !important; }`;
		}
		/**
		* Project appearance colors into the shared theme token layer.
		* @param config - appearance configuration to project.
		* @returns light/dark token values for the theme runtime.
		*/
		function buildAppearanceTokens(config) {
			const light = config.colors.light;
			const dark = config.colors.dark;
			const contrastTarget = {
				light: "#000000",
				dark: "#ffffff"
			};
			const hasWallpaper = config.wallpaper.url.length > 0;
			const surfaceAlpha = hasWallpaper ? config.surfaceOpacity : 1;
			const accent = {
				light: light.accent,
				dark: dark.accent
			};
			const accentHover = {
				light: lerpHex(light.accent, "#ffffff", .18),
				dark: lerpHex(dark.accent, "#000000", .12)
			};
			return {
				"--dsw-alias-brand-primary": accent,
				"--dsw-alias-brand-primary-new-colorprimary-new-color": accent,
				"--dsw-alias-state-business-primary": accent,
				"--dsw-alias-state-business-tertiary": {
					light: hexToRgba(light.accent, .14),
					dark: hexToRgba(dark.accent, .22)
				},
				"--dsw-alias-button-info-fill": accent,
				"--dsw-alias-button-info-hover": accentHover,
				"--dsw-alias-label-primary": {
					light: lerpHex(light.foreground, contrastTarget.light, config.contrast),
					dark: lerpHex(dark.foreground, contrastTarget.dark, config.contrast)
				},
				"--dsw-alias-label-secondary": {
					light: lerpHex(light.secondary, contrastTarget.light, config.contrast),
					dark: lerpHex(dark.secondary, contrastTarget.dark, config.contrast)
				},
				"--dsw-alias-bg-base": {
					light: hasWallpaper ? "transparent" : light.background,
					dark: hasWallpaper ? "transparent" : dark.background
				},
				"--dsw-specific-sidebar-fill": {
					light: hexToRgba(light.sidebar, surfaceAlpha),
					dark: hexToRgba(dark.sidebar, surfaceAlpha)
				}
			};
		}
		/**
		* Build the package-owned dynamic stylesheet for wallpaper, fonts, and custom CSS.
		* @param config - appearance configuration to project.
		* @returns complete stylesheet text for the current configuration.
		*/
		function buildAppearanceCss(config) {
			const rules = [];
			if (config.fonts.ui.length > 0) rules.push(`:root { --dsw-font-family: ${config.fonts.ui} !important; }`);
			if (config.fonts.code.length > 0) rules.push(`:root { --ds-font-family-code: ${config.fonts.code} !important; }`);
			if (config.wallpaper.url.length > 0) {
				rules.push(wallpaperRule("body", config.colors.light.background, config.surfaceOpacity, config.wallpaper.scrim, config.wallpaper.url));
				rules.push(wallpaperRule("body[data-ds-dark-theme]", config.colors.dark.background, config.surfaceOpacity, config.wallpaper.scrim, config.wallpaper.url));
			}
			if (config.customCss.length > 0) rules.push(config.customCss);
			return rules.join("\n");
		}
		//#endregion
		//#region src/client/index.ts
		/** Browser half: appearance settings section, theme overrides, and durable config. */
		const inject = [
			"slots",
			"settingsScope",
			"theme",
			"layout"
		];
		function normalizeHex(v) {
			const s = v.trim();
			if (s[0] === "#" && (s.length === 7 || s.length === 9)) return s.slice(0, 7);
			return s;
		}
		function pickColor(colors, keys) {
			for (const key of keys) {
				const value = colors[key];
				if (typeof value === "string" && value.length > 0) return value;
			}
			return null;
		}
		function gradientDataUri(c1, c2) {
			const svg = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"1600\" height=\"1000\"><defs><linearGradient id=\"g\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop offset=\"0\" stop-color=\"" + c1 + "\"/><stop offset=\"1\" stop-color=\"" + c2 + "\"/></linearGradient></defs><rect width=\"1600\" height=\"1000\" fill=\"url(#g)\"/></svg>";
			return "data:image/svg+xml," + encodeURIComponent(svg);
		}
		const PRESETS = [
			{
				id: "violet",
				label: "暮色紫",
				url: gradientDataUri("#7c3aed", "#1e1b4b")
			},
			{
				id: "ocean",
				label: "深海蓝",
				url: gradientDataUri("#0ea5e9", "#0b0d10")
			},
			{
				id: "jade",
				label: "翡翠绿",
				url: gradientDataUri("#10b981", "#04211f")
			},
			{
				id: "ember",
				label: "暖橙",
				url: gradientDataUri("#f97316", "#3b0a12")
			}
		];
		const TEMPLATE_CSS = [
			"/* ============================================================",
			"   dsh-appearance 自定义 CSS 模板",
			"   此处可写任意 CSS，实时注入 <style>；点“重置全部”可清除。",
			"   · 覆盖主题 token（内联注入）需写 body 选择器并加 !important：",
			"        body { --dsw-alias-brand-primary: #ff6b6b !important; }",
			"   · 深色专属选择器： body[data-ds-dark-theme]",
			"   · 常用变量：--dsw-alias-*  /  --dsw-specific-sidebar-fill",
			"              --dsw-font-family  /  --ds-font-family-code",
			"   ============================================================ */",
			"",
			"/* 示例：自定义强调色 */",
			"/* body { --dsw-alias-brand-primary: #ff6b6b !important; } */",
			"",
			"/* 示例：深色下更换背景 */",
			"/* body[data-ds-dark-theme] { --dsw-alias-bg-base: #101418 !important; } */",
			""
		].join("\n");
		/** Insert a package-owned <style> element and return its disposer. */
		function insertStyle(css) {
			const tag = document.createElement("style");
			tag.setAttribute("data-plugin", "ui-appearance");
			tag.textContent = css;
			document.head.appendChild(tag);
			return () => {
				tag.remove();
			};
		}
		/** Apply the browser half once the settings scope and slot runtime are present. */
		function apply(ctx) {
			const theme = ctx.theme;
			const layout = ctx.layout;
			const host = ctx.settingsScope.bind({ namespace: APPEARANCE_SETTINGS_NAMESPACE });
			const state = decodeConfig(host.getSnapshot().value?.config ?? "");
			let disposeTokens = null;
			let disposeCss = null;
			let pendingConfig;
			let hasLocalChanges = false;
			let persistenceMessage = "正在读取已保存的外观配置…";
			const appearanceListeners = /* @__PURE__ */ new Set();
			function notifyAppearance() {
				for (const listener of [...appearanceListeners]) listener();
			}
			function setPersistenceMessage(message) {
				if (persistenceMessage === message) return;
				persistenceMessage = message;
				notifyAppearance();
			}
			function subscribeAppearance(listener) {
				appearanceListeners.add(listener);
				return () => {
					appearanceListeners.delete(listener);
				};
			}
			function applyAll() {
				if (disposeTokens !== null) {
					disposeTokens();
					disposeTokens = null;
				}
				if (disposeCss !== null) {
					disposeCss();
					disposeCss = null;
				}
				disposeTokens = theme.overrideTokens("ui-appearance", buildAppearanceTokens(state));
				disposeCss = insertStyle(buildAppearanceCss(state));
			}
			function commit() {
				hasLocalChanges = true;
				const serialized = encodeConfig(state);
				pendingConfig = serialized;
				applyAll();
				notifyAppearance();
				setPersistenceMessage("正在保存到 DSH settings.yaml…");
				Promise.resolve(host.set("config", serialized)).then(() => {
					if (pendingConfig !== serialized) return;
					const snapshot = host.getSnapshot();
					const user = snapshot.user;
					const stored = typeof user === "object" && user !== null && !Array.isArray(user) ? user.config : void 0;
					pendingConfig = void 0;
					if (snapshot.status === "ready" && snapshot.writable && snapshot.value?.config === serialized && stored === serialized) {
						hasLocalChanges = false;
						setPersistenceMessage("已保存到 DSH settings.yaml");
						return;
					}
					setPersistenceMessage("保存失败：Host 未接受 ui-appearance.config；当前仅在本页生效");
				}, () => {
					if (pendingConfig !== serialized) return;
					pendingConfig = void 0;
					setPersistenceMessage("保存失败：无法连接 DSH settings；当前仅在本页生效");
				});
			}
			function setWallpaper(url) {
				state.wallpaper.url = url;
				if (url && state.surfaceOpacity === 1) {
					state.surfaceOpacity = .5;
					if (state.wallpaper.scrim === .45) state.wallpaper.scrim = .25;
				}
				commit();
			}
			function resetAll() {
				Object.assign(state, decodeConfig(encodeConfig(DEFAULT_CONFIG)));
				commit();
			}
			function applyVsTheme(text) {
				let json;
				try {
					json = JSON.parse(text);
				} catch (error) {
					return {
						ok: false,
						error: `JSON 解析失败：${error instanceof Error ? error.message : String(error)}`
					};
				}
				const colors = json.colors;
				if (!colors || typeof colors !== "object") return {
					ok: false,
					error: "未找到 colors 字段（不是 VS Code 主题 JSON？）"
				};
				const type = (json.type ?? "").toLowerCase();
				const schemes = type.includes("dark") ? ["dark"] : type.includes("light") ? ["light"] : ["light", "dark"];
				const MAP = [
					["accent", [
						"button.background",
						"activityBarBadge.background",
						"badge.background",
						"progressBar.background",
						"focusBorder"
					]],
					["background", [
						"editor.background",
						"editorGroup.background",
						"sideBar.background",
						"panel.background"
					]],
					["foreground", ["editor.foreground", "foreground"]],
					["secondary", [
						"editorLineNumber.foreground",
						"descriptionForeground",
						"input.placeholderForeground",
						"editorHint.foreground"
					]],
					["sidebar", ["sideBar.background", "activityBar.background"]]
				];
				let changed = 0;
				for (const scheme of schemes) for (const [field, keys] of MAP) {
					const value = pickColor(colors, keys);
					if (value !== null) {
						state.colors[scheme][field] = normalizeHex(value);
						changed++;
					}
				}
				if (changed === 0) return {
					ok: false,
					error: "未匹配到可用的颜色字段"
				};
				commit();
				return {
					ok: true,
					changed,
					schemes: schemes.join(", ")
				};
			}
			applyAll();
			ctx.effect(() => {
				const adopt = () => {
					const snapshot = host.getSnapshot();
					if (snapshot.mode === "memory") {
						setPersistenceMessage("远程浏览器仅保留本页配置，不写入 Host");
						return;
					}
					if (snapshot.status === "loading") {
						setPersistenceMessage("正在读取已保存的外观配置…");
						return;
					}
					if (snapshot.status === "unavailable") {
						setPersistenceMessage("持久化不可用：Host 未暴露 ui-appearance 命名空间");
						return;
					}
					if (!snapshot.writable) {
						setPersistenceMessage("持久化不可用：DSH settings 当前为只读");
						return;
					}
					const serialized = snapshot.value?.config ?? "";
					if (pendingConfig === void 0 && !hasLocalChanges && serialized !== encodeConfig(state)) {
						Object.assign(state, decodeConfig(serialized));
						applyAll();
						notifyAppearance();
					}
					if (pendingConfig === void 0) setPersistenceMessage("已从 DSH settings.yaml 恢复配置");
				};
				const dispose = host.subscribe(adopt);
				adopt();
				return dispose;
			}, "ui-appearance: durable settings adoption");
			ctx.effect(() => () => {
				if (disposeTokens !== null) {
					disposeTokens();
					disposeTokens = null;
				}
				if (disposeCss !== null) {
					disposeCss();
					disposeCss = null;
				}
			}, "ui-appearance: theme + style layers");
			const themeListeners = /* @__PURE__ */ new Set();
			ctx.on("theme/change", () => {
				for (const listener of Array.from(themeListeners)) listener();
			});
			const subscribeTheme = (listener) => {
				themeListeners.add(listener);
				return () => {
					themeListeners.delete(listener);
				};
			};
			const S = {
				section: {
					display: "flex",
					flexDirection: "column",
					gap: 22,
					maxWidth: 760,
					padding: "4px 2px 40px"
				},
				h2: {
					margin: 0,
					fontSize: 18,
					fontWeight: 600,
					color: "var(--dsw-alias-label-primary)"
				},
				intro: {
					margin: 0,
					fontSize: 13,
					lineHeight: "20px",
					color: "var(--dsw-alias-label-secondary)"
				},
				group: {
					display: "flex",
					flexDirection: "column",
					gap: 10
				},
				groupTitle: {
					fontSize: 12,
					fontWeight: 600,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					color: "var(--dsw-alias-label-secondary)"
				},
				row: {
					display: "flex",
					alignItems: "center",
					gap: 12,
					minHeight: 30
				},
				label: {
					flex: "0 0 128px",
					fontSize: 13,
					color: "var(--dsw-alias-label-secondary)"
				},
				value: {
					fontSize: 12,
					color: "var(--dsw-alias-label-secondary)",
					fontFamily: "var(--ds-font-family-code)",
					minWidth: 44,
					textAlign: "right"
				},
				textInput: {
					flex: 1,
					minWidth: 0,
					padding: "6px 8px",
					fontSize: 13,
					color: "var(--dsw-alias-label-primary)",
					background: "var(--dsw-alias-bg-layer-1)",
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: 6
				},
				colorInput: {
					width: 36,
					height: 28,
					padding: 0,
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: 6,
					background: "var(--dsw-alias-bg-layer-1)"
				},
				range: {
					flex: 1,
					minWidth: 0
				},
				btn: {
					padding: "6px 12px",
					fontSize: 13,
					color: "var(--dsw-alias-label-primary)",
					background: "var(--dsw-alias-bg-layer-1)",
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: 6,
					cursor: "pointer"
				},
				btnActive: {
					borderColor: "var(--dsw-alias-brand-primary)",
					color: "var(--dsw-alias-brand-primary)",
					boxShadow: "inset 0 0 0 1px var(--dsw-alias-brand-primary)"
				},
				btnRow: {
					display: "flex",
					gap: 8,
					flexWrap: "wrap"
				},
				note: {
					fontSize: 12,
					lineHeight: "18px",
					color: "var(--dsw-alias-label-secondary)"
				},
				textArea: {
					width: "100%",
					minHeight: 160,
					padding: 8,
					fontSize: 12,
					lineHeight: "18px",
					fontFamily: "var(--ds-font-family-code)",
					color: "var(--dsw-alias-label-primary)",
					background: "var(--dsw-alias-bg-layer-1)",
					border: "1px solid var(--dsw-alias-border-l2)",
					borderRadius: 6,
					resize: "vertical"
				},
				fileInput: {
					fontSize: 12,
					color: "var(--dsw-alias-label-secondary)"
				}
			};
			function Group(title, children) {
				const kids = Array.isArray(children) ? children : [children];
				return (0, react.createElement)("div", {
					key: title,
					style: S.group
				}, [(0, react.createElement)("div", {
					key: "t",
					style: S.groupTitle
				}, title)].concat(kids));
			}
			function Row(key, children) {
				return (0, react.createElement)("div", {
					key,
					style: S.row
				}, children);
			}
			function ColorField(label, value, onChange) {
				return Row(`color-${label}`, [
					(0, react.createElement)("div", {
						key: "l",
						style: S.label
					}, label),
					(0, react.createElement)("input", {
						key: "c",
						type: "color",
						value,
						style: S.colorInput,
						onChange: (event) => {
							onChange(event.target.value);
						}
					}),
					(0, react.createElement)("input", {
						key: "t",
						type: "text",
						value,
						style: S.textInput,
						onChange: (event) => {
							onChange(event.target.value);
						}
					})
				]);
			}
			function SliderField(label, min, max, step, value, onChange, fmt) {
				return Row(`slider-${label}`, [
					(0, react.createElement)("div", {
						key: "l",
						style: S.label
					}, label),
					(0, react.createElement)("input", {
						key: "r",
						type: "range",
						min,
						max,
						step,
						value,
						style: S.range,
						onChange: (event) => {
							onChange(Number(event.target.value));
						}
					}),
					(0, react.createElement)("div", {
						key: "v",
						style: S.value
					}, fmt(value))
				]);
			}
			function TextField(label, value, onChange, placeholder) {
				return Row(`text-${label}`, [(0, react.createElement)("div", {
					key: "l",
					style: S.label
				}, label), (0, react.createElement)("input", {
					key: "i",
					type: "text",
					value,
					placeholder: placeholder ?? "",
					style: S.textInput,
					onChange: (event) => {
						onChange(event.target.value);
					}
				})]);
			}
			function FileField(label, accept, onFile) {
				return Row(`file-${label}`, [(0, react.createElement)("div", {
					key: "l",
					style: S.label
				}, label), (0, react.createElement)("input", {
					key: "f",
					type: "file",
					accept,
					style: S.fileInput,
					onChange: (e) => {
						const f = e.target.files?.[0];
						if (f) onFile(f);
					}
				})]);
			}
			function mkButtons(items, isActive, onPick) {
				return items.map((it) => (0, react.createElement)("button", {
					key: it.id,
					type: "button",
					style: {
						...S.btn,
						...isActive(it) ? S.btnActive : {}
					},
					onClick: () => {
						onPick(it);
					}
				}, it.label));
			}
			function readFileAsDataUrl(file, cb) {
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result === "string") cb(reader.result);
				};
				reader.readAsDataURL(file);
			}
			function readFileAsText(file, cb) {
				const reader = new FileReader();
				reader.onload = () => {
					if (typeof reader.result === "string") cb(reader.result);
				};
				reader.readAsText(file);
			}
			function AppearanceSection() {
				const [, bumpState] = (0, react.useState)(0);
				const bump = () => {
					bumpState((value) => value + 1);
				};
				const [scheme, setScheme] = (0, react.useState)(() => {
					return theme.getTheme().active.colorScheme === "dark" ? "dark" : "light";
				});
				const [snap, setSnap] = (0, react.useState)(() => theme.getTheme());
				const [status, setStatus] = (0, react.useState)("");
				const [saveStatus, setSaveStatus] = (0, react.useState)(() => persistenceMessage);
				(0, react.useEffect)(() => subscribeTheme(() => {
					setSnap(theme.getTheme());
				}), []);
				(0, react.useEffect)(() => subscribeAppearance(() => {
					setSaveStatus(persistenceMessage);
					bump();
				}), []);
				const pref = snap.preference;
				const activeScheme = snap.active.colorScheme;
				const colors = state.colors[scheme];
				const modeNote = (pref === "system" ? "跟随系统" : pref === "dark" ? "深色" : "浅色") + " · 当前生效：" + (activeScheme === "dark" ? "深色" : "浅色");
				const setColor = (key, value) => {
					state.colors[scheme][key] = value;
					commit();
					bump();
				};
				const onImageFile = (file) => {
					setStatus("正在读取图片…");
					readFileAsDataUrl(file, (url) => {
						setWallpaper(url);
						bump();
						setStatus("已载入背景图（表面透明度已自动调低）");
					});
				};
				const onVsFile = (file) => {
					setStatus("正在导入主题…");
					readFileAsText(file, (text) => {
						const r = applyVsTheme(text);
						bump();
						if (r.ok) setStatus(`已导入 VS Code 主题：${r.changed ?? 0} 处（${r.schemes ?? ""}）`);
						else setStatus(r.error ?? "导入失败");
					});
				};
				const onCssFile = (file) => {
					setStatus("正在读取 CSS…");
					readFileAsText(file, (text) => {
						state.customCss = text;
						commit();
						bump();
						setStatus("已载入自定义 CSS");
					});
				};
				const modeButtons = mkButtons([
					{
						id: "light",
						label: "浅色"
					},
					{
						id: "dark",
						label: "深色"
					},
					{
						id: "system",
						label: "跟随系统"
					}
				], (it) => pref === it.id, (it) => {
					theme.setTheme(it.id);
				});
				const schemeButtons = mkButtons([{
					id: "light",
					label: "浅色"
				}, {
					id: "dark",
					label: "深色"
				}], (it) => scheme === it.id, (it) => {
					setScheme(it.id);
				});
				const presetButtons = mkButtons(PRESETS, () => false, (it) => {
					if (it.url !== void 0) {
						setWallpaper(it.url);
						bump();
					}
				});
				const uiFontPresets = mkButtons([
					{
						id: "inter",
						label: "Inter",
						value: "'Inter', system-ui, sans-serif"
					},
					{
						id: "yahei",
						label: "雅黑",
						value: "'Microsoft YaHei', 'PingFang SC', sans-serif"
					},
					{
						id: "default",
						label: "默认",
						value: ""
					}
				], (it) => state.fonts.ui === (it.value ?? ""), (it) => {
					state.fonts.ui = it.value ?? "";
					commit();
					bump();
				});
				const codeFontPresets = mkButtons([
					{
						id: "jbm",
						label: "JetBrains Mono",
						value: "'JetBrains Mono', 'Fira Code', monospace"
					},
					{
						id: "fira",
						label: "Fira Code",
						value: "'Fira Code', monospace"
					},
					{
						id: "sfm",
						label: "SF Mono",
						value: "'SF Mono', Menlo, Consolas, monospace"
					},
					{
						id: "default",
						label: "默认",
						value: ""
					}
				], (it) => state.fonts.code === (it.value ?? ""), (it) => {
					state.fonts.code = it.value ?? "";
					commit();
					bump();
				});
				return (0, react.createElement)("div", { style: S.section }, [
					(0, react.createElement)("h2", {
						key: "h",
						style: S.h2
					}, "外观"),
					(0, react.createElement)("p", {
						key: "i",
						style: S.intro
					}, "配置 WebUI 的配色、背景、字体与布局。配置保存为 ui-appearance.config JSON，并在刷新或重启后自动恢复。"),
					Group("主题模式", [(0, react.createElement)("div", {
						key: "modes",
						style: S.btnRow
					}, modeButtons), (0, react.createElement)("div", {
						key: "modeNote",
						style: S.note
					}, modeNote)]),
					Group("配色 · " + (scheme === "dark" ? "深色" : "浅色"), [
						(0, react.createElement)("div", {
							key: "schemes",
							style: S.btnRow
						}, schemeButtons),
						ColorField("强调色", colors.accent, (v) => {
							setColor("accent", v);
						}),
						ColorField("前景文字", colors.foreground, (v) => {
							setColor("foreground", v);
						}),
						ColorField("次要文字", colors.secondary, (v) => {
							setColor("secondary", v);
						}),
						ColorField("背景", colors.background, (v) => {
							setColor("background", v);
						}),
						ColorField("侧边栏", colors.sidebar, (v) => {
							setColor("sidebar", v);
						}),
						SliderField("对比度", 0, 1, .05, state.contrast, (v) => {
							state.contrast = v;
							commit();
							bump();
						}, (v) => `${Math.round(v * 100)}%`),
						SliderField("表面透明度", .2, 1, .05, state.surfaceOpacity, (v) => {
							state.surfaceOpacity = v;
							commit();
							bump();
						}, (v) => `${Math.round(v * 100)}%`),
						(0, react.createElement)("div", {
							key: "surfaceNote",
							style: S.note
						}, "表面透明度越低，背景图越明显（设图时自动调到 50%）；拉满 100% 则不显示背景图。")
					]),
					Group("背景图", [
						TextField("图片 URL", state.wallpaper.url, (v) => {
							setWallpaper(v);
							bump();
						}, "https://… 或 data:image/…"),
						FileField("本地上传", "image/*", onImageFile),
						(0, react.createElement)("div", {
							key: "presets",
							style: S.btnRow
						}, presetButtons),
						SliderField("遮罩层透明度", 0, 1, .05, state.wallpaper.scrim, (v) => {
							state.wallpaper.scrim = v;
							commit();
							bump();
						}, (v) => `${Math.round(v * 100)}%`),
						(0, react.createElement)("div", {
							key: "scrimNote",
							style: S.note
						}, "遮罩层直接压在背景图上，保证前景文字可读。")
					]),
					Group("VS Code 主题", [FileField("主题 JSON 文件", ".json,application/json", onVsFile), (0, react.createElement)("div", {
						key: "vsNote",
						style: S.note
					}, "导入 VS Code 主题的 colors 字段，自动映射强调色/背景/前景/次要文字/侧边栏；按 type（light/dark）分别套用。")]),
					Group("自定义 CSS", [
						(0, react.createElement)("div", {
							key: "cssBtns",
							style: S.btnRow
						}, [(0, react.createElement)("button", {
							key: "tmpl",
							type: "button",
							style: S.btn,
							onClick: () => {
								state.customCss = TEMPLATE_CSS;
								commit();
								bump();
								setStatus("已填入模板（可编辑，实时生效）");
							}
						}, "填入模板"), (0, react.createElement)("button", {
							key: "clear",
							type: "button",
							style: S.btn,
							onClick: () => {
								state.customCss = "";
								commit();
								bump();
								setStatus("已清除自定义 CSS");
							}
						}, "清除 CSS")]),
						(0, react.createElement)("textarea", {
							key: "cssTa",
							value: state.customCss,
							rows: 10,
							style: S.textArea,
							placeholder: "粘贴或编辑自定义 CSS…",
							onChange: (e) => {
								state.customCss = e.target.value;
								commit();
								bump();
							}
						}),
						FileField("CSS 文件", ".css,text/css", onCssFile),
						(0, react.createElement)("div", {
							key: "cssNote",
							style: S.note
						}, "CSS 实时注入并生效；覆盖主题 token 需写 body 选择器并加 !important（模板里有示例）。")
					]),
					Group("字体", [
						TextField("UI 字体", state.fonts.ui, (v) => {
							state.fonts.ui = v;
							commit();
							bump();
						}, "'Inter', system-ui"),
						(0, react.createElement)("div", {
							key: "uiPresets",
							style: S.btnRow
						}, uiFontPresets),
						TextField("代码字体", state.fonts.code, (v) => {
							state.fonts.code = v;
							commit();
							bump();
						}, "'JetBrains Mono', monospace"),
						(0, react.createElement)("div", {
							key: "codePresets",
							style: S.btnRow
						}, codeFontPresets)
					]),
					Group("侧边栏布局", [(0, react.createElement)("div", {
						key: "layout",
						style: S.btnRow
					}, [
						(0, react.createElement)("button", {
							key: "toggle",
							type: "button",
							style: S.btn,
							onClick: () => {
								layout.toggleSidebar();
							}
						}, "折叠 / 展开侧边栏"),
						(0, react.createElement)("button", {
							key: "openD",
							type: "button",
							style: S.btn,
							onClick: () => {
								layout.openDetails();
							}
						}, "打开详情栏"),
						(0, react.createElement)("button", {
							key: "closeD",
							type: "button",
							style: S.btn,
							onClick: () => {
								layout.closeDetails();
							}
						}, "关闭详情栏")
					]), (0, react.createElement)("div", {
						key: "layoutNote",
						style: S.note
					}, "侧边栏折叠后保留 56px 控制栏，再次点击展开。")]),
					(0, react.createElement)("div", {
						key: "footer",
						style: {
							display: "flex",
							gap: 8,
							alignItems: "center",
							flexWrap: "wrap"
						}
					}, [
						(0, react.createElement)("button", {
							key: "reset",
							type: "button",
							style: S.btn,
							onClick: resetAll
						}, "重置全部"),
						(0, react.createElement)("span", {
							key: "status",
							style: S.note
						}, status),
						(0, react.createElement)("span", {
							key: "saveStatus",
							style: S.note
						}, saveStatus)
					])
				]);
			}
			ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: "appearance",
				order: 12,
				label: "外观"
			}, () => (0, react.createElement)(AppearanceSection)));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map