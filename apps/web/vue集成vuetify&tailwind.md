安装 Vuetify 和 Tailwindcss
```bash
pnpm add vuetify
pnpm add -D tailwindcss @tailwindcss/vite
pnpm add @mdi/font -D # vuetify 会使用图标作为多选和单选框的图标
```

创建 src\styles\layers.css
```css
@layer tailwind-theme;
@layer tailwind-reset;

@layer vuetify-core;
@layer vuetify-components;
@layer vuetify-overrides;
@layer vuetify-utilities;

@layer tailwind-utilities;

@layer vuetify-final;
```

创建 src\styles\tailwind.css
```css
@import "tailwindcss/theme" layer(tailwind-theme);
@import "tailwindcss/preflight" layer(tailwind-reset);
@import "tailwindcss/utilities" layer(tailwind-utilities);

/* dark/light mode — Vuetify uses .v-theme--dark/.v-theme--light instead of .dark */
@custom-variant light (&:where(.v-theme--light, .v-theme--light *));
@custom-variant dark (&:where(.v-theme--dark, .v-theme--dark *));
/* @custom-variant dark (.v-theme--dark &);
@custom-variant light (.v-theme--light &); */
@theme {
  --breakpoint-*: initial;
  /* reset Tailwind defaults */
  /* keep in sync with vuetify plugin/config and settings.scss */
  --breakpoint-xs: 0px;
  --breakpoint-sm: 600px;
  --breakpoint-md: 960px;
  --breakpoint-lg: 1280px;
  --breakpoint-xl: 1920px;
  --breakpoint-xxl: 2560px;
}

/*
  note: adopt and extend values from TailwindCSS
*/
@utility rounded-pill {
  border-radius: 9999px
}

@utility rounded-circle {
  border-radius: 50%
}

@utility rounded-shaped {
  border-radius: 24px 0
}

@source inline('rounded');
/* .25rem */
@source inline('rounded-{none,sm,md,lg,xl,2xl,3xl,full,pill,circle,shaped}');

/*
  note: adopt elevation shadows from TailwindCSS
*/
@utility elevation-0 {
  box-shadow: none
}

@utility elevation-1 {
  box-shadow: var(--shadow-xs)
}

@utility elevation-2 {
  box-shadow: var(--shadow-sm)
}

@utility elevation-3 {
  box-shadow: var(--shadow-md)
}

@utility elevation-4 {
  box-shadow: var(--shadow-xl)
}

@utility elevation-5 {
  box-shadow: var(--shadow-2xl)
}

@source inline('elevation-{0,1,2,3,4,5}');
```

创建 src\plugins\index.ts
```js
// Plugins
import vuetify from './vuetify'
import { router } from '@/router'
import { createPinia } from 'pinia'

// Types
import type { App } from 'vue'

export function registerPlugins(app: App) {

  app.use(createPinia())
  app.use(router)
  app.use(vuetify)
}
```

创建 src\plugins\vuetify.ts
```js
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

import '../styles/layers.css'
import 'vuetify/styles'
// 关键步骤：在这里导入MDI图标库的CSS
import '@mdi/font/css/materialdesignicons.css'

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'dark', // 'system' | 'light' | 'dark'
  },
})
```

在 main.ts 中引入 tailwind.css
```js
import './styles/tailwind.css'
import './assets/main.css'

import { createApp } from 'vue'

import App from './App.vue'
import { registerPlugins } from './plugins'

const app = createApp(App)

registerPlugins(app)

app.mount('#app')
```

将 tailwind 注册到vite.config.ts
```js
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(), // 将 tailwindcss() 注册为 vite.config.mts 中 plugins 里的 第一个 入口
    // ...
  ],
})
```

要实现 tailwind 与 vuetify 的主题同步必须用 v-app 标签包裹组件
```vue
<script>
//  App.vue
</script>

<template>
<v-app>
    <div class="app">
      <header>
        <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

        <div class="wrapper">
          <HelloWorld msg="You did it!" />

          <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
          </nav>
        </div>
        <v-btn @click="toggleTheme">
          切换主题
        </v-btn>
      </header>

      <RouterView />
    </div>
  </v-app>
</template>
```


## 自定义主题样式

tailwind主题样式使用css变量实现
浅色主题使用:root和 深色主题使用.v-theme--dark(不能使用.dark)
```css
:root {
  --color-card-background: #fff
}
.v-theme--light {
  --color-card-background: #fff
}

/*注册为tailwind样式，可以通过 bg-color-card-background 或 text-color-card-background 来使用*/
@theme {
  --color-card-background: var(--color-card-background);
}
```

vuetify主题使用 createVuetify
在src\plugins\vuetify.ts中配置主题
```js
export default createVuetify({
	components,
	directives,
	theme: {
		defaultTheme: localStorage.getItem('app-theme') || 'light', // 'system' | 'light' | 'dark'
		themes: {
			dark: {
				colors: {
					background: '#0a0a0a', // 深色模式默认背景色
				}
			},
			light: {
				colors: {
					primary: '#1766bf', // 浅色模式默认 primary 颜色
				}
			}
		}
	},

})

```