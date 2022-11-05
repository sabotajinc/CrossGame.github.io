const game = new CrossGame('.game.cross');
const settings = new GameSettins({
    selector: '.game.actions',
    changeHandler: onRobotNameChange,
    submitHandler: onStartGame,
});
const computerRobot = {
    [CrossGame.CROSS]: false,
    [CrossGame.ZERO]: false,
};

console.log({ game, settings, computerRobot });

game.addEventListener(CrossGame.EVENTS.WIN, ()=> setTimeout(onWin, 1000));
game.addEventListener(CrossGame.EVENTS.DRAW, onDraw);
game.addEventListener(CrossGame.EVENTS.NEXT_STEP, onNextStep);
game.addEventListener(CrossGame.EVENTS.NEW_GAME, onStartNewGame);

function onWin() {
    if(confirm(`Победили ${game.curentUser === CrossGame.CROSS ? 'крестики' : 'нолики'} \nНачать новую игру?`)) {
        game.deleteLine();
        game.startNewGame();
    }
}

function onDraw() {
    if (confirm('Ничья. Сыграть еще раз?')) {
        game.startNewGame();
    }
}

function onStartNewGame() {
    if (computerRobot[CrossGame.CROSS]) {
        const { rowIndex, cellIndex } = CrossRobot.getXStep(game);

        game.step(rowIndex, cellIndex);
    }
}

function onNextStep() {
    if (computerRobot[game.curentUser]) {
        const { rowIndex, cellIndex } = CrossRobot.getStep(game.curentUser, game);

        game.step(rowIndex, cellIndex);
    }
}

function onRobotNameChange() {
    if (confirm('Начать новую игру?')) {
        onStartGame();
    }
}

function onStartGame() {
    // какие настройки игры?
    switch (settings.robotName.toUpperCase()) {
        case 'COMPUTER': {
            // Компьютер играет сам
            computerRobot[CrossGame.CROSS] = true;
            computerRobot[CrossGame.ZERO] = true;
            break;
        }
        case 'O': {
            // Компьютер играет ноликами
            computerRobot[CrossGame.CROSS] = false;
            computerRobot[CrossGame.ZERO] = true;
            break;
        }
        case 'X': {
            // Компьютер играет крестиками
            computerRobot[CrossGame.CROSS] = true;
            computerRobot[CrossGame.ZERO] = false;
            break;
        }
        case 'HUMAN': {
            // Играть с человеком
            computerRobot[CrossGame.CROSS] = false;
            computerRobot[CrossGame.ZERO] = false;
            break;
        }
    }

    // старт новой игры
    game.startNewGame();
}
