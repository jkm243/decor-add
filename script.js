// On injecte dynamiquement la bibliothèque FFmpeg.wasm pour éviter de lourds fichiers locaux
const ffmpegScript = document.createElement('script');
ffmpegScript.src = 'https://unpkg.com';
document.head.appendChild(ffmpegScript);

const translations = {
    RU: {
        title: "Промо Afro-Latino Carnaval",
        subTitle: "Добавьте рамку мероприятия на ваше фото или видео за пару секунд!",
        upload: "Выбрать файл (Видео или Фото)",
        insTitle: "⚙️ Инструкция по настройке:",
        insList: [
            "Используйте ползунки ниже, чтобы идеально подогнать ваш файл под рамку.",
            "Вы можете отдалить/приблизить изображение и сместить его во все стороны.",
            "Конвертация в MP4 происходит автоматически при скачивании."
        ],
        zoom: "Масштаб",
        labelX: "Смещение по горизонтали (X)",
        labelY: "Смещение по вертикали (Y)",
        btnDownload: "Скачать готовый файл",
        statusLoading: "Загрузка файла...",
        statusReady: "Отрегулируйте размер и положение файла ниже перед скачиванием.",
        statusGenImg: "Создание изображения...",
        statusDoneImg: "Изображение успешно скачано!",
        statusGenVid: "Идет обработка и конвертация в MP4... Пожалуйста, подождите.",
        statusDoneVid: "MP4 видео успешно скачано и готово к публикации!"
    },
    EN: {
        title: "Promo Afro-Latino Carnaval",
        subTitle: "Add the event frame to your photo or video in just a few seconds!",
        upload: "Choose File (Video or Photo)",
        insTitle: "⚙️ Setup Instructions:",
        insList: [
            "Use the sliders below to perfectly fit your file under the frame.",
            "You can zoom in/out and shift the position horizontally or vertically.",
            "Conversion to MP4 happens automatically during download."
        ],
        zoom: "Zoom",
        labelX: "Horizontal Position (X)",
        labelY: "Vertical Position (Y)",
        btnDownload: "Download customized file",
        statusLoading: "Loading your file...",
        statusReady: "Adjust the size and position below before downloading.",
        statusGenImg: "Generating image...",
        statusDoneImg: "Image downloaded successfully!",
        statusGenVid: "Processing and converting to MP4... Please wait.",
        statusDoneVid: "MP4 Video downloaded successfully and ready to post!"
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

let userVideo = document.createElement('video');
let userImage = new Image();
let overlayImage = new Image();

userVideo.crossOrigin = "anonymous";
userImage.crossOrigin = "anonymous";
overlayImage.crossOrigin = "anonymous";
overlayImage.src = 'decor-flyer.png';

let currentMediaType = null, mediaLoaded = false, isProcessing = false;
let ffmpegInstance = null;

// Initialisation transparente de FFmpeg en arrière-plan
async function loadFFmpeg() {
    if (typeof FFmpeg === 'undefined') {
        setTimeout(loadFFmpeg, 500);
        return;
    }
    const { createFFmpeg } = FFmpeg;
    ffmpegInstance = createFFmpeg({ log: false });
    await ffmpegInstance.load();
}
loadFFmpeg();

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
    const file = e.target.files[0];
    if (!file) return;
    mediaLoaded = false;
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
    } else if (currentMediaType === 'video') {
        if (!ffmpegInstance || !ffmpegInstance.isLoaded()) {
            alert("Пожалуйста, подождите секунду, модуль конвертации еще загружается...");
            return;
        }

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
        const mr = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9,opus' });
        mr.ondataavailable = function (e) { if (e.data.size > 0) chunks.push(e.data); };

        mr.onstop = async function () {
            userVideo.ontimeupdate = null;

            // ÉTAPE DE CONVERSION FFMPEG AUTOMATIQUE ET TRANSPARENTE
            const webmBlob = new Blob(chunks, { type: 'video/webm' });
            const arrayBuffer = await webmBlob.arrayBuffer();

            // Écriture du fichier WebM temporaire dans la mémoire virtuelle de FFmpeg
            ffmpegInstance.FS('writeFile', 'input.webm', new Uint8Array(arrayBuffer));

            // Commande de conversion ultra-rapide en vrai MP4 (Codec H.264 compatible WhatsApp/Instagram)
            await ffmpegInstance.run('-i', 'input.webm', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-c:a', 'aac', 'output.mp4');

            // Lecture du fichier MP4 converti
            const mp4Data = ffmpegInstance.FS('readFile', 'output.mp4');
            const mp4Blob = new Blob([mp4Data.buffer], { type: 'video/mp4' });

            // Lancement automatique du téléchargement du fichier final .mp4
            const a = document.createElement('a');
            a.href = URL.createObjectURL(mp4Blob); a.download = 'promo.mp4'; document.body.appendChild(a); a.click(); document.body.removeChild(a);
            // Nettoyage de la mémoire virtuelle
            ffmpegInstance.FS('unlink', 'input.webm'); ffmpegInstance.FS('unlink', 'output.mp4'); statusText.innerText = translations[currentLang].statusDoneVid; downloadBtn.disabled = false; isProcessing = false; userVideo.muted = true; userVideo.loop = true; userVideo.play(); drawVideoLoop();
        }; mr.start(); userVideo.play(); userVideo.onended = function () { mr.stop(); };
    }
});