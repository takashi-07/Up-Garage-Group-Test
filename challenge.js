const axios = require('axios');

// チャレンジを開始する関数
async function startChallenge(nickname) {
  const url = 'http://challenge.z2o.cloud/challenges';
  const response = await axios.post(url, { nickname });
  return response.data.id;
}

// 呼出を実行する関数
async function callChallenge(challengeId) {
  const url = `http://challenge.z2o.cloud/challenges`;
  const headers = { 'X-Challenge-Id': challengeId };
  const response = await axios.put(url, null, { headers });
  return response.data;
}

// メインの処理関数
async function runChallenge(nickname) {
  // チャレンジを開始
  let challengeId;
  try {
    challengeId = await startChallenge(nickname);
    console.log('Challenge started. ID:', challengeId);
  } catch (error) {
    console.error('An error occurred:', error.message);
    return;
  }

  let completed = false;
  let totalTimeDiff = 0;
  while (!completed) {
    try {
      // チャレンジの呼出を実行
      const response = await callChallenge(challengeId);
      console.log('Response:', response);

      if (response.result) {
        // チャレンジが終了した場合
        console.log('Challenge completed.');
        console.log('Attempts:', response.result.attempts);
        console.log('URL:', response.result.url);
        if (response.result.url !== null) {
          console.log('Do something after receiving `url`.');
          console.log(response.result.url);
          completed = true;
        }
      } else {
        // チャレンジが継続中の場合、差分を合計
        totalTimeDiff += response.total_diff;

        // 次の呼出まで待機
        const waitTime = response.actives_at - response.called_at;
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (error) {
      console.error('An error occurred:', error.message);
      break;
    }
  }

  if (!completed) {
    // チャレンジが失敗した場合、再帰的に呼び出し
    await runChallenge(nickname);
  }
}

// メインの処理を実行
runChallenge('takashi')
  .then(url => {
    // `url` が返ってきた後の処理をここに書く
    console.log(url);
  })
  .catch(error => {
    console.error('An error occurred:', error.message);
  });
