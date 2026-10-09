// Retro 8-Bit Web Audio Synthesizer for Pixel Expense Manager
const SoundEffects = (function() {
    let audioCtx = null;
    let isMuted = localStorage.getItem('pixel_sound_muted') === 'true';

    function initAudio() {
        if (!audioCtx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    function playTone(freq, type, duration, startTime = 0, gain = 0.1) {
        if (isMuted || !audioCtx) return;
        try {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
            gainNode.gain.setValueAtTime(gain, audioCtx.currentTime + startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + startTime + duration);
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start(audioCtx.currentTime + startTime);
            osc.stop(audioCtx.currentTime + startTime + duration);
        } catch (e) {
            console.warn("Audio play error", e);
        }
    }

    return {
        isMuted: () => isMuted,
        toggleMute: function() {
            isMuted = !isMuted;
            localStorage.setItem('pixel_sound_muted', isMuted);
            return isMuted;
        },
        playCoin: function() {
            initAudio();
            if (isMuted) return;
            // Mario coin: B5 then E6
            playTone(987.77, 'square', 0.08, 0, 0.12);
            playTone(1318.51, 'square', 0.28, 0.08, 0.12);
        },
        playClick: function() {
            initAudio();
            if (isMuted) return;
            playTone(600, 'square', 0.03, 0, 0.06);
        },
        playSuccess: function() {
            initAudio();
            if (isMuted) return;
            // Arpeggio C5 -> E5 -> G5 -> C6
            playTone(523.25, 'triangle', 0.1, 0, 0.1);
            playTone(659.25, 'triangle', 0.1, 0.08, 0.1);
            playTone(783.99, 'triangle', 0.1, 0.16, 0.1);
            playTone(1046.50, 'triangle', 0.25, 0.24, 0.12);
        },
        playWarning: function() {
            initAudio();
            if (isMuted) return;
            playTone(220, 'sawtooth', 0.15, 0, 0.15);
            playTone(180, 'sawtooth', 0.25, 0.12, 0.15);
        },
        playDelete: function() {
            initAudio();
            if (isMuted) return;
            playTone(400, 'sawtooth', 0.08, 0, 0.08);
            playTone(200, 'sawtooth', 0.15, 0.06, 0.08);
        }
    };
})();
