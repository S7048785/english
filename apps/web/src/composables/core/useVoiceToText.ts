type Options = {
	lang?: string; // 语言
	// 是否连续识别，默认 false，说完话后自动停止，为true时需手动调用stop函数关闭语音识别
	continuous?: boolean;
	// 是否显示临时结果 默认false，类似SSE
	interimResults?: boolean;
	// 最大候选数，默认1
	maxAlternatives?: number;
}

let instance: SpeechRecognition | null = null

const getInstance = (options: Options): SpeechRecognition => {
	// Safari要加webkit前缀
	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if (!SpeechRecognition) {
		throw new Error('浏览器不支持语音识别');
	}
	if (!instance) {
		// 第一次实例化
		instance = new SpeechRecognition();
		const { lang = 'zh-CN', continuous = true, interimResults = true, maxAlternatives = 1 } = options;
		instance.lang = lang;
		instance.continuous = continuous;
		instance.interimResults = interimResults;
		instance.maxAlternatives = maxAlternatives;
	}
	return instance;
}
export const useVoiceToText = (options: Options) => {
	const recognition = getInstance(options);
	const isRecording = ref(false);
	// 识别结束事件
	recognition.onend = () => {
		isRecording.value = false;
	}
	// 开始识别
	const start = (callback?: (result: string) => void) => {
		isRecording.value = true;
		recognition.start();
		// 输出识别结果事件
		recognition.onresult = (event: any) => {
			let fullText = ''
			for(let i = 0; i < event.results.length; i++) {
				fullText = event.results[i][0].transcript
			}
			console.log('识别结果：', fullText);
			callback?.(fullText)
		}
	}
	// 停止识别
	const stop = () => {
		isRecording.value = false;
		recognition.stop();
	}
	return {
		recognition,
		start,
		stop,
		isRecording,
	};
}