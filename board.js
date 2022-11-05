function CrossGame(selector) {
    // this = {}
    // this.__proto__ = CrossGame.prototype; // { constructor: CrossGame }

    this.listeners = {};

    this.$root = document.querySelector(selector);
    this.$board = this.$root.querySelector('.cross__board');
    this.$cells = Array.from(this.$root.querySelectorAll('.cross__board--row'))
        .map($row => Array.from($row.querySelectorAll('.cross__board-item')));

    this.setInitialBoard();
    this.clearBoard();

    this.$board.addEventListener('click', this.handleClick.bind(this));
    this.$board.addEventListener('animationend', this.handleAnimation.bind(this));

    // return this;
}

CrossGame.EMPTY = '';
CrossGame.CROSS = 'x';
CrossGame.ZERO  = 'o';
CrossGame.ERRORS = {
    101: 'Ячейка не пуста, ходить нельзя',
    102: 'Ожидайте разрешение хода',
}
CrossGame.STATUS = {
    STARTED: 'Game started',
    RENDER: 'Cross or Zero rendered',
    PAUSE: 'Game paused',
    FINISH: 'Game finished',
}
CrossGame.LINE_TYPE = {
    ROW: 'row',
    COLUMN: 'column',
    DIAGONAL: 'diagonal'
}
CrossGame.EVENTS = {
    WIN: 'win',
    DRAW: 'draw',
    NEXT_STEP: 'nextStep',
    NEW_GAME: 'newGame',
}

CrossGame.prototype.startNewGame = function () {
    this.setInitialBoard();
    this.clearBoard();
    
    this.dispatch(CrossGame.EVENTS.NEW_GAME);
}

CrossGame.prototype.addEventListener = function (eventName, eventListener) {
    if (!this.listeners[eventName]) {
        this.listeners[eventName] = [];
    }

    this.listeners[eventName].push(eventListener);
}

CrossGame.prototype.removeEventListener = function (eventName, eventListener) {
    if (!this.listeners[eventName]) {
        return ;
    }

    this.listeners[eventName] = this.listeners[eventName]
        .filter(listener => listener !== eventListener );
}

CrossGame.prototype.dispatch = function (eventName, data = {}) {
    if (!this.listeners[eventName]) {
        return ;
    }

    const e = {
        name: eventName,
        ...data
    };

    this.listeners[eventName].forEach(listener => listener.call(this, e) );
}

CrossGame.prototype.handleAnimation = function (e) {
    const { animationName, target } = e;

    if (animationName === 'a-o' || (animationName === 'a-x' && target.classList.contains('x__line2'))) {
        this.stepComplete();
    }
}

CrossGame.prototype.stepComplete = function () {
    if (this.checkWin(this.curentUser)) {
        this.dispatch(CrossGame.EVENTS.WIN);

        return ;
    }

    if (this.checkDraw()) {
        this.dispatch(CrossGame.EVENTS.DRAW);

        return ;
    }

    // игра продолжается
    this.setStatusStarted();
    // передача хода
    this.curentUser = this.curentUser === CrossGame.CROSS ? CrossGame.ZERO : CrossGame.CROSS;

    this.dispatch(CrossGame.EVENTS.NEXT_STEP);
}

CrossGame.prototype.getLines = function () {
    const lines = [];

    lines.push({
        type: CrossGame.LINE_TYPE.DIAGONAL,
        index: 0,
        cords: [
            x1=50, 
            y1=12.5, 
            x2=100, 
            y2=62.5,
        ],
        data: [
            this.board[0][0],
            this.board[1][1],
            this.board[2][2],
        ]
    }, {
        type: CrossGame.LINE_TYPE.DIAGONAL,
        index: 1,
        cords: [
            x1=50, 
            y1=62.5, 
            x2=100, 
            y2=12.5,
        ],
        data: [
            this.board[0][2],
            this.board[1][1],
            this.board[2][0],
        ]
    });

    for (let i=0; i < 3; i++) {
        lines.push({
            type: CrossGame.LINE_TYPE.ROW,
            index: i,
            cords: [
                x1=50, 
                y1=i * 25 + 12.5, 
                x2=100, 
                y2=i * 25 + 12.5,
            ],
            data: this.board[i],
        }, {
            type: CrossGame.LINE_TYPE.COLUMN,
            index: i,
            cords: [
                x1=i * 25 + 50, 
                y1=12.5, 
                x2=i * 25 + 50, 
                y2=62.5,
            ],
            data: [
                this.board[0][i],
                this.board[1][i],
                this.board[2][i],
            ],
        });
    }

    return lines;
}

CrossGame.prototype.isLineWin = function (line, winSymbol) {
    return line.data.every(symbol => symbol === winSymbol);
}

