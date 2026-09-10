const translations = {
    RU: {
        title: "Промо Afro-Latino Carnaval",
        subTitle: "Добавьте рамку мероприятия на ваше фото или видео за пару секунд!",
        upload: "Выбрать файл (Видео или Фото)",
        insTitle: "⚙️ Инструкция по настройке:",
        insList: [
            "Используйте ползунки ниже, чтобы идеально подогнать ваш файл под рамку.",
            "Вы можете отдалить/приблизить изображение и сместить его во все стороны.",
            "Экспорт в MP4 происходит мгновенно и без задержек."
        ],
        zoom: "Масштаб",
        labelX: "Смещение по горизонтали (X)",
        labelY: "Смещение по вертикали (Y)",
        btnDownload: "Скачать готовый файл",
        statusLoading: "Загрузка файла...",
        statusReady: "Отрегулируйте размер и положение файла ниже перед скачиванием.",
        statusGenImg: "Создание изображения...",
        statusDoneImg: "Изображение успешно скачано!",
        statusGenVid: "Идет мгновенное сохранение в MP4... Пожалуйста, подождите.",
        statusDoneVid: "MP4 видео успешно скачано и готово к публикации!",
        shareTitle: "📢 Поделиться в соцсетях:",
        whatsappMsg: "Привет! Посмотри мое видео с Afro-Latino Carnaval! Присоединяйся к нам 🎉"
    },
    EN: {
        title: "Promo Afro-Latino Carnaval",
        subTitle: "Add the event frame to your photo or video in just a few seconds!",
        upload: "Choose File (Video or Photo)",
        insTitle: "⚙️ Setup Instructions:",
        insList: [
            "Use the sliders below to perfectly fit your file under the frame.",
            "You can zoom in/out and shift the position horizontally or vertically.",
            "Export to MP4 happens instantly without delays."
        ],
        zoom: "Zoom",
        labelX: "Horizontal Position (X)",
        labelY: "Vertical Position (Y)",
        btnDownload: "Download customized file",
        statusLoading: "Loading your file...",
        statusReady: "Adjust the size and position below before downloading.",
        statusGenImg: "Generating image...",
        statusDoneImg: "Image downloaded successfully!",
        statusGenVid: "Saving MP4 video instantly... Please wait.",
        statusDoneVid: "MP4 Video downloaded successfully and ready to post!",
        shareTitle: "📢 Share on Socials:",
        whatsappMsg: "Hey! Check out my video from the Afro-Latino Carnaval! Join us 🎉"
    }
};

let currentLang = 'RU';
const mediaInput = document.getElementById('mediaInput');
const previewBox = document.getElementById('previewBox');
const controlsBox = document.getElementById('controlsBox');
const canvas = document.getElementById('canvasRender');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const statusText = document.getElementById('status');
const zoomRange = document.getElementById('zoomRange');
const posXRange = document.getElementById('posXRange');
const posYRange = document.getElementById('posYRange');
const zoomLabel = document.getElementById('zoomLabel');
const shareBox = document.getElementById('shareBox');

let userVideo = document.createElement('video');
let userImage = new Image();
let overlayImage = new Image();

userVideo.crossOrigin = "anonymous";
userImage.crossOrigin = "anonymous";
overlayImage.crossOrigin = "anonymous";
overlayImage.src = 'decor-flyer.png';

let currentMediaType = null, mediaLoaded = false, isProcessing = false;

function switchLang(lang) {
    currentLang = lang;
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText === lang) btn.classList.add('active');
    });
    document.getElementById('mainTitle').innerText = translations[lang].title;
    document.getElementById('subTitle').innerText = translations[lang].subTitle;
    document.getElementById('uploadText').innerText = translations[lang].upload;
    document.getElementById('insTitle').innerText = translations[lang].insTitle;
    document.getElementById('labelX').innerText = translations[lang].labelX;
    document.getElementById('labelY').innerText = translations[lang].labelY;
    document.getElementById('shareTitle').innerText = translations[lang].shareTitle;
    downloadBtn.innerText = translations[lang].btnDownload;

    const listContainer = document.getElementById('insList');
    listContainer.innerHTML = '';
    translations[lang].insList.forEach(text => {
        const li = document.createElement('li');
        li.innerText = text;
        listContainer.appendChild(li);
    });
    zoomLabel.innerText = `${translations[lang].zoom}: ${zoomRange.value}%`;
    if (mediaLoaded && !isProcessing) statusText.innerText = translations[lang].statusReady;
}

switchLang('RU');

[zoomRange, posXRange, posYRange].forEach(input => {
    input.addEventListener('input', () => {
        if (input === zoomRange) zoomLabel.innerText = `${translations[currentLang].zoom}: ${zoomRange.value}%`;
        if (currentMediaType === 'image' && mediaLoaded) drawFrame();
    });
});

