const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const statusEl = document.getElementById('status');
const resultEl = document.getElementById('result');
const videoPreview = document.getElementById('videoPreview');
const imagePreview = document.getElementById('imagePreview');
const downloadBtnFinal = document.getElementById('downloadBtnFinal');

function showStatus(type, message) {
    statusEl.className = `status ${type}`;
    statusEl.textContent = message;
    statusEl.classList.remove('hidden');
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
    if (!url) return showStatus('error', 'Please enter a URL.');

    resultEl.classList.add('hidden');
    statusEl.classList.add('hidden');

    const platform = detectPlatform(url);
    if (!platform) return showStatus('error', 'Unsupported platform.');

    showStatus('loading', 'Fetching media...');

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
            throw new Error(data?.message || 'No downloadable media found.');
        }

        const mediaUrl = data?.result?.[0]?.url || data?.url || data?.download?.[0]?.url;
        const thumbnail = data?.result?.[0]?.thumbnail || data?.thumbnail || '';

        if (!mediaUrl) {
            throw new Error('No media URL found in response.');
        }

        const isVideo = platform === 'instagram' || platform === 'tiktok' || mediaUrl.includes('.mp4') || mediaUrl.includes('cdninstagram.com') || mediaUrl.includes('fbcdn.net');

        if (thumbnail && isVideo) {
            videoPreview.poster = thumbnail;
        }

        if (isVideo) {
            videoPreview.src = mediaUrl;
            videoPreview.hidden = false;
            imagePreview.hidden = true;
            downloadBtnFinal.href = mediaUrl;
            downloadBtnFinal.textContent = '⬇ Download Video';
        } else {
            videoPreview.hidden = true;
            imagePreview.src = mediaUrl;
            imagePreview.hidden = false;
            imagePreview.style.aspectRatio = 'auto';
            downloadBtnFinal.href = mediaUrl;
            downloadBtnFinal.textContent = '⬇ Download Image';
        }

        statusEl.classList.add('hidden');
        resultEl.classList.remove('hidden');
    } catch (err) {
        showStatus('error', err.message || 'Something went wrong.');
    }
});