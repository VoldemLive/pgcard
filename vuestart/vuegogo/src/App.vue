<template>
  <div class="app">
    <div class="app_btns">
        <my-button @click="showDialog">Create post</my-button>
        <my-select v-model="selectedSort" :options="sortOptions"/>
    </div>
    
    <my-dialog :show="dialogVisible">
      <post-form @create="addPost" />
    </my-dialog>

    <post-list :posts="posts" @remove="removePost" v-if="!isPostLoading" />
    <div v-else>Loading...</div>
  </div>
</template> 

<script>
import PostForm from "@/components/PostForm";
import PostList from "@/components/PostList";
import axios from "axios";
export default {
  components: {
    PostForm,
    PostList,
  },
  data() {
    return {
      posts:[],
      dialogVisible: false,
      isPostLoading : true,
      selectedSort : '',
      sortOptions: [
        {value: 'title', name:'by title'},
        {value: 'body', name:'by name'}
      ],
    };
  },
  methods: {
    addPost(post) {
      this.posts.push(post);
      this.dialogVisible = false;
    },
    removePost(post) {
      this.posts = this.posts.filter((p) => p.id !== post.id);
    },
    showDialog() {
      this.dialogVisible = true;
    },
    async fetchItems() {
      try {
        setTimeout(async () => {
          const response = await axios.get(
            "https://masapi.cyou:8443/api/v1/items?limit=5",
            {
              headers: {
                "x-access-token":
                  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6InZvbGRlbSJ9.J4ytZgAJUfVz5OsET5fsZF_3JWupksEu92xS4ZY0X4c",
              },
            }
          );
          this.posts = response.data.data.map(function (element) {
            return {
              body: element.ourname,
              title: element.ourarticul,
              id: parseInt(element.id, 10),
            };
          });
          this.isPostLoading = false;
        }, 1);
        console.log(response);
      } catch (e) {}
    },  
  },
  mounted(){
      this.fetchItems();
    },
  watch:{
    selectedSort(newValue){
      console.log(newValue);
    }
  },
};
</script>
<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app_btns{
  display: flex;
  justify-content: space-between;
}

.app {
  padding: 20px;
}
</style>