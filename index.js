import {
    getAudioBufferFromFile,
    getAnalyser,
    analyze,
} from './audio.js';

const offlineCtx = new OfflineAudioContext(2, 44100*40, 44100);

const source = offlineCtx.createBufferSource();

const input = document.querySelector('input[type=file]');
const img = document.querySelector('img');

input.addEventListener('input', async e => {
    const file = e.currentTarget.files[0];
    
    const audioBuffer = await getAudioBufferFromFile(file, offlineCtx);

    const analyser = getAnalyser(offlineCtx);
    analyser.connect(offlineCtx.destination);

    offlineCtx.startRendering();
    
    const imageUrl = await analyze(offlineCtx, analyser);
    img.src = imageUrl;
    
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start();

    
});