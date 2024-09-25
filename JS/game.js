// 牌の種類と数を定義
const SUIT_TYPES = ['萬', '筒', '索'];
const HONOR_TYPES = ['東', '南', '西', '北', '白', '發', '中'];
const NUM_TILES_PER_SUIT = 9;
const NUM_HONOR_TILES = 4;

// プレイヤーのIDを定義
const PLAYER_IDS = ['left', 'bottom', 'right', 'top'];

// ゲームの状態を表す変数
let gameStarted = false;
let currentPlayerIndex = 0;
let isRonDeclared = false; // ロン宣言
let isPonDeclared = false; // ポン宣言
let isKanDeclared = false; // カン宣言
let isMinkanOrKakanDeclared = false; // 明カンまたは加カンが宣言されたかどうか
let skipFlags = {}; // スキップ
let isDealerHola = false; // 親和了
let isRoundEnding = false; // 局の終了処理中かどうかを示すフラグ
let remainingTilesCount = 136; // 残り牌数
let playerScores = {}; // プレイヤーの点数を格納するオブジェクト
let riichiDeposit = 0; // リーチ棒の供託数
let isRiichi = {}; // プレイヤーの立直状態を格納
let isFuriten = {}; // プレイヤーのフリテン状態を格納
let melds = {}; // プレイヤーの鳴き牌情報を格納するオブジェクト

// 和了情報を格納する変数
let winningHandData = {};

// 局数と親の順番を管理する変数を追加
let currentRound = 1; // 現在の局数
let dealerIndex = Math.floor(Math.random() * PLAYER_IDS.length); // 親のインデックス

// 牌の情報を格納する変数
let allTiles = [];
let discardedTiles = {}; // プレイヤーIDをキーに、捨てられた牌の配列を格納
let playerMeldElements = {}; // ポン、カンを表示する要素
let wallTiles = []; // 王牌
let doraTiles = []; // ドラ
let doraTileNumber = 1; // ドラ表示数

// 役の定義と翻数
const YAKU = {
    立直: { name: "立直", fans: 1 },
    門前清自摸和: { name: "門前清自摸和", fans: 1 },
    断么九: { name: "断么九", fans: 1 },
    平和: { name: "平和", fans: 1 },
    自風牌: { name: "自風牌", fans: 1 },
    場風牌: { name: "場風牌", fans: 1 },
    三元牌: { name: "三元牌", fans: 1 },
    槍槓: { name: "槍槓", fans: 1 },
    嶺上開花: { name: "嶺上開花", fans: 1 },
    海底摸月: { name: "海底摸月", fans: 1 },
    河底撈魚: { name: "河底撈魚", fans: 1 },
    一発: { name: "一発", fans: 1 },
    ダブル立直: { name: "ダブル立直", fans: 2 },
    三色同刻: { name: "三色同刻", fans: 2 },
    対々和: { name: "対々和", fans: 2 },
    一暗刻: { name: "一暗刻", fans: 2 }, // 三暗刻の代用
    小三元: { name: "小三元", fans: 2 },
    混老頭: { name: "混老頭", fans: 2 },
    混全帯么九: { name: "混全帯么九", fans: 2 },
    純全帯么九: { name: "純全帯么九", fans: 3 },
    混一色: { name: "混一色", fans: 3 },
    清一色: { name: "清一色", fans: 3 }, // 清一色の難易度が低いため翻数を混一色と同じにする
    流し満貫: { name: "流し満貫", fans: 5 },
};

// 役満の定義と役満数
const YAKUMAN = {
    天和: { name: "天和", power: 1 },
    地和: { name: "地和", power: 1 },
    人和: { name: "人和", power: 1 },
    大三元: { name: "大三元", power: 1 },
    字一色: { name: "字一色", power: 1 },
    緑一色: { name: "緑一色", power: 1 },
    清老頭: { name: "清老頭", power: 1 },
    一槓子: { name: "一槓子", power: 1 }, // 四槓子の代用
    小四喜: { name: "小四喜", power: 1 },
    大四喜: { name: "大四喜", power: 2 },
    一暗槓単騎: { name: "一暗槓単騎", power: 2 },
}

// DOM要素をキャッシュする
let playerHandElements = {};
let playerDiscardedElements = {};
let tsumoButtons = {};
let ronButtons = {};
let ponButtons = {};
let kanButtons = {};
let skipButtons = {};
let remainingTilesElement = null; // 残り牌数を表示する要素をキャッシュ

// audioタグを取得
const dahaiSound = document.getElementById("dahaiSound");

// ミュートボタンの要素を取得
const muteButton = document.getElementById('mute-button');
// ミュートボタンの画像要素を作成
const muteButtonImage = document.createElement('img');
muteButtonImage.src = 'Picture/unmute.png'; // 初期状態の画像を設定
muteButton.appendChild(muteButtonImage); // 画像をボタンに追加

// 音声のオン/オフ状態を管理する変数
let isMuted = false;

// 戻るボタンの要素を取得
const backToTitleButton = document.getElementById('back-to-title-button');

// --- 牌の操作に関する関数 ---

/**
 * 牌要素を作成する関数
 * @param {string} tile 牌の文字列表現 (例: "1萬")
 * @returns {HTMLDivElement} 牌を表すHTMLDiv要素
 */
function createTileElement(tile, isDiscarded = false) {
    const tileElement = document.createElement('div');
    tileElement.className = 'tile';

    // 捨て牌の場合、discarded-tileクラスを追加
    if (isDiscarded) {
        tileElement.classList.add('discarded-tile');
    }

    // 牌の画像を追加
    const imgElement = document.createElement('img');
    // 牌の種類と数字を取得 (字牌は種類のみ)
    const suit = tile.slice(-1);
    const number = SUIT_TYPES.includes(suit) ? tile.slice(0, -1) : null;

    // 画像ファイル名を生成
    let imgFileName = "";
    if (number !== null) {
        // 数牌の場合
        switch (suit) {
            case '萬': imgFileName = `manzu_${number}.png`; break;
            case '筒': imgFileName = `pinzu_${number}.png`; break;
            case '索': imgFileName = `sozu_${number}.png`; break;
        }
    } else {
        // 字牌の場合
        switch (suit) {
            case '東': imgFileName = "zi_ton.png"; break;
            case '南': imgFileName = "zi_nan.png"; break;
            case '西': imgFileName = "zi_sha.png"; break;
            case '北': imgFileName = "zi_pei.png"; break;
            case '白': imgFileName = "zi_haku.png"; break;
            case '發': imgFileName = "zi_hatsu.png"; break;
            case '中': imgFileName = "zi_chun.png"; break;
        }
    }

    imgElement.src = `picture/tiles/${imgFileName}`; // 修正後の画像ファイルパス
    imgElement.alt = tile; // 画像が表示されない場合の代替テキスト
    tileElement.appendChild(imgElement);

    // 牌の種類に応じてクラスを追加
    if (tile.includes('萬')) {
        tileElement.classList.add('manzu');
    } else if (tile.includes('筒')) {
        tileElement.classList.add('pinzu');
    } else if (tile.includes('索')) {
        tileElement.classList.add('sozu');
    }

    return tileElement;
}

/**
 * 指定されたプレイヤーの手牌に牌を追加する関数
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌の文字列表現
 * @param {boolean} isTsumo ツモ牌かどうか
 */
function addTileToHand(playerId, tile, isTsumo = false) {
    const playerHandElement = playerHandElements[playerId];
    if (!playerHandElement) {
        console.error(`Element with ID ${playerId}-hand not found.`);
        return;
    }
    const tileElement = createTileElement(tile);

    // ツモ牌の場合、tsumo-tileクラスを追加
    if (isTsumo) {
        tileElement.classList.add("tsumo-tile");
    }

    playerHandElement.appendChild(tileElement);

    // 追加した牌にクリックイベントリスナーを設定
    tileElement.onclick = () => {
        handleTileClick(playerId, tile, tileElement);
    };
}

/**
 * 指定されたプレイヤーの手牌から牌を削除する関数
 * @param {string} playerId プレイヤーID
 * @param {HTMLDivElement} tileElement 削除する牌のHTMLDiv要素
 */
function removeTileFromHand(playerId, tileElement) {
    const playerHandElement = playerHandElements[playerId];
    playerHandElement.removeChild(tileElement);
}

/**
 * 指定されたプレイヤーの捨て牌エリアに牌を追加する関数
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌の文字列表現
 */
function addTileToDiscarded(playerId, tile) {
    // 表示用の捨て牌に追加
    const playerDiscardedElement = playerDiscardedElements[playerId];
    if (!playerDiscardedElement) {
        console.error(`Element with ID ${playerId}-discarded not found.`);
        return;
    }
    const discardedTileElement = createTileElement(tile, true); // 捨て牌であることを指定
    playerDiscardedElement.appendChild(discardedTileElement);

    // フリテン判定用捨て牌リストを更新
    discardedTiles[playerId].push(tile);
}

