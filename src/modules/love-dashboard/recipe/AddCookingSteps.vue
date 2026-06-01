<template>
  <div :class="embedded ? 'add-cooking-steps-embedded' : 'bg-background text-on-background font-body-md min-h-screen'">
    <!-- TopAppBar - Only show when not embedded -->
    <header v-if="!embedded" class="fixed top-0 w-full z-50 flex justify-between items-center px-container-padding-mobile md:px-container-padding-desktop py-4 bg-background shadow-sm">
      <div class="flex items-center gap-4">
        <button class="p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 duration-100" @click="goBack">
          <span class="material-symbols-outlined text-on-surface-variant">arrow_back</span>
        </button>
        <h1 class="font-headline-md text-headline-md text-primary">Heirloom Kitchen</h1>
      </div>
      <div class="flex gap-4">
        <span class="material-symbols-outlined text-primary cursor-pointer hover:text-primary-container transition-colors" @click="saveRecipe">save</span>
        <span class="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary-container transition-colors">settings</span>
      </div>
    </header>

    <!-- SideNavBar (Desktop) - Only show when not embedded -->
    <aside v-if="!embedded" class="hidden md:flex flex-col fixed left-0 top-0 h-full w-64 py-8 gap-stack-lg bg-surface-container-low border-r border-outline-variant z-40">
      <div class="px-6 mb-8">
        <h2 class="font-headline-md text-headline-md text-primary">Heirloom Kitchen</h2>
        <p class="font-label-md text-on-surface-variant">Modern Organic Cooking</p>
      </div>
      <nav class="flex flex-col gap-2">
        <a class="flex items-center gap-4 py-3 text-on-surface-variant pl-5 hover:bg-surface-container-high transition-all" href="#">
          <span class="material-symbols-outlined">auto_stories</span>
          <span class="font-label-lg text-label-lg">My Cookbook</span>
        </a>
        <a class="flex items-center gap-4 py-3 text-primary font-bold border-l-4 border-primary pl-4 translate-x-1 duration-200" href="#">
          <span class="material-symbols-outlined">edit_note</span>
          <span class="font-label-lg text-label-lg">New Recipe</span>
        </a>
        <a class="flex items-center gap-4 py-3 text-on-surface-variant pl-5 hover:bg-surface-container-high transition-all" href="#">
          <span class="material-symbols-outlined">bookmark</span>
          <span class="font-label-lg text-label-lg">Saved</span>
        </a>
        <a class="flex items-center gap-4 py-3 text-on-surface-variant pl-5 hover:bg-surface-container-high transition-all" href="#">
          <span class="material-symbols-outlined">restaurant</span>
          <span class="font-label-lg text-label-lg">Ingredients</span>
        </a>
        <a class="flex items-center gap-4 py-3 text-on-surface-variant pl-5 hover:bg-surface-container-high transition-all" href="#">
          <span class="material-symbols-outlined">settings</span>
          <span class="font-label-lg text-label-lg">Settings</span>
        </a>
      </nav>
      <div class="mt-auto px-6">
        <button class="w-full bg-primary text-on-primary py-3 rounded-md font-label-lg shadow-sm hover:opacity-90 transition-opacity">
          Upgrade to Pro
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="embedded ? '' : 'pt-24 pb-32 md:pl-72 px-container-padding-mobile md:px-container-padding-desktop max-w-7xl mx-auto'">
      <header class="mb-10" v-if="!embedded">
        <h2 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-2">添加烹饪步骤</h2>
        <p class="text-on-surface-variant font-body-md">记录您的独家秘方，与世界分享美味。</p>
      </header>

      <section class="space-y-section-gap" id="steps-container" ref="stepsContainer">
        <!-- Step 1 -->
        <div class="step-card relative flex gap-stack-lg">
          <div class="step-timeline"></div>
          <!-- Left Side: Step Number, Title and Description -->
          <div class="flex-1 flex flex-col bg-surface-container-low p-stack-lg rounded-xl shadow-sm border border-outline-variant/10">
            <!-- Step Number and Title (Horizontal) -->
            <div class="flex items-center gap-4 mb-stack-md">
              <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-on-primary font-headline-md text-headline-md shadow-md">1</div>
              <input 
                v-model="steps[0].title"
                class="flex-1 bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all" 
                placeholder="步骤标题 (例如：准备食材)" 
                type="text"
              />
            </div>
            <!-- Description (Vertical below title) -->
            <textarea 
              v-model="steps[0].description"
              class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all resize-none" 
              placeholder="详细描述烹饪过程、火候调节或特别的小贴士..." 
              rows="4"
            ></textarea>
          </div>
          <!-- Right Side: Image Upload (Horizontal with left side) -->
          <div class="w-72 flex-shrink-0">
            <button class="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface-container hover:border-primary transition-all group overflow-hidden relative" @click="triggerImageUpload(0)">
              <img 
                v-if="steps[0].image"
                :src="steps[0].image"
                alt="" 
                class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
              />
              <span class="material-symbols-outlined text-primary text-4xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
              <span class="font-label-lg text-primary">添加步骤照片</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              ref="imageInput0"
              @change="(e) => handleImageUpload(e, 0)"
            />
          </div>
        </div>

        <!-- Step 2 -->
        <div class="step-card relative flex gap-stack-lg">
          <div class="step-timeline"></div>
          <div class="flex-1 flex flex-col bg-surface-container-low p-stack-lg rounded-xl shadow-sm border border-outline-variant/10">
            <div class="flex items-center gap-4 mb-stack-md">
              <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-on-primary font-headline-md text-headline-md shadow-md">2</div>
              <input 
                v-model="steps[1].title"
                class="flex-1 bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all" 
                placeholder="步骤标题" 
                type="text"
              />
            </div>
            <textarea 
              v-model="steps[1].description"
              class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all resize-none" 
              placeholder="详细描述烹饪过程..." 
              rows="4"
            ></textarea>
          </div>
          <div class="w-72 flex-shrink-0">
            <button class="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface-container hover:border-primary transition-all group overflow-hidden relative" @click="triggerImageUpload(1)">
              <img 
                v-if="steps[1].image"
                :src="steps[1].image"
                alt="" 
                class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
              />
              <span class="material-symbols-outlined text-primary text-4xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
              <span class="font-label-lg text-primary">添加步骤照片</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              ref="imageInput1"
              @change="(e) => handleImageUpload(e, 1)"
            />
          </div>
        </div>

        <!-- Dynamic Steps -->
        <div 
          v-for="(step, index) in steps.slice(2)" 
          :key="index + 2"
          class="step-card relative flex gap-stack-lg"
        >
          <div class="step-timeline"></div>
          <div class="flex-1 flex flex-col bg-surface-container-low p-stack-lg rounded-xl shadow-sm border border-outline-variant/10">
            <div class="flex items-center gap-4 mb-stack-md">
              <div class="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary text-on-primary font-headline-md text-headline-md shadow-md">{{ index + 3 }}</div>
              <input 
                v-model="step.title"
                class="flex-1 bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all" 
                placeholder="步骤标题" 
                type="text"
              />
            </div>
            <textarea 
              v-model="step.description"
              class="w-full bg-surface-container-lowest border border-outline-variant rounded-md px-4 py-3 font-body-md text-on-surface focus:ring-0 transition-all resize-none" 
              placeholder="详细描述烹饪过程..." 
              rows="4"
            ></textarea>
          </div>
          <div class="w-72 flex-shrink-0">
            <button class="w-full aspect-square flex flex-col items-center justify-center border-2 border-dashed border-outline-variant rounded-xl bg-surface-container-low hover:bg-surface-container hover:border-primary transition-all group overflow-hidden relative" @click="triggerImageUpload(index + 2)">
              <img 
                v-if="step.image"
                :src="step.image"
                alt="" 
                class="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-40 transition-opacity"
              />
              <span class="material-symbols-outlined text-primary text-4xl mb-2 group-hover:scale-110 transition-transform">add_a_photo</span>
              <span class="font-label-lg text-primary">添加步骤照片</span>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              class="hidden" 
              :ref="el => setImageInputRef(el, index + 2)"
              @change="(e) => handleImageUpload(e, index + 2)"
            />
          </div>
        </div>
      </section>

      <!-- Add Next Step Button -->
      <div class="mt-section-gap flex justify-center">
        <button class="flex items-center gap-3 px-8 py-4 bg-secondary-container text-on-secondary-container rounded-full font-label-lg hover:opacity-80 transition-all active:scale-95" @click="addStep" id="add-step-btn">
          <span class="material-symbols-outlined">add_circle</span>
          <span>添加下一步骤</span>
        </button>
      </div>

      <!-- Footer Action -->
      <div class="mt-section-gap pt-10 border-t border-outline-variant flex flex-col md:flex-row items-center justify-between gap-6">
        <div class="text-on-surface-variant font-body-md italic text-center md:text-left">
          "烹饪是一门艺术，而食谱则是您的画笔。"
        </div>
        <button class="w-full md:w-auto px-12 py-4 bg-primary text-on-primary rounded-md font-headline-md text-headline-md shadow-lg hover:brightness-110 transition-all active:scale-95" @click="saveRecipe">
          保存食谱
        </button>
      </div>
    </main>

    <!-- BottomNavBar (Mobile) - Only show when not embedded -->
    <nav v-if="!embedded" class="fixed bottom-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container-lowest shadow-[0_-4px_20px_0_rgba(50,47,46,0.05)] rounded-t-xl md:hidden">
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity" href="#">
        <span class="material-symbols-outlined">menu_book</span>
        <span class="font-label-md text-label-md">食谱</span>
      </a>
      <a class="flex flex-col items-center justify-center bg-secondary-container text-on-secondary-container rounded-full px-4 py-1 scale-90 duration-150" href="#">
        <span class="material-symbols-outlined">add_circle</span>
        <span class="font-label-md text-label-md">创建</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity" href="#">
        <span class="material-symbols-outlined">inventory_2</span>
        <span class="font-label-md text-label-md">食材柜</span>
      </a>
      <a class="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 transition-opacity" href="#">
        <span class="material-symbols-outlined">person</span>
        <span class="font-label-md text-label-md">我的</span>
      </a>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  embedded: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'close', 'save'])

