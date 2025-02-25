import { GameSize, Handicap, Player, StoneColor, Vertex, VertexBase } from './components/common';
import { GameBoard, Stone } from './components/gameboard';
import { Game } from './game';

const V = new VertexBase(GameSize.Nine);

const initializeGame = () => {
    const handicap = new Handicap(6.5, 0);
    const game = new Game(1, 1, GameSize.Nine, handicap);
    const blackPlayer: Player = new Player(StoneColor.Black);
    game.addPlayer(blackPlayer);
    const whitePlayer: Player = new Player(StoneColor.White);
    game.addPlayer(whitePlayer);
    return game;
}

test("Create a game.", () => {
    const handicap = new Handicap(6.5, 0);
    const game = new Game(1, 1, GameSize.Nine, handicap);
    expect(game.gameSize).toBe(9);
    expect(game.getPlayers().length).toBe(0);

    const blackPlayer: Player = new Player(StoneColor.Black);
    game.addPlayer(blackPlayer);
    const secondBlackPlayer: Player = new Player(StoneColor.Black);
    expect(() => game.addPlayer(secondBlackPlayer)).toThrow(Game.ERR_PLAYER_ALREADY_EXISTS);
    const whitePlayer: Player = new Player(StoneColor.White);
    game.addPlayer(whitePlayer);
    const secondWhitePlayer: Player = new Player(StoneColor.White);
    expect(() => game.addPlayer(secondWhitePlayer)).toThrow(Game.ERR_TWO_PLAYERS_ALREADY_EXIST);
});

test("Play stones.", () => {
    const game: Game = initializeGame();

    const vertex1 = V.vertex([0, 0]);
    game.play(vertex1, StoneColor.Black);
    expect(game.get(vertex1)).toBe(StoneColor.Black);

    const vertex2 = V.vertex([1, 0]);
    game.play(vertex2, StoneColor.White);
    expect(game.get(vertex2)).toBe(StoneColor.White);
});

test("Not allowed to play in a row.", () => {
    const game: Game = initializeGame();

    const vertex1 = V.vertex([0, 0]);
    game.play(vertex1, StoneColor.Black);
    const vertex2 = V.vertex([1, 0]);
    expect(() => game.play(vertex2, StoneColor.Black)).toThrow(Game.ERR_PLAY_OUT_OF_TURN);
});

test("Get the turn.", () => {
    const game: Game = initializeGame();

    expect(game.getTurn()).toBe(StoneColor.Black);

    const vertex1 = V.vertex([0, 0]);
    game.play(vertex1, StoneColor.Black);
    expect(game.getTurn()).toBe(StoneColor.White);
});

test("Pass the turn.", () => {
    const game: Game = initializeGame();

    game.pass(StoneColor.Black);
    expect(game.getTurn()).toBe(StoneColor.White);
    expect(() => game.pass(StoneColor.Black)).toThrow(Game.ERR_PLAY_OUT_OF_TURN);

    game.pass(StoneColor.White);
    expect(game.getTurn()).toBe(StoneColor.Black);
    expect(() => game.pass(StoneColor.White)).toThrow(Game.ERR_PLAY_OUT_OF_TURN);
});
