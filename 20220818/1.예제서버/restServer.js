const http = require('http');
const fs = require('fs').promises;
//const requestIp = require('request-ip'); // ip 출력용

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
const messages = [];


function findkeyinsession(cookiekey){
  for(key in session){
    if(key === cookiekey){
      return true;
    }
  }
  return false;
}



//const users = {}; // 데이터 저장용
//let idd = 0; //아이디 초기값


http
  .createServer(async (req, res) => {
    // 1. 서버를 만들고 요청( req: 요청 , res: 응답)
  const cookies = parseCookies(req.headers.cookie);//
   if(!cookies.session){
        if (req.url.startsWith('/login')) {
          const { query } = url.parse(req.url);
          const { name } = qs.parse(query);
          const expires = new Date();
          expires.setMinutes(expires.getMinutes() + 5);
          const uniqueInt = Math.floor(Math.random() * (10000000))+1;
          //const uniqueInt = idd++;
          //const uniqueInt = Date.now();
          while(findkeyinsession (uniqueInt)){
            uniqueInt = Math.floor(Math.random() * (10000000))+1;
          }
          session[uniqueInt] = {
            name,
            expires,
          }; //구조분해 할당?
          console.log(session);
          res.writeHead(302, {
            Location: '/chatRoom', // login?name=진주하 , response
            'Set-Cookie': `session=${uniqueInt}; Expires=${expires.toGMTString()}; HttpOnly; Path=/`, //모든 요청에다가 보낸다
          });
          res.end();
        // 세션쿠키가 존재하고, 만료 기간이 지나지 않았다면
        } else {
          const data = await fs.readFile('./login.html');
          //4. restFront.html를 읽고(로그인 페이지)
          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          return res.end(data);
        }
      }
   
  //else if (cookies.session && findkeyinsession(cookies.session) &&  session[cookies.session].expires > new Date()){}

  //세션 쿠키가 존재하고, 세션 안에 해당 쿠키가 있고, 만료 시간이 안지났는지 확인
    // 보안 : 5분 안에 로그인한 계정이면 들어갈 수 있도록 여부 확인

     else if (cookies.session && findkeyinsession(cookies.session) &&  session[cookies.session].expires > new Date()) {
      //const data = await fs.readFile("./restFront.html")//
      //res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
      //return res.end(data);




    //로그인 된 사용자 ----------------------
  //   const cookies = parseCookies(req.headers.cookie);//
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
      } else if (req.url === '/chatRoom') {
        const data = await fs.readFile('./restFront.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(data);
      } else if (req.url === '/messages') {
        //const data = await fs.readFile('./restFront.html');
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        console.log(messages);
        return res.end(JSON.stringify(messages));
      }
      // /도 /about도 /users도 아니면
      try {
        const data = await fs.readFile(`.${req.url}`);// restFront.js 실행
        return res.end(data);
      } catch (err) {
        // 주소에 해당하는 라우트를 못 찾았다는 404 Not Found error 발생
        res.writeHead(404);
        return res.end('NOT FOUND');
      }
    } else if (req.method === 'POST') {
      if (req.url === '/message') {
        let body = '';
        // 요청의 body를 stream 형식으로 받음
        req.on('data', (data) => {
          body += data;
        });
        // 요청의 body를 다 받은 후 실행됨
        return req.on('end', () => {
          console.log('POST 본문(Body):', body);
          // const { name } = JSON.parse(body);
          // const id = requestIp.getCLientIp(req);
          // users[id] = name;
          //const id = ++idd;
          //const id = Date.now(); //시간을 아이디에 넣어준 것. 이런 것보단 진짜 중복될 수 없는 아이디값을 넣어줘야 함

          const { message } = JSON.parse(body);
          messages.push( {name: session[cookies.session]['name'], message})
          console.log(messages);
          res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
          res.end('ok');
        });
      }
    } else if (req.method === 'PUT') {
      if (req.url.startsWith('/message/')) {
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
      if (req.url.startsWith('/message/')) {
        const key = req.url.split('/')[2];
        delete messages[key];
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end('ok');
      }
    }
    //404 에러 발생
    res.writeHead(404);
    return res.end('NOT FOUND');
  }  
     catch (err) {
        res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end(err.message);
      }
    }})

    .listen(8080, () => {
      console.log('8080번 포트에서 서버 대기 중입니다');
    });
    

//     //로그인 된 사용자 ----------------------
//   //   const cookies = parseCookies(req.headers.cookie);//
//   // try {
//     if (req.method === 'GET') {
//       // 2. 서버를 만들었으면 요청을 해야 응답이 온다 
//       if (req.url === '/') {
//         const data = await fs.readFile('./restFront.html');
//         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//         return res.end(data);
//       } else if (req.url === '/about') {
//         const data = await fs.readFile('./about.html');
//         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//         return res.end(data);
//       } else if (req.url === '/chatRoom') {
//         const data = await fs.readFile('./restFront.html');
//         res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
//         return res.end(data);
//         //return res.end(JSON.stringify(message));
//       } else if (req.url === '/messages') {
//         const data = await fs.readFile('./restFront.html');
//         res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
//         console.log(messages);
//         return res.end(JSON.stringify(messages));
//       }
//       // /도 /about도 /users도 아니면
//       try {
//         const data = await fs.readFile(`.${req.url}`);// restFront.js 실행
//         return res.end(data);
//       } catch (err) {
//         // 주소에 해당하는 라우트를 못 찾았다는 404 Not Found error 발생
//         res.writeHead(404);
//         return res.end('NOT FOUND');
//       }
//     } else if (req.method === 'POST') {
//       if (req.url === '/message') {
//         let body = '';
//         // 요청의 body를 stream 형식으로 받음
//         req.on('data', (data) => {
//           body += data;
//         });
//         // 요청의 body를 다 받은 후 실행됨
//         return req.on('end', () => {
//           console.log('POST 본문(Body):', body);
//           // const { name } = JSON.parse(body);
//           // const id = requestIp.getCLientIp(req);
//           // users[id] = name;
//           //const id = ++idd;
//           //const id = Date.now(); //시간을 아이디에 넣어준 것. 이런 것보단 진짜 중복될 수 없는 아이디값을 넣어줘야 함

//           const { message } = JSON.parse(body);
//           messages.push( {name: session[cookies.session]['name'], message})
//           console.log(messages);
//           res.writeHead(201, { 'Content-Type': 'text/plain; charset=utf-8' });
//           res.end('ok');
//         });
//       }
//     } else if (req.method === 'PUT') {
//       if (req.url.startsWith('/message/')) {
//         const key = req.url.split('/')[2];
//         let body = '';
//         req.on('data', (data) => {
//           body += data;
//         });
//         return req.on('end', () => {
//           console.log('PUT 본문(Body):', body);
//           users[key] = JSON.parse(body).name;
//           res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
//           return res.end('ok');
//         });
//       }
//     } else if (req.method === 'DELETE') {
//       if (req.url.startsWith('/message/')) {
//         const key = req.url.split('/')[2];
//         delete messages[key];
//         res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
//         return res.end('ok');
//       }
//     }
//     //404 에러 발생
//     res.writeHead(404);
//     return res.end('NOT FOUND');
//   } 
//   catch (err) {
//     console.error(err);
//     res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
//     res.end(err.message);
//   }
// })

  // .listen(8080, () => {
  //   console.log('8080번 포트에서 서버 대기 중입니다');
  // });
