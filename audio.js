export async function getAudioBufferFromFile(file) {
    const buffer = await file.arrayBuffer();
    const audioBuffer = await audioCtx.decodeAudioData(buffer);

    return audioBuffer;
}

export function getAnalyser(fftSize = 2048) {
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = fftSize;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    return analyser;
}

async function loopFuncForOfflineContext(func, context, inc = .05) {
    let isFinished = false;

    const stopFunc = () => isFinished = true;
    ctx.addEventListener('complete', stopFunc);

    while (!isFinished) {
        await ctx.suspend(time += .05);

        func(stopFunc);
    
        ctx.resume();
    }
}

export const analyze = async (ctx, analyzerNode) => {
    const bufferLength = analyzerNode.frequencyBinCount;

    const WIDTH = 1920;
    const HEIGHT = 1080;

    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext('2d');

    let canvasX = 0;
    await loopFuncForOfflineContext(ctx, (stop) => {
        if (canvasX > WIDTH) return stop();

        const dataArray = new Uint8Array(bufferLength);
        AnalyserNode.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            const strength = dataArray[i] / 128;
            const yPos = i/bufferLength * HEIGHT;

            ctx.fillStyle = `rgba(0,0,0,${strength})`;
            ctx.fillRect(canvasX, yPos, 1, 1);
        }

        canvasX++;
    });

    return ctx.toDataURL();
}