const steps = ref([
  { title: '', description: '', image: null },
  { title: '', description: '', image: null }
])

const stepsContainer = ref(null)
const imageInputs = ref({})

const addStep = () => {
  steps.value.push({
    title: '',
    description: '',
    image: null
  })
  
  // Scroll to the new step
  setTimeout(() => {
    if (stepsContainer.value) {
      const allSteps = stepsContainer.value.querySelectorAll('.step-card')
      const lastStep = allSteps[allSteps.length - 1]
      if (lastStep) {
        lastStep.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
  }, 100)
}

const triggerImageUpload = (index) => {
  const input = imageInputs.value[index]
  if (input) {
    input.click()
  }
}

const setImageInputRef = (el, index) => {
  if (el) {
    imageInputs.value[index] = el
  }
}

const handleImageUpload = (event, index) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      steps.value[index].image = e.target.result
    }
    reader.readAsDataURL(file)
  }
}

const goBack = () => {
  emit('close')
}

const saveRecipe = () => {
  console.log('Saving recipe:', steps.value)
  emit('save', steps.value)
  // TODO: Implement save logic
  alert('食谱保存成功！')
  emit('close')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&family=Inter:wght@400;500;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap');

.add-cooking-steps-embedded {
  width: 100%;
  height: 100%;
}

.step-card {
  display: flex;
  flex-direction: row;
  gap: 24px;
  position: relative;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
  display: inline-block;
  line-height: 1;
  text-transform: none;
  letter-spacing: normal;
  word-wrap: normal;
  white-space: nowrap;
  direction: ltr;
}

.step-timeline::before {
  content: '';
  position: absolute;
  left: 24px;
  top: 40px;
  bottom: -24px;
  width: 2px;
  background-color: #d4e9c5; /* Sage Green */
  z-index: 0;
}

.step-card:last-child .step-timeline::before {
  display: none;
}

input:focus, textarea:focus {
  outline: none;
  border-width: 2px !important;
  border-color: #9a4024 !important; /* Primary Terracotta */
}

/* Tailwind custom classes */
.bg-background { background-color: #fff8f6; }
.text-on-background { color: #1d1b1a; }
.font-body-md { font-family: 'Inter', sans-serif; font-size: 16px; line-height: 24px; font-weight: 400; }
.px-container-padding-mobile { padding-left: 20px; padding-right: 20px; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.gap-4 { gap: 1rem; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.fixed { position: fixed; }
.top-0 { top: 0; }
.w-full { width: 100%; }
.z-50 { z-index: 50; }
.flex { display: flex; }
.p-2 { padding: 0.5rem; }
.hover\:bg-surface-container:hover { background-color: #f3ecea; }
.rounded-full { border-radius: 9999px; }
.transition-colors { transition-property: color, background-color, border-color; transition-duration: 150ms; }
.active\:scale-95:active { transform: scale(0.95); }
.duration-100 { transition-duration: 100ms; }
.text-on-surface-variant { color: #56423d; }
.font-headline-md { font-family: 'Playfair Display', serif; font-size: 24px; line-height: 32px; font-weight: 600; }
.text-headline-md { font-size: 24px; line-height: 32px; }
.text-primary { color: #9a4024; }
.cursor-pointer { cursor: pointer; }
.hover\:text-primary-container:hover { color: #ba5839; }
.hidden { display: none; }
.md\:flex { display: none; }
.flex-col { flex-direction: column; }
.left-0 { left: 0; }
.h-full { height: 100%; }
.w-64 { width: 16rem; }
.py-8 { padding-top: 2rem; padding-bottom: 2rem; }
.gap-stack-lg { gap: 24px; }
.bg-surface-container-low { background-color: #f9f2f0; }
.border-r { border-right-width: 1px; }
.border-outline-variant { border-color: #dcc1b9; }
.z-40 { z-index: 40; }
.px-6 { padding-left: 1.5rem; padding-right: 1.5rem; }
.mb-8 { margin-bottom: 2rem; }
.font-label-md { font-family: 'Inter', sans-serif; font-size: 12px; line-height: 16px; font-weight: 500; }
.gap-2 { gap: 0.5rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.pl-5 { padding-left: 1.25rem; }
.hover\:bg-surface-container-high:hover { background-color: #eee7e5; }
.transition-all { transition-property: all; transition-duration: 150ms; }
.font-bold { font-weight: 700; }
.border-l-4 { border-left-width: 4px; }
.border-primary { border-color: #9a4024; }
.pl-4 { padding-left: 1rem; }
.translate-x-1 { transform: translateX(0.25rem); }
.duration-200 { transition-duration: 200ms; }
.mt-auto { margin-top: auto; }
.bg-primary { background-color: #9a4024; }
.text-on-primary { color: #ffffff; }
.rounded-md { border-radius: 0.5rem; }
.font-label-lg { font-family: 'Inter', sans-serif; font-size: 14px; line-height: 20px; letter-spacing: 0.05em; font-weight: 600; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.hover\:opacity-90:hover { opacity: 0.9; }
.pt-24 { padding-top: 6rem; }
.pb-32 { padding-bottom: 8rem; }
.md\:pl-72 { padding-left: 18rem; }
.md\:px-container-padding-desktop { padding-left: 40px; padding-right: 40px; }
.max-w-7xl { max-width: 80rem; }
.mx-auto { margin-left: auto; margin-right: auto; }
.mb-10 { margin-bottom: 2.5rem; }
.font-headline-lg-mobile { font-family: 'Playfair Display', serif; font-size: 28px; line-height: 36px; font-weight: 700; }
.md\:font-headline-lg { font-family: 'Playfair Display', serif; font-size: 32px; line-height: 40px; font-weight: 700; }
.text-headline-lg-mobile { font-size: 28px; line-height: 36px; }
.md\:text-headline-lg { font-size: 32px; line-height: 40px; }
.mb-2 { margin-bottom: 0.5rem; }
.space-y-section-gap > * + * { margin-top: 48px; }
.relative { position: relative; }
.md\:flex-row { flex-direction: row; }
.gap-stack-lg { gap: 24px; }
.flex-1 { flex: 1 1 0%; }
.p-stack-lg { padding: 24px; }
.rounded-xl { border-radius: 0.75rem; }
.shadow-sm { box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
.border { border-width: 1px; }
.border-outline-variant\/10 { border-color: rgba(220, 193, 185, 0.1); }
.mb-stack-md { margin-bottom: 16px; }
.w-12 { width: 3rem; }
.h-12 { height: 3rem; }
.justify-center { justify-content: center; }
.rounded-full { border-radius: 9999px; }
.text-on-primary { color: #ffffff; }
.shadow-md { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
.bg-surface-container-lowest { background-color: #ffffff; }
.border-outline-variant { border-color: #dcc1b9; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.focus\:ring-0:focus { --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0 var(--tw-ring-offset-width) var(--tw-ring-offset-color); --tw-ring-shadow: var(--tw-ring-inset) 0 0 0 calc(0px + var(--tw-ring-offset-width)) var(--tw-ring-color); box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000); }
.resize-none { resize: none; }
.w-full { width: 100%; }
.md\:w-72 { width: 18rem; }
.aspect-square { aspect-ratio: 1 / 1; }
.md\:aspect-video { aspect-ratio: 16 / 9; }
.lg\:aspect-square { aspect-ratio: 1 / 1; }
.border-2 { border-width: 2px; }
.border-dashed { border-style: dashed; }
.group:hover .group-hover\:scale-110 { transform: scale(1.1); }
.overflow-hidden { overflow: hidden; }
.absolute { position: absolute; }
.inset-0 { top: 0; right: 0; bottom: 0; left: 0; }
.object-cover { object-fit: cover; }
.opacity-20 { opacity: 0.2; }
.group:hover .group-hover\:opacity-40 { opacity: 0.4; }
.text-4xl { font-size: 2.25rem; line-height: 2.5rem; }
.mb-2 { margin-bottom: 0.5rem; }
.mt-section-gap { margin-top: 48px; }
.px-8 { padding-left: 2rem; padding-right: 2rem; }
.py-4 { padding-top: 1rem; padding-bottom: 1rem; }
.bg-secondary-container { background-color: #d4e9c5; }
.text-on-secondary-container { color: #576a4d; }
.rounded-full { border-radius: 9999px; }
.hover\:opacity-80:hover { opacity: 0.8; }
.pt-10 { padding-top: 2.5rem; }
.border-t { border-top-width: 1px; }
.flex-col { flex-direction: column; }
.md\:flex-row { flex-direction: row; }
.items-center { align-items: center; }
.justify-between { justify-content: space-between; }
.gap-6 { gap: 1.5rem; }
.italic { font-style: italic; }
.text-center { text-align: center; }
.md\:text-left { text-align: left; }
.px-12 { padding-left: 3rem; padding-right: 3rem; }
.shadow-lg { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
.hover\:brightness-110:hover { filter: brightness(1.1); }
.bottom-0 { bottom: 0; }
.z-50 { z-index: 50; }
.justify-around { justify-content: space-around; }
.px-4 { padding-left: 1rem; padding-right: 1rem; }
.py-3 { padding-top: 0.75rem; padding-bottom: 0.75rem; }
.shadow-\[0_-4px_20px_0_rgba\(50\,47\,46\,0\.05\)\] { box-shadow: 0 -4px 20px 0 rgba(50, 47, 46, 0.05); }
.rounded-t-xl { border-top-left-radius: 0.75rem; border-top-right-radius: 0.75rem; }
.scale-90 { transform: scale(0.9); }
.duration-150 { transition-duration: 150ms; }
.hover\:opacity-80:hover { opacity: 0.8; }

@media (min-width: 768px) {
  .md\:flex { display: flex; }
  .md\:px-container-padding-desktop { padding-left: 40px; padding-right: 40px; }
  .md\:font-headline-lg { font-family: 'Playfair Display', serif; font-size: 32px; line-height: 40px; font-weight: 700; }
  .md\:text-headline-lg { font-size: 32px; line-height: 40px; }
  .md\:pl-72 { padding-left: 18rem; }
  .md\:flex-row { flex-direction: row; }
  .md\:w-72 { width: 18rem; }
  .md\:aspect-video { aspect-ratio: 16 / 9; }
  .md\:text-left { text-align: left; }
  .md\:w-auto { width: auto; }
  .md\:hidden { display: none; }
}

@media (min-width: 1024px) {
  .lg\:aspect-square { aspect-ratio: 1 / 1; }
}
</style>
