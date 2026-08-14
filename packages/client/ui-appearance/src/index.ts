/** Host registration for the durable appearance settings section. */

import type { Context } from '@deepseek-ai/cordis'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import { APPEARANCE_SETTINGS_NAMESPACE, AppearanceSettingsSchema } from './settings.ts'

export {
  APPEARANCE_SETTINGS_NAMESPACE,
  type AppearanceConfig, type AppearanceSettings,
} from './settings.ts'

/**
 * Register the durable appearance section when the optional settings service
 * becomes available in the composed Host tree.
 * The browser half binds this namespace through the settings scope.
 * @param ctx - Host context that may acquire the settings service.
 */
export function apply(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(
      settingsNamespace(APPEARANCE_SETTINGS_NAMESPACE),
      AppearanceSettingsSchema,
    )
  })
}
