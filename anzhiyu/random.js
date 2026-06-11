var posts=["2026/06/08/JavaWeb基础面试题精炼/","2026/06/11/Java分布式项目面试题精炼/","2026/06/09/Java后端工程化面试题精炼-上/","2026/05/13/blog-building-guide/","2026/06/07/Java后端宏鼎汇中小厂面经电商供应链/","2026/06/10/Java后端工程化面试题精炼-下/","2026/05/12/hello-world/"];function toRandomPost(){
    pjax.loadUrl('/'+posts[Math.floor(Math.random() * posts.length)]);
  };