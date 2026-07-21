<template>
  <div class="recipe-card">
    <div class="card-content">
      <div class="image-section">
        <img :src="imageUrl" :alt="title" class="recipe-image" />
        <div class="favorite-btn-wrapper">
          <button
            class="favorite-btn"
            :class="{ 'is-favorite': isFavorite }"
            type="button"
            @click="toggleFavorite"
          >
            <span class="material-symbols-outlined" :data-weight="isFavorite ? 'fill' : 'regular'">
              favorite
            </span>
          </button>
        </div>
      </div>

      <div class="info-section">
        <div class="header-row">
          <span class="meal-type">{{ mealType }}</span>
          <div class="duration">
            <span class="material-symbols-outlined duration-icon">schedule</span>
            <span>{{ duration }}</span>
          </div>
        </div>

        <h3 class="recipe-title">{{ title }}</h3>

        <div class="details-grid">
          <div class="ingredients-section">
            <h4 class="section-title">食材</h4>
            <ul class="ingredients-list">
              <li
                v-for="(ingredient, index) in ingredients"
                :key="`${ingredient.name}-${index}`"
                class="ingredient-item"
              >
                <input
                  type="checkbox"
                  class="ingredient-checkbox"
                  :checked="ingredient.checked"
                  @change="toggleIngredient(index)"
                />
                <span :class="{ strikethrough: ingredient.checked }">
                  {{ [ingredient.name, ingredient.amount].filter(Boolean).join(' ') }}
                </span>
              </li>
            </ul>
          </div>

          <div class="steps-section">
            <h4 class="section-title">步骤</h4>
            <ol class="steps-list">
              <li v-for="(step, index) in steps.slice(0, 3)" :key="index" class="step-item">
                {{ step }}
              </li>
            </ol>
          </div>
        </div>

        <button class="view-recipe-btn" type="button" @click="viewRecipe">
          查看完整食谱
          <span class="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mealType: {
    type: String,
    required: true,
  },
  duration: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  ingredients: {
    type: Array,
    required: true,
    default: () => [],
  },
  steps: {
    type: Array,
    required: true,
    default: () => [],
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:isFavorite', 'toggleIngredient', 'viewRecipe'])

const toggleFavorite = () => {
  emit('update:isFavorite', !props.isFavorite)
}

const toggleIngredient = (index) => {
  emit('toggleIngredient', index)
}

const viewRecipe = () => {
  emit('viewRecipe')
}
</script>

<style scoped>
.recipe-card {
  background-color: #f9f2f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(50, 47, 46, 0.05);
  border: 1px solid rgba(220, 193, 185, 0.1);
  transition: transform 0.3s;
}

.recipe-card:hover {
  transform: translateY(-2px);
}

.card-content {
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .card-content {
    flex-direction: row;
  }
}

.image-section {
  position: relative;
  height: 256px;
  overflow: hidden;
}

@media (min-width: 768px) {
  .image-section {
    width: 40%;
    height: auto;
  }
}

.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s;
}

.recipe-card:hover .recipe-image {
  transform: scale(1.05);
}

.favorite-btn-wrapper {
  position: absolute;
  top: 16px;
  right: 16px;
}

.favorite-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  color: #9a4024;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-btn:hover,
.favorite-btn.is-favorite {
  background-color: #9a4024;
  color: #ffffff;
}

.info-section {
  padding: 24px;
}

@media (min-width: 768px) {
  .info-section {
    width: 60%;
  }
}

.header-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 8px;
}

.meal-type {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #ba5839;
  letter-spacing: 0.05em;
}

.duration {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #56423d;
}

.duration-icon {
  font-size: 18px;
}

.duration span:last-child {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}

.recipe-title {
  font-family: 'Playfair Display', serif;
  font-size: 24px;
  line-height: 32px;
  font-weight: 600;
  color: #1d1b1a;
  margin: 0 0 16px;
}

.details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

@media (min-width: 768px) {
  .details-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.section-title {
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.05em;
  font-weight: 700;
  color: #9a4024;
  margin: 0 0 8px;
}

.ingredients-list,
.steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.ingredient-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 15px;
  line-height: 22px;
  color: #56423d;
}

.ingredient-checkbox {
  border-radius: 4px;
  border: 1px solid #dcc1b9;
  cursor: pointer;
}

.strikethrough {
  text-decoration: line-through;
  opacity: 0.45;
}

.step-item {
  margin-bottom: 4px;
  font-size: 15px;
  line-height: 22px;
  color: #56423d;
}

.view-recipe-btn {
  color: #9a4024;
  font-size: 14px;
  line-height: 20px;
  letter-spacing: 0.05em;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}

.view-recipe-btn:hover {
  text-decoration: underline;
}

.view-recipe-btn .material-symbols-outlined {
  font-size: 16px;
}
</style>
