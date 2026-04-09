<template>
  <div class="feature-selector">
    <label class="section-label">Dacha qulayliklari</label>
    
    <div class="chips-container">
      <div v-for="(feature, idx) in modelValue" :key="idx" class="chip">
        {{ feature }}
        <button class="remove-chip" @click="removeFeature(idx)">×</button>
      </div>
      
      <input 
        v-model="newFeature"
        @keydown.enter.prevent="addFeature"
        @keydown.comma.prevent="addFeature"
        placeholder="Yangi qulaylik (masalan: Basseyn)..."
        class="feature-input"
      />
    </div>

    <!-- Predefined Suggestions -->
    <div class="suggestions">
      <button 
        v-for="s in suggestions.filter(x => !modelValue.includes(x))" 
        :key="s" 
        class="suggestion-btn"
        @click="addPredefined(s)"
      >
        + {{ s }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  modelValue: { type: Array, default: () => [] }
});

const emit = defineEmits(['update:modelValue']);

const newFeature = ref('');
const suggestions = [
  "Basseyn", "Sauna", "Bilyard", "Tapchan", "Karaoke", 
  "WiFi", "Ping-pong", "Konditsioner", "Oshxona", "Mangal"
];

const addFeature = () => {
  const val = newFeature.value.trim().replace(/,/g, '');
  if (val && !props.modelValue.includes(val)) {
    emit('update:modelValue', [...props.modelValue, val]);
  }
  newFeature.value = '';
};

const addPredefined = (val) => {
  if (!props.modelValue.includes(val)) {
    emit('update:modelValue', [...props.modelValue, val]);
  }
};

const removeFeature = (idx) => {
  const newList = [...props.modelValue];
  newList.splice(idx, 1);
  emit('update:modelValue', newList);
};
</script>

<style scoped>
.feature-selector {
  width: 100%;
}

.section-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 8px;
  margin-left: 4px;
}

.chips-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  background: rgba(15, 23, 42, 0.4);
  border: 1.5px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 8px;
  min-height: 48px;
  transition: border-color 0.2s;
}

.chips-container:focus-within {
  border-color: var(--primary-color);
}

.chip {
  background: rgba(37, 99, 235, 0.15);
  color: #60a5fa;
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid rgba(37, 99, 235, 0.2);
}

.remove-chip {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.feature-input {
  flex: 1;
  min-width: 150px;
  background: transparent;
  border: none;
  color: white;
  font-size: 13px;
  outline: none;
  padding: 4px;
}

.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.suggestion-btn {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.suggestion-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  border-color: rgba(255, 255, 255, 0.2);
}
</style>
