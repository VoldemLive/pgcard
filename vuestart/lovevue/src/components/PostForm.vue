<template>
  <form>
    <input
      v-model="post.code"
      class="input"
      type="text"
      placeholder="Enter code..."
    />
    <input
      v-model="post.name"
      class="input"
      type="text"
      placeholder="Enter name..."
    />
    <input
      v-model="post.articul"
      class="input"
      type="text"
      placeholder="Enter articul..."
    />
    <input
      v-model="post.price"
      class="input"
      type="text"
      placeholder="Enter price..."
    />
    <button class="btn" @click.prevent="createPost">Create item</button>
  </form>
</template>

<script>
export default {
  name:'post-form',
  data() {
    return {
      post: {
        code: '',
        name: '',
        articul: '',
        price: '',
      },
    };
  },
  methods: {
    createPost() {
      this.post.id = Date.now();
      this.$emit("create", this.post);
      this.post = {
        code: '',
        name: '',
        articul: '',
        price: '',
      };
    },
  },
};
</script>

<style scoped>
.form {
  display: flex;
  flex-direction: column;
}

.input {
  width: 100%;
  border: 1px solid green;
  padding: 10px 15px;
  margin-top: 5px;
}

.btn {
  align-self: flex-end;
  margin-top: 5px;
  border: 1px solid green;
  padding: 20px;
  background: none;
}
</style>
