var posts=["2026/05/13/blog-building-guide/","2026/05/12/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };