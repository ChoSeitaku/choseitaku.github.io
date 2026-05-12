# 我的装备页面配置

# 页面配置📦 [​](#页面配置📦)

## 我的装备页面配置 [​](#我的装备页面配置)

前往你的 Hexo 博客的根目录 在 Hexo 博客根目录 `[blog]` 下打开终端，输入

bash
```
hexo new page equipment
```

1

你会找到 `source/equipment/index.md` 这个文件

修改这个文件： 记得添加 `type: "equipment"`

yml
```
title: 我的装备
date: 2023-06-10 21:33:24
type: equipment
aside: false
top_img: false
```

1
2
3
4
5

添加数据，新建文件`source\_data\equipment.yml`,没有`_data`文件夹的话也请自己新建。以下是默认格式示例，打开`source\_data\equipment.yml`，输入

yml
```
- class_name: 好物
  description: 实物装备推荐
  tip: 跟 安知鱼 一起享受科技带来的乐趣
  top_background: https://bu.dusays.com/2023/07/05/64a4c38842b7a.webp
  good_things:
    - title: 生产力
      description: 提升自己生产效率的硬件设备
      equipment_list:
        - name: MacBook Pro 2021 16 英寸
          specification: M1 Max 64G / 1TB
          description: 屏幕显示效果好、色彩准确、对比度强、性能强劲、续航优秀。可以用来开发和设计。
          image: https://bu.dusays.com/2023/07/05/64a4c3b191e2e.png
          link: /posts/571d.html
        - name: iPad 2020
          specification: 深空灰 / 128G
          description: 事事玩得转，买前生产力，买后爱奇艺。
          image: https://bu.dusays.com/2023/07/05/64a4c3b191e2e.png
          link: https://www.apple.com.cn/ipad-10.2/
        - name: iPhone 12 mini
          specification: 绿色 / 128G
          description: 超瓷晶面板，玻璃背板搭配铝金属边框，曲线优美的圆角设计，mini大小正好一只手就抓住，深得我心，唯一缺点大概就是续航不够。
          image: https://bu.dusays.com/2023/07/05/64a4c3ded6319.webp
          link: https://www.apple.com.cn/iphone-12/specs/
        - name: AirPods（第三代）
          specification: 标准版
          description: 第三代对比第二代提升很大，和我一样不喜欢入耳式耳机的可以入，空间音频等功能确实新颖，第一次使用有被惊艳到。
          image: https://bu.dusays.com/2023/07/05/64a4c3ded6319.webp
          link: https://www.apple.com.cn/airpods-3rd-generation/
    - title: 出行
      description: 用来出行的实物及设备
      equipment_list:
        - name: Apple Watch Series 8
          specification: 黑色
          description: 始终为我的健康放哨，深夜弹出站立提醒，不过确实有效的提高了我的运动频率，配合apple全家桶还是非常棒的产品，缺点依然是续航。
          image: https://bu.dusays.com/2023/07/05/64a4c40ab698a.webp
          link: https://www.apple.com.cn/apple-watch-series-8/
        - name: NATIONAL GEOGRAPHIC双肩包
          specification: 黑色
          description: 国家地理黑色大包，正好装下16寸 Macbook Pro，并且背起来很舒适，底部自带防雨罩也好用，各种奇怪的小口袋深得我心。
          image: https://bu.dusays.com/2023/07/05/64a4c40ab698a.webp
          link: https://item.jd.com/100011269828.html
        - name: NATIONAL GEOGRAPHIC学生书包🎒
          specification: 红白色
          description: 国家地理黑色大包，冰冰🧊同款，颜值在线且实用。
          image: https://bu.dusays.com/2023/07/05/64a4c40ab698a.webp
          link: https://item.jd.com/100005889786.html
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
42
43
44
45
46

主题配置文件中开启menu中关于和我的装备的注释，导航栏我的装备，注意缩进！！！

yml
```
menu:
  # 文章:
  #   隧道: /archives/ || anzhiyu-icon-box-archive
  #   分类: /categories/ || anzhiyu-icon-shapes
  #   标签: /tags/ || anzhiyu-icon-tags

  # 友链:
  #   友人帐: /link/ || anzhiyu-icon-link
  #   朋友圈: /fcircle/ || anzhiyu-icon-artstation
  #   留言板: /comments/ || anzhiyu-icon-envelope

  # 我的:
  #   音乐馆: /music/ || anzhiyu-icon-music
  #   追番页: /bangumis/ || anzhiyu-icon-bilibili
  #   相册集: /album/ || anzhiyu-icon-images
  #   小空调: /air-conditioner/ || anzhiyu-icon-fan

  关于:
    #   关于本人: /about/ || anzhiyu-icon-paper-plane
    #   闲言碎语: /essay/ || anzhiyu-icon-lightbulb
    #   随便逛逛: javascript:toRandomPost() || anzhiyu-icon-shoe-prints1
    我的装备: /equipment/ || anzhiyu-icon-dice-d20
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