const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const loaderEl = document.getElementById('loader');
const resultEl = document.getElementById('result');
const videoPreview = document.getElementById('videoPreview');
const imagePreview = document.getElementById('imagePreview');
const downloadBtnFinal = document.getElementById('downloadBtnFinal');
const errorEl = document.getElementById('error');

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
    resultEl.classList.add('hidden');
    loaderEl.classList.add('hidden');
}

function detectPlatform(url) {
    if (/instagram\.com/.test(url)) return 'instagram';
    if (/tiktok\.com/.test(url)) return 'tiktok';
    if (/youtube\.com|youtu\.be/.test(url)) return 'youtube';
    if (/facebook\.com/.test(url)) return 'facebook';
    if (/twitter\.com|x\.com/.test(url)) return 'twitter';
    return null;
}

downloadBtn.addEventListener('click', async () => {
    const url = urlInput.value.trim();
    if (!url) return showError('Please enter a URL.');

    resultEl.classList.add('hidden');
    errorEl.classList.add('hidden');
    loaderEl.classList.remove('hidden');

    const platform = detectPlatform(url);
    if (!platform) return showError('Unsupported platform.');

    try {
        let data;
        if (platform === 'instagram') {
            data = await window.btch.igdl(url);
        } else if (platform === 'tiktok') {
            data = await window.btch.ttdl(url);
        } else if (platform === 'youtube') {
            data = await window.btch.youtube(url);
        } else if (platform === 'facebook') {
            data = await window.btch.fbdown(url);
        } else if (platform === 'twitter') {
            data = await window.btch.twitter(url);
        }

        if (!data || data.status === false) {
            throw new Error(data?.message || 'No media found.');
        }

        const mediaUrl = data?.result?.[0]?.url || data?.url || data?.download?.[0]?.url;
        const thumbnail = data?.result?.[0]?.thumbnail || data?.thumbnail || '';

        if (!mediaUrl) {
            throw new Error('No download URL found.');
        }

        const isVideo = platform === 'instagram' || platform === 'tiktok' || mediaUrl.includes('.mp4') || mediaUrl.includes('cdninstagram.com') || mediaUrl.includes('fbcdn.net');

        if (isVideo) {
            videoPreview.src = mediaUrl;
            videoPreview.poster = thumbnail;
            videoPreview.hidden = false;
            imagePreview.hidden = true;
            downloadBtnFinal.href = mediaUrl;
            downloadBtnFinal.textContent = '⬇ Download Video';
        } else {
            videoPreview.hidden = true;
            imagePreview.src = mediaUrl;
            imagePreview.hidden = false;
            downloadBtnFinal.href = mediaUrl;
            downloadBtnFinal.textContent = '⬇ Download Image';
        }

        loaderEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (err) {
        showError(err.message || 'Something went wrong.');
    }
});