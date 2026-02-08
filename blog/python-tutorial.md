# Python入门教程 - 从零开始学Python

Python是一门非常适合初学者的编程语言，语法简洁明了，功能强大。本文将带你从零开始学习Python。

## 为什么选择Python？

Python有以下优点：

- **易学易用**：语法简单，接近自然语言
- **功能强大**：拥有丰富的库和框架
- **应用广泛**：Web开发、数据分析、机器学习、自动化等
- **社区活跃**：有大量的学习资源和支持

## 安装Python

### Windows用户

1. 访问Python官网：https://www.python.org/
2. 下载最新版本的Python安装包
3. 运行安装程序，**记得勾选"Add Python to PATH"**
4. 打开命令提示符，输入`python --version`验证安装

### Mac/Linux用户

Mac和大多数Linux发行版已经预装了Python，但建议安装最新版本：

```bash
# Mac用户使用Homebrew
brew install python3

# Ubuntu用户
sudo apt-get install python3
```

## 第一个Python程序

创建一个名为`hello.py`的文件，输入以下代码：

```python
print("Hello, World!")
```

运行程序：

```bash
python hello.py
```

你应该会看到输出：`Hello, World!`

## Python基础语法

### 变量和数据类型

```python
# 整数
age = 25

# 浮点数
height = 1.75

# 字符串
name = "张三"

# 布尔值
is_student = True

# 列表
scores = [90, 85, 92, 88]

# 字典
person = {
    "name": "张三",
    "age": 25,
    "city": "北京"
}
```

### 条件语句

```python
age = 18

if age >= 18:
    print("你已经成年了")
else:
    print("你还未成年")
```

### 循环

```python
# for循环
for i in range(5):
    print(f"这是第{i+1}次循环")

# while循环
count = 0
while count < 5:
    print(f"计数：{count}")
    count += 1
```

### 函数

```python
def greet(name):
    """问候函数"""
    return f"你好，{name}！"

# 调用函数
message = greet("小明")
print(message)
```

## 实战练习

让我们写一个简单的计算器程序：

```python
def calculator():
    """简单计算器"""
    print("欢迎使用计算器")
    print("1. 加法")
    print("2. 减法")
    print("3. 乘法")
    print("4. 除法")
    
    choice = input("请选择操作（1-4）：")
    
    num1 = float(input("请输入第一个数字："))
    num2 = float(input("请输入第二个数字："))
    
    if choice == '1':
        result = num1 + num2
        print(f"结果：{num1} + {num2} = {result}")
    elif choice == '2':
        result = num1 - num2
        print(f"结果：{num1} - {num2} = {result}")
    elif choice == '3':
        result = num1 * num2
        print(f"结果：{num1} × {num2} = {result}")
    elif choice == '4':
        if num2 != 0:
            result = num1 / num2
            print(f"结果：{num1} ÷ {num2} = {result}")
        else:
            print("错误：除数不能为0")
    else:
        print("无效的选择")

# 运行计算器
calculator()
```

## 学习资源推荐

- **官方文档**：https://docs.python.org/zh-cn/3/
- **菜鸟教程**：https://www.runoob.com/python3/
- **廖雪峰的Python教程**：https://www.liaoxuefeng.com/wiki/1016959663602400
- **LeetCode**：练习算法和数据结构

## 下一步

学完基础后，你可以：

1. 学习Python标准库
2. 尝试Web开发（Flask/Django）
3. 学习数据分析（Pandas/NumPy）
4. 探索机器学习（Scikit-learn/TensorFlow）

## 总结

Python是一门非常值得学习的编程语言。记住，编程最重要的是多练习、多实践。不要害怕犯错，每个错误都是学习的机会。

祝你学习愉快！如果有任何问题，欢迎在评论区留言。

---

*本文首发于个人博客，转载请注明出处。*
