import { settingsNamespace } from "@deepseek-ai/dsh-settings";
import z from "@deepseek-ai/schemastery";
//#region lib/types/settings.js
/** Durable appearance settings shared by the Host schema and the browser scope. */
/** Settings namespace owned by the appearance plugin. */
const APPEARANCE_SETTINGS_NAMESPACE = "ui-appearance";
/** Durable schema; the config rides one string field so the shape stays the plugin's own. */
const AppearanceSettingsSchema = z.object({ config: z.string().default("") });
//#endregion
//#region lib/types/index.js
/** Host registration for the durable appearance settings section. */
/**
* Register the durable appearance section when the optional settings service
* becomes available in the composed Host tree.
* The browser half binds this namespace through the settings scope.
* @param ctx - Host context that may acquire the settings service.
*/
function apply(ctx) {
	ctx.inject(["settings"], (settingsCtx) => {
		settingsCtx.settings.register(settingsNamespace(APPEARANCE_SETTINGS_NAMESPACE), AppearanceSettingsSchema);
	});
}
//#endregion
export { APPEARANCE_SETTINGS_NAMESPACE, apply };
