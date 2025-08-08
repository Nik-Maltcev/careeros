## Документация сервиса

- [Помощь по подключению](https://robokassa.com/content/nachalo-raboty.html)
- [Требования для подключения](https://robokassa.com/content/trebovaniya.html)
- [Личный кабинет](https://partner.robokassa.ru/)

- [Помощь по подключению](https://robokassa.com/content/nachalo-raboty.html)
- [Требования для подключения](https://robokassa.com/content/trebovaniya.html)
- [Логотипы Robokassa](https://robokassa.com/media/Logo_Robokassa.zip)
- [Документация для Казахстана](https://docs.robokassa.kz/)

- [Robokassa](https://docs.robokassa.ru/)
- Интерфейс оплаты

Внимание! Если вы используете CMS систему
или любые другие торговые платформы, рекомендуем ознакомиться с готовыми решениями в разделе [виджеты и модули](https://docs.robokassa.ru/widgets/).


# Об интерфейсе оплаты

Интерфейс Robokassa, предлагает перейти к
оплате, нажав одну кнопку.
Предварительно магазин должен сохранить у себя передаваемую информацию (номер счёта, сумма, дата
формирования и дополнительные
параметры, если они используются).


Покупатель отправляется для оплаты в
платёжный интерфейс Robokassa, выбирает
способ оплаты и совершает платёж. После чего средства перечисляются на Ваш баланс в системе
Robokassa, а на указанный вами
[ResultURL](https://docs.robokassa.ru/pay-interface/#notification) мы
пришлём уведомление об оплате.


#### URL для запросов HTTP  GET/POST:

https://auth.robokassa.ru/Merchant/Index.aspx

## Готовый виджет для оплаты на  сайте

Вы можете выбрать готовый виджет и
кастомизировать его под ваши нужды
в конструкторе или в личном кабинете в разделе
Платежный виджет

В конструкторе выберите нужный
виджет способа перехода к оплате,
отредактируйте его внешний вид, проставте сумму оплаты и при необходимости дополнительные поля.
Затем сгенерируемый готовый код скопируйте
к себе на сайт.


#### По каждому магазину  передается три параметра:

• Кнопка перехода на оплату;

• Форма с произвольной суммой
оплаты;

• Ссылка перехода на оплату;

• Оплата с помощью QR-кода;

## Пример кода виджета, для самостоятельной  установки

Приведённые примеры предполагает, что в
технических настройках магазина выбран
алгоритм расчёта хэша MD5.

Кнопка

Форма c произвольной суммой

С применением всех параметров


PHP

```interface-code__content-main

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

        <?php
          $merchant_login = "demo";
          $password_1 = "password_1";
          $invid = 0;
          $description = "Техническая документация по ROBOKASSA";
          $out_sum = "8.96";
          $signature_value = md5("$merchant_login:$out_sum:$invid:$password_1");
          print "<html><script language=JavaScript ".
            "src='https://auth.robokassa.ru/Merchant/PaymentForm/FormMS.js?".
            "MerchantLogin=$merchant_login&OutSum=$out_sum&InvoiceID=$invid".
            "&Description=$description&SignatureValue=$signature_value'></script></html>";
        ?>

```

```interface-code__content-main


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

        <?php
          $merchant_login = "demo";
          $password_1 = "password_1";
          $invid = 0;
          $description = "Техническая документация по ROBOKASSA";
          $default_sum = "10";
          $signature_value = md5("$merchant_login::$invid:$password_1");
          print "<html><script language=JavaScript ".
            "src='https://auth.robokassa.ru/Merchant/PaymentForm/FormFLS.js?".
            "MerchantLogin=$merchant_login&DefaultSum=$default_sum&InvoiceID=$invid".
            "&Description=$description&SignatureValue=$signature_value'></script></html>";
        ?>

```

```interface-code__content-main


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

        <?php
          // регистрационная информация (Идентификатор магазина, пароль №1)
          // registration info (Merchant ID, password #1)
          $merchant_login = "demo";
          $password_1 = "password_1";
          // номер заказа
          // number of order
          $invid = 12345;
          // описание заказа
          // order description
          $description = "Техническая документация по ROBOKASSA";
          // сумма заказа
          // sum of order
          $out_sum = "8.96";
          // Товарная номенклатура (Receipt) в url encode
          // Product Nomenclature (Receipt) in url encode
          // Before url encode - {"items":[{"name":"product","quantity":1,"sum":1,"tax":"none"}]}
          $receipt = "%7B%22items%22%3A%5B%7B%22name%22%3A%22product%22%2C%22quantity%22%3A1%2C%22sum%22%3A1%2C%22tax%22%3A%22none%22%7D%5D%7D";
          // предлагаемая валюта платежа
          // default payment e-currency
          $incurrlabel = "BANKOCEAN2R";
          // язык
          // language
          $culture = "ru";
          // кодировка
          // encoding
          $encoding = "utf-8";
          // Адрес электронной почты покупателя
          // E-mail
          $Email = "test@test.ru";
          // Срок действия счёта
          // Expiration Date
          $ExpirationDate = "2029-01-16T12:00";
          // Дополнительные пользовательские параметры
          // Shp_item
          $Shp_item = "Shp_oplata=1";
          // формирование подписи
          // generate signature
          $signature_value =md5("$merchant_login:$out_sum:$invid:$receipt:$password_1:Shp_item=$shp_item");
          // форма оплаты товара
          // payment form
          print
            "<html>".
              "<form action='https://auth.robokassa.ru/Merchant/Index.aspx' method=POST>".
                "<input type=hidden name=MerchantLogin value=$merchant_login>".
                "<input type=hidden name=OutSum value=$out_sum>".
                "<input type=hidden name=InvId value=$invid>".
                "<input type=hidden name=Description value='$description'>".
                "<input type=hidden name=SignatureValue value=$signature_value>".
                "<input type=hidden name=Shp_item value='$shp_item'>".
                "<input type=hidden name=IncCurrLabel value=$incurrlabel>".
                "<input type=hidden name=Culture value=$culture>".
                "<input type=hidden name=Email value=$Email>".
                "<input type=hidden name=ExpirationDate value=$ExpirationDate>".
                "<input type=hidden name=Receipt value=$receipt>".
                "<input type=submit value='Оплатить'>".
            "</form></html>";
        ?>

```

Описание
параметров

Параметр

Значение

MerchantLogin


Идентификатор магазина

password\_1


Пароль,
который вы указали в
[Технических настройках.](https://partner.robokassa.ru/Shops)

InvId


Номер счета в магазине. Необязательный параметр, но мы настоятельно рекомендуем
его использовать. Значение этого параметра
должно быть уникальным для каждой оплаты. Может принимать значения
от 1 до 9223372036854775807 (2 – 1)

Description


Описание
покупки, можно использовать только символы английского
или русского алфавита, цифры и знаки препинания. Максимальная длина — 100
символов.


OutSum


Требуемая к получению сумма (буквально — стоимость заказа,
сделанного клиентом). Формат представления — число, разделитель — точка,
например:
123.45.
Сумма должна быть указана в рублях.


SignatureValue


Контрольная сумма — хэш,
число в 16-ричной форме и любом регистре (0-9, A-F), рассчитанное методом
указанным в Технических настройках магазина.
Рассчитывается по базе, содержащей следующие параметры, разделенные символом
:
с добавлением Пароль#1


База для расчёта контрольной суммы:

MerchantLogin:OutSum:InvId:Пароль#1

Если Вы хотите передавать нам пользовательские параметры, например:
Shp\_login=Vasya;,
Shp\_oplata=1, то база для расчёта контрольной суммы должна выглядеть так:

MerchantLogin:OutSum:InvId:Пароль#1:Shp\_login=Vasya:Shp\_oplata=1

### Результат применения кода

![](https://docs.robokassa.ru/pay-interface/src/img/interface-button-simple.png)![](https://docs.robokassa.ru/pay-interface/src/img/interface-button-sum.png)![](https://docs.robokassa.ru/pay-interface/src/img/code-result-image.png)

### Создание ссылки без перенаправления на оплату (JWT)

### Запрос JSON Web Token

#### Адрес для отправки запроса:

POST https://services.robokassa.ru/InvoiceServiceWebApi/api/CreateInvoice

Запрос представляет собой JWT-строку, которая
передается в теле HTTP запроса.

#### Параметры запроса:

Header

Payload

Signature

#### Описание параметров:

Header \- Заголовок. Состоит из двух параметров в формате JSON

JSON

```xml-code__content-wrapper xml-code__content-wrapper--white


1
2
3
4


       {
          "typ": "JWT",
          "alg": "MD5"
       }

```

Вместо MD5 можно использовать любое название алгоритма из списка:

MD5,

RIPEMD160,

SHA1 (или HS1),

SHA256 (или HS256),

SHA384 (или HS384),

SHA512 (или HS512)

Если параметр "alg" и его значение не переданы, то будет использован метод указанный в настройках магазина.

После чего преобразовать этот JSON в Base64Url. Пример результата:eyJ0eXAiOiJKV1QiLCJhbGciOiJNRDUifQ.

Payload \- Полезная нагрузка. Состоит из основного запроса в формате JSON

JSON

```xml-code__content-wrapper xml-code__content-wrapper--white


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


       {
          "MerchantLogin": "robo-demo-test",
          "InvoiceType": "OneTime",
          "Culture": "ru",
          "InvId": 0,
          "OutSum": 1,
          "Description": "as",
          "MerchantComments": "no comment",
          "UserFields":
             {
              "shp_info":"test"
             },
          "InvoiceItems": [\
            {\
              "Name": "Тест1",\
              "Quantity": 1,\
              "Cost": 0.5,\
              "Tax": "vat20",\
              "PaymentMethod": "full_payment",\
              "PaymentObject": "commodity"\
            },\
            {\
              "Name": "Тест2",\
              "Quantity": 1,\
              "Cost": 0.5,\
              "Tax": "vat0",\
              "PaymentMethod": "full_prepayment",\
              "PaymentObject": "commodity",\
              "NomenclatureCode": "IYVITCUR%XE^$X%C^T&VITC^RX&%ERC^TIRX%&ERCUITRXE&ZX%R^CTIR^XUE%ZN1m9E+1¦?5O?6¦?168"\
             }\
            ],
          "SuccessUrl2Data":
             {
              "Url":"https://robokassa.com/",
              "Method":"GET"
             },
          "FailUrl2Data":
             {
              "Url":"https://www.google.com/",
              "Method":"POST"
             }
           }

```

Используется [**стандартный набор параметров скрипта**](https://docs.robokassa.ru/script-parameters/#required) и [**фискализации**](https://docs.robokassa.ru/fiscalization/) но с некоторыми отличиями.



Описание
параметров

Параметр

Значение

InvoiceType


Тип ссылки, одноразовая или многоразовая.

Возможные значения:

OneTime

– Одноразовая ссылка (счет выставляемый в ЛКК)

Reusable

– Многоразовая ссылка

MerchantComments


Внутренний комментарий для сотрудников. Отображается в ЛК в разделе "Выставление счетов".


Этот JSON так же необходимо преобразовать в Base64Url. Пример результата:ewogICAiTWVyY2hhbnRMb2dpbiI6InJvYm8tZGVtby10ZXN0IiwKICAgIkludm9pY2VUeXBlIjoiT25lVGltZSIsCiAgICJDdWx0dXJlIjoicnUiLAogICAiSW52SWQiOjgwMCwKICAgIk91dFN1bSI6MSwKICAgIkRlc2NyaXB0aW9uIjoiYXMiLAogICAiTWVyY2hhbnRDb21tZW50cyI6Im5vIGNvbW1lbnQiLAogICAiSW52b2ljZUl0ZW1zIjpbCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjEiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQyMCIsCiAgICAgICAgICJQYXltZW50TWV0aG9kIjoiZnVsbF9wYXltZW50IiwKICAgICAgICAgIlBheW1lbnRPYmplY3QiOiJjb21tb2RpdHkiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjIiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQwIiwKICAgICAgICAgIlBheW1lbnRNZXRob2QiOiJmdWxsX3ByZXBheW1lbnQiLAogICAgICAgICAiUGF5bWVudE9iamVjdCI6ImNvbW1vZGl0eSIsCiAgICAgICAgICJOb21lbmNsYXR1cmVDb2RlIjoiSVlWSVRDVVIlWEVeJFglQ15UJlZJVENeUlgmJUVSQ15USVJYJSZFUkNVSVRSWEUmWlglUl5DVElSXlhVRSVaTjFtOUUrMcKmPzVPPzbCpj8xNjgiCiAgICAgIH0KICAgXQp9

Signature \- Используется для проверки подлинности токена. Эта строка генерируется путем подписи заголовка и полезной нагрузки токена с использованием алгоритма подписи и секретного ключа.

#### Принцип формирования

Изначально нужно создать следующую строку  результат из шага 1.результат из шага 2  , должна получится следующая строка:

eyJ0eXAiOiJKV1QiLCJhbGciOiJNRDUifQ.ewogICAiTWVyY2hhbnRMb2dpbiI6InJvYm8tZGVtby10ZXN0IiwKICAgIkludm9pY2VUeXBlIjoiT25lVGltZSIsCiAgICJDdWx0dXJlIjoicnUiLAogICAiSW52SWQiOjgwMCwKICAgIk91dFN1bSI6MSwKICAgIkRlc2NyaXB0aW9uIjoiYXMiLAogICAiTWVyY2hhbnRDb21tZW50cyI6Im5vIGNvbW1lbnQiLAogICAiSW52b2ljZUl0ZW1zIjpbCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjEiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQyMCIsCiAgICAgICAgICJQYXltZW50TWV0aG9kIjoiZnVsbF9wYXltZW50IiwKICAgICAgICAgIlBheW1lbnRPYmplY3QiOiJjb21tb2RpdHkiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjIiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQwIiwKICAgICAgICAgIlBheW1lbnRNZXRob2QiOiJmdWxsX3ByZXBheW1lbnQiLAogICAgICAgICAiUGF5bWVudE9iamVjdCI6ImNvbW1vZGl0eSIsCiAgICAgICAgICJOb21lbmNsYXR1cmVDb2RlIjoiSVlWSVRDVVIlWEVeJFglQ15UJlZJVENeUlgmJUVSQ15USVJYJSZFUkNVSVRSWEUmWlglUl5DVElSXlhVRSVaTjFtOUUrMcKmPzVPPzbCpj8xNjgiCiAgICAgIH0KICAgXQp9

Далее используя шифрование HMAC необходимо закодировать строку с помощью выбранного метода шифрования.В качестве секретного ключа используется индентификатор магазина и пароль1 в формате  robo-demo-test:pass1 и представить в формате Base64 - IzOJPWjDkzajNttt8dFQFg

На финальном этапе необходимо соеденить три полученных строки через точку \-  eyJ0eXAiOiJKV1QiLCJhbGciOiJNRDUifQ.ewogICAiTWVyY2hhbnRMb2dpbiI6InJvYm8tZGVtby10ZXN0IiwKICAgIkludm9pY2VUeXBlIjoiT25lVGltZSIsCiAgICJDdWx0dXJlIjoicnUiLAogICAiSW52SWQiOjgwMCwKICAgIk91dFN1bSI6MSwKICAgIkRlc2NyaXB0aW9uIjoiYXMiLAogICAiTWVyY2hhbnRDb21tZW50cyI6Im5vIGNvbW1lbnQiLAogICAiSW52b2ljZUl0ZW1zIjpbCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjEiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQyMCIsCiAgICAgICAgICJQYXltZW50TWV0aG9kIjoiZnVsbF9wYXltZW50IiwKICAgICAgICAgIlBheW1lbnRPYmplY3QiOiJjb21tb2RpdHkiCiAgICAgIH0sCiAgICAgIHsKICAgICAgICAgIk5hbWUiOiLQotC10YHRgjIiLAogICAgICAgICAiUXVhbnRpdHkiOjEsCiAgICAgICAgICJDb3N0IjowLjUsCiAgICAgICAgICJUYXgiOiJ2YXQwIiwKICAgICAgICAgIlBheW1lbnRNZXRob2QiOiJmdWxsX3ByZXBheW1lbnQiLAogICAgICAgICAiUGF5bWVudE9iamVjdCI6ImNvbW1vZGl0eSIsCiAgICAgICAgICJOb21lbmNsYXR1cmVDb2RlIjoiSVlWSVRDVVIlWEVeJFglQ15UJlZJVENeUlgmJUVSQ15USVJYJSZFUkNVSVRSWEUmWlglUl5DVElSXlhVRSVaTjFtOUUrMcKmPzVPPzbCpj8xNjgiCiAgICAgIH0KICAgXQp9.IzOJPWjDkzajNttt8dFQFg


и отправить запрос по указанному ранее адресу. В ответе Вы получите короткую ссылку на оплату счета.

### Деактивация созданного счета/ссылки

#### Адрес для отправки запроса:

POST https://services.robokassa.ru/InvoiceServiceWebApi/api/DeactivateInvoice

Для деактивации созданной ссылки или счета используется та же структура и алгоритм что и при создании.


Единственное отличие заключается в параметре
Payload, передается идентификатор магазина и один из идентификаторов счета.

JSON

```xml-code__content-wrapper xml-code__content-wrapper--white


1
2
3
4


       {
          "MerchantLogin": "robo-demo-test",
          "InvId": 851
       }

```

Идентификаторы счета могут быть следующими:

Параметр

Значение

EncodedId


Последняя часть ссылки счета.

Например:  https://auth.robokassa.ru/merchant/Invoice/6hucaX7-BkKNi4lyi-Iu2g

Id


Идентификатор счета, возвращается в ответе на запрос о создании счета.


InvId


Номер счета указанный продавцом при создании ссылки. Если продавец не указывал номер счета, то он был сгенерирован автоматически. Возвращается в ответе на запрос о создании счета либо в личном кабинете в разделе "Выставление счетов".


### Оплата по сохраненной карте

При таком способе Робокасса не будет предлагать ввод карты или выбор способа оплаты, но будет требовать ввода cvc2/cvv2.

Работает при использовании карты которая ранее уже применялась для попытки оплаты операции.

Для старта оплаты необходимо указать OpKey другой операции (не обязательно успешной) при которой уже использовалась карта.
OpKey в данном случае будет являться токеном для карты.

#### Схема реализации:

• В адрес магазина проводится первая оплата;

• На [Result2](https://docs.robokassa.ru/pay-interface/#jws) приходит OpKey операции. Так же его можно получить используя метод [OpStateExt](https://docs.robokassa.ru/xml-interfaces/#account) ;

• Происходит новый вызов платежной страницы с использовнием токена OpKey;

#### Адрес для отправки запроса:

GET/POST https://auth.robokassa.ru/Merchant/Payment/CoFPayment?

Описание
параметров

Параметр

Значение

Token


OpKey операции, карту которой мы хотим использовать для новых оплат. Обязательный параметр.


#### Расчет подписи:

Параметр Token
участвует в расчёте подписи [SignatureValue](https://docs.robokassa.ru/script-parameters/)
в следующей позиции:

MerchantLogin:OutSum:InvId:Receipt:ResultUrl2:Token:Пароль#1


#### Пример запроса:

https://auth.robokassa.ru/Merchant/Payment/CoFPayment?MerchantLogin=robo-demo&OutSum=1&Receipt=%257B%2522items%2522%253A%255B%257B%2522name%2522%253A%2522%25D0%25A2%25D0%25B5%25D1%2585%25D0%25BD%25D0%25B8%25D1%2587%25D0%25B5%25D1%2581%25D0%25BA%25D0%25B0%25D1%258F%2520%25D0%25B4%25D0%25BE%25D0%25BA%25D1%2583%25D0%25BC%25D0%25B5%25D0%25BD%25D1%2582%25D0%25B0%25D1%2586%25D0%25B8%25D1%258F%2522%252C%2522quantity%2522%253A1%252C%2522sum%2522%253A1.00%252C%2522tax%2522%253A%2522none%2522%257D%255D%257D&Token=E1253728-48A9-488D-A045-9954C442AF5C-qNavrXC6Y4&SignatureValue=779cfc2bd6a642977fb4dce8496bdee4


#### Пример расчета подписи:

robo-demo:1::%7B%22items%22%3A%5B%7B%22name%22%3A%22%D0%A2%D0%B5%D1%85%D0%BD%D0%B8%D1%87%D0%B5%D1%81%D0%BA%D0%B0%D1%8F%20%D0%B4%D0%BE%D0%BA%D1%83%D0%BC%D0%B5%D0%BD%D1%82%D0%B0%D1%86%D0%B8%D1%8F%22%2C%22quantity%22%3A1%2C%22sum%22%3A1.00%2C%22tax%22%3A%22none%22%7D%5D%7D:E1253728-48A9-488D-A045-9954C442AF5C-qNavrXC6Y4:pass1


## Оповещение об оплате на  ResultURL

ResultURL предназначен для
получения Вашим сайтом оповещения
об успешном платеже в автоматическом режиме. В случае успешного проведения оплаты Robokassa делает
запрос на ResultURL
(см. раздел Технические настройки). Данные всегда
передаются в кодировке UTF-8.

Ваш скрипт, находящийся по
ResultURL, обязан проверить
равенство полученной контрольной суммы и контрольной суммы, рассчитанной Вашим скриптом по
параметрам, полученным от Robokassa, а не по
локальным данным магазина.


Если контрольные суммы
совпали, то Ваш скрипт должен ответить
Robokassa, чтобы мы поняли, что Ваш скрипт работает правильно и повторное уведомление с нашей
стороны не требуется. Результат должен
содержать текст OK
и параметр InvId.
Например, для
номера счёта 5 должен быть вот такой ответ:
OK5.


Если контрольные суммы не
совпали, то полученное оповещение
некорректно, и ситуация требует разбора магазином.


Если в настройках в качестве метода отсылки данных был выбран E-Mail, то в случае успешного
проведения оплаты Robokassa отправит Вам
письмо на электронный адрес, указанный в поле ResultURL, со всеми выше перечисленными параметрами.


#### Внимание!

В случае, если вы используете фильтрацию входящих запросов, не забудьте прописать IP-адреса
Робокассы в white-лист вашего сервера
(185.59.216.65, 185.59.217.65)

При использовании [тестового режима](https://docs.robokassa.ru/testing-mode/) запрос на ResultURL будет отправлен,
но с нашей стороны не происходит логирования общения сервера с обработчиком, так же в запросе не будет указано значение параметра Email.


Описание
параметров

Параметр

Значение

OutSum


Сумма платежа.


InvId


Номер счета в магазине.


Fee


Комиссия Robokassa за совершение операции. Комиссия удерживается согласно тарифу
клиента. Таким образом из суммы, оплаченной
покупателем (параметр OutSum) вычитается комиссия Robokassa, и на расчетный счет
поступит сумма OutSum минус Fee.


EMail


EMail, указанный покупателем в процессе оплаты.


SignatureValue


Контрольная сумма — хэш, число в 16-ричной форме и в верхнем регистре
(0-9, A-F), рассчитанное методом указанным в Технических настройках магазина.


База для расчёта контрольной суммы:

если вы не передавали пользовательские параметры
**OutSum:InvId:Пароль#2**

если вы передавали пользовательские параметры
**OutSum:InvId:Пароль#2:\[Пользовательские параметры\]**

Например,
вы передали нам параметры со значениями:


OutSum100.26

InvId450009

Shp\_loginVasya

Shp\_oplata1

то база для расчёта контрольной суммы будет выглядеть так:

100.26:450009:Пароль#2:Shp\_login=Vasya:Shp\_oplata=1

PaymentMethod


Способ оплаты который использовал пользователь при совершении платежа.


IncCurrLabel


Валюта, которой платил клиент.


Shp\_


[Пользовательские параметры](https://docs.robokassa.ru/script-parameters/index.php?sphrase_id=8031#extra),
которые возвращаюся вам, если они были переданы при старте платежа.


## Дополнительное оповещение  об оплате на ResultUrl2

Дополнительное оповещение об
успешной оплате позволяет получить уведомление на альтернативный адрес, отличный от указанного в
настройках магазина(Result URL). Для операций с холдами на этот адрес направляется уведомление об
успешной предавторизации, и это единственный способ его получить.

#### Внимание!

Уведомление отправляется методом POST вне зависимости от выбранного метода для
[ResultUrl](https://docs.robokassa.ru/pay-interface/#notification)
в технических настройках магазина.


При использовании
[тестового режима](https://docs.robokassa.ru/testing-mode/)
уведомление на ResultUrl2 не будет отправлено.


Для получения уведомления,
необходимо добавить параметр ResultUrl2
к [стандартному запросу на оплату](https://docs.robokassa.ru/pay-interface/#pay),
значение которого будет содержать закодированный в адрес в формате UrlEncode, на который вы хотите получить
уведомление. По своему усмотрению в каждой новой оплате вы можете использовать новый адрес, так как значение ResultUrl2
не обязательно должно быть статичным.

#### Пример запроса:

https://auth.robokassa.ru/merchant/Index.aspx?Merchant\_login=robokassa&OutSum=10&InvID=1234829&ResultUrl2=https%3A%2F%2Ftest.test%2Frobokassa&Signature=8e8596d1219ff89cbb98d5f3f37bcfc5


В этом примере инициируется
старт оплаты на сумму 10 рублей с последующей отправкой уведомления на адрес https://test.test/robokassa

#### Расчет подписи:

Параметр ResultURL2
участвует в расчёте подписи [SignatureValue](https://docs.robokassa.ru/script-parameters/)
в следующей позиции:

MerchantLogin:OutSum:InvId:Receipt:StepByStep:ResultUrl2:Пароль#1


#### Пример строки для расчёта  хэша:

robokassa:10:1234829:https%3A%2F%2Ftest.test%2Frobokassa:password1


### Получение уведомления

На адрес указанный в
параметре ResultUrl2
отправляется уведомление в формате [JWS(JSON Web Signature)](https://www.rfc-editor.org/rfc/rfc7515),
которое закодированно в base64.

#### Пример запроса:

eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJoZWFkZXIiOnsidHlwZSI6IlBheW1lbnRTdGF0ZU5vdGlmaWNhdGlvbiIsInZlcnNpb24iOiIxLjAuMCIsInRpbWVzdGFtcCI6IjE2OTA0NTQ5ODAifSwiZGF0YSI6eyJzaG9wIjoicm9iby1kZW1vLXRlc3QiLCJvcEtleSI6IjE0RDJCNTIxLTRFQUItNDkyQS05RDkxLTAwRDEyRkYyNEQ1Ny0xTnZIRU5Md2dwIiwiaW52SWQiOiIxMjM0ODI5IiwicGF5bWVudE1ldGhvZCI6IkJhbmtDYXJkIiwiaW5jU3VtIjoiMTAuMDAiLCJzdGF0ZSI6Ik9LIn19.DaanjJ4A2yaGOppIVEj929MGNWU4jHcjAh4\_DnFRJzkqvESbVpN5trGg8OlaftyQEldxeQaTF9ykrS7O1BmhPow0ZRv4GwjJQSwHzCGJUOcyVw507PMnRSAIT4oXq\_PtKjqjuHQL\_bxQxyGxZORoKhzsDwBYl\_nMXsY-R\_SCXPfvYRDPeJRRlC-HwQscOzyGN1cBHStuh5-w8qHytpaysVlif\_XYK1-Lfa3ZsFjNz-2LENGL4CRmKMA2KhUfhNfNWXSA4J2KykfWznAvaY37T\_\_QQHhDyHuIjsUtstG5Jf2aK2CuJY-i9mBTRkXD0U3Y5Lh7lnJQrkXAMBySRvYigQ


#### В декодированном виде:

JSON

```xml-code__content-wrapper xml-code__content-wrapper--white


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

       {
        "header": {
          "type": "PaymentStateNotification",
          "version": "1.0.0",
          "timestamp": "1691186412",
        },
        "data": {
          "shop": "robokassa",
          "opKey": "14D2B521-4EAB-492A-9D91-00D12FF24D57-1NvHQWRwf",
          "invId": "1234829",
          "paymentMethod": "BankCard",
          "incSum": "10.00",
          "state": "OK",
        }
      }

```

В массиве **data**
содержится вся необходимая информация о платеже: идентификатор магазина,

номер заказа, метод
оплаты, сумма и статус операции.

Описание
параметров

Параметр

Значение

Shop


Идентификатор магазина.


OpKey


Уникальный идентификатор операции.


InvId


Номер счета в магазине.


PaymentMethod


Способ оплаты который использовал пользователь при совершении платежа.


incSum


Сумма оплаченная клиентом.


State


Текущее состояние оплаты.

#### Проверка подписи

Если вам требуется дополнительный уровень безопасности, вы можете осуществить проверку подписи JWS при получении уведомления. Для этого потребуется использовать соответствующий сертификат. Вы можете скачать его [по этой ссылке.](https://docs.robokassa.ru/media/files/jwtsign.cer)
Пожалуйста, обратите внимание, что данная проверка не является обязательной, но может быть полезной для обеспечения дополнительной аутентификации и целостности получаемых данных.

#### Ожидаемый ответ

При успешной обработке,
получатель должен вернуть HTTP-код из диапазона 200-299. Если сообщение не удалось доставить или
полученный код не из диапазона 200-299, то попытка доставки будет повторяться, но не более пяти
раз.

## Переадресация при успешной  оплате на SuccessURL

В случае успешного исполнения
платежа Покупатель сможет перейти по адресу,
указанному вами в [Технических настройках](https://partner.robokassa.ru/Shops),
там же вы указали метод (GET или POST).


Переход пользователя по данному
адресу с корректными параметрами
(правильной Контрольной суммой) означает, что оплата вашего заказа успешно выполнена.


Однако для дополнительной защиты желательно, чтобы факт оплаты проверялся скриптом, исполняемым
при переходе на [SuccessURL](https://docs.robokassa.ru/pay-interface/#success),
или путем запроса XML-интерфейса получения состояния оплаты счета, и только при реальном наличии
счета с номером InvId в базе данных магазина.


На самом деле, переход
пользователя по ссылке

[SuccessURL](https://docs.robokassa.ru/pay-interface/#success) – это формальность, которая нужна только для того,
чтобы пользователь вернулся обратно к Вам и получил информацию о том, что он сделал всё
правильно, и его заказ ждёт его там-то и там-то.
Проводить подтверждение оплаты у себя по базе и все остальные действия, связанные с выдачей
покупки, Вам нужно при получении уведомления на
[ResultUrl](https://docs.robokassa.ru/pay-interface/#notification),
потому что именно на него Robokassa передаёт подтверждающие данные об оплате в автоматическом
режиме (т. е. в любом случае и без
участия пользователя).


Передаваемые параметры

Параметр

Значение

OutSum


Сумма, оплаченная покупателем (та самая, которую вы прислали в Robokassa, на
страницу оплаты).


InvId


Номер счета в магазине.


SignatureValue


Контрольная сумма — хэш, число в 16-ричной форме и в верхнем регистре
(0-9, A-F), рассчитанное методом указанным в Технических настройках
магазина.


База для расчёта контрольной суммы:

если вы не передавали пользовательские параметры
OutSum:InvId:Пароль#1

Если вы передавали пользовательские параметры
OutSum:InvId:Пароль#1:Shp

Пример с передачей пользовательских параметров:

OutSum100.26

InvId450009

Shp\_loginVasya

Shp\_oplata1

то база для расчёта контрольной суммы будет выглядеть так:

100.26:450009:Пароль#1:Shp\_login=Vasya:Shp\_oplata=1

Culture

Определяет на каком языке была страница оплаты Robokassa у пользователя.
Если параметр не передан, то используются региональные настройки браузера
покупателя. Для значений отличных от ru
или en используется английский язык.


Возможные значения:

en

–
Английский

ru

–
Русский

Shp


[Пользовательские параметры](https://docs.robokassa.ru/script-parameters/index.php?sphrase_id=8031#extra),
которые возвращаюся вам, если они были переданы при старте платежа.


## Переадресация при отказе от оплаты на  FailURL

В случае отказа от исполнения платежа
покупатель перенаправляется по данному адресу.
Необходим для того, чтобы продавец мог, например, разблокировать заказанный товар на складе.


Переход пользователя по данному адресу,
строго говоря, не означает окончательного
отказа покупателя от оплаты, нажав кнопку «Назад» в браузере он может вернуться на страницу
оплаты Robokassa. Поэтому в случае блокировки товара
на складе под заказ, для его разблокирования желательно проверять факт отказа от платежа
запросом
[XML-интерфейса получения состояния оплаты](https://docs.robokassa.ru/xml-interfaces/#account)
счета, используя в запросе номер счета InvId имеющийся в базе данных магазина/продавца.


Передаваемые параметры

Параметр

Значение

OutSum


Сумма, оплаченная покупателем (та самая, которую вы прислали в Robokassa, на
страницу оплаты).


InvId


Номер счета в магазине.


Culture


Язык, использовавшийся при совершении оплаты. В соответствии с ISO 3166-1.


Shp\_


Дополнительные пользовательские параметры (если были переданы).


## Дополнительная переадресация после успешной оплаты или отказа от платежа(SuccessUrl2/FailUrl2)

Дополнительная возможность переадресации покупателя после успешной или неуспешной оплаты на адрес отличный от Success URL или Fail URL указанный в настройках магазина.

Использование данного функционала возможно, например, при необходимости перенаправления покупателя на определенную страницу после успешной оплаты для возможности посмотреть или скачать купленный товар.

#### Пример запроса:

https://auth.robokassa.ru/Merchant/Index.aspx?MerchantLogin=robo-demo&OutSum=1&invoiceID=&Receipt=%257B%2522items%2522%253A%255B%257B%2522name%2522%253A%2522%255Cu0422%255Cu0435%255Cu0441%255Cu0442%255Cu043e%255Cu0432%255Cu044b%255Cu0439%2B%255Cu0442%255Cu043e%255Cu0432%255Cu0430%255Cu0440%2522%252C%2522quantity%2522%253A1%252C%2522cost%2522%253A1%252C%2522tax%2522%253A%2522vat0%2522%252C%2522payment\_object%2522%253A%2522commodity%2522%257D%255D%257D&SuccessUrl2=https%3A%2F%2Frobokassa.com%2F&SuccessUrl2Method=GET&FailUrl2=https%3A%2F%2Fwww.google.com%2F&FailUrl2Method=GET&SignatureValue=b789721670badc454e3b1a3a1e349fab


В этом примере инициируется
старт оплаты на сумму 1 рублей с последующей переадресацией в случае успешной оплаты на адрес https://robokassa.com/ либо на адрес  https://www.google.com/ в случае неуспешной оплаты.


#### Расчет подписи:

Для расчета подписи в [SignatureValue](https://docs.robokassa.ru/script-parameters/) добавляются четыре дополнительных параметра
SuccessUrl2,
SuccessUrl2Method (GET/ POST в верхнем регистре),
FailUrl2,
FailUrl2Method (GET/ POST в верхнем регистре)

MerchantLogin:OutSum:InvId:Receipt:StepByStep:ResultUrl2:SuccessUrl2:SuccessUrl2Method:FailUrl2:FailUrl2Method:Пароль#1

#### Пример строки для расчёта хэша:

robo-demo:1::%7B%22items%22%3A%5B%7B%22name%22%3A%22%5Cu0422%5Cu0435%5Cu0441%5Cu0442%5Cu043e%5Cu0432%5Cu044b%5Cu0439+%5Cu0442%5Cu043e%5Cu0432%5Cu0430%5Cu0440%22%2C%22quantity%22%3A1%2C%22cost%22%3A1%2C%22tax%22%3A%22vat0%22%2C%22payment\_object%22%3A%22commodity%22%7D%5D%7D:https%3A%2F%2Frobokassa.com%2F:GET:https%3A%2F%2Fwww.google.com%2F:GET:password1


#### Описание  параметров

Параметр

Значение

OutSum


Сумма платежа.


InvId


Номер счета в магазине.


SignatureValue


Контрольная сумма — хэш, число в 16-ричной форме и в верхнем регистре
(0-9, A-F), рассчитанное методом указанным в Технических настройках магазина.


База для расчёта контрольной суммы:

если вы не передавали пользовательские параметры
**OutSum:InvId:Пароль#1**

если вы передавали пользовательские параметры
**OutSum:InvId:Пароль#1:\[Пользовательские параметры\]**

Например,
вы передали нам параметры со значениями:


OutSum100.26

InvId450009

Shp\_loginVasya

Shp\_oplata1

то база для расчёта контрольной суммы будет выглядеть так:

100.26:450009:Пароль#1:Shp\_login=Vasya:Shp\_oplata=1

Culture

Определяет на каком языке была страница оплаты Robokassa у пользователя.
Если параметр не передан, то используются региональные настройки браузера
покупателя. Для значений отличных от ru
или en используется английский язык.


Возможные значения:

en

–
Английский

ru

–
Русский

Shp\_


[Пользовательские параметры](https://docs.robokassa.ru/script-parameters/index.php?sphrase_id=8031#extra),
которые возвращаюся вам, если они были переданы при старте платежа.


## Типовые ошибки интерфейса  оплаты

код ошибки

значение

25


Магазин не активирован. Ошибка возникает в двух случаях:

1) Магазин действительно еще не активирован, а вы пытаетесь выставлять счета в "боевом"
режиме

2) В технических настройках на вашем сайте вы некорректно указали Идентификатор
магазина. Найти его можно в разделе "Мои магазины" вашего личного кабинета, открыв
нужный магазин. В закладке "Технические настройки" будет поле "Идентификатор магазина".
Значение данного поля нужно скопировать и корректно прописать в настройках вашего сайта.


26


Магазин не найден. Ошибка возникает в том случае, когда в технических настройках на
вашем сайте вы некорректно указали
Идентификатор магазина. Найти его можно в разделе «Мои магазины» вашего личного
кабинета, открыв нужный магазин. В закладке «Технические
настройки» будет поле «Идентификатор магазина».


29


Неверный параметр SignatureValue.
Проверьте скрипт, отвечающий за инициализацию оплаты, а именно ту часть, которая
формирует SignatureValue по формуле, состоящей из переменных. Самые распространенные
неточности, из-за которых может неверно считаться
данный параметр:


– Используется некорректный Идентификатор магазина
(MerchantLogin)

– Используется некорректный Пароль 1
(MerchantPass1)

– Используются дополнительные пользовательские параметры
(shp\_),
которые были добавлены, но не занесены в формулу подсчета, или наоборот, в формуле
подсчета они
указаны, а в коде нет. Если shp\_ используются, то они должны быть переданы в алфавитном
порядке как в параметрах на оплату,
так и в формуле подсчета SignatureValue.


#### Внимание!

Если вы используете тестовую среду Robokassa, передавая параметр
IsTest=1
или включив его
галочкой в настройках вашего модуля/бота, то необходимо использовать
только тестовую пару технических паролей
(см. закладку «Технические настройки» в карточке магазина).


30


Неверный параметр счёта. Проверьте правильность передаваемых как обязательных, так и
необязательных параметров счета.


31


Неверная сумма платежа. Ошибка возникает по причине того, что при переадресации клиента
на платежную страницу сервиса Robokassa
для выставления счета, вы не передаете нам сумму, на которую необходимо исполнить
платеж. Либо передаете сумму равную 0.


33


Время отведённое на оплату счёта истекло. Ошибка показывает, что время отведённое на
проведение платежа этим способом истекло.
Ознакомиться с имеющимися временными ограничениями по способам оплаты
[вы можете здесь.](https://docs.robokassa.ru/pay-interface/)

34


Услуга рекуррентных платежей не разрешена магазину. Функция проведения рекуррентных
платежей сначала должна быть согласована
и подключена для вашего магазина нашими менеджерами. В противном случае платежи с
подобной настройкой работать не будут.


35


Неверные параметры для инициализации рекуррентного платежа. Некорректные параметры
указаны при инициализации рекуррентного
платежа. Сверьтесь с соответствующим разделом [нашей технической документации](https://docs.robokassa.ru/recurring/)
и проверьте настройки рекуррентных платежей
у себя на сайте.


40


Повторная оплата счета с тем же номером невозможна. В момент формирования запроса на
инициализацию оплаты вы передаете нам
значение параметра InvId
(номер заказа/счета), которое использовалось вами прежде. Этот параметр должен принимать
с каждой переадресацией в сервис
Robokassa уникальное значение. Ошибка показывает, что один из клиентов уже оплатил
данный номер заказа ранее, а сейчас вы
переадресуете к нам другого плательщика, выставляя ему тот же номер счета.
Оплаты при включенном параметре
IsTest=1
не логируются и не могут спровоцировать возникновение этой ошибки.


41


Ошибка на старте операции. При инициализации оплаты в системе произошла внештатная
ошибка, вследствие которой платеж был
отменен, не стартовав. Просьба инициировать оплату еще раз. При неудаче обратитесь в
нашу поддержку.


51


Срок оплаты счета истек. Ошибка возникает, когда время, отведенное для оплаты счета, истекло.
Это касается только счетов, выставленных через личный кабинет или с использованием метода [JSON Web Token](https://docs.robokassa.ru/pay-interface/#jwt).


52


Попытка повторной оплаты счета. Ошибка возникает при попытке повторно оплатить уже оплаченный счет.
Это касается только счетов, выставленных через личный кабинет или с использованием метода [JSON Web Token](https://docs.robokassa.ru/pay-interface/#jwt).


53


Счет не найден. Возникает, если ссылка на счет некорректна или сам счет не существует.
Эта ошибка касается только счетов, выставленных через личный кабинет или с использованием метода [JSON Web Token](https://docs.robokassa.ru/pay-interface/#jwt).


64


Функционал [холдирования](https://docs.robokassa.ru/holding/) средств запрещен для магазина.
Ошибка возникает, если магазин не имеет разрешения на использование функционала холдирования средств.


65


Некорректные параметры для [холдирования](https://docs.robokassa.ru/holding/).
Ошибка возникает при передаче неверных параметров для выполнения операции холдирования средств.


20

28

21

32

22

36

23

37

24

43

27

500


Внутренние ошибки сервиса. В случае возникновения данных ошибок, просьба обратиться в
поддержку нашего сервиса Robokassa
через раздел «Поддержка» вашего личного кабинета.


# Рекомендации для  разработчиков мобильных приложений

При разработке мобильного приложения, которое будет использовать нашу платёжную форму через
встроенный браузер, мы настоятельно рекомендуем использовать компонент **WkWebView.**
Подробнее про него можно прочитать [здесь](https://developer.apple.com/documentation/webkit/wkwebview/)

### Обработка Intent-ссылок в Webview

Для корректной обработки Intent-ссылок в WebView требуется различать поведение на Android и iOS:

**Android**

если URL содержит один из следующих паттернов, необходимо инициировать intent action:

sberpay

sbolpay

intent

://qr.nspk.ru/

**iOS**

Если в схеме URL есть одно из следующих значений, или если сам URL содержит //qr.nspk.ru/ , — обрабатывайте ссылку через WebView:

ios-app-smartonline://sbolpay/

btripsexpenses://sbolpay/

budgetonline-ios://sbolpay

sbolpay

sberpay

**Важно**

Начиная с iOS 8.0 и OS X 10.10 используйте WkWebView для добавления веб-контента в ваше
приложение. Не используйте UIWebView или WebView.

Если же, Вы планируете
разработку с компонентом UIWebView, то работоспособность нашей платёжной формы в вашем мобильном
приложении мы гарантировать не можем.


Оглавление:

[Интерфейс оплаты](https://docs.robokassa.ru/pay-interface/#pay)

[Готовое решение](https://docs.robokassa.ru/pay-interface/#solution)

[Пример кода на PHP для установки на сайте](https://docs.robokassa.ru/pay-interface/#php)

[Создание ссылки без перенаправления на оплату (JWT)](https://docs.robokassa.ru/pay-interface/#jwt)

[Оплата по сохраненной карте](https://docs.robokassa.ru/pay-interface/#saving)

[Оповещение об оплате на ResultURL](https://docs.robokassa.ru/pay-interface/#notification)

[Дополнительное оповещение об оплате на ResultUrl2](https://docs.robokassa.ru/pay-interface/#jws)

[Переадресация пользователей на\\
SuccessURL](https://docs.robokassa.ru/pay-interface/#success)

[Переадресация пользователя при отказе от\\
оплаты на FailURL](https://docs.robokassa.ru/pay-interface/#fail)

[Переадресация пользователя на ReturnURL(SuccessUrl2/FailUrl2)](https://docs.robokassa.ru/pay-interface/#return)

[Типовые ошибки интерфейса](https://docs.robokassa.ru/pay-interface/#errors)

[Рекомендации для разработчиков\\
мобильных приложений](https://docs.robokassa.ru/pay-interface/#recommend)

### Полезные разделы:

[Фискализация](https://docs.robokassa.ru/fiscalization/) [Работа в тестовом режиме](https://docs.robokassa.ru/testing-mode/)

### Есть вопросы?

Мы всегда рады помочь с
технической
частью или другими вопросами о сервисе. [Обращайтесь в службу\\
поддержки\\
клиентов Robokassa.](https://robokassa.com/contacts/podderzhka/)