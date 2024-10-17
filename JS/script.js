// 各モードボタンの要素を取得
const vsCPUlButton = document.getElementById('vsCPU-button');
const vsOnlineButton = document.getElementById('vsOnline-button');
const allManualButton = document.getElementById('manual-button');
const ruleButton = document.getElementById('rule-button');
const yakuListButton = document.getElementById('yakuList-button');

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
            <p>手牌4枚+1枚の1面子1雀頭で和了できる麻雀です！</p>
            <ul style="text-align: left;">
                <li>東風戦、南入なし</li>
                <li>本場による加点なし</li>
                <li>切り上げ満貫とし、満貫未満は0点(和了は可能)</li>
                <li>赤ドラなし</li>
                <li>チーなし</li>
                <li>喰い替えあり</li>
                <li>後付けあり</li>
                <li>喰いタンあり</li>
                <li>リーチ後の暗カンはいかなる形でも可能</li>
                <li>四風連打なし</li>
                <li>四家リーチ流れなし</li>
                <li>ダブロン、トリロンは頭ハネ</li>
                <li>箱下なし(0点未満で終了)</li>
                <li>アガリ止めなし(親が和了orテンパイで続行)</li>
            </ul>
            `,
        confirmButtonText: "閉じる",
        showCancelButton: false,
    });
});

// 役一覧ボタンのクリックイベントリスナー
yakuListButton.addEventListener('click', () => {
    // SweetAlert 役一覧画面を表示
    Swal.fire({
        title: `役一覧`,
        html: `
            <style>
                #yaku-table, #yakuman-table {
                    border-collapse: collapse;
                    width: 100%;
                    max-width: 600px;
                    margin: 20px auto;
                }
                #yaku-table th, #yaku-table td, #yakuman-table th, #yakuman-table td {
                    border: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }
                #yaku-table th, #yakuman-table th {
                    background-color: #f2f2f2;
                }
            </style>
            <table id="yaku-table">
                <thead>
                    <tr>
                        <th>役名</th>
                        <th>翻数</th>
                        <th>例</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>立直</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>一発</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>門前清自摸和</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>断么九</td>
                        <td>1翻</td>
                        <td>234萬55筒</td>
                    </tr>
                    <tr>
                        <td>平和</td>
                        <td>1翻</td>
                        <td>99萬567索</td>
                    </tr>
                    <tr>
                        <td>自風牌</td>
                        <td>1翻</td>
                        <td>22萬西西西</td>
                    </tr>
                    <tr>
                        <td>場風牌</td>
                        <td>1翻</td>
                        <td>22萬東東東</td>
                    </tr>
                    <tr>
                        <td>三元牌</td>
                        <td>1翻</td>
                        <td>44索白白白</td>
                    </tr>
                    <tr>
                        <td>槍槓</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>海底摸月</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>河底撈魚</td>
                        <td>1翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>ダブル立直</td>
                        <td>2翻</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>三色同刻</td>
                        <td>2翻</td>
                        <td>225萬5筒5索</td>
                    </tr>
                    <tr>
                        <td>対々和</td>
                        <td>2翻</td>
                        <td>777萬88筒</td>
                    </tr>
                    <tr>
                        <td>一暗刻</td>
                        <td>2翻</td>
                        <td>77萬888筒(暗刻)</td>
                    </tr>
                    <tr>
                        <td>混老頭</td>
                        <td>2翻</td>
                        <td>111筒南南</td>
                    </tr>
                    <tr>
                        <td>混全帯么九</td>
                        <td>2翻</td>
                        <td>789萬北北</td>
                    </tr>
                    <tr>
                        <td>純全帯么九</td>
                        <td>3翻</td>
                        <td>789萬11索</td>
                    </tr>
                    <tr>
                        <td>混一色</td>
                        <td>3翻(喰下り2翻)</td>
                        <td>234索發發</td>
                    </tr>
                    <tr>
                        <td>清一色</td>
                        <td>3翻(喰下り2翻)</td>
                        <td>12388索</td>
                    </tr>
                </tbody>
            </table>
            <table id="yakuman-table">
                <thead>
                    <tr>
                        <th>役満名</th>
                        <th>役満数</th>
                        <th>例</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>天和</td>
                        <td>役満</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>地和</td>
                        <td>役満</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>人和</td>
                        <td>役満</td>
                        <td>-</td>
                    </tr>
                    <tr>
                        <td>大三元</td>
                        <td>役満</td>
                        <td>22萬白發中、白白白發中</td>
                    </tr>
                    <tr>
                        <td>字一色</td>
                        <td>役満</td>
                        <td>東東東南南</td>
                    </tr>
                    <tr>
                        <td>緑一色</td>
                        <td>役満</td>
                        <td>23466索</td>
                    </tr>
                    <tr>
                        <td>清老頭</td>
                        <td>役満</td>
                        <td>11萬999索</td>
                    </tr>
                    <tr>
                        <td>一槓子</td>
                        <td>役満</td>
                        <td>88萬 白白白白(槓子)</td>
                    </tr>
                    <tr>
                        <td>小四喜</td>
                        <td>役満</td>
                        <td>東南南西 北(1面待ち)</td>
                    </tr>
                    <tr>
                        <td>大四喜</td>
                        <td>ダブル役満</td>
                        <td>東南西北 北(4面待ち)</td>
                    </tr>
                    <tr>
                        <td>一暗槓単騎</td>
                        <td>ダブル役満</td>
                        <td>88萬 白白白白(暗槓)</td>
                    </tr>
                </tbody>
            </table>
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