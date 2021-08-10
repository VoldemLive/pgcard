<template>
  <form @submit.prevent>
    <h3>Creating post form</h3>
    <my-input
      v-model:myValue="post.title"
      placeholder="Title"
    />
    <my-input
      v-model:myValue="post.body"
      placeholder="Body"
    />
    <my-button @click="createPost" style="align-self:flex-end; margin-top:15px;">
      Create
    </my-button>
  </form>
</template>

<script>
export default{
      data(){
          return {
              post:{
                  title:'',
                  body:'', 
              }
          }
      },
      methods: {
          createPost() {
              this.post.id = Date.now(),
              this.$emit('create', this.post)
              this.post = {
                  title: '',
                  body: '',
              }
          },
      },
    }
</script>


<style scoped>
form {
  display: flex;
  flex-direction: column;
}

</style>