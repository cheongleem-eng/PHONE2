let isPaMode = false;
let audioCtx, micSource, delayNode, feedbackGain;

function playSound(id) {
    const snd = document.getElementById(id);
    if (snd) { snd.currentTime = 0; snd.play(); }
}

function handleKeyPress(key) {
    if (key === '2') {
        playSound('snd-chime-2');
        resetPaStatus();
    } else if (key === '5') {
        playSound('snd-chime-5');
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
    playSound('snd-click'); // 리셋 버튼 클릭음
    resetPaStatus();
    stopPA();
}

async function startPA() {
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