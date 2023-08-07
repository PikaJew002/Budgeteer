<template>
  <div v-show="show">
    <div :ref="id" :id="id" :class="[`alert alert-${variant}`, dismissible ? 'alert-dismissible fade show' : '']" role="alert">
      <slot />
      <button v-if="dismissible" type="button" class="close" aria-label="Close" @click="onDismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
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
  },
  emits: ['dismissed'],
  methods: {
    onDismiss() {
      this.$emit('dismissed');
    },
  },
  watch: {
    show(newShow, oldShow) {
      if (newShow !== oldShow) {
        if (newShow) {
          if (this.duration && this.duration > 0) {
            setTimeout(function () {
              this.$emit('dismissed');
            }, this.duration * 1000);
          }
        }
      }
    },
  },
  mounted() {
    $(this.$refs[this.id]).alert();
  },
  beforeUnmount() {
    $(this.$refs[this.id]).alert('dispose');
  },
}
</script>