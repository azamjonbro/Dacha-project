<template>
  <div class="media-dropzone" @dragover.prevent="dragOver" @dragleave.prevent="dragLeave" @drop.prevent="drop">
    <div class="drop-area" :class="{ active: isDragging, loading: uploading }">
      <div v-if="!uploading" class="drop-content">
        <div class="icon">📸</div>
        <p>Rasmlar yoki videoni shu yerga tashlang</p>
        <span>yoki fayllarni tanlang</span>
        <input type="file" multiple @change="handleFileSelect" accept="image/*,video/*" class="file-input" />
      </div>
      <div v-else class="upload-loader">
        <div class="spinner"></div>
        <p>Yuklanmoqda...</p>
      </div>
    </div>

    <!-- Previews -->
    <div class="media-previews" v-if="images.length > 0 || video">
      <div v-for="(img, idx) in images" :key="idx" class="preview-card">
        <img :src="getMediaPreview(img)" alt="Dacha image" />
        <button class="remove-btn" @click.stop="removeImage(idx)">×</button>
      </div>
      
      <div v-if="video" class="preview-card video-card">
        <video :src="getMediaPreview(video)" muted></video>
        <div class="video-tag">VIDEO</div>
        <button class="remove-btn" @click.stop="removeVideo">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../utils/axios';
import { useToast } from 'vue-toastification';

const props = defineProps({
  images: { type: Array, default: () => [] },
  video: { type: String, default: '' }
});

const emit = defineEmits(['update:images', 'update:video', 'uploading']);

const isDragging = ref(false);
const uploading = ref(false);
const toast = useToast();

const baseUrl = (api.defaults.baseURL || "http://localhost:4000/api").replace('/api', '');

const getMediaPreview = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${baseUrl}${url}`;
};

const dragOver = () => { isDragging.value = true; };
const dragLeave = () => { isDragging.value = false; };

const drop = (e) => {
  isDragging.value = false;
  const files = Array.from(e.dataTransfer.files);
  uploadFiles(files);
};

const handleFileSelect = (e) => {
  const files = Array.from(e.target.files);
  uploadFiles(files);
};

const uploadFiles = async (files) => {
  if (files.length === 0) return;
  
  // Size validation: 200MB
  const MAX_SIZE = 200 * 1024 * 1024;
  const oversizedFiles = files.filter(f => f.size > MAX_SIZE);
  if (oversizedFiles.length > 0) {
    toast.error(`Fayl hajmi juda katta (maks 200MB): ${oversizedFiles[0].name}`);
    return;
  }

  uploading.value = true;
  emit('uploading', true);
  
  try {
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await api.post('/dacha/upload', formData, {
        headers: { 'Content-Type': undefined }
      });
      
      if (res.type === 'video') {
        emit('update:video', res.url);
      } else {
        const newImages = [...props.images, res.url];
        emit('update:images', newImages);
      }
    }
  } catch (error) {
    toast.error("Fayl yuklashda xatolik yuz berdi");
  } finally {
    uploading.value = false;
    emit('uploading', false);
  }
};

const removeImage = (idx) => {
  const newImages = [...props.images];
  newImages.splice(idx, 1);
  emit('update:images', newImages);
};

const removeVideo = () => {
  emit('update:video', '');
};
</script>

<style scoped>
.media-dropzone {
  width: 100%;
}

.drop-area {
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 32px;
  text-align: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: rgba(15, 23, 42, 0.2);
  cursor: pointer;
}

.drop-area:hover, .drop-area.active {
  background: rgba(37, 99, 235, 0.05);
  border-color: var(--primary-color);
}

.drop-content .icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.drop-content p {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
  margin-bottom: 4px;
}

.drop-content span {
  font-size: 12px;
  color: #64748b;
}

.file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

/* Loader */
.upload-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--primary-color);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Previews */
.media-previews {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.preview-card {
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.preview-card img, .preview-card video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-btn {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(220, 38, 38, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
}

.video-tag {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: var(--primary-color);
  color: white;
  font-size: 8px;
  font-weight: 800;
  padding: 2px 4px;
  border-radius: 4px;
}
</style>
