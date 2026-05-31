import { useTheme } from 'vuetify'
import {computed, watchEffect} from 'vue'

export function usePersistedTheme() {
	const theme = useTheme()
	const STORAGE_KEY = 'app-theme'

	// 初始化：从 localStorage 读取保存的主题
	const initTheme = () => {
		const savedTheme = localStorage.getItem(STORAGE_KEY)
		if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
			theme.global.name.value = savedTheme
		} else {
			// 可选：根据系统偏好设置默认主题
			const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
			theme.global.name.value = prefersDark ? 'dark' : 'light'
		}
	}

	// 切换主题并保存
	const toggleTheme = () => {
		const newTheme = theme.global.name.value === 'light' ? 'dark' : 'light'
		theme.global.name.value = newTheme
		localStorage.setItem(STORAGE_KEY, newTheme)
	}

	// 监听主题变化（防止其他地方修改主题）
	watchEffect(() => {
		localStorage.setItem(STORAGE_KEY, theme.global.name.value)
	})

	// 初始化
	initTheme()

	return {
		theme: theme.global.name,
		toggleTheme,
		isDark: computed(() => theme.global.name.value === 'dark')
	}
}