import { GameSize, Handicap, Player, StoneColor, Vertex, VertexBase } from './components/common';
import { GameBoard } from './components/gameboard';
import { Game } from './game';

const V = new VertexBase(GameSize.Nine);

test("Create a game.", () => {
    const handicap = new Handicap(6.5, 0);
    const game = new Game(1, 1, GameSize.Nine, handicap);
    expect(game.gameSize).toBe(9);
    expect(game.players.length).toBe(0);

    const blackPlayer: Player = new Player(StoneColor.Black);
    game.addPlayer(blackPlayer);
    const secondBlackPlayer: Player = new Player(StoneColor.Black);
    expect(() => game.addPlayer(secondBlackPlayer)).toThrow('The player already exists.');
    const whitePlayer: Player = new Player(StoneColor.White);
    game.addPlayer(whitePlayer);
    const secondWhitePlayer: Player = new Player(StoneColor.White);
    expect(() => game.addPlayer(secondWhitePlayer)).toThrow('The game already has two players.');    
});
