<template>
  <div ref="el" :id="id" class="modal fade" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered" role="document">
      <div class="modal-content">
        <div :class="['modal-header', headerBgVariant ? `bg-${headerBgVariant}` : '', headerTextVariant ? `text-${headerTextVariant}` : '']">
          <slot name="modal-header">
            <h5 class="modal-title">{{ title }}</h5>
            <button type="button" :class="['close', headerTextVariant ? `text-${headerTextVariant}` : '']" @click="$emit('hide')" aria-label="Close">
              <span aria-hidden="true">&times;</span>
            </button>
          </slot>
        </div>
        <div class="modal-body">
          <slot />
        </div>
        <div class="modal-footer">
          <slot name="modal-footer" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.modal .modal-dialog {
  margin-top: 0;
  margin-bottom: 1rem;
}

@media (max-width: 576px) {
  .modal .modal-dialog-centered {
    align-items: end;
  }
}
</style>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import Modal from 'bootstrap/js/dist/modal';

let props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: [String, null],
    default: null,
  },
  backdrop: {
    type: [Boolean, String],
    default: 'static',
  },
  keyboard: {
    type: Boolean,
    default: true,
  },
  focus: {
    type: Boolean,
    default: true,
  },
  show: {
    type: Boolean,
    default: false,
  },
  headerBgVariant: String,
  headerTextVariant: String,
});

let emit = defineEmits(['hide']);

let el = ref(null);

let modalInstance = ref();

let previousEl = null;

function onHide() {
  modalInstance.value.hide();
  emit('hide');
  previousEl.focus();
  previousEl = null;
}


onMounted(() => {
  modalInstance.value = new Modal(el.value, {
    backdrop: props.backdrop,
    keyboard: props.keyboard,
    focus: props.focus,
  });
  el.value.addEventListener('hidden.bs.modal', onHide)
});

onBeforeUnmount(() => {
  modalInstance.value.dispose();
  el.value.removeEventListener('hidden.bs.modal', onHide);
});

watch(() => props.show, (newShow, oldShow) => {
  if (newShow !== oldShow) {
    if (newShow) {
      previousEl = (document.activeElement || document.body);
      modalInstance.value.show();
    } else {
      modalInstance.value.hide();
    }
  }
});
</script>
