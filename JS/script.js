// スタートボタンの要素を取得
const startButton = document.getElementById('start-button');

// スタートボタンのクリックイベントリスナー
startButton.addEventListener('click', () => {
    // game.html に遷移
    window.location.href = 'game.html';
});