<template>
  <div class="steps-editor">
    <div class="editor-header">
      <div>
        <p class="eyebrow">添加烹饪步骤</p>
        <h2 class="editor-title">设计一个分步编辑界面，捕捉每个细节。</h2>
        <p class="editor-subtitle">记录您的独家秘方，与世界分享美味。</p>
      </div>
    </div>

    <section class="steps-list">
      <div
        v-for="(step, index) in steps"
        :key="index"
        class="step-card"
      >
        <div class="step-timeline"></div>

        <div class="step-main">
          <div class="step-header">
            <div class="step-badge">{{ index + 1 }}</div>
            <input
              v-model="step.title"
              type="text"
              class="step-title-input"
              placeholder="步骤标题 (例如：准备食材)"
              @input="updateStep(index, 'title', step.title)"
            />
          </div>
          <textarea
            v-model="step.description"
            class="step-description-input"
            rows="4"
            placeholder="详细描述烹饪过程、火候调节或特别的小贴士..."
            @input="updateStep(index, 'description', step.description)"
          />
        </div>

        <div class="step-media">
          <button type="button" class="upload-button">
            <span class="material-symbols-outlined">add_a_photo</span>
            <span>添加步骤照片</span>
          </button>
        </div>
      </div>
    </section>

    <div class="editor-actions">
      <button type="button" class="add-step-button" @click="addStep">
        <span class="material-symbols-outlined">add_circle</span>
        添加下一步骤
      </button>
    </div>

    <div class="editor-footer">
      <div class="footer-copy">“烹饪是一门艺术，而食谱则是您的画笔。”</div>
      <button type="button" class="save-button" @click="saveSteps">
        保存食谱
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => []
  }
})
const emits = defineEmits(['update:modelValue', 'save'])

const steps = ref(props.modelValue.map((item) => ({ ...item })))

watch(
  () => props.modelValue,
  (next) => {
    steps.value = next.map((item) => ({ ...item }))
  },
  { deep: true }
)

const addStep = () => {
  steps.value.push({
    title: `步骤 ${steps.value.length + 1}`,
    description: ''
  })
  emitUpdate()
}

const updateStep = (index, field, value) => {
  if (!steps.value[index]) return
  steps.value[index][field] = value
  emitUpdate()
}

const emitUpdate = () => {
  emits('update:modelValue', steps.value.map((item) => ({ ...item })))
}

const saveSteps = () => {
  emits('save', steps.value.map((item) => ({ ...item })))
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Playfair+Display:wght@600;700;800&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.steps-editor {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.editor-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.eyebrow {
  margin: 0;
  color: #576a4d;
  font-size: 0.95rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.editor-title {
  margin: 0;
  font-family: 'Playfair Display', serif;
  font-size: clamp(1.8rem, 2.2vw, 2.7rem);
  line-height: 1.05;
  color: #9a4024;
}

.editor-subtitle {
  margin: 0;
  color: #56423d;
  font-size: 1rem;
  line-height: 1.8;
}

.steps-list {
  display: grid;
  gap: 24px;
}

.step-card {
  position: relative;
  display: grid;
  gap: 24px;
  padding: 24px;
  background: #f3ecea;
  border: 1px solid rgba(137, 114, 108, 0.12);
  border-radius: 22px;
  overflow: hidden;
}

.step-card::before {
  content: '';
  position: absolute;
  left: 32px;
  top: 72px;
  bottom: -24px;
  width: 4px;
  background-color: #d4e9c5;
  z-index: 0;
}

.step-card:last-child::before {
  display: none;
}

.step-header {
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 1;
}

.step-badge {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 9999px;
  display: grid;
  place-items: center;
  background: #9a4024;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(154, 64, 36, 0.18);
}

.step-title-input,
.step-description-input {
  width: 100%;
  border: 1px solid #dcc1b9;
  border-radius: 16px;
  background: #ffffff;
  color: #1d1b1a;
  font-family: 'Inter', sans-serif;
  font-size: 1rem;
  padding: 16px 18px;
  transition: border-color 0.2s ease;
}

.step-title-input {
  min-height: 56px;
}

.step-description-input {
  resize: vertical;
  min-height: 120px;
}

.step-title-input:focus,
.step-description-input:focus {
  outline: none;
  border-color: #9a4024;
}

.step-main {
  position: relative;
  z-index: 1;
  display: grid;
  gap: 16px;
}

.step-media {
  position: relative;
  z-index: 1;
}

.upload-button {
  width: 100%;
  min-height: 180px;
  display: grid;
  place-items: center;
  gap: 12px;
  border: 2px dashed #dcc1b9;
  background: rgba(255, 255, 255, 0.86);
  border-radius: 24px;
  color: #9a4024;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

.upload-button:hover {
  border-color: #9a4024;
  background: #ffffff;
}

.upload-button .material-symbols-outlined {
  font-size: 2.25rem;
}

.editor-actions {
  display: flex;
  justify-content: center;
}

.add-step-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 28px;
  background: #d4e9c5;
  color: #3a4c31;
  border: none;
  border-radius: 999px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.add-step-button:hover {
  opacity: 0.9;
}

.add-step-button:active {
  transform: scale(0.97);
}

.editor-footer {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding-top: 16px;
  border-top: 1px solid #dcc1b9;
}

.footer-copy {
  color: #56423d;
  font-size: 0.95rem;
  font-style: italic;
}

.save-button {
  padding: 16px 34px;
  background: #9a4024;
  color: #ffffff;
  border: none;
  border-radius: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, filter 0.2s ease;
}

.save-button:hover {
  filter: brightness(1.05);
}

.save-button:active {
  transform: scale(0.97);
}

@media (min-width: 900px) {
  .steps-list {
    gap: 32px;
  }

  .step-card {
    grid-template-columns: 1fr 280px;
    align-items: start;
  }

  .step-card::before {
    left: 32px;
    top: 54px;
  }

  .step-main {
    gap: 20px;
  }
}
</style>
