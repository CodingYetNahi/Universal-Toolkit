// Procedural Web Audio Ambient Synthesizer
// Generates rain, ocean, campfire, pink noise, white noise, and binaural alpha tone

class AmbientAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private activeGenerators: Map<string, { nodes: AudioNode[]; gain: GainNode }> = new Map();

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Create White Noise buffer
  private createNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Create Pink Noise buffer
  private createPinkNoiseBuffer(duration = 5): AudioBuffer {
    if (!this.ctx) throw new Error('AudioContext not ready');
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  public startSound(id: string, initialVolume = 0.5) {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    if (this.activeGenerators.has(id)) {
      this.setVolume(id, initialVolume);
      return;
    }

    const soundGain = this.ctx.createGain();
    soundGain.gain.setValueAtTime(initialVolume, this.ctx.currentTime);
    soundGain.connect(this.masterGain);

    const nodesToClean: AudioNode[] = [soundGain];

    switch (id) {
      case 'rain':
      case 'indian_monsoon': {
        const buffer = this.createPinkNoiseBuffer(5);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(id === 'indian_monsoon' ? 1100 : 800, this.ctx.currentTime);

        const highpass = this.ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.setValueAtTime(150, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(highpass);
        highpass.connect(soundGain);

        noiseSource.start();
        nodesToClean.push(noiseSource, filter, highpass);
        break;
      }

      case 'ocean': {
        const buffer = this.createPinkNoiseBuffer(5);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(400, this.ctx.currentTime);

        // LFO for wave swelling
        const lfo = this.ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.12, this.ctx.currentTime); // ~8 sec wave cycle
        const lfoGain = this.ctx.createGain();
        lfoGain.gain.setValueAtTime(300, this.ctx.currentTime);

        lfo.connect(filter.frequency);
        noiseSource.connect(filter);
        filter.connect(soundGain);

        lfo.start();
        noiseSource.start();
        nodesToClean.push(noiseSource, filter, lfo, lfoGain);
        break;
      }

      case 'campfire': {
        const buffer = this.createPinkNoiseBuffer(4);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1200, this.ctx.currentTime);
        filter.Q.setValueAtTime(3, this.ctx.currentTime);

        noiseSource.connect(filter);
        filter.connect(soundGain);
        noiseSource.start();
        nodesToClean.push(noiseSource, filter);
        break;
      }

      case 'pink_noise': {
        const buffer = this.createPinkNoiseBuffer(5);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        noiseSource.connect(soundGain);
        noiseSource.start();
        nodesToClean.push(noiseSource);
        break;
      }

      case 'alpha_wave': {
        // Binaural beat: 200 Hz left ear, 210 Hz right ear = 10 Hz Alpha frequency
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        osc1.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(210, this.ctx.currentTime);

        const merger = this.ctx.createChannelMerger(2);
        osc1.connect(merger, 0, 0);
        osc2.connect(merger, 0, 1);

        merger.connect(soundGain);
        osc1.start();
        osc2.start();
        nodesToClean.push(osc1, osc2, merger);
        break;
      }

      case 'white_noise': {
        const buffer = this.createNoiseBuffer(5);
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = buffer;
        noiseSource.loop = true;
        noiseSource.connect(soundGain);
        noiseSource.start();
        nodesToClean.push(noiseSource);
        break;
      }
      case 'courtyard':
      case 'train': {
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = this.createPinkNoiseBuffer(6);
        noiseSource.loop = true;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(id === 'train' ? 260 : 520, this.ctx.currentTime);
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.setValueAtTime(id === 'train' ? 1.8 : 0.08, this.ctx.currentTime);
        lfoGain.gain.setValueAtTime(id === 'train' ? 0.08 : 0.03, this.ctx.currentTime);
        lfo.connect(lfoGain); lfoGain.connect(soundGain.gain);
        noiseSource.connect(filter); filter.connect(soundGain);
        noiseSource.start(); lfo.start();
        nodesToClean.push(noiseSource, filter, lfo, lfoGain);
        break;
      }
    }

    this.activeGenerators.set(id, { nodes: nodesToClean, gain: soundGain });
  }

  public setVolume(id: string, volume: number) {
    const item = this.activeGenerators.get(id);
    if (item && this.ctx) {
      item.gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stopSound(id: string) {
    const item = this.activeGenerators.get(id);
    if (item) {
      item.nodes.forEach((node) => {
        if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
          try {
            (node as AudioScheduledSourceNode).stop();
          } catch {
            // Already stopped
          }
        }
        node.disconnect();
      });
      this.activeGenerators.delete(id);
    }
  }

  public stopAll() {
    Array.from(this.activeGenerators.keys()).forEach((id) => {
      this.stopSound(id);
    });
  }
}

export const ambientAudio = new AmbientAudioEngine();
