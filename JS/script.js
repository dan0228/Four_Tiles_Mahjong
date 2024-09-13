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
let isRonPossible = false; // ロン可能
let isRonSkip = false; // ロンスキップ
let isDealerHola = false; // 親和了
let isRoundEnding = false; // 局の終了処理中かどうかを示すフラグ
let remainingTilesCount = 136; // 残り牌数
let playerScores = {}; // プレイヤーの点数を格納するオブジェクト

// 局数と親の順番を管理する変数を追加
let currentRound = 1; // 現在の局数
let dealerIndex = Math.floor(Math.random() * PLAYER_IDS.length); // 親のインデックス

// 牌の情報を格納する変数
let allTiles = [];
let discardedTiles = {}; // プレイヤーIDをキーに、最後に捨てられた牌を格納

// DOM要素をキャッシュする
let playerHandElements = {};
let playerDiscardedElements = {};
let tsumoButtons = {};
let ronButtons = {};
let skipButtons = {};
let remainingTilesElement = null; // 残り牌数を表示する要素をキャッシュ

// audioタグを取得
const dahaiSound = document.getElementById("dahaiSound");
let soundUnlocked = false;

// ミュートボタンの要素を取得
const muteButton = document.getElementById('mute-button');
// ミュートボタンの画像要素を作成
const muteButtonImage = document.createElement('img');
muteButtonImage.src = 'Picture/ミュート解除.png'; // 初期状態の画像を設定
muteButton.appendChild(muteButtonImage); // 画像をボタンに追加

// 音声のオン/オフ状態を管理する変数
let isMuted = false;

// ユーザーインタラクションを待ってからダミー音声を読み込む
document.addEventListener('click', () => {
    if (!soundUnlocked) {
        unlockAudio();
    }
});

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
    muteButtonImage.src = isMuted ? 'Picture/ミュート.png' : 'Picture/ミュート解除.png';
});

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
        imgFileName = `${suit}_${number}.png`;
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

    imgElement.src = `picture/${imgFileName}`; // 修正後の画像ファイルパス
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
    tileElement.addEventListener('click', () => {
        handleTileClick(playerId, tile, tileElement);
    });
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
    const playerDiscardedElement = playerDiscardedElements[playerId];
    if (!playerDiscardedElement) {
        console.error(`Element with ID ${playerId}-discarded not found.`);
        return;
    }
    const discardedTileElement = createTileElement(tile, true); // 捨て牌であることを指定
    playerDiscardedElement.appendChild(discardedTileElement);

    // 捨て牌リストを更新
    discardedTiles[playerId] = tile;
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

    // 残り牌数の表示を更新
    updateRemainingTilesDisplay();

    // 親を初期化
    dealerIndex = Math.floor(Math.random() * PLAYER_IDS.length);
    currentPlayerIndex = dealerIndex; // 最初の親はランダムに決定

    // 各プレイヤーに初期手牌を配る
    PLAYER_IDS.forEach((playerId, index) => {
        generateInitialHand(playerId);
    });
    // 残り牌数を初期化
    remainingTilesCount = allTiles.length - 13; //ドラ以外の王牌を引く

    // プレイヤーの初期スコアを設定
    PLAYER_IDS.forEach(playerId => {
        playerScores[playerId] = 25000;
    });
    updatePlayerScoresDisplay();

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
        tsumoButtons[playerId] = document.getElementById(playerId + '-tsumo-button');
        ronButtons[playerId] = document.getElementById(playerId + '-ron-button');
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
    hundredsImage.src = `Picture/${paddedRemainingTiles[0]}ao.png`;
    tensImage.src = `Picture/${paddedRemainingTiles[1]}ao.png`;
    onesImage.src = `Picture/${paddedRemainingTiles[2]}ao.png`;
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
            digitImage.src = `Picture/${scoreString[i]}.png`;
            digitImage.alt = scoreString[i];
            scoreElement.appendChild(digitImage);
        }
    });
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

    // ロンが成立したらhandleRonCheck関数が終了してから後続処理が行われるようループ
    while (isRonDeclared) {
        // 一定時間待機 (ブラウザがフリーズしないように)
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // 子が和了したか、流局のとき
    if (!isDealerHola) {
        currentRound++;
        dealerIndex = (dealerIndex + 1) % PLAYER_IDS.length; // 親を反時計回りに移動
        currentPlayerIndex = dealerIndex; // 次の親からスタート
    } else {
        currentPlayerIndex = dealerIndex; // 親が和了したので親からスタート
    }

    // フラグの初期化
    isRonPossible = false;
    isRonSkip = false;
    isDealerHola = false;
    isRonDeclared = false;

    // 牌を初期化
    initializeTiles();

    // 各プレイヤーの手牌をリセット
    PLAYER_IDS.forEach(playerId => {
        playerHandElements[playerId].innerHTML = ''; // 手牌をクリア
    });

    // 捨て牌エリアをリセット
    PLAYER_IDS.forEach(playerId => {
        playerDiscardedElements[playerId].innerHTML = ''; // 捨て牌をクリア
    });
    discardedTiles = {}; // 捨て牌情報をリセット

    // 残り牌数を初期化
    remainingTilesCount = allTiles.length - 13; //ドラ以外の王牌を引く
    updateRemainingTilesDisplay();

    // 各プレイヤーに初期手牌を配る
    PLAYER_IDS.forEach((playerId, index) => {
        generateInitialHand(playerId);
    });

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
    if (isRonDeclared) {
        return;
    }
    // ツモ判定を行う
    checkTsumo(playerId);
}

