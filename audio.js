export async function getAudioBufferFromFile(file, audioCtx) {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buffer);

    return audioBuffer;
}

export function getAnalyser(audioCtx, fftSize = 2048) {
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = fftSize;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    return analyser;
}

async function loopFuncForOfflineContext(ctx, func, inc = .1) {
    let isFinished = false;

    const stopFunc = () => isFinished = true;
    ctx.addEventListener('complete', stopFunc);

    while (!isFinished) {
        const time = ctx.currentTime + inc;
        try {
            await ctx.suspend(time);
        } catch (e) {
            console.log(e)
            return;
        }

        func(stopFunc);
    
        ctx.resume();
    }
}

export const analyze = async (audioCtx, analyzerNode) => {
    const bufferLength = analyzerNode.frequencyBinCount;

    const WIDTH = 1920;
    const HEIGHT = 1080;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'red';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    let canvasX = 0;
    await loopFuncForOfflineContext(audioCtx, (stop) => {
        if (canvasX > WIDTH) return stop();

        const dataArray = new Uint8Array(bufferLength);
        analyzerNode.getByteFrequencyData(dataArray);

        const lineHeight = bufferLength / HEIGHT;

        for (let i = 0; i < bufferLength; i++) {
            const strength = dataArray[i] / 128;
            const yPos = i/bufferLength * HEIGHT;

            ctx.fillStyle = `rgba(0,0,0,${strength})`;
            ctx.fillRect(canvasX, yPos, 2, lineHeight);
        }
        
        console.log({ canvasX })
        canvasX++;
    });

    return canvas.toDataURL();
}