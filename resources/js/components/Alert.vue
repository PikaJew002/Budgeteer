<template>
  <div v-if="show">
    <div :class="[`alert alert-${variant}`, dismissible ? 'alert-dismissible fade show' : '']" role="alert">
      <slot />
      <button v-if="dismissible" type="button" class="btn-close" aria-label="Close" @click="$emit('dismissed')"></button>
    </div>
  </div>
</template>

<script setup>
import { watch } from 'vue';

let props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  duration: {
    type: Number,
    required: false,
  },
  dismissible: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: 'success',
  }
});

let emit = defineEmits(['dismissed']);

watch(() => props.show, (newShow, oldShow) => {
  if (newShow !== oldShow) {
    if (newShow) {
      if (props.duration && props.duration > 0) {
        setTimeout(function () {
          emit('dismissed');
        }, props.duration * 1000);
      }
    }
  }
});
</script>
