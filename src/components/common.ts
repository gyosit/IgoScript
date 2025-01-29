// Type definitions for stone color
export enum StoneColor {
    Black = 'black',
    White = 'white',
    Empty = 'empty'
};

// Type game status
export enum GameStatus {
    NotStarted = 'not started',
    Playing = 'playing',
    Finished = 'finished'
};

// Game size
export enum GameSize {
    Nine = 9,
    Thirteen = 13,
    Nineteen = 19
};

// XY coordinate or index
type XYI = [number, number] | number;

/**
 * The vertex maker of the board.
 * 
 * @param {number} gameSize The size of the game.
 * 
 */
export class VertexBase {
    gameSize: GameSize;

    /**
     * 
     * @param {number} gameSize The size of the game.
     * 
     */
    constructor(gameSize: GameSize) {
        this.gameSize = gameSize;
    }

    /**
     * Create a vertex from the xy coordinate or index.
     * 
     * @param {[number, number] | number} xyi The xy coordinate or index of the vertex.
     * 
     * @returns {Vertex} The vertex.
     * 
     */
    vertex(xyi: XYI): Vertex {
        return new Vertex(xyi, this.gameSize);
    }
}

/**
 * The vertex of the board. 
 * The left top vertex is (x, y, index) = (0, 0, 0). 
 * The right bottom vertex is (x, y, index) = (gameSize - 1, gameSize - 1, gameSize * gameSize - 1).
 * 
 * @param {number} x The x coordinate of the vertex.
 * @param {number} y The y coordinate of the vertex.
 * @param {number} index The index of the vertex.
 * 
 */
export class Vertex {
    x: number;
    y: number;
    index: number;
    gameSize: GameSize;

    /**
     * 
     * @param {[number, number] | number} xyi The xy coordinate or index of the vertex.
     * @param {number} gameSize The size of the game.
     * 
     */ 
    constructor(xyi: XYI, gameSize: GameSize) {
        this.gameSize = gameSize;
        if (typeof xyi === 'number') {
            this.index = xyi;
            this.x = xyi % gameSize;
            this.y = Math.floor(xyi / gameSize);
        } else {
            this.x = xyi[0];
            this.y = xyi[1];
            this.index = this.y * gameSize + this.x;
        }
    }

    /**
     * Equalize two vertices.
     * 
     * @param {Vertex} vertex The vertex to compare.
     * 
     * @returns {boolean} Whether the vertices are equal.
     * 
     */
    equals(vertex: Vertex): boolean {
        return this.x === vertex.x && this.y === vertex.y;
    }

    /**
     * Check whether the vertex in in the list of vertices.
     * 
     * @param {Vertex[]} vertices The list of vertices.
     * @param {Vertex} vertex The vertex to check.
     * 
     * @returns {boolean} Whether the vertex is in the list of vertices.
     * 
     */
    static includes(vertices: Vertex[], vertex: Vertex): boolean {
        for (let v of vertices) {
            if (v.equals(vertex)) {
                return true;
            }
        }
        return false;
    }
};

/**
 * The handicap of the game.
 * 
 * @param {number} komi The points given to the white player.
 * @param {number} numStones The number of handicap stones for the black player.
 * 
 */
export class Handicap {
    komi: number;
    numStones: number;

    constructor(komi: number, numStones: number) {
        this.komi = komi;
        this.numStones = numStones;
    }
}

/**
 * The player of the game.
 * 
 * @param {StoneColor} stoneColor The color of the player's stones.
 * @param {number} numAgehamas The number of stones captured by the player.
 * @param {number} numTerritories The number of territories owned by the player.
 * @param {boolean} isWinner Whether the player is the winner.
 * 
 */
export class Player {
    stoneColor: StoneColor;
    numAgehamas: number;
    numTerritories: number;
    isWinner: boolean;

    /**
     * 
     * @param {StoneColor} stoneColor The color of the player's stones.
     * 
     */
    constructor(stoneColor: StoneColor) {
        this.stoneColor = stoneColor;
        this.numAgehamas = 0;
        this.numTerritories = 0;
        this.isWinner = false;
    }
} 

