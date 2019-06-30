# Crypto-Vote
This is a demonstration of how Blind Signature can be used in the scenario of E-Voting.  
Read the reference for more information on how the schema works.

## Demo
Online Demo: http://139.162.113.186:5000/  
( Use token `test` to participate in the election 'Hello World'. Token `test` is preserved and will not expire after use. )
Video: https://drive.google.com/open?id=1CDiNfNVk--hIuC4Pzt2VPT_ykbz1_Tqd

## Installation
### Production
First clone the repo:  
```
git clone https://github.com/s3131212/Crypto-Vote.git
cd Crypto-Vote
```

Then build the frontend:
```
cd client  # pwd = /path/to/repo/client
npm install
npm run build
``` 

Edit the database connection info:
```
cd ../server  # pwd = /path/to/repo/server
vim index.js
```
Make sure you have already import `db.sql`

Last, start the server:  
```
npm install
npm start
```
When no port is set in environment variable, port `5000` will be used.

### Development
Start both backend server and React dev server.

To start backend server, use:
```
# pwd = /path/to/repo/server
npm start
```

Before starting React dev server, change the `proxy` in `package.json` to backend server address.

Then start the React dev server:
```
cd ../client  # pwd = /path/to/repo/client
npm start
```

Now use `localhost:3000` (or the port React dev server used) to access Crypto-Vote.  

## Packages Used
### Frontend
* React
* Bootstrap 4 & Reactstrap
* js-sha256
* jsbn
* chart.js 2 & react-chartjs-2
* secure-random
* sweetalert-react

### Backend
* express
* blind-signatures
* express-admin
* js-sha256
* mysql
* secure-random-string

## References
### Paper
J. Radwin, Michael & Phil Klein, Professor. (1997). An Untraceable, Universally Verifiable Voting Scheme.  
蘇品長(Pin-Chang Su);葉昱宗(Yui-Chong Yeh)(2017)。新型態之電子投票機制設計。電子商務學報。19(1)。29-50。

### Code
[Deploying a React app with React-Router and an Express Backend](https://dev.to/nburgess/creating-a-react-app-with-react-router-and-an-express-backend-33l3)

## Teammate Contribution
I'm the only member of this team. All code except the packages mentioned above is written by me.

## 心得
其實比起寫程式，我花更多時間在讀論文研究怎麼設計架構 XD 原本想用 GraphQL 的，也都開始寫了，但把架構圖畫出來之後發現這個場景用 GraphQL 很不適合（隱密性的問題），所以就拿掉，改用最原始的 Fetch API 去處理前後端溝通。寫程式時，主要時間幾乎都是花在去設計整個驗證機制而不是實現厲害的功能，雖然功能上還蠻陽春的，但我覺得以原本的目標（證明這個架構可行）來說，算是有達到要求了。
