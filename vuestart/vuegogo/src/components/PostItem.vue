<template>
  <div class="post">
    <div>
        <div>Title: {{ post.title }}</div>
        <div>Body: {{ post.body }}</div>
    </div>
    <my-button @click="$emit('remove', post)">X</my-button>
  </div>
</template>

<script>
    export default{
        props:{
            post:{
                type:Object,
                required:true,
            }
        }
    }
</script>

<style scoped>
    .post {
        margin-top: 15px;
        padding: 15px;
        border: 1px solid teal;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

</style>>