/**
 * 指定されたプレイヤーの手牌をソートする関数
 * @param {string} playerId プレイヤーID
 */
function sortHand(playerId) {
    const playerHandElement = playerHandElements[playerId];
    if (!playerHandElement) {
        console.error(`Element with ID ${playerId}-hand not found.`);
        return;
    }

    const tilesArray = Array.from(playerHandElement.children);
    const tileTextOrder = {
        '萬': 0,
        '筒': 1,
        '索': 2,
        '東': 3, '南': 4, '西': 5, '北': 6,
        '白': 7, '發': 8, '中': 9
    };

    tilesArray.sort((a, b) => {
        // imgタグのalt属性から牌の文字列を取得
        const typeA = a.querySelector('img').alt.slice(-1);
        const typeB = b.querySelector('img').alt.slice(-1);
        if (typeA === typeB) {
            return parseInt(a.querySelector('img').alt) - parseInt(b.querySelector('img').alt);
        }
        return tileTextOrder[typeA] - tileTextOrder[typeB];
    });

    playerHandElement.innerHTML = '';
    tilesArray.forEach(tileDiv => playerHandElement.appendChild(tileDiv));

    // ソート後、tsumo-tile クラスを削除
    tilesArray.forEach(tileDiv => tileDiv.classList.remove("tsumo-tile"));
}

// --- ゲーム進行に関する関数 ---

/**
 * ゲームの初期化処理
 */
function initializeGame() {
    // 牌の初期化
    initializeTiles();

    // DOM要素をキャッシュ
    cacheDOMElements();

    // 親を初期化
    dealerIndex = Math.floor(Math.random() * PLAYER_IDS.length);
    currentPlayerIndex = dealerIndex; // 最初の親はランダムに決定

    // 各プレイヤーの手牌、捨て牌、鳴き牌、スコアを初期化
    PLAYER_IDS.forEach((playerId) => {
        generateInitialHand(playerId);
        discardedTiles[playerId] = [];
        melds[playerId] = [];
        playerScores[playerId] = 25000;
    });
    updatePlayerScoresDisplay();

    // 王牌を設定
    wallTiles = allTiles.splice(0, 14);
    displayWallTiles();

    // ドラ表示牌を設定
    displayDoraTile(doraTileNumber);

    // 残り牌数を初期化
    remainingTilesCount = allTiles.length;

    // 供託を初期化
    updateRiichiDepositDisplay();

    // 最初のターンを開始
    startGame();

    // 初回のゲーム開始時に画像を設定
    const gameInfoImage = document.getElementById('game-info-image');
    switch (PLAYER_IDS[dealerIndex]) {
        case 'bottom':
            gameInfoImage.src = 'Picture/info_bottom.png';
            break;
        case 'left':
            gameInfoImage.src = 'Picture/info_left.png';
            break;
        case 'right':
            gameInfoImage.src = 'Picture/info_right.png';
            break;
        case 'top':
            gameInfoImage.src = 'Picture/info_top.png';
            break;
    }
    // 局数画像を初期化
    const roundImage = document.getElementById('round-image');
    roundImage.src = 'Picture/ton1.png'; // 最初は1局目なのでton1を表示
}

/**
 * すべての牌を作成し、シャッフルする
 */
function initializeTiles() {
    allTiles = [];
    // 数牌を作成
    SUIT_TYPES.forEach(suit => {
        for (let i = 1; i <= NUM_TILES_PER_SUIT; i++) {
            // 各数牌を4枚ずつpush
            for (let j = 0; j < 4; j++) {
                allTiles.push(i + suit);
                //TODO テスト用 
                //allTiles.push('3萬');
            }
        }
    });
    // 字牌を作成
    HONOR_TYPES.forEach(honor => {
        for (let i = 0; i < NUM_HONOR_TILES; i++) {
            allTiles.push(honor);
        }
    });
    // シャッフル
    shuffle(allTiles);
}

/**
 * 必要なDOM要素をキャッシュする
 */
function cacheDOMElements() {
    PLAYER_IDS.forEach(playerId => {
        playerHandElements[playerId] = document.getElementById(playerId + '-hand');
        playerDiscardedElements[playerId] = document.getElementById(playerId + '-discarded');
        playerMeldElements[playerId] = document.getElementById(playerId + '-melds');
        tsumoButtons[playerId] = document.getElementById(playerId + '-tsumo-button');
        ronButtons[playerId] = document.getElementById(playerId + '-ron-button');
        ponButtons[playerId] = document.getElementById(playerId + '-pon-button');
        kanButtons[playerId] = document.getElementById(playerId + '-kan-button');
        skipButtons[playerId] = document.getElementById(playerId + '-skip-button');
    });
    // 残り牌数を表示する要素をキャッシュ
    remainingTilesElement = document.getElementById("remaining-tiles");
}

/**
 * 残り牌数を表示する要素を更新する
 */
function updateRemainingTilesDisplay() {
    // 残り牌数の画像を表示する要素を取得
    const hundredsImage = document.getElementById("remaining-tiles-hundreds");
    const tensImage = document.getElementById("remaining-tiles-tens");
    const onesImage = document.getElementById("remaining-tiles-ones");

    // 残り牌数を3桁の数値に変換
    const paddedRemainingTiles = remainingTilesCount.toString().padStart(3, '0');

    // 各桁の画像を設定
    hundredsImage.src = `Picture/number/${paddedRemainingTiles[0]}ao.png`;
    tensImage.src = `Picture/number/${paddedRemainingTiles[1]}ao.png`;
    onesImage.src = `Picture/number/${paddedRemainingTiles[2]}ao.png`;
}

/**
 * リーチ棒の供託数表示を更新する
 */
function updateRiichiDepositDisplay() {
    const onesImage = document.getElementById("riichi-deposit-ones");

    // riichiDeposit を1桁の文字列に変換
    const depositString = riichiDeposit.toString().padStart(1, '0');

    // 各桁の画像を設定
    onesImage.src = `Picture/number/${depositString[0]}w.png`;
}

/**
 * プレイヤーの点数表示を更新する
 */
function updatePlayerScoresDisplay() {
    PLAYER_IDS.forEach(playerId => {
        const scoreElement = document.getElementById(`${playerId}-score`);
        scoreElement.innerHTML = ''; // 既存の画像をクリア

        const scoreString = playerScores[playerId].toString().padStart(5, '0');
        for (let i = 0; i < scoreString.length; i++) {
            const digitImage = document.createElement('img');
            digitImage.src = `Picture/number/${scoreString[i]}.png`;
            digitImage.alt = scoreString[i];
            scoreElement.appendChild(digitImage);
        }
    });
}

// 王牌を表示する
function displayWallTiles() {
    const wallTilesContainer = document.getElementById('wall-tiles-container');
    wallTilesContainer.innerHTML = ''; // 既存の牌をクリア

    // 最初の4牌のみを表示
    for (let i = 0; i < 4; i++) {
        const tile = wallTiles[i];
        const imgElement = document.createElement('img');
        imgElement.src = `picture/tiles/ura.png`;
        imgElement.alt = tile;
        wallTilesContainer.appendChild(imgElement);
    }
}

/**
 * ドラ表示牌を表示する
 * @param {string} doraTileNumber ドラ表示数
 */
function displayDoraTile(doraTileNumber) {
    const doraTileElement = document.getElementById('dora-tiles');
    doraTileElement.innerHTML = ''; // 既存の牌をクリア
    doraTiles = [];

    // ドラ表示牌の数を考慮して表示
    for (let i = 0; i < doraTileNumber; i++) {
        const tile = wallTiles[i];
        const imgElement = document.createElement('img');
        const suit = tile.slice(-1);
        const number = SUIT_TYPES.includes(suit) ? tile.slice(0, -1) : null;

        // 画像ファイル名を生成
        let imgFileName = "";
        if (number !== null) {
            // 数牌の場合
            switch (suit) {
                case '萬': imgFileName = `manzu_${number}.png`; break;
                case '筒': imgFileName = `pinzu_${number}.png`; break;
                case '索': imgFileName = `sozu_${number}.png`; break;
            }
        } else {
            // 字牌の場合
            switch (suit) {
                case '東': imgFileName = "zi_ton.png"; break;
                case '南': imgFileName = "zi_nan.png"; break;
                case '西': imgFileName = "zi_sha.png"; break;
                case '北': imgFileName = "zi_pei.png"; break;
                case '白': imgFileName = "zi_haku.png"; break;
                case '發': imgFileName = "zi_hatsu.png"; break;
                case '中': imgFileName = "zi_chun.png"; break;
            }
        }

        imgElement.src = `picture/tiles/${imgFileName}`;
        imgElement.alt = tile;
        doraTileElement.appendChild(imgElement);

        let nextTile = null;

        if (number !== null) {
            // 数牌の場合
            let nextNumber = number === 9 ? 1 : parseInt(number) + 1;
            let nextSuit = suit;
            nextTile = nextNumber + nextSuit;
        } else {
            // 字牌の場合
            const windTiles = ['東', '南', '西', '北'];
            const dragonTiles = ['白', '發', '中'];

            if (windTiles.includes(suit)) {
                // 東南西北の場合
                const tileIndex = windTiles.indexOf(suit);
                nextTile = windTiles[(tileIndex + 1) % windTiles.length];
            } else if (dragonTiles.includes(suit)) {
                // 白發中の場合
                const tileIndex = dragonTiles.indexOf(suit);
                nextTile = dragonTiles[(tileIndex + 1) % dragonTiles.length];
            }
        }

        doraTiles.push(nextTile);
        isMinkanOrKakanDeclared = false;
    }
}

