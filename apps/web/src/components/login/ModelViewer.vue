<script setup lang="ts">
import { computed, onMounted, onUpdated, useTemplateRef, watch } from "vue";
import type { LoginType } from "@/components/login/type.ts";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const props = defineProps<{
  loginModel: LoginType;
}>();

const emit = defineEmits<{
  toggle: [];
}>();
const canvasRef = useTemplateRef<HTMLCanvasElement>("canvasRef");

let mixer: THREE.AnimationMixer | null = null;
let clock = new THREE.Clock();
let scene = new THREE.Scene();
let currentModel: THREE.Group | null = null;

const loadModel = (url: LoginType) => {
  //移除当前模型
  if (currentModel) {
    scene.remove(currentModel);
    currentModel = null;
  }

  //加载新模型
  const loader = new GLTFLoader();
  if (url === "LOGIN") {
    loader.load(`/models/login/scene.gltf`, (gltf) => {
      currentModel = gltf.scene;
      scene.add(gltf.scene);
      scene.position.y = -0.8;
      currentModel.scale.set(0.8, 0.8, 0.8);
    });
  }
  if (url === "REGISTER") {
    loader.load(`/models/register/scene.gltf`, (gltf) => {
      currentModel = gltf.scene;
      scene.add(gltf.scene);
      scene.position.y = -0.8; //往下一点
      currentModel.scale.set(0.8, 0.8, 0.8);
      mixer = new THREE.AnimationMixer(gltf.scene);
      if (gltf.animations && gltf.animations.length > 0) {
        gltf.animations.forEach((animation) => {
          const action = mixer!.clipAction(animation);
          action.play();
        });
      }
    });
  }
};

const initThree = () => {
  const width = canvasRef.value!.clientWidth; //获取canvas宽度
  const height = canvasRef.value!.clientHeight; //获取canvas高度
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000); //创建相机
  camera.position.set(1, 0.5, 1); //设置相机位置
  const renderer = new THREE.WebGLRenderer({
    canvas: canvasRef.value!, //渲染容器
    antialias: true, //抗锯齿
    alpha: true, //透明背景
    precision: "highp", //高精度
    powerPreference: "high-performance", //高性能
  });
  loadModel(props.loginModel);
  renderer.setSize(width, height); //设置渲染器大小
  renderer.render(scene, camera); //渲染场景
  const controls = new OrbitControls(camera, renderer.domElement); //创建轨道控制器
  const animate = () => {
    requestAnimationFrame(animate);
    if (mixer) {
      mixer.update(clock.getDelta());
    }
    scene.rotation.y += 0.002; //旋转场景
    controls.update(); //更新轨道控制器
    renderer.render(scene, camera); //渲染场景
  };
  animate();
};

watch(
  () => props.loginModel,
  () => {
    initThree();
  },
);
const onToggleLoginModel = () => {
  emit("toggle");
};

const loginClass = computed(() => {
  return props.loginModel === "LOGIN"
    ? "bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all"
    : "text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all";
});
const registerClass = computed(() => {
  return props.loginModel === "REGISTER"
    ? "bg-indigo-500 text-white shadow-lg px-4 py-2 rounded-md text-sm font-medium transition-all"
    : "text-white/70 hover:text-white hover:bg-white/10 px-4 py-2 rounded-md text-sm font-medium transition-all";
});

onMounted(() => {
  initThree();
});

onUpdated(() => {
  // initThree()
});
</script>

<template>
  <div class="relative h-full bg-linear-to-br from-gray-800 to-gray-900">
    <canvas class="w-full h-full" ref="canvasRef"></canvas>
    <div class="absolute top-6 left-6">
      <div class="flex items-center gap-2">
        <div
          class="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-[10px] flex items-center justify-center"
        >
          <span class="text-white font-bold text-xl">E</span>
        </div>
        <span class="text-white text-xl font-bold">English App</span>
      </div>
    </div>
    <!-- 登录/注册切换按钮 -->
    <div class="absolute top-6 right-6">
      <div class="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1">
        <button :class="loginClass" @click="onToggleLoginModel">登录</button>
        <button :class="registerClass" @click="onToggleLoginModel">注册</button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
