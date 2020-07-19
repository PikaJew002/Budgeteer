export default {
  data() {
    return {
      message: {
        time: 2,
        countDown: 0,
        type: '',
        message: ''
      }
    }
  },

  methods: {
    countDownChanged(time) {
      this.message.countDown = time;
    },

    showAlert(type, message, time = 2) {
      this.time = time;
      this.message.type = type;
      this.message.message = message;
      this.message.countDown = this.message.time;
    },
  }
}
