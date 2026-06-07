type Options = {
  rate?: number;
  volume?: number;
  pitch?: number;
  lang?: string;
};

let pronounce: SpeechSynthesisUtterance | null = null;

const instance = () => {
  if (!pronounce) {
    pronounce = new SpeechSynthesisUtterance();
  }
  return pronounce;
};

export const useAudio = (options: Options) => {
  const pronounce = instance();
  const { rate = 0.7, volume = 1, pitch = 1, lang = "en-US" } = options;
  pronounce.rate = rate;
  pronounce.volume = volume;
  pronounce.pitch = pitch;
  pronounce.lang = lang;

  const playAudio = (word: string) => {
    // 如果正在播放，先停止
    if (window.speechSynthesis.speaking) {
      return window.speechSynthesis.cancel();
    }
    pronounce.text = word;
    window.speechSynthesis.speak(pronounce);
  };
  return { playAudio };
};
