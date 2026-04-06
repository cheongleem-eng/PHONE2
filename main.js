let isPaMode = false;
let audioCtx, micSource, delayNode, feedbackGain;

function playSound(id) {
    const snd = document.getElementById(id);
    if (snd) { 
        snd.currentTime = 0; 
        snd.play().catch(err => console.error("Error playing sound:", id, err)); 
    }
}

function handleKeyPress(key) {
    // 모든 버튼 클릭 시 button bgm 재생
    playSound('snd-bgm');

    if (key === '2') {
        playSound('snd-chime-2');
        resetPaStatus();
    } else if (key === '5') {
        // button bgm 재생 후 0.5초 뒤에 five bgm 재생
        setTimeout(() => {
            playSound('snd-five-bgm');
        }, 500);
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
    playSound('snd-bgm'); // button bgm 재생
    playSound('snd-click'); // 리셋 버튼 클릭음
    resetPaStatus();
    stopPA();
}

async function startPA() {
    playSound('snd-bgm'); // button bgm 재생
    playSound('snd-click'); // PTT 누를 때 즉시 클릭음

    if (!isPaMode) return;

    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') await audioCtx.resume();

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micSource = audioCtx.createMediaStreamSource(stream);

        delayNode = audioCtx.createDelay();
        delayNode.delayTime.value = 0.2; 
        
        feedbackGain = audioCtx.createGain();
        feedbackGain.gain.value = 0.4; 

        micSource.connect(audioCtx.destination);
        micSource.connect(delayNode);
        delayNode.connect(feedbackGain);
        feedbackGain.connect(audioCtx.destination);
    } catch (err) {
        console.error("마이크 오류:", err);
    }
}

function stopPA() {
    if (micSource) {
        micSource.disconnect();
        micSource = null;
    }
}