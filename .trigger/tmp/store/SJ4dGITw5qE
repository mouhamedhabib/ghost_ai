import {
  __name,
  init_esm
} from "./chunk-244PAGAH.mjs";

// node_modules/@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs
init_esm();
var h = /* @__PURE__ */ __name(() => {
}, "h");
h.prototype = h;
var o;
function D(e) {
  o = e;
}
__name(D, "D");
var p = null;
function a() {
  return (p === null || p.byteLength === 0) && (p = new Uint8Array(o.memory.buffer)), p;
}
__name(a, "a");
var y = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true });
y.decode();
var E = 2146435072;
var A = 0;
function T(e, t) {
  return A += t, A >= E && (y = new TextDecoder("utf-8", { ignoreBOM: true, fatal: true }), y.decode(), A = t), y.decode(a().subarray(e, e + t));
}
__name(T, "T");
function m(e, t) {
  return e = e >>> 0, T(e, t);
}
__name(m, "m");
var f = 0;
var g = new TextEncoder();
"encodeInto" in g || (g.encodeInto = function(e, t) {
  const n = g.encode(e);
  return t.set(n), { read: e.length, written: n.length };
});
function l(e, t, n) {
  if (n === void 0) {
    const i = g.encode(e), d = t(i.length, 1) >>> 0;
    return a().subarray(d, d + i.length).set(i), f = i.length, d;
  }
  let _ = e.length, r = t(_, 1) >>> 0;
  const s = a();
  let c = 0;
  for (; c < _; c++) {
    const i = e.charCodeAt(c);
    if (i > 127) break;
    s[r + c] = i;
  }
  if (c !== _) {
    c !== 0 && (e = e.slice(c)), r = n(r, _, _ = c + e.length * 3, 1) >>> 0;
    const i = a().subarray(r + c, r + _), d = g.encodeInto(e, i);
    c += d.written, r = n(r, _, c, 1) >>> 0;
  }
  return f = c, r;
}
__name(l, "l");
var b = null;
function u() {
  return (b === null || b.buffer.detached === true || b.buffer.detached === void 0 && b.buffer !== o.memory.buffer) && (b = new DataView(o.memory.buffer)), b;
}
__name(u, "u");
function x(e) {
  return e == null;
}
__name(x, "x");
function S(e) {
  const t = typeof e;
  if (t == "number" || t == "boolean" || e == null) return `${e}`;
  if (t == "string") return `"${e}"`;
  if (t == "symbol") {
    const r = e.description;
    return r == null ? "Symbol" : `Symbol(${r})`;
  }
  if (t == "function") {
    const r = e.name;
    return typeof r == "string" && r.length > 0 ? `Function(${r})` : "Function";
  }
  if (Array.isArray(e)) {
    const r = e.length;
    let s = "[";
    r > 0 && (s += S(e[0]));
    for (let c = 1; c < r; c++) s += ", " + S(e[c]);
    return s += "]", s;
  }
  const n = /\[object ([^\]]+)\]/.exec(toString.call(e));
  let _;
  if (n && n.length > 1) _ = n[1];
  else return toString.call(e);
  if (_ == "Object") try {
    return "Object(" + JSON.stringify(e) + ")";
  } catch {
    return "Object";
  }
  return e instanceof Error ? `${e.name}: ${e.message}
${e.stack}` : _;
}
__name(S, "S");
function M(e, t) {
  return e = e >>> 0, a().subarray(e / 1, e / 1 + t);
}
__name(M, "M");
function w(e) {
  const t = o.__wbindgen_externrefs.get(e);
  return o.__externref_table_dealloc(e), t;
}
__name(w, "w");
var I = typeof FinalizationRegistry > "u" ? { register: /* @__PURE__ */ __name(() => {
}, "register"), unregister: /* @__PURE__ */ __name(() => {
}, "unregister") } : new FinalizationRegistry((e) => o.__wbg_querycompiler_free(e >>> 0, 1));
var F = class {
  static {
    __name(this, "F");
  }
  __destroy_into_raw() {
    const t = this.__wbg_ptr;
    return this.__wbg_ptr = 0, I.unregister(this), t;
  }
  free() {
    const t = this.__destroy_into_raw();
    o.__wbg_querycompiler_free(t, 0);
  }
  compileBatch(t) {
    const n = l(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compileBatch(this.__wbg_ptr, n, _);
    if (r[2]) throw w(r[1]);
    return w(r[0]);
  }
  constructor(t) {
    const n = o.querycompiler_new(t);
    if (n[2]) throw w(n[1]);
    return this.__wbg_ptr = n[0] >>> 0, I.register(this, this.__wbg_ptr, this), this;
  }
  compile(t) {
    const n = l(t, o.__wbindgen_malloc, o.__wbindgen_realloc), _ = f, r = o.querycompiler_compile(this.__wbg_ptr, n, _);
    if (r[2]) throw w(r[1]);
    return w(r[0]);
  }
};
Symbol.dispose && (F.prototype[Symbol.dispose] = F.prototype.free);
function O(e, t) {
  return Error(m(e, t));
}
__name(O, "O");
function B(e) {
  return Number(e);
}
__name(B, "B");
function N(e, t) {
  const n = String(t), _ = l(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
  u().setInt32(e + 4 * 1, r, true), u().setInt32(e + 4 * 0, _, true);
}
__name(N, "N");
function U(e) {
  const t = e, n = typeof t == "boolean" ? t : void 0;
  return x(n) ? 16777215 : n ? 1 : 0;
}
__name(U, "U");
function R(e, t) {
  const n = S(t), _ = l(n, o.__wbindgen_malloc, o.__wbindgen_realloc), r = f;
  u().setInt32(e + 4 * 1, r, true), u().setInt32(e + 4 * 0, _, true);
}
__name(R, "R");
function $(e, t) {
  return e in t;
}
__name($, "$");
function q(e) {
  const t = e;
  return typeof t == "object" && t !== null;
}
__name(q, "q");
function C(e) {
  return typeof e == "string";
}
__name(C, "C");
function k(e) {
  return e === void 0;
}
__name(k, "k");
function W(e, t) {
  return e == t;
}
__name(W, "W");
function V(e, t) {
  const n = t, _ = typeof n == "number" ? n : void 0;
  u().setFloat64(e + 8 * 1, x(_) ? 0 : _, true), u().setInt32(e + 4 * 0, !x(_), true);
}
__name(V, "V");
function z(e, t) {
  const n = t, _ = typeof n == "string" ? n : void 0;
  var r = x(_) ? 0 : l(_, o.__wbindgen_malloc, o.__wbindgen_realloc), s = f;
  u().setInt32(e + 4 * 1, s, true), u().setInt32(e + 4 * 0, r, true);
}
__name(z, "z");
function L(e, t) {
  throw new Error(m(e, t));
}
__name(L, "L");
function P(e) {
  return Object.entries(e);
}
__name(P, "P");
function Q(e) {
  return e.getTime();
}
__name(Q, "Q");
function Y(e, t) {
  return e[t >>> 0];
}
__name(Y, "Y");
function G(e, t) {
  return e[t];
}
__name(G, "G");
function J(e) {
  let t;
  try {
    t = e instanceof ArrayBuffer;
  } catch {
    t = false;
  }
  return t;
}
__name(J, "J");
function X(e) {
  let t;
  try {
    t = e instanceof Uint8Array;
  } catch {
    t = false;
  }
  return t;
}
__name(X, "X");
function H(e) {
  return Number.isSafeInteger(e);
}
__name(H, "H");
function K(e) {
  return e.length;
}
__name(K, "K");
function Z(e) {
  return e.length;
}
__name(Z, "Z");
function v() {
  return /* @__PURE__ */ new Date();
}
__name(v, "v");
function ee() {
  return new Object();
}
__name(ee, "ee");
function te(e) {
  return new Uint8Array(e);
}
__name(te, "te");
function ne() {
  return /* @__PURE__ */ new Map();
}
__name(ne, "ne");
function re() {
  return new Array();
}
__name(re, "re");
function _e(e, t, n) {
  Uint8Array.prototype.set.call(M(e, t), n);
}
__name(_e, "_e");
function oe(e, t, n) {
  e[t] = n;
}
__name(oe, "oe");
function ce(e, t, n) {
  return e.set(t, n);
}
__name(ce, "ce");
function ie(e, t, n) {
  e[t >>> 0] = n;
}
__name(ie, "ie");
function se(e, t) {
  global.PRISMA_WASM_PANIC_REGISTRY.set_message(m(e, t));
}
__name(se, "se");
function ue(e, t) {
  return m(e, t);
}
__name(ue, "ue");
function fe(e) {
  return BigInt.asUintN(64, e);
}
__name(fe, "fe");
function be(e) {
  return e;
}
__name(be, "be");
function de(e) {
  return e;
}
__name(de, "de");
function ae() {
  const e = o.__wbindgen_externrefs, t = e.grow(4);
  e.set(0, void 0), e.set(t + 0, void 0), e.set(t + 1, null), e.set(t + 2, true), e.set(t + 3, false);
}
__name(ae, "ae");
export {
  F as QueryCompiler,
  O as __wbg_Error_e83987f665cf5504,
  B as __wbg_Number_bb48ca12f395cd08,
  N as __wbg_String_8f0eb39a4a4c2f66,
  U as __wbg___wbindgen_boolean_get_6d5a1ee65bab5f68,
  R as __wbg___wbindgen_debug_string_df47ffb5e35e6763,
  $ as __wbg___wbindgen_in_bb933bd9e1b3bc0f,
  q as __wbg___wbindgen_is_object_c818261d21f283a4,
  C as __wbg___wbindgen_is_string_fbb76cb2940daafd,
  k as __wbg___wbindgen_is_undefined_2d472862bd29a478,
  W as __wbg___wbindgen_jsval_loose_eq_b664b38a2f582147,
  V as __wbg___wbindgen_number_get_a20bf9b85341449d,
  z as __wbg___wbindgen_string_get_e4f06c90489ad01b,
  L as __wbg___wbindgen_throw_b855445ff6a94295,
  P as __wbg_entries_e171b586f8f6bdbf,
  Q as __wbg_getTime_14776bfb48a1bff9,
  Y as __wbg_get_7bed016f185add81,
  G as __wbg_get_with_ref_key_1dc361bd10053bfe,
  J as __wbg_instanceof_ArrayBuffer_70beb1189ca63b38,
  X as __wbg_instanceof_Uint8Array_20c8e73002f7af98,
  H as __wbg_isSafeInteger_d216eda7911dde36,
  K as __wbg_length_69bca3cb64fc8748,
  Z as __wbg_length_cdd215e10d9dd507,
  v as __wbg_new_0_f9740686d739025c,
  ee as __wbg_new_1acc0b6eea89d040,
  te as __wbg_new_5a79be3ab53b8aa5,
  ne as __wbg_new_68651c719dcda04e,
  re as __wbg_new_e17d9f43105b08be,
  _e as __wbg_prototypesetcall_2a6620b6922694b2,
  oe as __wbg_set_3f1d0b984ed272ed,
  ce as __wbg_set_907fb406c34a251d,
  ie as __wbg_set_c213c871859d6500,
  se as __wbg_set_message_82ae475bb413aa5c,
  D as __wbg_set_wasm,
  ue as __wbindgen_cast_2241b6af4c4b2941,
  fe as __wbindgen_cast_4625c577ab2ec9ee,
  be as __wbindgen_cast_9ae0607507abb057,
  de as __wbindgen_cast_d6cd19b81560fd6e,
  ae as __wbindgen_init_externref_table
};
//# sourceMappingURL=query_compiler_fast_bg.postgresql-Z63CQRM3.mjs.map
