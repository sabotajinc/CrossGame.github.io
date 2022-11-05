class CrossRobot {
    static CENTER_CELL = {
        rowIndex: 1,
        cellIndex: 1,
    }

    static CORNERS = [
        {
            rowIndex: 0,
            cellIndex: 0,
        },
        {
            rowIndex: 0,
            cellIndex: 2,
        },
        {
            rowIndex: 2,
            cellIndex: 2,
        },
        {
            rowIndex: 2,
            cellIndex: 0,
        }
    ]

    static SIDES = [
        {
            rowIndex: 0,
            cellIndex: 1,
        },
        {
            rowIndex: 1,
            cellIndex: 2,
        },
        {
            rowIndex: 2,
            cellIndex: 1,
        },
        {
            rowIndex: 1,
            cellIndex: 0,
        }
    ]

    static getStep(user, game) {
        if (user === CrossGame.CROSS) {
            return CrossRobot.getXStep(game);
        } else if (user === CrossGame.ZERO) {
            return CrossRobot.getZeroStep(game);
        }

        throw new Error(`uncknown user: ${user}`);
    }

    static getXStep(game) {
        if (game.steps.length === 0) {
            return CrossRobot.CENTER_CELL;
        }

        // проверяю правило 1
        const lines = game.getLines();
        const userNearWinLine = CrossRobot.getUserNearWinLine(CrossGame.CROSS, lines);

        if (userNearWinLine) {
            return CrossRobot.createStepToEmptyCell(userNearWinLine);
        }

        // проверяю правило 2
        const enemyNearWinLine = CrossRobot.getUserNearWinLine(CrossGame.ZERO, lines);

        if (enemyNearWinLine) {
            return CrossRobot.createStepToEmptyCell(enemyNearWinLine);
        }

        // делаем ход в тот из свободных углов, который дальше всего от предыдущего хода ноликов
        const lastEnemyStep = game.steps[game.steps.length - 1];
        const farCorner = CrossRobot.getFarFreeCorner(game.board, lastEnemyStep);

        if (farCorner) {
            return farCorner;
        }

        // ход в любую клетку
        return CrossRobot.getRandomStep(game.board);
    }

    static getZeroStep(game) {
        // проверяю правило 1
        const lines = game.getLines();
        const userNearWinLine = CrossRobot.getUserNearWinLine(CrossGame.ZERO, lines);

        if (userNearWinLine) {
            return CrossRobot.createStepToEmptyCell(userNearWinLine);
        }

        // проверяю правило 2
        const enemyNearWinLine = CrossRobot.getUserNearWinLine(CrossGame.CROSS, lines);

        if (enemyNearWinLine) {
            return CrossRobot.createStepToEmptyCell(enemyNearWinLine);
        }

        // Если крестики сделали первый ход в центр
        const firstStep = game.steps[0];

        if (CrossRobot.isPositionsEqual(firstStep, CrossRobot.CENTER_CELL)) {
            // до конца игры ходить в любой угол
            const randomFreeCorner = CrossRobot.getRandomCornerStep(game.board);

            if (randomFreeCorner) {
                return randomFreeCorner;
            }

            // если это невозможно — в любую клетку.
            return CrossRobot.getRandomStep(game.board);
        }

        // Если крестики сделали первый ход в угол
        if (CrossRobot.isPositionCorner(firstStep)) {
            // ответить ходом в центр
            if (game.steps.length === 1) {
                return CrossRobot.CENTER_CELL;
            }

            // Следующим ходом занять угол, противоположный первому ходу крестиков
            if (game.steps.length === 3) {
                const oppositeCorner = CrossRobot.getOppositeCorner(firstStep);

                if (CrossRobot.isPositionFree(oppositeCorner, game.board)) {
                    return oppositeCorner;
                }

                // а если это невозможно — пойти на сторону.
                return CrossRobot.getRandomSideStep(game.board);
            }
        }

        // Если крестики сделали первый ход на сторону
        if (CrossRobot.isPositionSide(firstStep)) {
            // ответить ходом в центр
            if (game.steps.length === 1) {
                return CrossRobot.CENTER_CELL;
            }

            if (game.steps.length === 3) {
                const nextCrossStep = game.steps[2];

                // Если следующий ход крестиков — в угол
                if (CrossRobot.isPositionCorner(nextCrossStep)) {
                    // занять противоположный угол
                    return CrossRobot.getOppositeCorner(nextCrossStep);
                }

                // Если следующий ход крестиков — на противоположную сторону
                const oppositeSide = CrossRobot.getOppositeSide(firstStep);

                if (CrossRobot.isPositionsEqual(oppositeSide, nextCrossStep)) {
                    // пойти в любой угол
                    return CrossRobot.getRandomCornerStep(game.board);
                }

                // Если следующий ход крестиков — на сторону рядом с их первым ходом, пойти в угол рядом с обоими крестиками
                return CrossRobot.getCornerBeforeCells(firstStep, nextCrossStep);
            }
        }

        return CrossRobot.getRandomStep(game.board);
    }

    static getCornerBeforeCells(position1, position2) {
        let nearestCorner = CrossRobot.CORNERS[0];
        let nearestDistance = CrossRobot.getDistance(nearestCorner, position1) + CrossRobot.getDistance(nearestCorner, position2);

        for (let i=1; i < CrossRobot.CORNERS.length; i++) {
            const currentCorner = CrossRobot.CORNERS[i];
            const currentDistance = CrossRobot.getDistance(currentCorner, position1) + CrossRobot.getDistance(currentCorner, position2);

            if (currentDistance < nearestCorner) {
                nearestDistance = currentDistance;
                nearestCorner = currentCorner;
            }
        }

        return nearestCorner;
    }

    static isPositionFree(position, board) {
        return board[position.rowIndex][position.cellIndex] === CrossGame.EMPTY;
    }

    static getOppositeSide(side) {
        if (!CrossRobot.isPositionSide(side)) {
            return null;
        }

        return {
            rowIndex: 2 - side.rowIndex,
            cellIndex: 2 - side.cellIndex,
        };
    }

    static getOppositeCorner(corner) {
        if (!CrossRobot.isPositionCorner(corner)) {
            return null;
        }

        return {
            rowIndex: 2 - corner.rowIndex,
            cellIndex: 2 - corner.cellIndex,
        };
    }

    static isPositionSide(position) {
        return !!CrossRobot.SIDES.find(cell => CrossRobot.isPositionsEqual(cell, position));
    }

    static isPositionCorner(position) {
        return !!CrossRobot.CORNERS.find(cell => CrossRobot.isPositionsEqual(cell, position));
    }

    static isPositionsEqual(position1, position2) {
        return position1.cellIndex === position2.cellIndex && position1.rowIndex === position2.rowIndex;
    }

    static getRandomSideStep(board) {
        const emptyCells = CrossRobot.getFreeSides(board);

        if (emptyCells.length === 0) {
            return null;
        }

        const randomIdx = Math.floor(Math.random()*emptyCells.length);

        return emptyCells[randomIdx];
    }

    static getRandomCornerStep(board) {
        const emptyCells = CrossRobot.getFreeCorners(board);

        if (emptyCells.length === 0) {
            return null;
        }

        const randomIdx = Math.floor(Math.random()*emptyCells.length);

        return emptyCells[randomIdx];
    }

    static getRandomStep(board) {
        const emptyCells = board.reduce(
            (emptyCells, row, rowIndex) => {
                const emptyRowCells = row
                    .map((cellData, cellIndex) => ({
                        data: cellData,
                        cellIndex,
                        rowIndex
                    }))
                    .filter(cell => cell.data === CrossGame.EMPTY);

                if (emptyRowCells.length > 0) {
                    emptyCells.push(...emptyRowCells);
                }

                return emptyCells;
            },
            []
        );

        if (emptyCells.length === 0) {
            return null;
        }

        const randomIdx = Math.floor(Math.random()*emptyCells.length);

        return emptyCells[randomIdx];
    }

    static getFreeSides(board) {
        return CrossRobot.SIDES
            .filter(position => CrossRobot.isPositionFree(position, board));
    }

    static getFreeCorners(board) {
        return CrossRobot.CORNERS
            .filter(position => CrossRobot.isPositionFree(position, board));
    }

    static getDistance(position1, position2) {
        return Math.pow(position1.cellIndex - position2.cellIndex, 2) + Math.pow(position1.rowIndex - position2.rowIndex, 2);
    }

    static getFarFreeCorner(board, position) {
        const freeCorners = CrossRobot.getFreeCorners(board);

        if (freeCorners.length === 0) {
            return null;
        }

        let farCorner = freeCorners[0];
        let maxDistance = CrossRobot.getDistance(farCorner, position);

        for (let i=1; i < freeCorners.length; i++) {
            const currentCorner = freeCorners[i];
            const currentDistance = CrossRobot.getDistance(currentCorner, position);

            if (currentDistance > maxDistance) {
                maxDistance = currentDistance;
                farCorner = currentCorner;
            }
        }

        return farCorner;
    }

    // line.data contains only one Empty position
    static createStepToEmptyCell(line) {
        const emptyIndex = line.data.findIndex(symbol => symbol === CrossGame.EMPTY);

        switch (line.type) {
            case CrossGame.LINE_TYPE.DIAGONAL: {
                if (line.index === 0) {
                    return {
                        rowIndex: emptyIndex,
                        cellIndex: emptyIndex,
                    }
                }

                return {
                    rowIndex: emptyIndex,
                    cellIndex: 2 - emptyIndex,
                }
            }
            case CrossGame.LINE_TYPE.ROW: {
                return {
                    rowIndex: line.index,
                    cellIndex: emptyIndex,
                }
            }
            case CrossGame.LINE_TYPE.COLUMN: {
                return {
                    rowIndex: emptyIndex,
                    cellIndex: line.index,
                }
            }
        }

        throw new Error(`unknown line: ${line.type}, ${line.index}`);
    }

    static getUserNearWinLine(user, lines) {
        return lines.find(line => line.data.includes(CrossGame.EMPTY) && line.data.filter(symbol => symbol === user).length === 2);
    }
}