CrossGame.prototype.checkWin = function (curentUser) {
    const lines = this.getLines();
    const winLine = lines.find(line => this.isLineWin(line, curentUser));

    if (winLine) {
        this.status = CrossGame.STATUS.FINISH;
        this.winLine = winLine;
        this.render();
        return true;
    }

    return false;
}

CrossGame.prototype.checkDraw = function () {
    const rowWithEmptySymbol = this.board.find(row => row.some(symbol => symbol === CrossGame.EMPTY));

    if (!rowWithEmptySymbol) {
        this.status = CrossGame.STATUS.FINISH;
        this.winLine = null;

        return true;
    }

    return false;
}

CrossGame.prototype.handleClick = function (e) {
    const { target } = e;
    const $cell = target.closest('.cross__board-item');
    const rowIndex = this.$cells.findIndex(($rowCells) => $rowCells.includes($cell));
    const cellIndex = this.$cells[rowIndex].findIndex($cellRef => $cellRef === $cell);

    this.step(rowIndex, cellIndex);
}

CrossGame.prototype.setInitialBoard = function () {
    this.board = [
        [CrossGame.EMPTY, CrossGame.EMPTY, CrossGame.EMPTY],
        [CrossGame.EMPTY, CrossGame.EMPTY, CrossGame.EMPTY],
        [CrossGame.EMPTY, CrossGame.EMPTY, CrossGame.EMPTY]
    ];
    this.curentUser = CrossGame.CROSS;
    this.status     = CrossGame.STATUS.STARTED;
    this.winLine    = null;
    this.steps      = [];
}

CrossGame.prototype.clearBoard = function () {
    this.$cells.forEach($rowCells => {
        $rowCells.forEach($cell => $cell.innerText = '')
    });
    
}

CrossGame.prototype.createCross = function () {
    const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    $svg.setAttribute('class', 'x cross__board-item-el');
    $svg.setAttribute('viewBox', '0 0 80 80');

    $svg.innerHTML = `
        <line class="x__line1" x1="20" y1="10" x2="60" y2="70"/>
        <line class="x__line2" x1="60" y1="10" x2="20" y2="70"/>
    `;

    return $svg;
}

CrossGame.prototype.createZero = function () {
    const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    $svg.setAttribute('class', 'o cross__board-item-el');
    $svg.setAttribute('viewBox', '0 0 80 80');

    $svg.innerHTML = `<ellipse cx="40" cy="40" rx="20" ry="30"/>`;

    return $svg;
}

CrossGame.prototype.createLine = function (x1, y1, x2, y2) {
    const $svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    $svg.setAttribute('class', 'cross__board-item-elem');
    $svg.setAttribute('viewBox', '0 0 150 80');

    $svg.innerHTML = `<line class="line" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;

    return $svg;
}

CrossGame.prototype.deleteLine = function () {
    const $svg = document.querySelector('.cross__board-item-elem');
    $svg.remove();
}

CrossGame.prototype.setStatusRender = function () {
    this.status = CrossGame.STATUS.RENDER;
}

CrossGame.prototype.setStatusStarted = function () {
    this.status = CrossGame.STATUS.STARTED;
}

CrossGame.prototype.render = function () {
    this.board.forEach((rowData, rowIndex) => {
        rowData.forEach((cellData, cellIndex) => {
            const $cell = this.$cells[rowIndex][cellIndex];

            if (cellData !== CrossGame.EMPTY && $cell.innerHTML.length > 0) {
                return ;
            }

            if (cellData === CrossGame.CROSS) {
                $cell.append( this.createCross() );
                this.setStatusRender();
            } else if (cellData === CrossGame.ZERO) {
                $cell.append( this.createZero() );
                this.setStatusRender();
            }
        });
    })
    if(this.winLine){
        this.$board.append(this.createLine(this.winLine.cords[0], this.winLine.cords[1], this.winLine.cords[2], this.winLine.cords[3])); 
    }
}

CrossGame.prototype.step   = function (rowIndex, cellIndex) {
    // проверить разрешен ли ход
    if (this.status !== CrossGame.STATUS.STARTED) {
        // ходить нельзя
        throw new Error(CrossGame.ERRORS[102]);
    }

    // проверяем пустая ли ячейка?
    const cellData = this.board[rowIndex][cellIndex];

    if (cellData !== CrossGame.EMPTY) {
        // ходить нельзя
        throw new Error(CrossGame.ERRORS[101]);
    }

    // ходить можно
    this.board[rowIndex][cellIndex] = this.curentUser;

    this.steps.push({
        rowIndex,
        cellIndex,
        symbol: this.curentUser
    });

    this.render();
}

console.dir( CrossGame );
