let isPaMode = false;
let audioCtx, micSource, micStream;

function playSound(id) {
    const snd = document.getElementById(id);
    if (snd) { 
        snd.currentTime = 0; 
        snd.play().catch(err => console.error("Error playing sound:", id, err)); 
    }
}

function handleKeyPress(key) {
    playSound('snd-bgm');

    if (key === '2') {
        playSound('snd-chime-2');
        resetPaStatus();
    } else if (key === '5') {
        playSound('snd-five-bgm');
        resetPaStatus();
    } else {
        playSound('snd-click');
        if (key === '8') {
            isPaMode = true;
            document.getElementById('ptt-btn').classList.add('ptt-active');
        } else {
            resetPaStatus();
        }
    }
}

function resetPaStatus() {
    isPaMode = false;
    document.getElementById('ptt-btn').classList.remove('ptt-active');
}

function resetAll() {
    playSound('snd-bgm');
    playSound('snd-click');
    resetPaStatus();
    stopPA();
}

async function startPA() {
    if (!isPaMode) return;
    playSound('snd-bgm');
    playSound('snd-click');

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    try {
        // 에코 캔슬링 및 노이즈 억제 활성화
        micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            } 
        });
        
        micSource = audioCtx.createMediaStreamSource(micStream);
        
        // 기내 방송 느낌을 위한 밴드패스 필터
        const filter = audioCtx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 0.8;

        // 갑작스러운 큰 소리를 방지하는 컴프레서
        const compressor = audioCtx.createDynamicsCompressor();
        compressor.threshold.setValueAtTime(-24, audioCtx.currentTime);
        compressor.knee.setValueAtTime(40, audioCtx.currentTime);
        compressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        compressor.attack.setValueAtTime(0, audioCtx.currentTime);
        compressor.release.setValueAtTime(0.25, audioCtx.currentTime);

        // 연결: 마이크 -> 필터 -> 컴프레서 -> 스피커
        micSource.connect(filter);
        filter.connect(compressor);
        compressor.connect(audioCtx.destination);
    } catch (err) {
        console.error("마이크 오류:", err);
    }
}

function stopPA() {
    if (micStream) {
        micStream.getTracks().forEach(track => track.stop());
        micStream = null;
    }
    if (micSource) {
        micSource.disconnect();
        micSource = null;
    }
}
