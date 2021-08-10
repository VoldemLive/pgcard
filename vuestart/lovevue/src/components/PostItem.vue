<template>
  <div class="post">
    <div class="posttext"><strong>id:</strong>{{ post.id }}</div>
    <div class="posttext"><strong>Code:</strong>{{ post.code }}</div>
    <div class="posttext"><strong>Name:</strong>{{ post.name }}</div>
    <div class="posttext"><strong>Articul:</strong>{{ post.articul }}</div>
    <div class="posttext"><strong>Price:</strong>{{ post.price }}</div>
    <div class="deletePost" @click:="deletePost(post.id)">X</div>
  </div>
</template>

<script>
export default {
  name: "post-item",
  props: {
    post: {
      type: Object,
      required: true,
    },
  },
  methods: {
    // deletePost(postId) {
    //   console.log(postId);
    // },
  },
};
</script>

<style scoped>
.post {
  padding: 15px;
  border: 1px solid green;
  margin-top: 5px;
}
</style>