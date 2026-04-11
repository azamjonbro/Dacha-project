<template>
  <main class="app-layout">
    <div class="content-area">
      <transition name="view">
        <DashboardView v-if="activeTab === 'dashboard'" />
        <DachasView v-else-if="activeTab === 'dachas'" :key="refreshKey" />
        <StatisticsView v-else-if="activeTab === 'statistics'" />
        <HistoryView v-else-if="activeTab === 'history'" />
      </transition>
    </div>
    
    <!-- Central FAB -->
    <button class="fab-btn" @click="showSheet = true">+</button>
    
    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <div class="nav-item" :class="{ active: activeTab === 'dashboard' }" @click="activeTab = 'dashboard'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        <span>Asosiy</span>
      </div>
      
      <div class="nav-item" :class="{ active: activeTab === 'dachas' }" @click="activeTab = 'dachas'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <span>Dachalar</span>
      </div>

      <div class="nav-spacer"></div>

      <div class="nav-item" :class="{ active: activeTab === 'statistics' }" @click="activeTab = 'statistics'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <span>Statistika</span>
      </div>

      <div class="nav-item" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Tarix</span>
      </div>
    </nav>
    
    <!-- Action Bottom Sheet -->
    <transition name="fade">
      <div v-if="showSheet" class="sheet-overlay" @click.self="showSheet = false"></div>
    </transition>
    <transition name="slide-up">
      <div v-if="showSheet" class="bottom-sheet z-max">
        <div class="sheet-handle"></div>
        <h3 class="sheet-header">Yangi Dacha qo'shish</h3>
        <div class="sheet-content">
          <input type="text" v-model="newDacha.name" placeholder="Dacha nomi..." class="sheet-input mb-3"/>
          <input type="text" v-model="newDacha.location" placeholder="Manzil (masalan: Nanay)..." class="sheet-input mb-3"/>
          <MediaDropzone 
            v-model:images="newDacha.images" 
            v-model:video="newDacha.video"
            @uploading="mediaUploading = $event"
          />
          <FeatureSelector v-model="newDacha.features" class="mt-3"/>
        </div>
        <div class="sheet-actions mt-4">
          <button 
            class="primary-btn w-full mb-3" 
            @click="createDacha"
            :disabled="mediaUploading"
          >
            {{ mediaUploading ? "Fayl yuklanmoqda..." : "Qo'shish" }}
          </button>
          <button class="cancel-btn w-full" @click="showSheet = false">Bekor qilish</button>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import api from "../utils/axios"
import { useToast } from "vue-toastification"

export default {
  components: {
    DashboardView: defineAsyncComponent(() => import('../components/Dashboard.vue')),
    DachasView: defineAsyncComponent(() => import('../components/Dachas.vue')),
    StatisticsView: defineAsyncComponent(() => import('../components/Statistics.vue')),
    HistoryView: defineAsyncComponent(() => import('../components/History.vue')),
    MediaDropzone: defineAsyncComponent(() => import('../components/MediaDropzone.vue')),
    FeatureSelector: defineAsyncComponent(() => import('../components/FeatureSelector.vue'))
  },
  data() {
    return {
      activeTab: 'dachas', // Default
      showSheet: false,
      mediaUploading: false,
      refreshKey: 0,
      newDacha: { 
        name: '',
        location: '',
        images: [],
        video: '',
        features: []
      }
    }
  },
  methods: {
    async createDacha() {
      const toast = useToast()
      if (!this.newDacha.name.trim()) {
        toast.error("Dacha nomini kiriting ❗")
        return
      }
      try {
        const adminId = localStorage.getItem("adminId")
        if (!adminId) {
          toast.error("Admin topilmadi ❌")
          return
        }
        await api.post("/dacha", { 
          name: this.newDacha.name, 
          location: this.newDacha.location,
          adminId,
          images: this.newDacha.images,
          video: this.newDacha.video,
          features: this.newDacha.features
        })
        toast.success("Dacha muvaffaqiyatli qo‘shildi ✅")
        this.showSheet = false
        this.newDacha = { name: '', location: '', images: [], video: '', features: [] }
        this.refreshKey++ // Force list refresh
      } catch (error) {
        toast.error(error?.message || "Xatolik yuz berdi ❌")
      }
    }
  }
}
</script>

<style scoped>
.app-layout {
  display: flex;
  flex-direction: column;
  height: 100dvh;
  position: relative;
  background: var(--background-color);
}
.content-area {
  flex: 1;
  position: relative;
  overflow-y: scroll;
  padding-top: 40px ;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 80px;
  background: var(--nav-bg);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--nav-border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding-bottom: env(safe-area-inset-bottom);
  z-index: 50;
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  padding-left: 10px;
  padding-right: 10px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
  width: 60px;
}

.nav-spacer {
  width: 60px;
}

.nav-item.active {
  color: var(--primary-color);
}

.nav-item svg {
  transition: transform 0.2s ease;
}

.nav-item.active svg {
  transform: translateY(-2px);
}

.nav-item span {
  font-size: 11px;
  font-weight: 600;
}

/* FAB */
.fab-btn {
  position: fixed;
  bottom: 50px;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: var(--primary-color);
  color: white;
  border: none;
  font-size: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 25px rgba(37, 99, 235, 0.4);
  z-index: 60;
  transition: transform 0.2s ease;
  cursor: pointer;
}

.fab-btn:active {
  transform: translateX(-50%) scale(0.92);
}

.w-full {
  width: 100%;
}
.mb-3 {
  margin-bottom: 12px;
}
.z-max {
  z-index: 10000;
  position: fixed;
  bottom: 0;
  left: 0;
}
.sheet-content {
  max-height: 70dvh;
  overflow-y: auto;
  padding: 4px;
}
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
</style>
