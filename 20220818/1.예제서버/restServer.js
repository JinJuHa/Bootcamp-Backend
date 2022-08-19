const http = require('http');
const fs = require('fs').promises;
//const getIp = require('request-ip'); // ip 출력용


const url = require('url');
const qs = require('querystring');
//let idd = 0;

const parseCookies = (cookie = '') =>
  cookie
    .split(';')
    .map(v => v.split('='))
    .reduce((acc, [k, v]) => {
      acc[k.trim()] = decodeURIComponent(v);
      return acc;
    }, {});

const session = {};


function findkeyinsession(cookiekey){
  for(key in session){
    if(key === cookiekey){
      return true;
    }
  }
  return false;
}



const users = {}; // 데이터 저장용
let idd = 0; //아이디 초기값


http
  .createServer(async (req, res) => {
    // 1. 서버를 만들고 요청( req: 요청 , res: 응답)
    
    if (req.url.startsWith('/login')) {
      const { query } = url.parse(req.url);
      const { name } = qs.parse(query);
      const expires = new Date();
      expires.setMinutes(expires.getMinutes() + 5);
      const uniqueInt = '1';
      //const uniqueInt = idd++;
      //const uniqueInt = Date.now();
      session[uniqueInt] = {
        name,
        expires,
      };
      res.writeHead(302, {
        Location: '/',
        'Set-Cookie': `session=${uniqueInt}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`,
      });
      res.end();
    // 세션쿠키가 존재하고, 만료 기간이 지나지 않았다면
    } else if (cookies.session && findkeyinsession(cookies.session) &&  session[cookies.session].expires > new Date()) {
      const data = await fs.readFile("./fo/restFront.html")//
      res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end(data);
    } else {
      try {
        const data = await fs.readFile('./login.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(data);
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(err.message);
      }
    }

    
    const cookies = parseCookies(req.headers.cookie);//
  try {
    if (req.method === 'GET') {
      // 2. 서버를 만들었으면 요청을 해야 응답이 온다 
      if (req.url === '/') {
        const data = await fs.readFile('./restFront.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/about') {
        const data = await fs.readFile('./about.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/users') {
        res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
        return res.end(JSON.stringify(users));
      }
      // /도 /about도 /users도 아니면
      try {
        const data = await fs.readFile(`.${req.url}`);// restFront.js 실행
        return res.end(data);
      } catch (err) {
        // 주소에 해당하는 라우트를 못 찾았다는 404 Not Found error 발생
      }
    } else if (req.method === 'POST') {
      if (req.url === '/user') {
        let body = '';
        // 요청의 body를 stream 형식으로 받음
        req.on('data', (data) => {
          body += data;
        });
        // 요청의 body를 다 받은 후 실행됨
        return req.on('end', () => {
          console.log('POST 본문(Body):', body);
          const { name } = JSON.parse(body);
          //const id = getIp.getCLientIp(req);
          users[id] = name;
          const id = ++idd;
          //const id = Date.now(); //시간을 아이디에 넣어준 것. 이런 것보단 진짜 중복될 수 없는 아이디값을 넣어줘야 함
          users[id] = name;
          res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('ok');
        });
      }
    } else if (req.method === 'PUT') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        let body = '';
        req.on('data', (data) => {
          body += data;
        });
        return req.on('end', () => {
          console.log('PUT 본문(Body):', body);
          users[key] = JSON.parse(body).name;
          res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
          return res.end('ok');
        });
      }
    } else if (req.method === 'DELETE') {
      if (req.url.startsWith('/user/')) {
        const key = req.url.split('/')[2];
        delete users[key];
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('ok');
      }
    }
    res.writeHead(404);
    return res.end('NOT FOUND');
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end(err.message);
  }
})

  .listen(8080, () => {
    console.log('8080번 포트에서 서버 대기 중입니다');
  });
