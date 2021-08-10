<template>
  <div class="app">
    <post-form @create="createPost"/>
    <post-list @deletePost="deletePost" :posts="posts"/>
  </div>
</template>

<script>
export default {
  data() {
    return {
      posts: [
        {
          id: Date.now()+Math.ceil(Math.random()*10000),
          code: "Tex1515",
          name: "Машинка техноком",
          articul: "1231-C",
          price: 12.3,
        },
        {
          id: Date.now()+Math.ceil(Math.random()*10000),
          code: "Tex1616",
          name: "Машинка техноком",
          articul: "1231-C",
          price: 22.0,
        },
        {
          id: Date.now()+Math.ceil(Math.random()*10000),
          code: "Tex1756",
          name: "Машинка техноком",
          articul: "1231-C",
          price: 13.65,
        },
        {
          id: Date.now()+Math.ceil(Math.random()*10000),
          code: "Tex1565",
          name: "Машинка техноком",
          articul: "1231-C",
          price: 25.5,
        },
      ],
    };
  },
  methods: {
    createPost(post){
      this.posts.push(post);
    },
    deletePost(postId){
      this.posts = this.posts.filter(post => post.id != postId);
    }
  },
};
</script>

<style>
.app {
  padding: 20px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}



</style>
