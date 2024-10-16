// 各モードボタンの要素を取得
const vsCPUlButton = document.getElementById('vsCPU-button');
const vsOnlineButton = document.getElementById('vsOnline-button');
const allManualButton = document.getElementById('manual-button');
const ruleButton = document.getElementById('rule-button');

// CPU対戦モードボタンのクリックイベントリスナー
vsCPUlButton.addEventListener('click', () => {
    // game.html に遷移
    window.location.href = 'game.html?mode=cpu"';
});

// オンライン対戦モードボタンのクリックイベントリスナー
vsOnlineButton.addEventListener('click', () => {
    // game.html に遷移
    window.location.href = 'game.html?mode=online';
});

// 全手動モードボタンのクリックイベントリスナー
allManualButton.addEventListener('click', () => {
    // game.html に遷移
    window.location.href = 'game.html?mode=manual';
});

// ルールボタンのクリックイベントリスナー
ruleButton.addEventListener('click', () => {
    // SweetAlert でルール画面を表示
    Swal.fire({
        title: `ルール`,
        html: `
            <p>手牌4枚で行う1面子1雀頭で和了できる麻雀です</p>
            <ul style="text-align: left;">
                <li>ダブロン、トリロンなし（頭ハネ）</li>
                <li>四風連打なし</li>
                <li>切り上げ満貫</li>
                <li>満貫未満は0点（和了は可能）</li>
                <li>本場なし</li>
                <li>東風戦</li>
                <li>箱下なし</li>
                <li>アガリ止めなし</li>
                <li>チーなし</li>

            `,
        confirmButtonText: "閉じる",
        showCancelButton: false,
    });
});

// 読み込み時のイベントリスナー
document.addEventListener('DOMContentLoaded', () => {
    // 初期化時に実行
    resizeAppContainer();

    // 画面リサイズ時に実行
    window.addEventListener('resize', resizeAppContainer);
});

/**
 * 画面比率を調整する
 */
function resizeAppContainer() {
    const appContainer = document.getElementById('app-container');
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const targetWidth = windowHeight * (16 / 9); // 16:9の比率を維持するための幅
    const targetHeight = windowWidth * (9 / 16); // 16:9の比率を維持するための高さ

    if (windowWidth / windowHeight >= (16 / 9)) {
        // 画面比率が16:9より広い場合
        appContainer.style.width = targetWidth + 'px';
        appContainer.style.height = windowHeight + 'px';
        appContainer.style.left = (windowWidth - targetWidth) / 2 + 'px'; // 中央寄せ
        appContainer.style.top = '0px';
    } else {
        // 画面比率が16:9より狭い場合
        appContainer.style.width = windowWidth + 'px';
        appContainer.style.height = targetHeight + 'px';
        appContainer.style.left = '0px';
        appContainer.style.top = (windowHeight - targetHeight) / 2 + 'px'; // 中央寄せ
    }
}