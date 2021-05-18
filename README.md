## 编程语言学习

# int
```
hex: 0xc8, 0hc8, 0c8h
dec: 0d200, 200, 0200d
oct: 0o310, 0q310, 310q, 310o
bin: 0b1100_1000, 0y1100_1000, 11001000b, 1100_1000b, 1100_1000y
```

# float
```
1.23, .23
```

# [运算符优先级](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Operator_Precedence)


# bool
```
true, false
```

# string
```
"str", 'str', 'str\'str\'', "str'str'"


$"123 \{ 123 \}"  => "123 { 123 }"

$"123 { 123 }"    => "123 123"
```

# Null
```
null
```

# Variable
```
auto a = 1
a = 2

int a = 1
a = 1.2 // error

int a = 1,b = 2, c= 3;
a => 1
b => 1
c => 1


int a,b,c = 1;
a => null
b => null
c => 1
```

# constant
```
const auto a = 1
```

# call
```
print(123)

typeof(123)   => "int"
typeof(1.23)  => "float"
typeof("123") => "string"
```

# fun
```
int add(int a, int b) => a + b

int add(const int a, const int b) {
  // a++; // error

  print(a + b)
  ret a + b;
}

const fun a = add
```

# List
```
[1,2]

List arr = [1,2]
```

# Map
```
map { "key": "value" }

Map a = map { "key": "value" }
```

# Conversion
```
(int)1.23  => 1
(int)"1.23"  => 1

(float)1   => 1.0
(string)1   => "1"
```

# Ternary expression
```
int a = true ? 1 : 2;
```

# Post-expression
```
int a = 1;
a--;
a++;
```

# Pre-expression
```
int a = 1;
--a;
++a;
```

# if,elif,else
```
int age = 111;
if( age == 10 ) {
  print(1)
} elif ( age == 11) {
  print(2)
} elif ( age == 12) {
  print(3)
} else {
  print(4)
}
```

# while
```
int i = 10
while(true) {
  print(i)
  i--

  if(i <= 5) break
}
```

## AtIndex
```
// list
[1 , 2, [3], 4][0]  => 1
[1 , 2, [3], 4][1]  => 2
[1 , 2, [3], 4][2]  => [3]
[1 , 2, [3], 4][2][0]  => 3

// string
"asd"[1]  => "s"

// map
map { "name": "Ajanuw" }["name"]  => "Ajanuw"

List add() => [1];
[add][0]()[0]       => 1
```

## AtKey
```
(map { 'name': "ajanuw" }).name   => "ajanuw"

(map { 'name': "ajanuw", 'lst': [1] }).lst[0]   => 1
```

## Optional chaining
```
> map{  }.a?.b?.x
null

> map{  }.a.b.x // error
```