/**
 * 最後に追加された牌にクリックイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 */
function setupLastTileClickListener(playerId) {
    const playerHandElement = playerHandElements[playerId];
    const lastTileElement = playerHandElement.lastChild; // 最後に追加された牌を取得

    if (lastTileElement) {
        lastTileElement.addEventListener('click', () => {
            const tile = lastTileElement.textContent;
            handleTileClick(playerId, tile, lastTileElement);
        });
    }
}

/**
 * 現在のプレイヤーのターンを終了し、次のプレイヤーにターンを移す
 */
function endTurn() {
    // 次のプレイヤーのターンを開始
    if (!isRonDeclared) {
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

        // 打牌音を再生
        playSound(dahaiSound);

        // ロン判定と処理
        handleRonCheck(playerId, tile);
    }
}

/**
 * ロン判定と処理を行う
 * @param {string} playerId 牌を捨てたプレイヤーID
 * @param {string} discardedTile 捨てられた牌の文字列
 */
async function handleRonCheck(playerId, discardedTile) {
    // ロン判定前にフラグをリセット
    isRonSkip = false;

    // 捨て牌リストを更新
    discardedTiles[playerId] = discardedTile;

    // 現在のプレイヤーのインデックスを取得
    const currentPlayerIndex = PLAYER_IDS.indexOf(playerId);

    // 現在のプレイヤーの次の人から反時計回りにロン判定を行う
    for (let i = 1; i < PLAYER_IDS.length; i++) {
        const otherPlayerIndex = (currentPlayerIndex + i) % PLAYER_IDS.length;
        const otherPlayerId = PLAYER_IDS[otherPlayerIndex];

        if (checkRon(otherPlayerId, playerId)) {
            // ロン可能である場合にtrueにする
            isRonPossible = true;

            // ロンボタンとスキップボタンを表示
            showRonButtons(otherPlayerId);

            // ロンボタンのイベントリスナーを設定
            setupRonButtonListener(otherPlayerId);

            // スキップボタンのイベントリスナーを設定
            setupSkipButtonListener(otherPlayerId, false);

            // ロン判定がTrueになったらループを抜ける(頭ハネ)
            break;
        }
    }

    while (isRonPossible && !isRonSkip) {
        // ロンが成立したら関数を終了
        if (isRonDeclared) {
            isRonDeclared = false;
            isRonPossible = false;
            isRonSkip = false;
            return;
        }
        // 一定時間待機 (ブラウザがフリーズしないように)
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    // ロン可能出なかった場合もしくはロン可能でスキップした場合にターンを終了
    if (!isRonPossible || isRonSkip) {
        endTurn();
    }
    isRonPossible = false;
    isRonSkip = false;
}

/**
 * ロンボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 */
function setupRonButtonListener(playerId) {
    ronButtons[playerId].addEventListener('click', () => {
        // ロン宣言済み
        isRonDeclared = true;

        // ロンボタン、ツモボタン、スキップボタンを非表示
        hideAllRonButtons();
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // ロン処理の実装
        handleRon(playerId);
    });
}

/**
 * ツモボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 */
function setupTsumoButtonListener(playerId) {
    tsumoButtons[playerId].addEventListener('click', () => {
        // ツモボタンとスキップボタンを非表示
        hideAllTsumoButtons();
        hideAllSkipButtons();

        // ツモ処理の実装
        handleTsumo(playerId);
    });
}

/**
 * ロン処理を行う
 * @param {string} playerId ロンを宣言したプレイヤーID
 */
function handleRon(playerId) {
    console.log(`${playerId} がロンしました！`);

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

// --- 判定に関する関数 ---

/**
 * ツモ判定を行う
 * @param {string} playerId プレイヤーID
 * @returns {boolean} ツモかどうか
 */
function checkTsumo(playerId) {
    const handTiles = getHandTiles(playerId);

    if (isWinningHand(handTiles)) {
        // 該当するプレイヤーのツモボタンとスキップボタンを表示
        tsumoButtons[playerId].style.display = 'block';
        skipButtons[playerId].style.display = 'block';

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
    const lastDiscardedTile = discardedTiles[discardPlayerId];

    if (lastDiscardedTile) {
        return isWinningHand([...handTiles, lastDiscardedTile]);
    }

    return false;
}

/**
 * 和了判定を行う
 * @param {string[]} tiles 牌の文字列配列
 * @returns {boolean} 和了かどうか
 */
function isWinningHand(tiles) {
    if (tiles.length !== 5) {
        return false; // 牌の数が5枚でなければ和了ではない
    }

    // 牌を種類と数字に分離してソート
    const sortedTiles = tiles.map(tile => {
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

    // 各牌の出現回数をカウント
    const tileCounts = {};
    for (const tile of sortedTiles) {
        // 字牌の場合、数字を含めない
        const tileKey = tile.number !== null ? `${tile.suit}${tile.number}` : `${tile.suit}`;
        tileCounts[tileKey] = (tileCounts[tileKey] || 0) + 1;
    }

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
        return false;
    }

    // 対子(候補)を取り除いた牌のリストを作成
    const remainingTiles = sortedTiles.filter(tile => {
        // 字牌の場合、数字を含めない
        const tileKey = tile.number !== null ? `${tile.suit}${tile.number}` : `${tile.suit}`;
        return tileKey !== pairTile;
    });
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
    return checkMeld(remainingTiles);
}

/**
 * 面子（順子または刻子）判定を行う
 * @param {object[]} tiles 牌オブジェクトの配列
 * @returns {boolean} 面子かどうか
 */
function checkMeld(tiles) {
    // 刻子判定
    if (tiles.length >= 3 && tiles[0].suit === tiles[1].suit && tiles[1].suit === tiles[2].suit && tiles[0].number === tiles[1].number && tiles[1].number === tiles[2].number) {
        return true;
    }

    // 順子判定
    for (let i = 0; i < tiles.length - 2; i++) {
        if (
            tiles[i].suit === tiles[i + 1].suit && // 同じ種類であることを確認
            tiles[i].suit === tiles[i + 2].suit && // 同じ種類であることを確認
            tiles[i + 1].number === tiles[i].number + 1 && // i+1番目の牌がi番目の牌の次の数字であることを確認
            tiles[i + 2].number === tiles[i + 1].number + 1 // i+2番目の牌がi+1番目の牌の次の数字であることを確認
        ) {
            return true;
        }
    }

    return false; // 刻子も順子も作れない場合は和了不可能
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
    if (soundUnlocked) {
        sound.currentTime = 0;
        sound.play().catch(error => {
            console.error("音声の再生エラー:", error);
            // エラーが発生した場合の処理（例：ユーザーに音声を許可するように促す）
        });
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
    return playerHandElement.children.length > 4;
}

/**
 * 指定されたプレイヤーに牌を引かせる
 * @param {string} playerId プレイヤーID
 */
function drawTile(playerId) {
    hideAllTsumoButtons(); // すべてのツモボタンを非表示に
    hideAllRonButtons();   // すべてのロンボタンを非表示に
    hideAllSkipButtons();   // すべてのスキップボタンを非表示に

    if (allTiles.length > 0) {
        const tile = allTiles.pop();
        // ツモ牌として追加することを明示的に伝える
        addTileToHand(playerId, tile, true);
        if (isRonDeclared) {
            return;
        }
        // 残り牌数を更新
        remainingTilesCount = allTiles.length - 13;
        // 残り牌数の表示を更新
        updateRemainingTilesDisplay();
        // ツモ音を再生
        playSound(dahaiSound);

        // 残り牌数が0枚になったら局終了
        if (remainingTilesCount == 0) {
            console.log("流局です。次の局に進みます。");
            proceedToNextRound();
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
 * 指定されたプレイヤーのロンボタンとスキップボタンを表示する
 * @param {string} playerId プレイヤーID
 */
function showRonButtons(playerId) {
    ronButtons[playerId].style.display = 'block';
    skipButtons[playerId].style.display = 'block';
}

// handleSkip を呼び出す関数を定義
function handleSkipClick(isTsumo) {
    handleSkip(isTsumo);
}

/**
 * スキップボタンのイベントリスナーを設定する
 * @param {string} playerId プレイヤーID
 * @param {boolean} isTsumo ツモかどうか
 */
function setupSkipButtonListener(playerId, isTsumo) {
    const skipButton = skipButtons[playerId];

    // 既存のイベントリスナーを削除
    skipButton.removeEventListener('click', handleSkipClick);

    // 新しいイベントリスナーを設定
    skipButton.addEventListener('click', () => {
        handleSkip(isTsumo);
    });
}

/**
 * スキップボタンがクリックされた時の処理
 * @param {boolean} isTsumo ツモかどうか
 */
function handleSkip(isTsumo) {
    // ロンボタン、ツモボタン、スキップボタンを非表示
    hideAllRonButtons();
    hideAllTsumoButtons();
    hideAllSkipButtons();

    // ロンでスキップしたらターンを進める
    if (!isTsumo) {
        isRonSkip = true;
    }
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