/**
 * ゲームを開始する
 */
function startGame() {
    gameStarted = true;
    startTurn(getCurrentPlayerId());
}

/**
 * ゲーム終了時の処理
 */
function handleGameEnd() {
    console.log(`ゲーム終了しました。`);
    // ゲーム終了のフラグを立てる
    gameStarted = false;
    // TODO: ゲーム終了時の処理を実装 (例: 結果表示など)
}

/**
 * 次の局に進む処理
 */
async function proceedToNextRound() {
    // 既に局の終了処理中であれば、処理を中断
    if (isRoundEnding) {
        return;
    }

    // 局の終了処理中であることを示す
    isRoundEnding = true;

    // 子が和了したか、流局のとき
    if (!isDealerHola) {
        currentRound++;
        dealerIndex = (dealerIndex + 1) % PLAYER_IDS.length; // 親を反時計回りに移動
        currentPlayerIndex = dealerIndex; // 次の親からスタート
    } else {
        currentPlayerIndex = dealerIndex; // 親が和了したので親からスタート
    }

    // フラグの初期化
    isDealerHola = false;
    isRonDeclared = false;

    // 牌と供託を初期化
    initializeTiles();
    riichiDeposit = 0;
    updateRiichiDepositDisplay();

    // 各プレイヤーの情報をリセットし、初期手牌を配る
    PLAYER_IDS.forEach(playerId => {
        playerHandElements[playerId].innerHTML = ''; // 手牌をクリア
        playerMeldElements[playerId].innerHTML = ''; // ポンした牌の要素を削除
        playerDiscardedElements[playerId].innerHTML = ''; // 捨て牌をクリア
        discardedTiles[playerId] = []; // 捨て牌リストをリセット
        melds[playerId] = []; // 鳴き牌リストをクリア
        isFuriten[playerId] = false; // フリテンをクリア
        const furitenImage = document.getElementById(`${playerId}-furiten`);
        furitenImage.style.display = 'none';
        generateInitialHand(playerId);
    });

    // 王牌を設定
    wallTiles = allTiles.splice(0, 14);
    displayWallTiles();

    // ドラ表示牌を設定
    doraTileNumber = 1;
    displayDoraTile(doraTileNumber);

    // 残り牌数を初期化
    remainingTilesCount = allTiles.length;
    updateRemainingTilesDisplay();

    // 新しい局を開始
    if (currentRound < 5) { // 4局未満なら次の局を開始（先に局数をインクリメントしているため5）
        console.log(`局が終了しました。${currentRound}局目に移ります。`);
        startGame();
    } else { // 4局終了したらゲーム終了
        handleGameEnd();
    }

    // 親のプレイヤーIDに応じて画像を変更
    const gameInfoImage = document.getElementById('game-info-image');
    const roundImage = document.getElementById('round-image');
    switch (PLAYER_IDS[dealerIndex]) {
        case 'bottom':
            gameInfoImage.src = 'Picture/info_bottom.png';
            break;
        case 'left':
            gameInfoImage.src = 'Picture/info_left.png';
            break;
        case 'right':
            gameInfoImage.src = 'Picture/info_right.png';
            break;
        case 'top':
            gameInfoImage.src = 'Picture/info_top.png';
            break;
    }

    // 局数に応じて画像を変更
    switch (currentRound) {
        case 1:
            roundImage.src = 'Picture/ton1.png';
            break;
        case 2:
            roundImage.src = 'Picture/ton2.png';
            break;
        case 3:
            roundImage.src = 'Picture/ton3.png';
            break;
        case 4:
            roundImage.src = 'Picture/ton4.png';
            break;
    }

    // 局の終了処理が完了
    isRoundEnding = false;
}

/**
 * 指定されたプレイヤーのターンを開始する
 * @param {string} playerId プレイヤーID
 */
function startTurn(playerId) {
    // 点数表示を更新
    updatePlayerScoresDisplay();

    // 牌を引く
    drawTile(playerId);
}

/**
 * 現在のプレイヤーのターンを終了し、次のプレイヤーにターンを移す
 */
function endTurn() {
    if (!isRonDeclared) {
        // ターン終了時にフリテン状態を更新
        updateFuritenStatus(getCurrentPlayerId());

        currentPlayerIndex = (currentPlayerIndex + 1) % PLAYER_IDS.length;
        startTurn(getCurrentPlayerId());
    }
}

/**
 * 手牌の牌がクリックされた時の処理
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌の文字列表現
 * @param {HTMLDivElement} tileElement クリックされた牌のHTMLDiv要素
 */
function handleTileClick(playerId, tile, tileElement) {
    if (canDiscard(playerId)) {
        removeTileFromHand(playerId, tileElement);
        addTileToDiscarded(playerId, tile);
        sortHand(playerId);

        if (isMinkanOrKakanDeclared) {
            // ドラを追加
            doraTileNumber++;
            displayDoraTile(doraTileNumber);
            isMinkanOrKakanDeclared = false;
        }

        // 打牌音を再生
        playSound(dahaiSound);

        // 捨て牌に対する処理
        handleDiscardAction(playerId, tile);
    }
}

/**
 * 捨て牌に対する処理を行う
 * @param {string} playerId 牌を捨てたプレイヤーID
 * @param {string} discardedTile 捨てられた牌の文字列
 */
