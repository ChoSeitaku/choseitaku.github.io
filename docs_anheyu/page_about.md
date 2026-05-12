# 关于页面配置

# 页面配置 📦 [​](#页面配置-📦)

## 关于页面配置 [​](#关于页面配置)

1.  前往你的 Hexo 博客的根目录

2.  在 Hexo 博客根目录 `[blog]`下打开终端，输入

    bash
    ```
    hexo new page about
    ```

    1

3.  你会找到 `source/about/index.md` 这个文件

4.  修改这个文件： 记得添加 `type: "about"`

    yml
    ```
    ---
    title: 关于
    date: 2021-03-30 15:57:51
    aside: false
    top_img: false
    background: "#f8f9fe"
    comments: false
    type: "about"
    ---
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

5.  主题配置文件中开启`menu`中关于和关于本人的注释，注意缩进！！！

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
      #   相册集: /album/ || icon-images
      #   小空调: /air-conditioner/ || icon-fan

      关于:
        关于本人: /about/ || icon-zhifeiji
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


新建`source/_data/about.yml`，输入以下内容

yml
```
- class_name: 关于页
  subtitle: 生活明朗，万物可爱✨
  avatarImg: https://npm.elemecdn.com/anzhiyu-blog-static@1.0.0/img/avatar.webp
  avatarSkills:
    left:
      - 🤖️ 数码科技爱好者
      - 🔍 分享与热心帮助
      - 🏠 智能家居小能手
      - 🔨 设计开发一条龙
    right:
      - 专修交互与设计 🤝
      - 脚踏实地行动派 🏃
      - 团队小组发动机 🧱
      - 壮汉人狠话不多 💢
  name: 陈志伟
  description: 是一名 前端工程师、学生、独立开发者、博主
  aboutsiteTips:
    tips: 追求
    title1: 源于
    title2: 热爱而去 感受
    word:
      - 学习
      - 生活
      - 程序
      - 体验
  helloAbout: Hello there!
  skillsTips:
    tips: 技能
    title: 开启创造力
  careers:
    tips: 生涯
    title: 无限进步
    list:
      - desc: EDU,软件工程专业
        color: "#357ef5"
      - desc: EDU,软件工程专业
        color: "#357ef5"
      - desc: EDU,软件工程专业
        color: "#357ef5"
    img: https://bu.dusays.com/2023/04/21/644287166329b.png
  statistic:
    link: /archives
    text: 文章隧道
    cover: https://bu.dusays.com/2023/05/01/644f4b037b930.jpg
  map:
    title: 我现在住在
    StrengthenTitle: 中国，长沙市
    background: https://bu.dusays.com/2023/07/05/64a4c61cb20ef.jpg
    backgroundDark: https://bu.dusays.com/2023/07/05/64a4c63495ac5.jpg
  selfInfo:
    selfInfoTips1: 生于
    selfInfoContentYear: 2002
    selfInfoTips2: 湖南信息学院
    selfInfoContent2: 软件工程
    selfInfoTips3: 现在职业
    selfInfoContent3: 大三学生👨‍🎓
  personalities:
    author_name: 执政官
    personality_type: ESFJ-A
    photo_url: https://bu.dusays.com/2023/07/05/64a4c63495ac5.jpg
    personality_img: https://npm.elemecdn.com/anzhiyu-blog@2.0.8/img/svg/ESFJ-A.svg
    name_url: https://www.16personalities.com/ch/esfj-%E4%BA%BA%E6%A0%BC
  maxim:
    maxim_tips: 座右铭
    maxim_top: 生活明朗，
    maxim_bottom: 万物可爱。
  buff:
    buff_tips: 特长
    buff_top: 脑回路新奇的 酸菜鱼
    buff_bottom: 二次元指数 MAX
  game:
    game_tips: 爱好游戏
    game_title: 原神
    game_uid: "UID: 125766904"
    game_bg: https://bu.dusays.com/2023/04/22/64433bf26e25d.webp
  comic:
    comic_tips: 爱好番剧
    comic_title: 追番
    comic_list:
      - name: 约定的梦幻岛
        href: https://www.bilibili.com/bangumi/media/md5267750/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1
        cover: https://bu.dusays.com/2023/05/27/647166c44b414.webp
      - name: 咒术回战
        href: https://www.bilibili.com/bangumi/media/md28229899/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1
        cover: https://bu.dusays.com/2023/05/24/646db4398832e.webp
      - name: 紫罗兰永恒花园
        href: https://www.bilibili.com/bangumi/media/md8892/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1
        cover: https://bu.dusays.com/2023/05/24/646db43983d99.webp
      - name: 鬼灭之刃
        href: https://www.bilibili.com/bangumi/media/md22718131/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1
        cover: https://bu.dusays.com/2023/05/24/646db439856a0.webp
      - name: JOJO的奇妙冒险 黄金之风
        href: https://www.bilibili.com/bangumi/media/md135652/?spm_id_from=666.25.b_6d656469615f6d6f64756c65.1
        cover: https://bu.dusays.com/2023/05/30/64760e38d651a.webp
  like:
    like_tips: 关注偏好
    like_title: 数码科技
    like_bg: https://bu.dusays.com/2022/12/06/638f5f05ce1f7.jpg
    like_bottom: 手机、电脑软硬件
  music:
    music_tips: 音乐偏好
    music_title: 许嵩、民谣、华语流行
    music_bg: https://p2.music.126.net/Mrg1i7DwcwjWBvQPIMt_Mg==/79164837213438.jpg
    music_link: /music
  reward_list:
    - name: 海阔蓝
      amount: 8.8
      datatime: 2023-03-28
    - name: LK66
      amount: 66.6
      datatime: 2023-03-24
    - name: 张时貳
      amount: 6.6
      datatime: 2023-01-22
    - name: ZeroAf
      amount: 9.9
      datatime: 2022-12-14
    - name: LuckyWangXi
      amount: 6.6
      datatime: 2022-12-14
    - name: 刀中日月长
      amount: 10
      datatime: 2022-11-16
    - name: 鹿啵包
      amount: 10
      datatime: 2022-11-08
    - name: 疾速k
      amount: 50
      datatime: 2022-09-20
    - name: 伴舟先生大霖子
      amount: 4.03
      datatime: 2022-10-27
      suffix: 贝壳
    - name: Magica_0x0
      amount: 3.36
      datatime: 2022-10-07
      suffix: 贝壳
    - name: 名字就是要短像这样
      amount: 3.36
      datatime: 2022-08-25
      suffix: 贝壳
    - name: Leviathan520
      amount: 1.34
      datatime: 2022-08-23
      suffix: 贝壳
    - name: 托马斯
      amount: 10
      datatime: 2022-08-19
    - name: 哇是猫猫欸
      amount: 1.34
      datatime: 2022-08-19
      suffix: 贝壳
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
47
48
49
50
51
52
53
54
55
56
57
58
59
60
61
62
63
64
65
66
67
68
69
70
71
72
73
74
75
76
77
78
79
80
81
82
83
84
85
86
87
88
89
90
91
92
93
94
95
96
97
98
99
100
101
102
103
104
105
106
107
108
109
110
111
112
113
114
115
116
117
118
119
120
121
122
123
124
125
126
127
128
129
130
131
132
133
134
135
136
137
138
139
140
141
142
143
144
145
146
147
148
149
150
151
152

