<template>
  <div :ref="id" :id="id" class="modal fade" tabindex="-1" role="dialog">
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

<script>

export default {
  props: {
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
  },
  emits: ['hide'],
  mounted() {
    $(this.$refs[this.id]).modal({
      backdrop: this.backdrop,
      keyboard: this.keyboard,
      focus: this.focus,
      show: this.show,
    });
  },
  watch: {
    show(newShow, oldShow) {
      if (newShow !== oldShow) {
        if (newShow) {
          $(this.$refs[this.id]).modal('show');
        } else {
          $(this.$refs[this.id]).modal('hide');
        }
      }
    },
  },
  beforeUnmount() {
    $(this.$refs[this.id]).modal('dispose');
  },
}
</script>