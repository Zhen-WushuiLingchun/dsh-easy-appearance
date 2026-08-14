//#region lib/types/invariant.js
/**
* Package-owned invariant companion for `@deepseek-ai/dsh-client-ui-appearance`.
* @module @deepseek-ai/dsh-client-ui-appearance/invariant
*/
const PACKAGE_NAME = "@deepseek-ai/dsh-client-ui-appearance";
/** Cordis companion plugin name. */
const name = "client-ui-appearance-invariant";
/** Service required before the companion can reserve package ownership. */
const inject = ["invariants"];
/**
* No runtime invariant: the settings scope validates and publishes the durable
* section, while tokens/CSS are applied idempotently by the browser half.
*/
const install = () => {};
/**
* Register this package's invariant companion.
* @param ctx - Cordis context carrying the invariant service.
* @returns the installed registration's disposer after setup succeeds.
*/
const apply = (ctx) => Promise.resolve(ctx.invariants.register(PACKAGE_NAME, install));
//#endregion
export { apply, inject, name };
