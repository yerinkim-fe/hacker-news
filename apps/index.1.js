(function () {
  const $more = document.querySelector('.more');
  const $content = document.getElementById('content');
  const $nav = document.querySelector('nav');
  const base = 'https://news.ycombinator.com/';
  let prevTarget;
  let reqs;
  let count = 0;
  let end = 0;
  let isClicked = true;
  let rank = 1;
  let times = 0;

  function reqListener () {
    // 서버 응답 완료 && 정상 응답
    if (reqs.readyState !== XMLHttpRequest.DONE) return;

    if (reqs.status === 200) {
      times = 0;
      
      let handler = function (end) {
        let reqItem;
        let newContent = '';

        rank = 1;

        function getData () {
          if (reqs.readyState !== XMLHttpRequest.DONE) return;

          if (reqs.status === 200) {
            // Deserializing (String → Object)
            responseObj = JSON.parse(reqItem.responseText);
            console.log(`${responseObj.id}`);
  
            let site;
            let commText;

            if (`${responseObj.url}` === 'undefined') {
              site = '';
            } else {
              let a = document.createElement('a');
              a.href = `${responseObj.url}`;

              site = `<span class="sitebit"> (<a href="${base}from?site=${a.hostname}">${a.hostname}</a>)</span>`
            }

            if (`${responseObj.descendants}` === '0') {
              commText = 'discuss';
            } else {
              commText = `${responseObj.descendants} comments`;
            }

            newContent += `<li>
              <span class="count">${rank + (times * 30)}.</span>
              <span class="title"><a href="${responseObj.url}">${responseObj.title}</a></span>
              ${site}
              <div class="subtext">
                <span class="score">${responseObj.score} points</span> 
                by <a href="${base}user?id=${responseObj.by}">${responseObj.by}</a> 
                <span class="age"><a href="${base}item?id=${responseObj.id}">${responseObj.time} minutes ago</a></span>  | 
                <a href="${base}hide?id=${responseObj.id}&amp;goto=news">hide</a> | 
                <a href="${base}item?id=${responseObj.id}">${commText}</a>
              </div>
              </li>`;
            
            // $content.innerHTML += newContent;
            rank++;
            isClicked = true;
            
          } else {
            console.log(`[${reqItem.status}] : ${reqItem.statusText}`);
          }

          if (rank === (end - (times * 30) + 1)) {
            times++;
            $content.innerHTML += newContent;
          }

          count++;

          if (count < end) {
            sendRequest();
          }
        }

        function sendRequest () {
            reqItem = new XMLHttpRequest();

            // while문이 도는 횟수만큼 아래에 예약을 건 셈
            reqItem.addEventListener('load', getData);

            reqItem.open('GET', `${prefixUrl}item/${parseData[count]}.json`);
            reqItem.send();
        }

        $content.innerHTML = '';
        console.log(count, end);

        sendRequest();
        /* 
        순서대로 대기해서 가져오지 말고, 동시에 30개에 대한 요청을 시작하고 (edited)
        그에 대한 응답을 처리하는 방향으로 하면 지금보다는 훨씬 빨라질겁니다
        */

        return end;
      }
      parseData = JSON.parse(reqs.responseText);
      console.log(parseData);

      function setCount (end) {
        if (30 < parseData.length - count) {
          end += 30;
          $more.classList.remove('hide');
        } else {
          end = parseData.length;
          $more.classList.add('hide');
        }

        return end;
      }
      
      count = 0;

      end = handler(setCount(0));

      // console.log(parseData.length);

      $more.addEventListener('click', function () {
        if (isClicked) {
          console.log('isClicked', isClicked);
          end = handler(setCount(end));

          isClicked = false;
        }
      });

    } else {
      console.log(`[${reqs.status}] : ${reqs.statusText}`);
    }
  }

  let prefixUrl = 'https://hacker-news.firebaseio.com/v0/';
  let liveData = ['topstories', 'newstories', , , 'askstories', 'showstories', 'jobstories'];

  let dataLoad = function (index) {
    reqs = new XMLHttpRequest();

    reqs.addEventListener('load', reqListener);
    reqs.open("GET", `${prefixUrl}${liveData[index]}.json`);
    reqs.send();
  }

  $nav.addEventListener('click', ev => {
    ev.preventDefault();

    if (prevTarget) prevTarget.classList.remove('active');
    ev.target.classList.add('active');

    prevTarget = ev.target;

    if (ev.target.id === 'top') {
      dataLoad(0);
    } else if (ev.target.id === 'newest') {
      dataLoad(1);
    } else if (ev.target.id === 'front') {
      dataLoad(2);
    } else if (ev.target.id === 'newcomments') {
      dataLoad(3);
    } else if (ev.target.id === 'ask') {
      dataLoad(4);
    } else if (ev.target.id === 'show') {
      dataLoad(5);
    } else if (ev.target.id === 'jobs') {
      dataLoad(6);
    }
  });

  dataLoad(0);

})();
