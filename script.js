const urlInput = document.getElementById('urlInput');
const downloadBtn = document.getElementById('downloadBtn');
const result = document.getElementById('result');
const error = document.getElementById('error');
const loading = document.getElementById('loading');
const videoPreview = document.getElementById('videoPreview');
const imagePreview = document.getElementById('imagePreview');
const videoTitle = document.getElementById('videoTitle');
const videoAuthor = document.getElementById('videoAuthor');
const videoMeta = document.getElementById('videoMeta');
const downloadMp4 = document.getElementById('downloadMp4');
const copyLink = document.getElementById('copyLink');

let currentVideoUrl = '';
let currentThumbnail = '';

function show(el) {
  [result, error, loading].forEach(e => e.classList.add('hidden'));
  el.classList.remove('hidden');
}

function isValidInstagramUrl(url) {
  const patterns = [
    /https?:\/\/(www\.)?instagram\.com\/p\/[\w-]+/i,
    /https?:\/\/(www\.)?instagram\.com\/reel\/[\w-]+/i,
    /https?:\/\/(www\.)?instagram\.com\/tv\/[\w-]+/i,
  ];
  return patterns.some(p => p.test(url.trim()));
}

downloadBtn.addEventListener('click', async () => {
  const url = urlInput.value.trim();
  if (!url) {
    error.textContent = 'Please paste an Instagram URL';
    show(error);
    return;
  }
  if (!isValidInstagramUrl(url)) {
    error.textContent = 'Please enter a valid Instagram URL';
    show(error);
    return;
  }

  downloadBtn.disabled = true;
  show(loading);

  try {
    const data = await window.btch.igdl(url);
    
    if (!data || data.status === false) {
      throw new Error(data?.message || 'No media found');
    }

    const mediaUrl = data?.result?.[0]?.url || data?.url;
    const thumbnail = data?.result?.[0]?.thumbnail || data?.thumbnail || '';
    
    if (!mediaUrl) {
      throw new Error('No download URL found');
    }

    currentVideoUrl = mediaUrl;
    currentThumbnail = thumbnail;

    const isVideo = mediaUrl.includes('.mp4') || mediaUrl.includes('cdninstagram.com') || mediaUrl.includes('fbcdn.net');

    if (isVideo) {
      videoPreview.src = mediaUrl;
      videoPreview.hidden = false;
      imagePreview.hidden = true;
      videoTitle.textContent = 'Instagram Video';
    } else {
      imagePreview.src = mediaUrl;
      imagePreview.hidden = false;
      videoPreview.hidden = true;
      videoTitle.textContent = 'Instagram Image';
    }

    if (thumbnail) {
      videoPreview.poster = thumbnail;
    }

    videoAuthor.textContent = '';
    videoMeta.textContent = 'Ready to download';

    show(result);
  } catch (err) {
    error.textContent = err.message || 'Something went wrong. Try another link.';
    show(error);
  } finally {
    downloadBtn.disabled = false;
  }
});

downloadMp4.addEventListener('click', async () => {
  if (!currentVideoUrl) return;
  try {
    downloadMp4.textContent = 'Starting download...';
    downloadMp4.disabled = true;
    
    const response = await fetch(currentVideoUrl);
    if (!response.ok) {
      throw new Error('Download failed');
    }
    
    const blob = await response.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'instagram-video.mp4';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
  } catch (err) {
    error.textContent = err.message || 'Download failed';
    show(error);
  } finally {
    downloadMp4.textContent = '⬇ Download Video';
    downloadMp4.disabled = false;
  }
});

copyLink.addEventListener('click', async () => {
  if (!currentVideoUrl) return;
  try {
    await navigator.clipboard.writeText(currentVideoUrl);
    const original = copyLink.textContent;
    copyLink.textContent = 'Copied!';
    setTimeout(() => copyLink.textContent = original, 2000);
  } catch {
    error.textContent = 'Failed to copy link';
    show(error);
  }
});