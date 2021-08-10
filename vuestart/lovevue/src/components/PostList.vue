<template>
  <div>
    <post-item v-for="post in posts" :post="post" :key="post"/>
  </div>  
</template>

<script>
export default {
  name:'post-list',
  props: {
    posts: {
      type: Array,
      required: true,
    },
  },
  methods: {
    deletePost(myItem) {
      this.$emit("deletePost", myItem);
    },
  },
};
</script>

<style scoped>
</style>
