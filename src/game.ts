import { GameSize, GameStatus, Handicap, Player, StoneColor, Vertex } from './components/common';
import { GameBoard } from './components/gameboard';

/**
 * The game of igo.
 * 
 * @param {number} id The id of the game.
 * @param {number} originalId The original id of the game.
 * @param {boolean} isInitialized Whether the game is initialized.
 * @param {GameBoard} gameBoard The board of the game.
 * @param {GameSize} gameSize The size of the game.
 * @param {GameStatus} gameStatus The status of the game.
 * @param {Handicap} handicap The handicap of the game.
 * @param {Player[]} players The players of the game.
 * @param {boolean} isThinking Whether the game is thinking.
 * @param {string} sgf The sgf of the game.
 * @param {StoneColor} turn The turn of the game.
 * 
 */
export class Game {
    private id: number;
    private originalId: number;
    private isInitialized: boolean;
    private turnOrder: StoneColor[];
    gameBoard: GameBoard;
    gameSize: GameSize;
    gameStatus: GameStatus;
    handicap: Handicap;
    players: Player[];
    isThinking: boolean;
    sgf: string;
    turn: StoneColor;

    /* Error */
    static ERR_PLAYER_ALREADY_EXISTS = new Error('The player already exists.');
    static ERR_TWO_PLAYERS_ALREADY_EXIST = new Error('The game already has two players.');
    static ERR_PLAY_OUT_OF_TURN = new Error('Not allowed to play out of turn.');

    /**
     * 
     * @param {number} id The id of the game.
     * @param {number} originalId The original id of the game.
     * @param {GameSize} gameSize The size of the game.
     * @param {Handicap} handicap The handicap of the game.
     * 
     */
    constructor(id: number, originalId: number, gameSize: GameSize, handicap: Handicap) {
        this.id = id;
        this.originalId = originalId;
        this.isInitialized = false;
        this.turnOrder = [StoneColor.Black, StoneColor.White];
        this.gameStatus = GameStatus.NotStarted;
        this.isThinking = false;
        this.sgf = '';
        this.turn = StoneColor.Black;
        this.gameSize = gameSize;
        this.gameBoard = new GameBoard(gameSize);
        this.handicap = handicap;
        this.players = [];
    }

    /**
     * Change turn.
     * 
     */
    private changeTurn() {
        this.turn = this.turnOrder[1 - this.turnOrder.indexOf(this.turn)];
    }

    /**
     * Add a player to the game.
     * 
     * @param {Player} player The player to add.
     * 
     * @throws {Error} The game already has two players.
     * @throws {Error} The player already exists.
     * 
     */
    addPlayer(player: Player) {
        if (this.players.length >= 2) {
            throw Game.ERR_TWO_PLAYERS_ALREADY_EXIST
        }

        if (this.players.length === 1 && this.players[0].stoneColor === player.stoneColor) {
            throw Game.ERR_PLAYER_ALREADY_EXISTS;
        }
        
        this.players.push(player);
    }

    /**
     * Play a stone.
     * 
     * @param {Vertex} vertex The vertex to play.
     * @param {StoneColor} stoneColor The color of the stone to play.
     * 
     */
    play(vertex: Vertex, stoneColor: StoneColor) {
        if (stoneColor !== this.turn) throw Game.ERR_PLAY_OUT_OF_TURN
        this.gameBoard.play(vertex, stoneColor);
        this.changeTurn();
    }

    /**
     * Pass a turn.
     * 
     * @param {StoneColor} stoneColor The color of the stone to pass.
     * 
     */
    pass(stoneColor: StoneColor) {
        if (stoneColor !== this.turn) throw Game.ERR_PLAY_OUT_OF_TURN
        this.changeTurn();
    }

    /**
     * Get the stone at a vertex.
     * 
     * @param {Vertex} vertex The vertex to get.
     * 
     * @returns {StoneColor} The stone at the vertex.
     * 
     */
    get(vertex: Vertex): StoneColor {
        return this.gameBoard.get(vertex);
    }

    /**
     * Get the turn.
     * 
     * @returns {StoneColor} The turn of the game.
     * 
     */
    getTurn(): StoneColor {
        return this.turn;
    }
}