# 相册页面配置

# 页面配置📦 [​](#页面配置📦)

## 相册页面配置 [​](#相册页面配置)

1.  前往你的 Hexo 博客的根目录

2.  在 Hexo 博客根目录 `[blog]`下打开终端，输入

    bash
    ```
    hexo new page album
    ```

    1

3.  你会找到 `source/album/index.md` 这个文件

4.  修改这个文件： 记得添加 `type: "album"`

    yml
    ```
    ---
    title: 相册集
    date: 2022-10-23 15:57:51
    aside: false
    top_img: false
    type: "album"
    ---
    ```

    1
    2
    3
    4
    5
    6
    7

5.  主题配置文件中开启`menu`中我的和相册集的注释，注意缩进！！！

    yml
    ```
    menu:
      # 文章:
      #   隧道: /archives/ || icon-box-archive
      #   分类: /categories/ || icon-shapes
      #   标签: /tags/ || icon-tags

      友链:
        友人帐: /link/ || icon-link
      #   朋友圈: /fcircle/ || icon-artstation
      #   留言板: /comments/ || icon-envelope

      我的:
        音乐馆: /music/ || icon-music
        #   追番页: /bangumis/ || icon-bilibili1
        相册集: /album/ || icon-images
      #   小空调: /air-conditioner/ || icon-fan

      关于:
        #   关于本人: /about/ || icon-zhifeiji
        闲言碎语: /essay/ || icon-lightbulb
        #   随便逛逛: javascript:toRandomPost() || icon-shoe-prints1
    ```

    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    11
    12
    13
    14
    15
    16
    17
    18
    19
    20
    21

    新建文件`[blog]\source\_data\album.yml`,没有`_data`文件夹的话也请自己新建。打开`[blog]\source\_data\album.yml`，输入：

    yml
    ```
    - class_name: 世界各地夕阳与风景
      path_name: /wordScenery
      type: 2
      description: 因为到不了世界各地，所以请网友们发来了各地的夕阳与风景🌇。
      cover: https://upload-bbs.miyoushe.com/upload/2025/06/13/125766904/2cf2b6aea07bba089d0d17c4fea72d1b_5366629137934368264.png
      top_background: https://bu.dusays.com/2023/06/30/649e546ada7dd.webp
      rowHeight: 220
      limit: 10
      lazyload: true
      btnLazyload: false
      url: false
      top_link: /album
      top_btn_text: 返回
      album_list:
        - date: 2022/10/26 01:00:00
          content: 湘潭的一角。
          address: 湖南湘潭
          from: 再吃一口就减肥
          image:
            - https://bu.dusays.com/2023/04/09/64329399db122.webp
        - date: 2022-10-25
          content: 洛阳暴雨后的天空。
          address: 河南洛阳
          from: 紫菜卷
          image:
            - https://bu.dusays.com/2023/04/09/64329399db122.webp
            - https://bu.dusays.com/2023/04/09/64329399db2e1.webp

    - class_name: 我的日常
      path_name: /dailyPhoto
      type: 1
      description: 这里存放的是有关我自己的一些沙雕生活与有趣的事情。
      top_link: /album
      top_btn_text: 返回
      top_background: https://bu.dusays.com/2023/04/09/64329399cea5a.webp
      cover: https://bu.dusays.com/2023/04/09/64329399cea5a.webp
      album_list:
        - date: 2022-10-24
          content: 老妹的画
          image:
            - https://bu.dusays.com/2023/04/09/643293997b92b.jpeg
    ```

    1
    2
    3
    4
    5
    6
    7
    8
    9
    10
    11
    12
    13
    14
    15
    16
    17
    18
    19
    20
    21
    22
    23
    24
    25
    26
    27
    28
    29
    30
    31
    32
    33
    34
    35
    36
    37
    38
    39
    40
    41

    参数 | 备选值/类型 | 解释
    --- | --- | ---
    class_name | string | 【必须】页面类
    path_name | url | 【必须】当前相册路径
    type | number | 【必须】当前相册页面样式类型
    description | string | 【必须】当前相册描述
    cover | url | 【必须】当前相册 cover 图片
    rowHeight | number | 【可选】仅当 type 为 2 时有效，当前相册 rowHeight
    limit | number | 【可选】仅当 type 为 2 时有效，当前相册 一次懒加载的数量
    lazyload | boolean | 【可选】仅当 type 为 2 时有效，当前相册 lazyload 是否开启懒加载，默认懒加载为滚动懒加载，type 为 1 时懒加载不可关闭。
    btnLazyload | boolean | 【可选】仅当 type 为 2 且 lazyload 开启 时有效，当前相册 lazyload 懒加载的方式，默认为滚动懒加载，开启本选项后为按钮点击懒加载。
    album_list | list | 【必须】当前相册内图片列表
    url | url | 【可选】仅当 type 为 2 时有效，可以加载远程的 json 数据。
    album_list.date | date | 【必须】当前图片创建时间
    album_list.content | string | 【必须】当前图片描述内容
    album_list.image | list | 【必须】当前图片集，可以多张
    album_list.from | string | 【可选】当前图片的创建人，未填写则不显示
    album_list.address | string | 【必须】当前图片地址


WARNING

注意示例数据中的图片不保证可用性。

由于相册页面需要很多的 page，所以在写数据的时候自行写入路径`path_name`，示例数据中有两个`path_name`，所以需要再创建两个页面

注意新建的页面必须与`path_name`一致。

bash
```
hexo new page dailyPhoto
hexo new page wordScenery
```

1
2

你会找到 `source/dailyPhoto/index.md` 和`source/wordScenery/index.md`两个文件，这两个为相册集详情页

然后内容为以下内容, 需在详情页加上`type: "album_detail"`

MARKDOWN
```
---
title: 日常生活
date: 2022-10-23 15:57:51
aside: false
top_img: false
type: "album_detail"
---
```

1
2
3
4
5
6
7

MARKDOWN
```
---
title: 世界各地风景
date: 2022-10-23 15:57:51
aside: false
top_img: false
type: "album_detail"
---
```

1
2
3
4
5
6
7

`远程加载json示例数据`

json
```
[
  {
    "url": "https://cdn.jsdelivr.net/gh/jerryc127/CDN/img/IMG_0556.jpg",
    "alt": "IMG_0556.jpg",
    "title": "这是title"
  },
  {
    "url": "https://cdn.jsdelivr.net/gh/jerryc127/CDN/img/IMG_0472.jpg",
    "alt": "IMG_0472.jpg"
  },
  {
    "url": "https://cdn.jsdelivr.net/gh/jerryc127/CDN/img/IMG_0453.jpg",
    "alt": ""
  },
  {
    "url": "https://cdn.jsdelivr.net/gh/jerryc127/CDN/img/IMG_0931.jpg",
    "alt": ""
  }
]
```

1
2
3
4
5
6
7
8
9
10
11
12
13
14
15
16
17
18
19

![相册页](https://img02.anheyu.com/adminuploads/1/2023/04/09/64326458a0f01.png!blogimg)

![相册页](https://img02.anheyu.com/adminuploads/1/2023/04/19/643f4351c8245.webp!blogimg)

![相册页](https://img02.anheyu.com/adminuploads/1/2023/04/19/643f42162d2f4.webp!blogimg)