参数 | 备选值/类型 | 解释
--- | --- | ---
class_name | 关于页 | 【必须】页面类
subtitle | string | 【必须】副标题
avatarImg | url | 【必须】头像链接
name | string | 【必须 作者名称
description | string | 【必须】描述
aboutsiteTips | object | 【必须】站点关于提示相关配置
aboutsiteTips.tips | string | 【必须】站点关于提示性文字
aboutsiteTips.title1 | string | 【必须】站点关于标题文字 1
aboutsiteTips.title2 | string | 【必须】站点关于标题文字 2
aboutsiteTips.word | list | 【必须】站点关于标题滚动文字
helloAbout | string | 【必须】hello 文字
skillsTips | object | 【必须】技能相关配置
skillsTips.tips | string | 【必须】技能提示文字
skillsTips.title | string | 【必须】技能标题
careers | object | 【必须】生涯相关配置
careers.tips | string | 【必须】生涯提示性文字
careers.title | string | 【必须】生涯标题
careers.list | list | 【可选】生涯 item
careers.list.desc | string | 【可选】生涯 item 描述
careers.list.color | string | 【可选】生涯 item 圆圈颜色
careers.img | string | 【必须】生涯底部图片
statistic | object | 【必须】统计数据相关配置
statistic.link | url | 【必须】统计数据按钮前往链接
statistic.text | string | 【必须】统计数据按钮文字
map | object | 【必须】地图相关配置
map.title | string | 【必须】地图标题
map.StrengthenTitle | string | 【必须】地图大标题
map.background | url | 【必须】地图亮色模式背景
map.backgroundDark | url | 【必须】地图暗色模式背景
selfInfo | object | 【必须】作者相关信息配置
selfInfo.selfInfoTips1 | string | 【必须】作者相关提示文字 1
selfInfo.selfInfoContentYear | number | 【必须】作者生日年份
selfInfo.selfInfoTips2 | string | 【必须】作者相关提示文字 2
selfInfo.selfInfoContent2 | string | 【必须】作者相关内容 2
selfInfo.selfInfoTips3 | string | 【必须】作者相关提示文字 3
selfInfo.selfInfoContent3 | string | 【必须】作者相关内容 3
personalities | object | 【必须】作者性格相关配置
personalities.author_name | string | 【必须】作者性格名称
personalities.personality_type | string | 【必须】作者性格类型
personalities.photo_url | url | 【必须】作者自拍图片
personalities.personality_img | url | 【必须】作者性格表述图片
personalities.name_url | url | 【必须】点击性格跳转到链接
maxim | object | 【必须】座右铭相关配置
maxim.maxim_tips | string | 【必须】座右铭相关提示文字
maxim.maxim_top | string | 【必须】座右铭相关顶部文字
maxim.maxim_bottom | string | 【必须】座右铭相关底部文字
buff | object | 【必须】特长相关配置
buff.buff_tips | string | 【必须】特长相关提示文字
buff.buff_top | string | 【必须】特长相关顶部文字
buff.buff_bottom | string | 【必须】特长相关底部文字
game | object | 【必须】爱好游戏相关配置
game.game_tips | string | 【必须】爱好游戏提示文字
game.game_title | string | 【必须】爱好游戏标题
game.game_uid | string | 【必须】爱好游戏 uid
game.game_bg | url | 【必须】爱好游戏背景
comic | object | 【必须】追番相关配置，需要 5 条数据
comic.comic_tips | string | 【必须】追番相关提示文字
comic.comic_title | string | 【必须】追番相关标题
comic.comic_list | list | 【必须】追番相关列表
comic.comic_list.name | string | 【必须】追番 item 名称
comic.comic_list.href | url | 【必须】追番 item 链接
comic.comic_list.cover | url | 【必须】追番 item 的 cover
like | object | 【必须】关注偏好相关配置
like.like_tips | string | 【必须】关注偏好配置提示文字
like.like_title | string | 【必须】关注偏好配置标题
like.like_bg | url | 【必须】关注偏好配置背景
like.like_bottom | string | 【必须】关注偏好配置底部文字
music | object | 【必须】音乐偏好相关配置
music.music_tips | string | 【必须】音乐偏好提示性文字
music.music_title | string | 【必须】音乐偏好标题
music.music_bg | url | 【必须】音乐偏好背景
music.music_link | url | 【必须】音乐偏好按钮链接
reward_list | object | 【可选】打赏相关配置，如果不配置将没有打赏模块
reward_list.name | string | 【必须】打赏 item 名称
reward_list.amount | number | 【必须】打赏 item 金额
reward_list.datatime | Date | 【必须】打赏 item 时间
reward_list.suffix | string/元 | 【可选】打赏 item 后缀（默认元）

![关于页](https://img02.anheyu.com/adminuploads/1/2023/04/09/6432643720ef6.png!blogimg)