async function handleDiscardAction(playerId, discardedTile) {
    // 現在のプレイヤーのインデックスを取得
    const currentPlayerIndex = PLAYER_IDS.indexOf(playerId);

    // 全員宣言がないか判定するフラグ
    isAllNotDeclaration = true;

    let isRonSkip = false;
    // 現在のプレイヤーの次の人から反時計回りにロン判定を行う
    for (let i = 1; i < PLAYER_IDS.length; i++) {
        const otherPlayerIndex = (currentPlayerIndex + i) % PLAYER_IDS.length;
        const otherPlayerId = PLAYER_IDS[otherPlayerIndex];

        let isRonPossible = false;
        skipFlags[otherPlayerId] = false;
        isRonDeclared = false;

        // フリテンでなく、ロン可能か
        if (!isFuriten[otherPlayerId] && checkRon(otherPlayerId, playerId)) {
            isRonPossible = true;
            // ロンボタンとスキップボタンを表示
            showRonButtons(otherPlayerId);
            showSkipButtons(otherPlayerId);

            // ロンボタンのイベントリスナーを設定
            setupRonButtonListener(otherPlayerId);
        }

        if (isRonPossible) {
            // フリテン判定ありのスキップボタンのイベントリスナーを設定
            setupSkipButtonListener(otherPlayerId, false);
        }
        // 他のプレイヤーの処理を待つ
        while (isRonPossible && !skipFlags[otherPlayerId]) {
            isAllNotDeclaration = false;
            isRonSkip = true;
            // 誰かが宣言したら関数を終了
            if (isRonDeclared) {
                return;
            }
            // 一定時間待機 (ブラウザがフリーズしないように)
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }

    // 誰もロンしなかった場合のみ、ポンとカンの判定を行う
    if (!isRonDeclared) {
        for (let i = 1; i < PLAYER_IDS.length; i++) {
            const otherPlayerIndex = (currentPlayerIndex + i) % PLAYER_IDS.length;
            const otherPlayerId = PLAYER_IDS[otherPlayerIndex];

            let isPonPossible = false;
            let isKanPossible = false;
            skipFlags[otherPlayerId] = false;
            isPonDeclared = false;
            isKanDeclared = false;

            // ポン可能か
            if (remainingTilesCount >= 1) {
                if (checkPon(otherPlayerId, discardedTile)) {
                    isPonPossible = true;

                    // ポンボタンとスキップボタンを表示
                    showPonButtons(otherPlayerId);
                    showSkipButtons(otherPlayerId);

                    // ポンボタンのイベントリスナーを設定
                    setupPonButtonListener(otherPlayerId, playerId, discardedTile);
                }
            }

            // カン可能か
            if (remainingTilesCount >= 1) {
                if (checkKan(otherPlayerId, discardedTile)) {
                    isKanPossible = true;

                    // カンボタンを表示
                    showKanButtons(otherPlayerId);

                    // カンボタンのイベントリスナーを設定
                    setupKanButtonListener(otherPlayerId, playerId, discardedTile);
                }
            }

            if (isPonPossible || isKanPossible) {
                // フリテン判定なしのスキップボタンのイベントリスナーを設定
                setupSkipButtonListener(otherPlayerId, true);
            }

            // 他のプレイヤーの処理を待つ
            while ((isPonPossible || isKanPossible) && !skipFlags[otherPlayerId]) {
                isAllNotDeclaration = false;
                // 誰かが宣言したら関数を終了
                if (isPonDeclared || isKanDeclared) {
                    return;
                }
                // 一定時間待機 (ブラウザがフリーズしないように)
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    }

    // 全員がロン、ポン、カン可能ではなかった場合もしくはスキップした場合にターンを終了
    if (isRonSkip || isAllNotDeclaration || Object.values(skipFlags).includes(true)) {
        endTurn();
    }
    isAllNotDeclaration = true;
}

/**
 * ロンボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 */
function setupRonButtonListener(playerId) {
    ronButtons[playerId].onclick = () => {
        // ロン宣言済み
        isRonDeclared = true;

        // ボタンを非表示
        hideAllRonButtons();
        hideAllPonButtons();
        hideAllKanButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // ロン処理の実装
        handleRon(playerId);
    };
}

/**
 * ツモボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 */
function setupTsumoButtonListener(playerId) {
    tsumoButtons[playerId].onclick = () => {
        // ボタンを非表示
        hideAllRonButtons();
        hideAllPonButtons();
        hideAllKanButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // ツモ処理の実装
        handleTsumo(playerId);
    };
}

/**
 * ポンボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 * @param {string} targetPlayerId ターゲットとなるプレイヤーID (牌を捨てたプレイヤー)
 * @param {string} tile ポン牌
 */
function setupPonButtonListener(playerId, targetPlayerId, tile) {
    ponButtons[playerId].onclick = () => {
        // ボタンを非表示
        hideAllRonButtons();
        hideAllPonButtons();
        hideAllKanButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // ポン処理の実装
        handlePon(playerId, targetPlayerId, tile)
    };
}

/**
 * カンボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 * @param {string} targetPlayerId ターゲットとなるプレイヤーID (牌を捨てたプレイヤー、または null)
 * @param {string} tile カン牌
 */
function setupKanButtonListener(playerId, targetPlayerId, tile) {
    kanButtons[playerId].onclick = () => {
        // ボタンを非表示
        hideAllRonButtons();
        hideAllPonButtons();
        hideAllKanButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // カン処理の実装
        handleKan(playerId, targetPlayerId, tile)
    };
}

/**
 * ロン処理を行う
 * @param {string} playerId ロンを宣言したプレイヤーID
 */
function handleRon(playerId) {
    console.log(`${playerId} がロンしました！`);

    // 役判定結果を表示
    console.log("役判定結果:", winningHandData);

    // ... (winningHandData を利用した処理) ...

    // proceedToNextRound() の完了後に isRoundEnding を false に戻す
    if (!isRoundEnding) {
        // 親がロンした場合、親は変わらず次の局へは進まない
        if (playerId === PLAYER_IDS[dealerIndex]) {
            console.log("親がロンしたため、局は継続です。");
            isDealerHola = true;
        }
        proceedToNextRound().then(() => {
            isRoundEnding = false;
        });
    }
}

/**
 * ツモ処理を行う
 * @param {string} playerId ツモを宣言したプレイヤーID
 */
function handleTsumo(playerId) {
    console.log(`${playerId} がツモしました！`);

    // 役判定結果を表示
    console.log("役判定結果:", winningHandData);

    // ... (winningHandData を利用した処理) ...

    // proceedToNextRound() の完了後に isRoundEnding を false に戻す
    if (!isRoundEnding) {
        // 親がツモした場合、親は変わらず次の局へは進まない
        if (playerId === PLAYER_IDS[dealerIndex]) {
            console.log("親がツモしたため、局は継続です。");
            isDealerHola = true;
        }
        proceedToNextRound().then(() => {
            isRoundEnding = false;
        });
    }
}

/**
 * ポン処理を行う
 * @param {string} playerId ポンをしたプレイヤーID
 * @param {string} targetPlayerId ターゲットとなるプレイヤーID (牌を捨てたプレイヤー)
 * @param {string} tile ポンする牌
 */
function handlePon(playerId, targetPlayerId, tile) {
    console.log(`${playerId} が ${tile} でポンしました！`);

    // 鳴き牌情報をmeldsに格納
    melds[playerId].push({
        meldType: 'pon',
        tiles: [tile, tile, tile],
    });

    // ポンした牌を手牌から削除
    removeTilesFromHand(playerId, tile, 2);

    // 表示用捨て牌からポンした牌を削除
    removeTileFromDiscarded(targetPlayerId, tile);

    // ポンした牌を表示する
    const meldContainer = document.createElement('div'); // ポン牌をまとめるコンテナ
    meldContainer.classList.add('meld'); // スタイル適用のためクラスを追加
    for (let i = 0; i < 3; i++) {
        const ponTileElement = createTileElement(tile);
        if (i === 0 && ((playerId === 'left' && targetPlayerId === 'top') ||
            (playerId === 'top' && targetPlayerId === 'right') ||
            (playerId === 'right' && targetPlayerId === 'bottom') ||
            (playerId === 'bottom' && targetPlayerId === 'left'))) {
            ponTileElement.classList.add('horizontal');
        } else if (i === 1 && ((playerId === 'left' && targetPlayerId === 'right') ||
            (playerId === 'top' && targetPlayerId === 'bottom') ||
            (playerId === 'right' && targetPlayerId === 'left') ||
            (playerId === 'bottom' && targetPlayerId === 'top'))) {
            ponTileElement.classList.add('horizontal');
        } else if (i === 2 && ((playerId === 'left' && targetPlayerId === 'bottom') ||
            (playerId === 'top' && targetPlayerId === 'left') ||
            (playerId === 'right' && targetPlayerId === 'top') ||
            (playerId === 'bottom' && targetPlayerId === 'right'))) {
            ponTileElement.classList.add('horizontal');
        }
        meldContainer.appendChild(ponTileElement);
    }
    playerMeldElements[playerId].appendChild(meldContainer);

    // ターンをポンしたプレイヤーに移す
    currentPlayerIndex = PLAYER_IDS.indexOf(playerId);

    // ポン音を再生
    playSound(dahaiSound);

    // 処理の終了を待つ
    isPonDeclared = true;
}

/**
 * カン処理を行う
 * @param {string} playerId カンをしたプレイヤーID
 * @param {string} targetPlayerId ターゲットとなるプレイヤーID (nullのとき暗カン)
 * @param {string} tile カンする牌
 */
function handleKan(playerId, targetPlayerId, tile) {
    console.log(`${playerId} が ${tile} でカンしました！`);

    let isKakan = false;

    if (targetPlayerId !== null) { // 明カンの場合
        // カンした牌を手牌から削除
        removeTilesFromHand(playerId, tile, 3);
        // 表示用捨て牌からカンした牌を削除
        removeTileFromDiscarded(targetPlayerId, tile);
        isMinkanOrKakanDeclared = true;
        // 鳴き牌情報をmeldsに格納
        melds[playerId].push({
            meldType: 'minkan',
            tiles: [tile, tile, tile, tile]
        });
    } else {
        // プレイヤーの手牌を取得
        const handTiles = getHandTiles(playerId);
        if (handTiles.filter(t => t === tile).length === 4) {
            // 暗カンの場合、カンした牌を手牌から削除
            removeTilesFromHand(playerId, tile, 4);
            // ドラを追加
            doraTileNumber++;
            displayDoraTile(doraTileNumber);
            // 鳴き牌情報をmeldsに格納
            melds[playerId].push({
                meldType: 'ankan',
                tiles: [tile, tile, tile, tile]
            });
        } else { // 加カンの場合の処理
            removeTilesFromHand(playerId, tile, 1);
            isKakan = true;
            isMinkanOrKakanDeclared = true;
            // 既存のポン情報を更新
            melds[playerId][0] = {
                meldType: 'kakan',
                tiles: [tile, tile, tile, tile]
            };
        }
    }

    // カンした牌を表示する
    const meldContainer = document.createElement('div'); // カン牌をまとめるコンテナ
    meldContainer.classList.add('meld'); // スタイル適用のためクラスを追加
    let isChangeElement = false;
    for (let i = 0; i < 4; i++) {
        const kanTileElement = createTileElement(tile);

        // 暗カンの場合、両端の牌 (i === 0 と i === 3) の画像を裏に変更
        if (!isKakan && targetPlayerId === null && (i === 0 || i === 3)) {
            const imgElement = kanTileElement.querySelector('img');
            imgElement.src = 'picture/tiles/ura.png';
            imgElement.alt = '裏';
            isChangeElement = true;
        }

        // 明カンの場合、牌を横向きにする
        if (i === 0 && ((playerId === 'left' && targetPlayerId === 'top') ||
            (playerId === 'top' && targetPlayerId === 'right') ||
            (playerId === 'right' && targetPlayerId === 'bottom') ||
            (playerId === 'bottom' && targetPlayerId === 'left'))) {
            kanTileElement.classList.add('horizontal');
            isChangeElement = true;
        } else if (i === 1 && ((playerId === 'left' && targetPlayerId === 'right') ||
            (playerId === 'top' && targetPlayerId === 'bottom') ||
            (playerId === 'right' && targetPlayerId === 'left') ||
            (playerId === 'bottom' && targetPlayerId === 'top'))) {
            kanTileElement.classList.add('horizontal');
            isChangeElement = true;
        } else if (i === 3 && ((playerId === 'left' && targetPlayerId === 'bottom') ||
            (playerId === 'top' && targetPlayerId === 'left') ||
            (playerId === 'right' && targetPlayerId === 'top') ||
            (playerId === 'bottom' && targetPlayerId === 'right'))) {
            kanTileElement.classList.add('horizontal');
            isChangeElement = true;
        }
        meldContainer.appendChild(kanTileElement);
    }

    // 加カンで、既にポンしている牌の画像を変更する
    if (isKakan) {
        const meldElements = playerMeldElements[playerId].children;
        for (const meldElement of meldElements) {
            // ポン牌の画像を取得
            const ponTileImages = meldElement.querySelectorAll('img');

            // 各ポン牌に対して処理
            ponTileImages.forEach(imgElement => {
                if (imgElement.parentElement.classList.contains('horizontal')) {
                    if (!imgElement.src.includes('_double')) {
                        imgElement.src = imgElement.src.replace('/tiles/', '/tiles_double/');
                        imgElement.src = imgElement.src.replace('.png', '_double.png');
                    }
                }
            });
        }
    }

    if (isChangeElement) {
        playerMeldElements[playerId].appendChild(meldContainer);
    }
    // ターンをカンしたプレイヤーに移す
    currentPlayerIndex = PLAYER_IDS.indexOf(playerId);

    // カン音を再生
    playSound(dahaiSound);

    // 牌を一枚引く
    drawTile(playerId);

    // 処理の終了を待つ
    isKanDeclared = true;
}

/**
 * 捨て牌エリアから指定された牌を削除する
 * @param {string} playerId プレイヤーID
 * @param {string} tile 削除する牌
 */
function removeTileFromDiscarded(playerId, tile) {
    const playerDiscardedElement = playerDiscardedElements[playerId];
    // playerDiscardedElement.children を配列に変換
    const discardedTiles = Array.from(playerDiscardedElement.children);
    discardedTiles.forEach(tileElement => {
        // 牌の種類を表す文字列を取得
        const tileText = tileElement.querySelector('img').alt;

        if (tileText === tile) {
            playerDiscardedElement.removeChild(tileElement);
            // 1枚削除したらループを抜ける
            return;
        }
    });
}

/**
 * 指定されたプレイヤーの手牌から、指定された牌を指定された枚数削除する
 * @param {string} playerId プレイヤーID
 * @param {string} tile 削除する牌
 * @param {number} count 削除する枚数
 */
function removeTilesFromHand(playerId, tile, count) {
    const playerHandElement = playerHandElements[playerId];
    // playerHandElement.children を配列に変換
    const tiles = Array.from(playerHandElement.children);
    let removedCount = 0; // 削除済みの牌の枚数をカウントする変数
    tiles.forEach(tileElement => {
        // 牌の種類を表す文字列を取得
        const tileText = tileElement.querySelector('img').alt;
        if (removedCount < count && tileText === tile) {
            playerHandElement.removeChild(tileElement);
            removedCount++;
        }
    });
}

// --- 判定に関する関数 ---

/**
 * ツモ判定を行う
 * @param {string} playerId プレイヤーID
 * @returns {boolean} ツモかどうか
 */
function checkTsumo(playerId) {
    const handTiles = getHandTiles(playerId);
    winningHandData = isWinningHand(handTiles, playerId, true);
    if (winningHandData.isWinning) {
        // 該当するプレイヤーのツモボタンとスキップボタンを表示
        showTsumoButtons(playerId);
        showSkipButtons(playerId);

        // スキップボタンのイベントリスナーを設定
        setupSkipButtonListener(playerId, true);

        // ツモボタンのイベントリスナーを設定
        setupTsumoButtonListener(playerId);
    }
}

/**
 * ロン判定を行う
 * @param {string} playerId プレイヤーID
 * @param {string} discardPlayerId 直前に捨てたプレイヤーID
 * @returns {boolean} ロンかどうか
 */
function checkRon(playerId, discardPlayerId) {
    const handTiles = getHandTiles(playerId);

    // 最後に捨てられた牌を取得
    const lastDiscardedTile = discardedTiles[discardPlayerId][discardedTiles[discardPlayerId].length - 1];

    if (lastDiscardedTile) {
        winningHandData = isWinningHand([...handTiles, lastDiscardedTile], discardPlayerId, true);
        return winningHandData.isWinning; // isWinningプロパティの値を返す
    }

    return false;
}

/**
 * 和了判定を行う
 * @param {string[]} tiles 牌の文字列配列
 * @param {string} playerId ツモの場合は自分、ロンの場合は牌を捨てたプレイヤー
 * @param {boolean} yakuJudge 役判定を実施するか
 * @returns {object} 和了判定結果、役のリストと合計翻数、または役満のリストと合計役満数
 */
function isWinningHand(tiles, PlayerId, yakuJudge) {
    let isTanki = false;
    let meld = false;
    let isSpecial1 = false;
    let isSpecial2 = false;
    let isSpecial3 = false;

    if (tiles.length !== 5 && tiles.length !== 2) {
        return {  // 牌の数が5枚か2枚でなければ和了ではない
            isWinning: false,
            yaku: [],
            fans: 0,
            yakumanList: [],
            yakumanPower: 0
        };
    }

    // 牌を種類と数字に分離してソート
    const sortedTiles = separateAndSortTiles(tiles);

    // 各牌の出現回数をカウント
    const tileCounts = countTileOccurrences(sortedTiles);

    // 対子（頭）があるか判定
    let pairTile = null;
    let storeKotsu = false;

    for (const tileKey in tileCounts) {
        if (tileCounts[tileKey] === 2) {
            pairTile = tileKey; // 対子の牌を保存
            storeKotsu = false;
            break;
        } else if (tileCounts[tileKey] === 3) {
            pairTile = tileKey; // 対子になる可能性のある牌を保存
            storeKotsu = true;
        }
    }

    // 対子(候補)がない場合は和了不可能
    if (pairTile === null) {
        return {
            isWinning: false,
            yaku: [],
            fans: 0,
            yakumanList: [],
            yakumanPower: 0
        };
    }

    if (tiles.length === 2) {
        // 手牌が2枚の場合は対子になれば和了
        if (pairTile != null) {
            isTanki = true;
        }
    } else if (tiles.length === 5) {
        // 対子(候補)を取り除いた牌のリストを作成
        const remainingTiles = sortedTiles.filter(tile => {
            // 字牌の場合、数字を含めない
            const tileKey = tile.number !== null ? `${tile.suit}${tile.number}` : `${tile.suit}`;
            return tileKey !== pairTile;
        });
        // 対子候補が3枚の場合は3枚削除されてしまうので1枚追加する
        if (storeKotsu) {
            if (remainingTiles.length > 0) {
                // pairTileが字牌かどうかを判定
                if (SUIT_TYPES.includes(pairTile.slice(0, 1))) {
                    // 数牌の場合のみ、数字を抽出
                    const [suit, number] = pairTile.match(/(.+)(\d+)/).slice(1);
                    remainingTiles.push({ suit, number: parseInt(number) });
                } else {
                    // 字牌の場合は、種類のみを抽出
                    const suit = pairTile;
                    remainingTiles.push({ suit, number: null });
                }
            }
        }

        // remainingTilesをソート
        remainingTiles.sort((a, b) => {
            if (a.suit === b.suit) {
                return a.number - b.number;
            } else {
                return a.suit.localeCompare(b.suit);
            }
        });

        // 残りの牌が順子または刻子で構成されているか判定
        meld = checkMeld(remainingTiles);

        // 大四喜、小四喜パターンの判定
        if (isSpecialHand1(tileCounts)) {
            isSpecial1 = true;
        }

        // 大三元パターンの判定
        if (isSpecialHand2(tileCounts)) {
            isSpecial2 = true;
        }

        // 三色同刻パターンの判定
        if (isSpecialHand3(tileCounts)) {
            isSpecial3 = true;
        }
    }

    if (isTanki || !(meld === '和了不可能') || isSpecialHand1(tileCounts) || isSpecialHand2(tileCounts) || isSpecialHand3(tileCounts)) {
        if (yakuJudge) {
            // 役判定、得点計算のためのデータセットを作成
            const handData = {
                tiles: tiles, // ソート前の手牌全体
                sortedTiles: sortedTiles, // ソート後の手牌全体
                holaTile: tiles[tiles.length - 1], // 和了牌
                pairTile: pairTile, // 対子の牌
                doraTiles: doraTiles, // ドラ
                isRiichi: isRiichi[playerId], // リーチか
                isTsumo: getCurrentPlayerId() === playerId, // ツモか
                prevailingWind: (PLAYER_IDS.indexOf(getCurrentPlayerId()) -
                    dealerIndex + PLAYER_IDS.length) % PLAYER_IDS.length, // 自風(0: 東 1: 南, 2: 西, 3: 北)
                isTanki: isTanki, // 鳴いた状態で単騎で和了か
                meld: meld, // 通常和了の刻子か順子か和了不可能か
                isSpecial1: isSpecial1, // 大四喜か小四喜パターンか
                isSpecial2: isSpecial2, // 大三元パターンか
                isSpecial3: isSpecial3, // 三色同刻パターンか
                melds: melds[playerId], // 鳴き牌情報
            };

            // 役判定
            const result = calculateYaku(handData);

            // 役判定結果を返す
            return {
                isWinning: true,
                yaku: result.yaku,
                fans: result.fans,
                yakumanList: result.yakuman,
                yakumanPower: result.yakumanPower
            };
        } else {
            // フリテン判定用（役計算不要）
            return {
                isWinning: true,
                yaku: [],
                fans: 0,
                yakumanList: [],
                yakumanCount: 0
            };
        }
    } else {
        return {
            isWinning: false,
            yaku: [],
            fans: 0,
            yakumanList: [],
            yakumanCount: 0
        };
    }
}

/**
 * 面子（順子または刻子）判定を行う
 * @param {object[]} tiles 牌オブジェクトの配列
 * @returns {string} '刻子' か '順子' か '和了不可能'
 */
function checkMeld(tiles) {
    // 刻子判定
    if (tiles.length >= 3 && tiles[0].suit === tiles[1].suit && tiles[1].suit === tiles[2].suit && tiles[0].number === tiles[1].number && tiles[1].number === tiles[2].number) {
        return '刻子';
    }

    // 順子判定
    for (let i = 0; i < tiles.length - 2; i++) {
        if (
            tiles[i].suit === tiles[i + 1].suit && // 同じ種類であることを確認
            tiles[i].suit === tiles[i + 2].suit && // 同じ種類であることを確認
            tiles[i + 1].number === tiles[i].number + 1 && // i+1番目の牌がi番目の牌の次の数字であることを確認
            tiles[i + 2].number === tiles[i + 1].number + 1 // i+2番目の牌がi+1番目の牌の次の数字であることを確認
        ) {
            return '順子';
        }
    }

    return '和了不可能'; // 刻子も順子も作れない場合は和了不可能
}

/**
 * 大四喜と小四喜（東南西北が4枚ともう一枚東南西北がある場合にtrueを返す）
 * @param {object[]} tileCounts 各牌のカウント数
 * @returns {boolean} 東南西北が5枚かどうか
 */
function isSpecialHand1(tileCounts) {
    const targetTiles = ['東', '南', '西', '北'];
    // targetTilesが全て手牌に含まれていないか判定
    if (!targetTiles.every(tile => tileCounts[tile] > 0)) {
        return false;
    } else {
        // targetTilesのいずれかが5枚あるか判定
        for (const targetTile of targetTiles) {
            if (tileCounts[targetTile] === 2) {
                return true;
            }
        }
    }
}

/**
 * 大三元（白發中と頭二枚のパターンを判定する）
 * @param {object[]} tileCounts 各牌のカウント数
 * @returns {boolean} 白發中と頭二枚のパターンかどうか
 */
function isSpecialHand2(tileCounts) {
    const targetTiles = ['白', '發', '中'];
    // 白發中が全て含まれていないか判定
    if (!targetTiles.every(tile => tileCounts[tile] > 0)) {
        return false;
    } else {
        for (const tileKey in tileCounts) {
            // 白發中のうちいずれかが3枚か
            if (targetTiles.includes(tileKey) && tileCounts[tileKey] === 3) {
                return true;
            }
            // 白發中以外で頭があるか
            if (!targetTiles.includes(tileKey) && tileCounts[tileKey] === 2) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 三色同刻（同じ数字の萬子、筒子、索子の3枚と頭二枚のパターンを判定する）
 * @param {object[]} tileCounts 各牌のカウント数
 * @returns {boolean} 同じ数字の萬子、筒子、索子の3枚と頭二枚のパターンかどうか
 */
function isSpecialHand3(tileCounts) {
    // 各数字について、全ての牌の種類が存在するかを確認
    // 数字のループ
    for (let number = 1; number <= 9; number++) {
        let hasAllSuits = true;
        let isKotu = false;
        // 牌の種類のループ
        for (const suit of SUIT_TYPES) {
            const tileKey = `${suit}${number}`;
            // 1枚か3枚でないか判定
            if (!(tileKey in tileCounts && (tileCounts[tileKey] === 1 || tileCounts[tileKey] === 3))) {
                hasAllSuits = false;
                break;
            } else if (tileCounts[tileKey] === 3) {
                isKotu = true;
            }
        }
        // 全ての牌の種類が存在しているか
        if (hasAllSuits) {
            // 刻子なら全ての種類と同じ牌の頭の判定、刻子でないなら全ての種類と別の牌の頭の判定
            if (isKotu || Object.values(tileCounts).includes(2)) {
                return true;
            }
        }
    }
    return false;
}

/**
 * 牌の文字列配列を種類と数字に分離してソートする
 * @param {string[]} tiles 牌の文字列配列 (例: ['1萬', '2萬', '3筒', '東'])
 * @returns {object[]} 種類と数字を持つオブジェクトの配列 (例: [{ suit: '萬', number: 1 }, { suit: '萬', number: 2 }, { suit: '筒', number: 3 }, { suit: '東', number: null }])
 */
function separateAndSortTiles(tiles) {
    return tiles.map(tile => {
        const suit = tile.slice(-1);
        // 字牌の場合、numberはnullとする
        const number = SUIT_TYPES.includes(suit) ? parseInt(tile.slice(0, -1)) : null;
        return { suit, number };
    }).sort((a, b) => {
        if (a.suit === b.suit) {
            // 字牌の場合は種類のみで比較
            return a.number !== null && b.number !== null ? a.number - b.number : a.suit.localeCompare(b.suit);
        } else {
            return a.suit.localeCompare(b.suit);
        }
    });
}

/**
 * ソートされた牌の出現回数をカウントする
 * @param {object[]} tiles 牌オブジェクトの配列
 * @returns {object} 牌の種類をキー、出現回数を値としたオブジェクト
 */
function countTileOccurrences(tiles) {
    const tileCounts = {};
    for (const tile of tiles) {
        // 字牌の場合、数字を含めない
        const tileKey = tile.number !== null ? `${tile.suit}${tile.number}` : `${tile.suit}`;
        tileCounts[tileKey] = (tileCounts[tileKey] || 0) + 1;
    }
    return tileCounts;
}

/**
 * ポン判定を行う
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌の文字列表現
 * @returns {boolean} ポン可能かどうか
 */
function checkPon(playerId, tile) {
    const handTiles = getHandTiles(playerId);
    // 同じ牌が2枚あるか判定
    return handTiles.filter(t => t === tile).length >= 2;
}

/**
 * カン判定を行う
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌の文字列表現
 * @returns {boolean} カン可能かどうか
 */
function checkKan(playerId, tile) {
    const handTiles = getHandTiles(playerId);
    if (handTiles.length === 5 && tile === null) { // 暗カンのとき、同じ牌が4枚以上あるか判定 
        const sortedTiles = separateAndSortTiles(handTiles); // 牌を種類と数字に分離してソート
        const tileCounts = countTileOccurrences(sortedTiles); // 牌の種類と枚数をカウント
        const tileValues = Object.values(tileCounts); // 枚数の配列を取得
        return tileValues.includes(4); // 枚数4が含まれているか判定
    } else { // 明カンのとき、同じ牌が3枚以上あるか判定
        return handTiles.filter(t => t === tile).length >= 3;
    }
}

/**
 * 加カン判定を行う
 * @param {string} playerId プレイヤーID
 * @param {string} tile 牌
 * @returns {boolean} 加カン可能かどうか
 */
function checkKakan(playerId, tile) {
    // 1. 既にポンまたはカンしている牌の種類を調べる
    const meldElements = playerMeldElements[playerId].children;

    // 2. 加カン可能な牌かどうか判定
    for (const meldElement of meldElements) {
        // ポンまたはカンの牌を取得
        const meldTiles = Array.from(meldElement.querySelectorAll('img')).map(img => img.alt);
        // ポンの場合
        if (meldTiles.length === 3 && meldTiles.every(t => t === tile)) {
            return true;
        }
    }

    // 手牌が2枚の場合(加カン)の判定
    const handTiles = getHandTiles(playerId);
    if (handTiles.length === 2) {
        // 手牌のうち、tileではない方の牌を取得
        const otherTile = handTiles.find(t => t !== tile);
        // otherTileがポンされている牌と同じかどうか判定
        for (const meldElement of meldElements) {
            const meldTiles = Array.from(meldElement.querySelectorAll('img')).map(img => img.alt);
            if (meldTiles.length === 3 && meldTiles.every(t => t === otherTile)) {
                return true;
            }
        }
    }

    return false;
}

// --- 役判定 ---

/**
 * 役判定を行う関数
 * @param {object} handData 手牌のデータ
 * @returns {object} 役のリストと合計翻数、役満のリスト
 */
function calculateYaku(handData) {
    const yaku = [];
    let fans = 0;
    const yakuman = [];
    let yakumanPower = 0;

    // 役満判定
    if (isTenho(handData)) {
        yakuman.push(YAKUMAN.天和);
        yakumanPower += YAKUMAN.天和.power;
    }

    if (isChiho(handData)) {
        yakuman.push(YAKUMAN.地和);
        yakumanPower += YAKUMAN.地和.power;
    }

    if (isRenho(handData)) {
        yakuman.push(YAKUMAN.人和);
        yakumanPower += YAKUMAN.人和.power;
    }

    if (isDaisangen(handData)) {
        yakuman.push(YAKUMAN.大三元);
        yakumanPower += YAKUMAN.大三元.power;
    }

    if (isTsuiisou(handData)) {
        yakuman.push(YAKUMAN.字一色);
        yakumanPower += YAKUMAN.字一色.power;
    }

    if (isRyuiisou(handData)) {
        yakuman.push(YAKUMAN.緑一色);
        yakumanPower += YAKUMAN.緑一色.power;
    }

    if (isChinroutou(handData)) {
        yakuman.push(YAKUMAN.清老頭);
        yakumanPower += YAKUMAN.清老頭.power;
    }

    if (isIikantsu(handData)) {
        yakuman.push(YAKUMAN.一槓子);
        yakumanPower += YAKUMAN.一槓子.power;
    }

    if (isShosushi(handData)) {
        yakuman.push(YAKUMAN.小四喜);
        yakumanPower += YAKUMAN.小四喜.power;
    }

    if (isDaisushi(handData)) {
        yakuman.push(YAKUMAN.大四喜);
        yakumanPower += YAKUMAN.大四喜.power;
    }

    if (isIiankantanki(handData)) {
        yakuman.push(YAKUMAN.一暗槓単騎);
        yakumanPower += YAKUMAN.一暗槓単騎.power;
    }

    // 役満でない場合、通常の役判定を行う
    if (yakumanPower === 0) {
        // TODO 通常の役判定のコードを追加 ...
    }

    return { yaku, fans, yakuman, yakumanPower };
}

/**
 * 天和の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 天和かどうか
 */
function isTenho(handData) {
    // 親であることと、第一ツモであることを確認
    return PLAYER_IDS[dealerIndex] === getCurrentPlayerId() && remainingTilesCount === 119 && handData.isTsumo;
}

/**
 * 地和の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 地和かどうか
 */
function isChiho(handData) {
    const isAllMenzen = PLAYER_IDS.every(playerId => melds[playerId].length === 0);
    // 親以外であること、第一ツモであること、全員が門前であることを確認
    return PLAYER_IDS[dealerIndex] !== getCurrentPlayerId() &&
        remainingTilesCount >= 116 && handData.isTsumo &&
        isAllMenzen;
}

/**
 * 人和の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 人和かどうか
 */
function isRenho(handData) {
    // 第一ツモ前（＝牌を捨てていない）
    const isNoDiscards = discardedTiles[playerId].length === 0;

    const isAllMenzen = PLAYER_IDS.every(playerId => melds[playerId].length === 0);
    // 子であることと、全員が門前であること、第一ツモ前のロンであることを確認
    return PLAYER_IDS[dealerIndex] !== getCurrentPlayerId() && isAllMenzen && !handData.isTsumo && isNoDiscards;
}

/**
 * 大三元の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 大三元かどうか
 */
function isDaisangen(handData) {
    return handData.isSpecial2;
}

/**
 * 字一色の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 字一色かどうか
 */
function isTsuiisou(handData) {
    // 全ての牌が字牌かどうかを判定
    return handData.sortedTiles.every(tile => !tile.number);
}

/**
 * 緑一色の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 緑一色かどうか
 */
function isRyuiisou(handData) {
    // 緑一色を構成する牌のリスト
    const greenTiles = ['2索', '3索', '4索', '6索', '8索', '發'];

    // 全ての牌が緑一色を構成する牌かどうかを判定
    return handData.sortedTiles.every(tile => {
        const tileString = tile.number ? `${tile.number}${tile.suit}` : tile.suit;
        return greenTiles.includes(tileString);
    });
}

/**
 * 清老頭の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 清老頭かどうか
 */
function isChinroutou(handData) {
    // 清老頭を構成する牌のリスト
    const chinroutouTiles = ['1萬', '9萬', '1筒', '9筒', '1索', '9索'];

    // 全ての牌が清老頭を構成する牌かどうかを判定
    return handData.sortedTiles.every(tile => {
        const tileString = tile.number ? `${tile.number}${tile.suit}` : tile.suit;
        return chinroutouTiles.includes(tileString);
    });
}

/**
 * 一槓子の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 一槓子かどうか
 */
function isIikantsu(handData) {
    // 鳴き牌情報の中に、カンが含まれているかどうかを判定
    return handData.isTanki && melds[getCurrentPlayerId()].some(meld => meld.meldType.includes('kan'));
}

/**
 * 小四喜の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 小四喜かどうか
 */
function isShosushi(handData) {
    // tilesの最初の４つが東南西北ではないか
    return handData.isSpecial1 && !(handData.tiles.slice(0, 4).every(tile => ['東', '南', '西', '北'].includes(tile.suit)));
}

/**
 * 大四喜の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 大四喜かどうか
 */
function isDaisushi(handData) {
    // tilesの最初の４つが東南西北か
    return handData.isSpecial1 && handData.tiles.slice(0, 4).every(tile => ['東', '南', '西', '北'].includes(tile.suit));
}

/**
 * 一暗槓単騎の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 一暗槓単騎かどうか
 */
function isIiankantanki(handData) {
    // 鳴き牌情報の中に、暗カンが含まれているかどうかを判定
    return handData.isTanki && melds[getCurrentPlayerId()].some(meld => meld.meldType.includes('ankan'));
}

/**
 * 門前自摸和の判定を行う
 * @param {object} handData 手牌情報
 * @returns {boolean} 門前自摸和かどうか
 */
function isMenzenTsumo(handData) {
    // 鳴き牌がないことと、ツモであることを確認
    return handData.melds.length === 0 && handData.isTsumo;
}

// --- その他の関数 ---

function unlockAudio() {
    const dummySound = new Audio();
    dummySound.src = "Music/silent.mp3";
    dummySound.preload = 'auto';
    dummySound.volume = 0;

    // 音声の再生が開始された後に soundUnlocked を true に設定
    dummySound.onplaying = () => {
        soundUnlocked = true;
    };

    dummySound.play().catch(error => {
        console.error("ダミー音声の再生エラー:", error);
        // エラーが発生した場合の処理（例：ユーザーに音声を許可するように促す）
    });
}

// 音声を再生する関数
function playSound(sound) {
    if (!isMuted) {
        sound.currentTime = 0; // 再生位置を先頭に戻す
        sound.play();
    }
}


/**
 * 配列をシャッフルする
 * @param {Array} array シャッフルする配列
 */
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * 指定されたプレイヤーが牌を捨てられるかどうかを判定する
 * @param {string} playerId プレイヤーID
 * @returns {boolean} 牌を捨てられるかどうか
 */
function canDiscard(playerId) {
    const playerHandElement = playerHandElements[playerId];
    return playerHandElement.children.length === 5 || playerHandElement.children.length === 2;
}

/**
 * 指定されたプレイヤーのフリテン状態を更新する
 * @param {string} playerId プレイヤーID
 */
function updateFuritenStatus(playerId) {
    // 捨て牌にロン可能な牌が含まれているかチェック
    const handTiles = getHandTiles(playerId);
    let isRonPossibleInDiscarded = false;

    // フリテン判定用の捨て牌に対してのみチェック
    for (const tile of discardedTiles[playerId]) {
        const winningHandDataForFuriten = isWinningHand([...handTiles, tile], playerId, false);
        if (tile && winningHandDataForFuriten.isWinning) {
            isRonPossibleInDiscarded = true;
            break;
        }
    }

    // フリテン状態を更新
    isFuriten[playerId] = isRonPossibleInDiscarded;

    // フリテン状態に応じて画像を表示/非表示
    const furitenImage = document.getElementById(`${playerId}-furiten`);
    furitenImage.style.display = isFuriten[playerId] ? 'block' : 'none';
}

/**
 * 指定されたプレイヤーに牌を引かせる
 * @param {string} playerId プレイヤーID
 */
function drawTile(playerId) {
    hideAllTsumoButtons(); // すべてのツモボタンを非表示に
    hideAllRonButtons();   // すべてのロンボタンを非表示に
    hideAllPonButtons(); // すべてのポンボタンを非表示に
    hideAllKanButtons(); // すべてのカンボタンを非表示に
    hideAllSkipButtons();   // すべてのスキップボタンを非表示に

    if (allTiles.length > 0) {
        const tile = allTiles.pop();
        addTileToHand(playerId, tile, true);

        // 残り牌数を更新
        remainingTilesCount = allTiles.length;
        // 残り牌数の表示を更新
        if (remainingTilesCount < 0) { //TODO テスト用
            console.log("流局です。次の局に進みます。");
            proceedToNextRound();
        } else {
            updateRemainingTilesDisplay();
            // ツモ音を再生
            playSound(dahaiSound);
        }

        if (remainingTilesCount >= 1) {
            // 加カン判定
            if (checkKakan(playerId, tile)) {
                // 加カンが可能なら、カンボタンとスキップボタンを表示
                showKanButtons(playerId);
                showSkipButtons(playerId);

                // カンボタンのイベントリスナーを設定 (targetPlayerIdはnull)
                setupKanButtonListener(playerId, null, tile);

                // スキップボタンのイベントリスナーを設定
                setupSkipButtonListener(playerId, true);
            }

            // 暗カン判定
            const handTiles = getHandTiles(playerId);
            const tileCounts = countTileOccurrences(separateAndSortTiles(handTiles));
            let fourOfAKindTiles = '';

            for (const tile in tileCounts) {
                if (tileCounts[tile] === 4) {
                    fourOfAKindTiles = tile.slice(-1) + tile.slice(0, -1);
                    break;
                }
            }
            if (checkKan(playerId, null)) {
                // カンボタンとスキップボタンを表示
                showKanButtons(playerId);
                showSkipButtons(playerId);

                // カンボタンのイベントリスナーを設定
                setupKanButtonListener(playerId, null, fourOfAKindTiles);

                // スキップボタンのイベントリスナーを設定
                setupSkipButtonListener(playerId, true);
            }
        }
        // ツモ判定を行う
        checkTsumo(playerId);

        if (isRonDeclared) {
            return;
        }
    }
}

/**
 * 指定されたプレイヤーに初期手牌を配る
 * @param {string} playerId プレイヤーID
 */
function generateInitialHand(playerId) {
    hideAllTsumoButtons(); // すべてのツモボタンを非表示に
    hideAllRonButtons();   // すべてのロンボタンを非表示に
    hideAllPonButtons(); // すべてのポンボタンを非表示に
    hideAllKanButtons(); // すべてのカンボタンを非表示に
    hideAllSkipButtons();   // すべてのスキップボタンを非表示に

    const numTiles = 4 // 4枚引く
    for (let i = 0; i < numTiles; i++) {
        const tile = allTiles.pop();
        addTileToHand(playerId, tile);
    }

    // 手牌をソート
    sortHand(playerId);
}

/**
 * 現在のプレイヤーのIDを取得する
 * @returns {string} 現在のプレイヤーID
 */
function getCurrentPlayerId() {
    return PLAYER_IDS[currentPlayerIndex];
}

/**
 * 指定されたプレイヤーのロンボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showRonButtons(playerId) {
    ronButtons[playerId].style.display = 'block';
}

/**
 * 指定されたプレイヤーのポンボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showPonButtons(playerId) {
    ponButtons[playerId].style.display = 'block';
}

/**
 * 指定されたプレイヤーのカンボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showKanButtons(playerId) {
    kanButtons[playerId].style.display = 'block';
}

/**
 * 指定されたプレイヤーのツモボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showTsumoButtons(playerId) {
    tsumoButtons[playerId].style.display = 'block';
}

/**
 * 指定されたプレイヤーのスキップボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showSkipButtons(playerId) {
    skipButtons[playerId].style.display = 'block';
}

/**
 * スキップボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 * @param {boolean} isTsumo ツモかどうか
 */
function setupSkipButtonListener(playerId, isTsumo) {
    skipButtons[playerId].onclick = () => {
        // ボタンを非表示
        hideAllRonButtons();
        hideAllPonButtons();
        hideAllKanButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        handleSkip(playerId, isTsumo);
    };
}

/**
 * スキップボタンがクリックされた時の処理
 * @param {boolean} playerId プレイヤーID
 * @param {boolean} isTsumo ツモかどうか
 */
function handleSkip(playerId, isTsumo) {
    // ロンでスキップしたらフリテン判定
    if (!isTsumo) {
        isFuriten[playerId] = true;
        // フリテン状態に応じて画像を表示/非表示
        const furitenImage = document.getElementById(`${playerId}-furiten`);
        furitenImage.style.display = isFuriten[playerId] ? 'block' : 'none';
    }
    skipFlags[playerId] = true;
}

/**
 * すべてのツモボタンを非表示にする
 */
function hideAllTsumoButtons() {
    Object.values(tsumoButtons).forEach(button => button.style.display = 'none');
}

/**
 * すべてのロンボタンを非表示にする
 */
function hideAllRonButtons() {
    Object.values(ronButtons).forEach(button => button.style.display = 'none');
}

/**
 * すべてのポンボタンを非表示にする
 */
function hideAllPonButtons() {
    Object.values(ponButtons).forEach(button => button.style.display = 'none');
}

/**
 * すべてのカンボタンを非表示にする
 */
function hideAllKanButtons() {
    Object.values(kanButtons).forEach(button => button.style.display = 'none');
}

/**
 * すべてのスキップボタンを非表示にする
 */
function hideAllSkipButtons() {
    Object.values(skipButtons).forEach(button => button.style.display = 'none');
}

/**
 * 指定されたプレイヤーの手牌を取得する
 * @param {string} playerId プレイヤーID
 * @returns {string[]} 手牌の牌の文字列表現の配列
 */
function getHandTiles(playerId) {
    const playerHandElement = playerHandElements[playerId];
    // querySelectorAll('img') を使って、すべての img 要素を取得
    return Array.from(playerHandElement.querySelectorAll('img')).map(imgElement => imgElement.alt);
}

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

// --- イベントリスナー ---

// ミュートボタンのクリックイベントリスナー
muteButton.addEventListener('click', () => {
    // 音声のオン/オフ状態を切り替える
    isMuted = !isMuted;

    // すべての音声要素に対してミュート状態を適用
    const audioElements = document.querySelectorAll('audio');
    audioElements.forEach(audio => {
        audio.muted = isMuted;
    });

    // ボタンの画像を変更
    muteButtonImage.src = isMuted ? 'Picture/mute.png' : 'Picture/unmute.png';
});

// 戻るボタンのクリックイベントリスナー
backToTitleButton.addEventListener('click', () => {
    // index.html に遷移
    window.location.href = 'index.html';
});

// 読み込み時のイベントリスナー
document.addEventListener('DOMContentLoaded', () => {

    // 初期化時に実行
    resizeAppContainer();

    // 画面リサイズ時に実行
    window.addEventListener('resize', resizeAppContainer);

    // 各プレイヤーの手牌のイベントリスナーを設定
    PLAYER_IDS.forEach(playerId => {
        const playerHandElement = document.getElementById(playerId + '-hand');
        playerHandElement.addEventListener('click', (event) => {
            const tileElement = event.target;
            if (tileElement.classList.contains('tile')) {
                const tile = tileElement.textContent;
                handleTileClick(playerId, tile, tileElement);
            }
        });
    });

    // ゲームの初期化処理を呼び出す
    initializeGame();
});