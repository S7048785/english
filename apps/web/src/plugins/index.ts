// Plugins
// import vuetify from './vuetify'
import { router } from "@/router";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
// Types
import type { App } from "vue";

import ui from "@nuxt/ui/vue-plugin";

export function registerPlugins(app: App) {
  const pinia = createPinia();
  pinia.use(piniaPluginPersistedstate);
  app.use(pinia);
  app.use(router);
  // app.use(vuetify)
  app.use(ui);
}
