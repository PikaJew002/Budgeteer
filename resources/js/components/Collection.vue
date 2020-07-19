<template>
  <div>
    <div v-if="allowSizeChange" class="d-none d-sm-flex align-items-center mb-3">
      <select v-model="deckSize" class="custom-select" style="width: 50px;">
        <option v-for="n in 4" :value="n" :selected="deckSize === n">{{ n }}</option>
        <option :value="6" :selected="deckSize === 6">6</option>
      </select>
      <div class="ml-2">
        {{ capitalize(type) }} per row
      </div>
    </div>
    <div class="card-deck mb-4" v-for="row in rowsFull">
      <template v-for="col in deckSize">
        <item :value="items[(row - 1)*deckSize + col - 1]"
              :type="type"
              :month="month ? month : null"
              :open="canOpen((row - 1)*deckSize + col - 1)"
              :remove="remove"
              :edit="edit"
              @open="openItem((row - 1)*deckSize + col - 1)"
              @delete="deleteItem((row - 1)*deckSize + col - 1)"
              @edit="editItem((row - 1)*deckSize + col - 1)">
        </item>
      </template>
    </div>
    <div class="row">
      <div v-if="colsInPartialRow > 0" :class="'col-md-' + (12/deckSize)*colsInPartialRow">
        <div class="card-deck mb-4">
          <template v-for="col in colsInPartialRow">
            <item :value="items[rowsFull*deckSize + col - 1]"
                  :type="type"
                  :month="month ? month : null"
                  :open="canOpen(rowsFull*deckSize + col - 1)"
                  :remove="remove"
                  :edit="edit"
                  @open="openItem(rowsFull*deckSize + col - 1)"
                  @delete="deleteItem(rowsFull*deckSize + col - 1)"
                  @edit="editItem(rowsFull*deckSize + col - 1)">
            </item>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Item from './Item.vue';
  export default {
    components: {
      'item': Item,
    },
    props: {
      items: {
        type: Array,
        required: true,
      },
      type: {
        type: String,
        required: true,
      },
      month: {
        type: Array,
        required: false,
      },
      open: {
        type: Boolean,
        default: false,
      },
      allowOpen: {
        type: Array,
        default: function() {
          return [];
        },
      },
      allowOpenIf: {
        type: Array,
        default: function() {
          return [];
        },
      },
      allowEdit: {
        type: Array,
        default: function() {
          return [];
        },
      },
      allowRemove: {
        type: Array,
        default: function() {
          return [];
        },
      },
      remove: {
        type: Boolean,
        default: false,
      },
      edit: {
        type: Boolean,
        default: false,
      },
      size: {
        type: Number,
        default: 4, // defaults to 4 items per row
      },
      allowSizeChange: {
        type: Boolean,
        default: false,
      },
    },
    data() {
      return {
        deckSize: this.size,
      };
    },
    methods: {
      getItemIndex(row, col) {
        return (row - 1)*this.deckSize + col - 1;
      },
      addItem() {
        this.$emit('add-item');
      },
      openItem(index) {
        this.$emit('open-item', index);
      },
      deleteItem(index) {
        this.$emit('delete-item', index);
      },
      editItem(index) {
        this.$emit('edit-item', index);
      },
      canOpen(index) {
        for(let i in this.allowOpen) {
          if(this.allowOpen[i].id == this.items[index].id) {
            return true;
          }
        }
        return this.open;
      },
      canEdit(index) {
        for(let i in this.allowEdit) {
          if(this.allowEdit[i].id == this.items[index].id) {
            return true;
          }
        }
        return this.edit;
      },
      canRemove(index) {
        for(let i in this.allowRemove) {
          if(this.allowRemove[i].id == this.items[index].id) {
            return true;
          }
        }
        return this.remove;
      },
      capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
      },
    },
    computed: {
      rowsFull() {
        return Math.floor(this.items.length / this.deckSize);
      },
      colsInPartialRow() {
        return (this.items.length % this.deckSize);
      },
    },
  }
</script>
