import { GameSize, GameStatus, Handicap, Player, StoneColor } from './components/common';
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
    gameBoard: GameBoard;
    gameSize: GameSize;
    gameStatus: GameStatus;
    handicap: Handicap;
    players: Player[];
    isThinking: boolean;
    sgf: string;
    turn: StoneColor;

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
            throw new Error('The game already has two players.');
        }

        if (this.players.length === 1 && this.players[0].stoneColor === player.stoneColor) {
            throw new Error('The player already exists.');
        }
        
        this.players.push(player);
    }
}