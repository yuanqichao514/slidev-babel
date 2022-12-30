---
theme: seriph
background: https://source.unsplash.com/collection/94734566/1920x1080
class: text-center
highlighter: shiki
lineNumbers: false
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
drawings:
  persist: false
title: Introduce some interesting open source projects
---
# 学一点点babel
（babel的基础知识及简单入门体验）


---

# 为什么学习一点babel？


babel在前端中的作用相当巨大，能够帮我们做很多我们需要做的繁琐事情，因此简单的了解babel有助于我们更多的了解编译



---

# 今天主要分享什么内容？


* babel到底是什么？
* babel有什么作用？
* babel的AST是什么？
* babel的API有哪些？
* babel的一个小例子

---

# babel到底是什么

babel最开始叫6to5，顾名思义是帮助我们将js语法的es6转换到es5，但是大家也知道，后来我们有了esxxxx，每一年都有新的更新，因此再用原来的名字已经不合适了，所以改名叫做babel。

babel其实是巴别塔的意思，在圣经中的意思是，人类建造了通往天堂的高塔，为了阻止人类，上帝让人类之间相互不能沟通，人类计划因此失败。此事件为世上出现不同语言和种族提供解释，这座塔就是巴别塔。

babel也就是作为转译器的作用，采用了这个名字。

---

# babel有什么作用

常见的功能：

* 转移esnext，typescript等到目标环境支持的js
* 一些特定用途的代码转换，比如自动埋点等，taro就是基于babel的api来实现的
* 代码的静态分析，我们常用的eslinter就是对代码规范进行检查

---

# babel的编译流程是什么

在讲AST之前，我们首先了解一下babel的编译流程：

* parse：通过parser将源码转换为AST，也就是抽象语法树
* transform：遍历AST，调用各种transform插件对AST进行增删改，是通过遍历到不同的节点后注入不同的visitor
* generate：把转换后的AST打印成目标代码，并生成sourcemap，是目标代码字符串的拼接


---

# babel的AST是什么

我们来认识一些常见的AST节点

- Literal： 字面量，包括字符串字面量，数字字面量，布尔字面量。。。。
- Identifier： 标识符，包括变量名，函数名，属性名，参数名等各种声明和引用的名字
- Statement： 语句，是可以独立执行的最小单位，包括break，continue，debugger，return，if语句，while语句。。。
- Declaration： 声明语句是一种特殊的语句，执行的逻辑是在一个作用域内声明一个变量，函数，class等
- Expression： 表达式，特点是执行完之后有返回值，这是与Statement的区别

以及Class、Modules、import & export等等。。。

---

值得注意的两个：
- Program&Directive： Program是代表整个程序的节点，它有 body 属性代表程序体，存放 statement 数组，就是具体执行的语句的集合。还有 directives 属性，存放 Directive 节点，比如`"use strict"` 这种指令会使用 Directive 节点表示
- File & Comment：babel的AST最外层节点是file，有program，comments，tokens等属性，分别存放上面提到的Program程序体，注释，token等；Comment又分为块注释和行内注释，对应不同的AST节点

---

# babel一些常见的API

-   parse 阶段有`@babel/parser`，功能是把源码转成 AST
-   transform 阶段有 `@babel/traverse`，可以遍历 AST，并调用 visitor 函数修改 AST，修改 AST 自然涉及到 AST 的判断、创建、修改等，这时候就需要 `@babel/types` 了，当需要批量创建 AST 的时候可以使用 `@babel/template` 来简化 AST 创建逻辑。
-   generate 阶段会把 AST 打印为目标代码字符串，同时生成 sourcemap，需要 `@babel/generator` 包
-   中途遇到错误想打印代码位置的时候，使用 `@babel/code-frame` 包
-   babel 的整体功能通过 `@babel/core` 提供，基于上面的包完成 babel 整体的编译流程，并应用 plugin 和 preset。


---

# @babel/parser

也叫babylon，是基于arcon引擎实现的，而arcon官方定义是A small, fast, JavaScript-based JavaScript parser。
而parser默认只能是parse js代码，其余类似jsx，ts等都需要不同的插件来实现。
提供 parse 和 parseExpression 两个api，前者返回AST根节点是File（整个AST），后者返回AST根节点是Expression（表达式的AST）

parse的内容包括什么？

-   `plugins`： 指定jsx、typescript、flow 等插件来解析对应的语法

-   `allowXxx`： 指定一些语法是否允许，比如函数外的 await、没声明的 export等

-   `sourceType`： 指定是否支持解析模块语法，有 module、script、unambiguous 3个取值：

    -   module：解析 es module 语法
    -   script：不解析 es module 语法
    -   unambiguous：根据内容是否有 import 和 export 来自动设置 module 还是 script

一般我们会指定 sourceType 为 unambiguous。

---

#  @babel/traverse

parse出的AST由@babel/traverse来遍历，提供了traverse方法`function traverse(parent, opts)`，通常是两个参数，第一个是parent：指定要遍历的AST节点，opts：指定visitor函数

visitor指定对什么AST做什么处理的函数，babel会在遍历到对应的AST时回调这些函数，这里用到一个设计模式，叫做`访问者模式`，可以指定开始遍历enter和结束遍历exit两个阶段的回调函数。

enter 时调用是在遍历当前节点的子节点前调用，exit 时调用是遍历完当前节点的子节点后调用。

另外关于这中间的内容还有很多，可以参见官网的api介绍，不再展开了

---

# 多提一嘴：plugin和preset

由于babel的很多事情都是由插件去完成的，比如转换ts，jsx这些都需要插件，所以对于单独的一个功能，我们可以通过plugin的配置来完成。

但有时候plugin比较多或者plugin的options比较多的时候，容易导致使用成本增加， 这个时候可以封装成一个preset，用户可以通过它来批量引入preset进行配置，如preset-react等。

babel会按照先应用plugin，后应用preset；plugin从前到后应用，preset从后到前应用的顺序来处理。

---

# 百闻不如一见🌰：

举个例子：如何利用babel进行埋点？


---

# 谢谢观看
