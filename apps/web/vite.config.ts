import { fileURLToPath, URL } from 'node:url'

import { Config } from "@en/config"
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueRouter from 'vue-router/vite'
import tailwindcss from '@tailwindcss/vite'
import MotionResolver from 'motion-v/resolver'
import ui from '@nuxt/ui/vite'
import checker from "vite-plugin-checker";

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: Config.ports.web,
    proxy: {
      '/api': {
        target: `http://localhost:${Config.ports.server}`,
        changeOrigin: true,
      },
      '/ai': {
        target: `http://localhost:${Config.ports.ai}`,
        changeOrigin: true,
      }
    }
  },
  plugins: [
    tailwindcss(),
    VueRouter({
      routesFolder: [
        {
          src: 'src/views',
          path: '',
          // 覆盖全局设置
          exclude: excluded => excluded,
          filePatterns: filePatterns => filePatterns,
          extensions: extensions => extensions,
        },
      ],
    }),
    vue(),
    vueJsx(),
    ui({
      prose: true,
      autoImport: {
        imports: [
          'vue',
          'vue-router',
          'pinia',
        ],
      },
      components: {
        resolvers: [
          MotionResolver()
        ]
      },
      ui: {
        colors: {
          primary: 'sky'
        }
      }
    }),
    checker({
      // 开启 vue-tsc 检查
      vueTsc: true,
    }),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@en': fileURLToPath(new URL('../../packages', import.meta.url))
    },
  },
})
