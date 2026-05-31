import {onMounted, useTemplateRef} from "vue";
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'


export const useModel = () => {
	const hologramRef = useTemplateRef<HTMLDivElement>('hologramRef')

	const initThree = () => {
		// 🌍 创建场景
		const scene = new THREE.Scene()

		// 📦 创建模型加载器
		const loader = new GLTFLoader()

		// 📷 创建相机
		// 参数：视角角度, 宽高比, 近裁剪面, 远裁剪面
		const camera = new THREE.PerspectiveCamera(75, 500 / 250, 0.1, 1000)
		camera.position.set(0, 0, 10)

		// 💡 添加光源 - 这是显示颜色的关键！
		const ambientLight = new THREE.AmbientLight(0xffffff, 1)
		scene.add(ambientLight)

		const directionalLight = new THREE.DirectionalLight(0xffffff, 2)
		directionalLight.position.set(5, 10, 7.5)
		scene.add(directionalLight)

		// 🎨 创建渲染器
		const renderer = new THREE.WebGLRenderer({
			canvas: hologramRef.value!,
			antialias: true,           // 抗锯齿
			alpha: true,               // 透明背景
			precision: 'highp',        // 高精度
			powerPreference: 'high-performance',
		})
		renderer.setSize(500, 250)
		renderer.outputColorSpace = THREE.SRGBColorSpace // 确保颜色正确

		// 🎮 创建轨道控制器（支持鼠标拖拽旋转）
		const controls = new OrbitControls(camera, renderer.domElement)

		// ⏱️ 动画相关变量
		let mixer: THREE.AnimationMixer | null = null
		const clock = new THREE.Clock()

		// 📥 加载 3D 模型
		loader.load('/models/hologram/scene.gltf', (gltf) => {
			scene.add(gltf.scene)
			gltf.scene.scale.set(4, 4, 4) // 缩放模型

			// 🎬 处理模型自带动画
			if (gltf.animations && gltf.animations.length > 0) {
				mixer = new THREE.AnimationMixer(gltf.scene)
				gltf.animations.forEach((clip) => {
					const action = mixer!.clipAction(clip)
					action.play()
				})
				console.log(`已播放 ${gltf.animations.length} 个动画`)
			}
		})

		// 🔄 动画循环
		const animate = () => {
			requestAnimationFrame(animate)

			// 更新动画混合器
			const delta = clock.getDelta()
			if (mixer) {
				mixer.update(delta)
			}

			// 场景自动旋转
			scene.rotation.y += 0.002

			// 更新控制器
			controls.update()

			// 渲染场景
			renderer.render(scene, camera)
		}

		animate()
	}

	onMounted(() => {
		initThree()
	})
	return { hologramRef }
}