mediaInput.addEventListener('change', function (e) {
    const file = e.target.files;
    if (!file) return;
    mediaLoaded = false;
    shareBox.style.display = 'none';
    statusText.innerText = translations[currentLang].statusLoading;
    const fileURL = URL.createObjectURL(file);

    if (file.type.startsWith('video/')) {
        currentMediaType = 'video';
        userVideo.src = fileURL;
        userVideo.muted = true; userVideo.playsInline = true; userVideo.loop = true;
        userVideo.onloadeddata = function () { initCanvas(); userVideo.play(); drawVideoLoop(); };
    } else if (file.type.startsWith('image/')) {
        currentMediaType = 'image';
        userImage.src = fileURL;
        userImage.onload = function () { initCanvas(); drawFrame(); };
    }
});

function initCanvas() {
    canvas.width = 720; canvas.height = 1280;
    previewBox.style.display = 'block'; controlsBox.style.display = 'block'; downloadBtn.style.display = 'block';
    statusText.innerText = translations[currentLang].statusReady;
    mediaLoaded = true; zoomRange.value = 100; zoomLabel.innerText = `${translations[currentLang].zoom}: 100%`;
    posXRange.value = 0; posYRange.value = 0;
}

function drawVideoLoop() {
    if (currentMediaType === 'video' && !userVideo.paused && !userVideo.ended) {
        drawFrame(); requestAnimationFrame(drawVideoLoop);
    }
}

function drawFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let sW = currentMediaType === 'video' ? userVideo.videoWidth : userImage.width;
    let sH = currentMediaType === 'video' ? userVideo.videoHeight : userImage.height;
    if (!sW || !sH) return;

    let baseScale = Math.max(canvas.width / sW, canvas.height / sH);
    let userZoom = zoomRange.value / 100;
    let fW = sW * baseScale * userZoom;
    let fH = sH * baseScale * userZoom;
    let x = (canvas.width - fW) / 2 + parseInt(posXRange.value);
    let y = (canvas.height - fH) / 2 + parseInt(posYRange.value);

    if (currentMediaType === 'video') ctx.drawImage(userVideo, x, y, fW, fH);
    else ctx.drawImage(userImage, x, y, fW, fH);
    ctx.drawImage(overlayImage, 0, 0, canvas.width, canvas.height);
}

downloadBtn.addEventListener('click', async function () {
    if (isProcessing) return;
    if (currentMediaType === 'image') {
        statusText.innerText = translations[currentLang].statusGenImg;
        const a = document.createElement('a'); a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.download = 'promo.jpg'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
        statusText.innerText = translations[currentLang].statusDoneImg;
        shareBox.style.display = 'block';
    } else if (currentMediaType === 'video') {
        isProcessing = true; downloadBtn.disabled = true;
        statusText.innerText = translations[currentLang].statusGenVid;

        userVideo.loop = false; userVideo.currentTime = 0; userVideo.muted = false;
        userVideo.ontimeupdate = function () { drawFrame(); };

        const stream = canvas.captureStream(30);
        let srcStream = userVideo.captureStream ? userVideo.captureStream() : userVideo.mozCaptureStream();
        if (srcStream && srcStream.getAudioTracks().length > 0) {
            stream.addTrack(srcStream.getAudioTracks());
        }

        let chunks = [];
        let options = { mimeType: 'video/mp4;codecs=avc1.42E01F,mp4a.40.2' };

        if (!MediaRecorder.isTypeSupported(options)) options = { mimeType: 'video/mp4;codecs=h264' };
        if (!MediaRecorder.isTypeSupported(options)) options = { mimeType: 'video/mp4' };
        if (!MediaRecorder.isTypeSupported(options)) options = { mimeType: 'video/webm;codecs=h264' };
        if (!MediaRecorder.isTypeSupported(options)) options = { mimeType: 'video/webm' };

        const mr = new MediaRecorder(stream, options);
        mr.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };

        mr.onstop = function () {
            userVideo.ontimeupdate = null;

            const blobData = new Blob(chunks, { type: 'video/mp4' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blobData);
            a.download = 'promo.mp4';
            document.body.appendChild(a); a.click(); document.body.removeChild(a);

            statusText.innerText = translations[currentLang].statusDoneVid;
            downloadBtn.disabled = false; isProcessing = false;
            userVideo.muted = true; userVideo.loop = true; userVideo.play(); drawVideoLoop();

            shareBox.style.display = 'block';
        };

        mr.start();
        userVideo.play();
        userVideo.onended = function () { mr.stop(); };
    }
});

function shareWhatsApp() {
    const text = encodeURIComponent(translations[currentLang].whatsappMsg);
    const url = `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
}

function shareInstagram() { 
    if (currentLang === 'RU') { 
        alert("Видео сохранено в вашу галерею! Откройте Instagram и выберите его для публикации в Сторис или Reels ✨"); } 
        else { 
            alert("Video saved to your gallery! Open Instagram and select it to publish as a Story or Reel ✨"); } 
            window.open('instagram.com', '_blank'); }