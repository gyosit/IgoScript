import { Game } from "../game";
import { VertexBase, Vertex, StoneColor, GameSize } from "./common";
import { GameBoard, Group, Stone, VertexStone } from "./gameboard";


const V = new VertexBase(GameSize.Nine);
test("Create a vertex from the xy coordinate or index.", () => {
    const vertex: Vertex = V.vertex([1, 2]);
    expect(vertex.x).toBe(1);
    expect(vertex.y).toBe(2);
    expect(vertex.index).toBe(19);
});

test("Equalize two vertices.", () => {
    const vertex1 = V.vertex([1, 2]);
    const vertex2 = V.vertex([1, 2]);
    const vertex3 = V.vertex([2, 3]);

    expect(vertex1.equals(vertex2)).toBe(true);
    expect(vertex1.equals(vertex3)).toBe(false);
});

test("Define stone colors.", () => {
    const black: StoneColor = StoneColor.Black;
    const white: StoneColor = StoneColor.White;
    expect(black).toBe('black');
    expect(white).toBe('white');
});

test("Create a stone.", () => {
    const blackStone: Stone = new Stone(0, StoneColor.Black);
    expect(blackStone.stoneColor).toBe(StoneColor.Black);
    const whiteStone: Stone = new Stone(1, StoneColor.White);
    expect(whiteStone.stoneColor).toBe(StoneColor.White);
    const emptyStone: Stone = new Stone(2, StoneColor.Empty);
    expect(emptyStone.stoneColor).toBe(StoneColor.Empty);
    const koStone: Stone = new Stone(3, StoneColor.Ko);
    expect(koStone.stoneColor).toBe(StoneColor.Ko);
});

test("Create a vertex stone.", () => {
    const vertex: Vertex = V.vertex([1, 2]);
    const stone: Stone = new Stone(0, StoneColor.Black);
    const vertexStone: VertexStone = new VertexStone(vertex, stone);
    expect(vertexStone.vertex).toBe(vertex);
    expect(vertexStone.stone).toBe(stone);
});

test("Create and update a group.", () => {
    const group: Group = new Group(0, StoneColor.Black);
    expect(group.getStoneColor()).toBe(StoneColor.Black);

    // Put a black stone on the vertex [0, 2].
    group.addVertexStone(V.vertex([0, 2]), StoneColor.Black);
    expect(group.getVertexStones().length).toBe(1);
    expect(group.getVertexStones()[0].vertex.equals(V.vertex([0, 2]))).toBe(true);
    expect(group.getVertexStones()[0].stone.stoneColor).toBe(StoneColor.Black);
    expect(() => group.addVertexStone(V.vertex([0, 2]), StoneColor.Black)).toThrow(Group.ERR_ALREADY_EXISTS_VERTEX_STONE);

    // Put a black stone on the vertex [1, 2].
    group.addVertexStone(V.vertex([1, 2]), StoneColor.Black);
    expect(group.getVertexStones().length).toBe(2);
});

test("Find the breath points from the vertex stones.", () => {
    const group1: Group = new Group(0, StoneColor.Black);
    group1.addVertexStone(V.vertex([0, 2]), StoneColor.Black);

    const expectedBreathPoints1: Vertex[] = [
        V.vertex([0, 1]),
        V.vertex([1, 2]),
        V.vertex([0, 3])
    ];
    expect(group1.getBreathPoints().length).toBe(3);
    for (const breathPoint of group1.getBreathPoints()) {
        expect(Vertex.includes(expectedBreathPoints1, breathPoint)).toEqual(true);
    }
});

test("Throw error by operations for empty or ko group.", () => {
    const emptyGroup1: Group = new Group(0, StoneColor.Empty);
    const emptyGroup2: Group = new Group(1, StoneColor.Empty);
    expect(() => emptyGroup1.getVertexStones()).toThrow(Group.ERR_NO_VERTEX_STONE);
    expect(() => emptyGroup1.getBreathPoints()).toThrow(Group.ERR_SPECIAL_GROUP);
    expect(() => emptyGroup1.merge(emptyGroup2)).toThrow(Group.ERR_SPECIAL_GROUP);
    expect(() => emptyGroup1.collapsed(emptyGroup2)).toThrow(Group.ERR_SPECIAL_GROUP);

    const koGroup1: Group = new Group(2, StoneColor.Ko);
    const koGroup2: Group = new Group(3, StoneColor.Ko);
    expect(() => koGroup1.getBreathPoints()).toThrow(Group.ERR_SPECIAL_GROUP);
    expect(() => koGroup1.merge(koGroup2)).toThrow(Group.ERR_SPECIAL_GROUP);
    expect(() => koGroup1.collapsed(koGroup2)).toThrow(Group.ERR_SPECIAL_GROUP);
});

test("Merge two groups.", () => {
    const group1: Group = new Group(0, StoneColor.Black);
    group1.addVertexStone(V.vertex([0, 2]), StoneColor.Black);

    const group2: Group = new Group(1, StoneColor.Black);
    group2.addVertexStone(V.vertex([1, 2]), StoneColor.Black);

    group1.merge(group2);
    expect(group1.getVertexStones().length).toBe(2);

    const expectedVertexStones = [
        new VertexStone(V.vertex([0, 2]), new Stone(0, StoneColor.Black)),
        new VertexStone(V.vertex([1, 2]), new Stone(0, StoneColor.Black))
    ];
    const expectedBreathPoints = [
        V.vertex([0, 1]),
        V.vertex([0, 3]),
        V.vertex([1, 1]),
        V.vertex([1, 3]),
        V.vertex([2, 2])

    ];
    expect(group1.getVertexStones()).toEqual(expectedVertexStones);
    for (const breathPoint of group1.getBreathPoints()) {
        expect(Vertex.includes(expectedBreathPoints, breathPoint)).toEqual(true);
    }
    expect(group1.getId()).toBe(0);
    expect(group2.getId()).toBe(-1);
    expect(group2.getStoneColor()).toBe(StoneColor.Empty);

    // Merge the same group.
    expect(() => group1.merge(group1)).toThrow(Group.ERR_MERGE_SAME_GROUP);

    // Merge the group with the different stone color.
    const group3: Group = new Group(2, StoneColor.White);
    group3.addVertexStone(V.vertex([2, 2]), StoneColor.White);
    expect(() => group1.merge(group3)).toThrow(Group.ERR_MERGE_DIFFERENT_COLOR);

    // Merge the far group.
    const group4: Group = new Group(3, StoneColor.Black);
    group4.addVertexStone(V.vertex([0, 4]), StoneColor.Black);
    expect(() => group1.merge(group4)).toThrow(Group.ERR_MERGE_FAR_STONES);
});

test("Merge three groups.", () => {
    const group1: Group = new Group(0, StoneColor.Black);
    group1.addVertexStone(V.vertex([0, 2]), StoneColor.Black);

    const group2: Group = new Group(1, StoneColor.Black);
    group2.addVertexStone(V.vertex([2, 2]), StoneColor.Black);

    const group3: Group = new Group(2, StoneColor.Black);
    group3.addVertexStone(V.vertex([1, 2]), StoneColor.Black);

    group1.merge(group3);
    group1.merge(group2);

    expect(group1.getVertexStones().length).toBe(3);
    const expectedBreathPoints = [
        V.vertex([0, 1]),
        V.vertex([0, 3]),
        V.vertex([1, 1]),
        V.vertex([1, 3]),
        V.vertex([2, 1]),
        V.vertex([2, 3]),
        V.vertex([3, 2])
    ];
    for (const breathPoint of group1.getBreathPoints()) {
        expect(Vertex.includes(expectedBreathPoints, breathPoint)).toEqual(true);
    }
});

test("Collide two groups with the different colors.", () => {
    const group1: Group = new Group(0, StoneColor.Black);
    group1.addVertexStone(V.vertex([0, 2]), StoneColor.Black);

    const group2: Group = new Group(1, StoneColor.White);
    group2.addVertexStone(V.vertex([1, 2]), StoneColor.White);

    group1.collapsed(group2);
    group2.collapsed(group1);
    
    const expectedBlackBreathPoints = [
        V.vertex([0, 1]),
        V.vertex([0, 3])
    ];
    expect(group1.getBreathPoints().length).toBe(2);
    for (const breathPoint of group1.getBreathPoints()) {
        expect(Vertex.includes(expectedBlackBreathPoints, breathPoint)).toEqual(true);
    }

    const expectedWhiteBreathPoints = [
        V.vertex([1, 1]),
        V.vertex([1, 3]),
        V.vertex([2, 2])
    ];
    expect(group2.getBreathPoints().length).toBe(3);
    for (const breathPoint of group2.getBreathPoints()) {
        expect(Vertex.includes(expectedWhiteBreathPoints, breathPoint)).toEqual(true);
    }
});

test("Push group to the group list.", () => {
    const groups: Group[] = [];
    const group1: Group = new Group(0, StoneColor.Black);
    Group.push(groups, group1);
    expect(groups.length).toBe(1);

    const group2: Group = new Group(1, StoneColor.Black);
    Group.push(groups, group2);
    expect(groups.length).toBe(2);

    const group3: Group = new Group(0, StoneColor.Black);
    expect(() => Group.push(groups, group3)).toThrow(Group.ERR_ALREADY_EXISTS_GROUP);
});

test("Play a stone.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const vertex: Vertex = V.vertex([1, 2]);
    gameBoard.play(vertex, StoneColor.Black);
    const playedStones: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones[vertex.index].stoneColor).toBe(StoneColor.Black);

    const vertex2: Vertex = V.vertex([2, 3]);
    gameBoard.play(vertex2, StoneColor.White);
    const playedStones2: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones2[vertex2.index].stoneColor).toBe(StoneColor.White);
    expect(playedStones[vertex.index].stoneColor).toBe(StoneColor.Black);

    const vertex3: Vertex = V.vertex([3, 4]);
    expect(() => gameBoard.play(vertex3, StoneColor.Empty)).toThrow(GameBoard.ERR_EMPTY_STONE);
});

test("Get a stone from the vertex.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const vertex: Vertex = V.vertex([1, 2]);
    gameBoard.play(vertex, StoneColor.Black);
    expect(gameBoard.get(vertex)).toBe(StoneColor.Black);

    const vertex2: Vertex = V.vertex([2, 3]);
    gameBoard.play(vertex2, StoneColor.White);
    expect(gameBoard.get(vertex2)).toBe(StoneColor.White);
    expect(gameBoard.get(vertex)).toBe(StoneColor.Black);

    const vertex3: Vertex = V.vertex([9, 9]);
    expect(() => gameBoard.get(vertex3)).toThrow(GameBoard.ERR_OUT_OF_BOARD);
});

test("Attempt to play a stone on the same vertex.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const vertex: Vertex = V.vertex([1, 2]);
    gameBoard.play(vertex, StoneColor.Black);
    expect(() => gameBoard.play(vertex, StoneColor.Black)).toThrow(GameBoard.ERR_OCCUPIED_VERTEX);
    expect(() => gameBoard.play(vertex, StoneColor.White)).toThrow(GameBoard.ERR_OCCUPIED_VERTEX);
});

test("Attempt to play a stone on the non-breath point.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const blackVertexes = [
        V.vertex([0, 2]),
        V.vertex([1, 1]),
        V.vertex([2, 2]),
        V.vertex([1, 3])
    ];
    for (const blackVertex of blackVertexes) {
        gameBoard.play(blackVertex, StoneColor.Black);
    }

    const previousGroups: Group[] = gameBoard.groups.slice();
    const whiteVertex = V.vertex([1, 2]);
    expect(() => gameBoard.play(whiteVertex, StoneColor.White)).toThrow(GameBoard.ERR_NO_BREATH_POINT);
    expect(gameBoard.groups).toEqual(previousGroups);
});

test("Capture the opponent's stones.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    // Capture the one stone.
    const blackVertex: Vertex = V.vertex([1, 2]);
    gameBoard.play(blackVertex, StoneColor.Black);
    const playedStones1: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones1[blackVertex.index].stoneColor).toBe(StoneColor.Black);

    const whiteVertexes1 = [
        V.vertex([0, 2]),
        V.vertex([1, 1]),
        V.vertex([2, 2]),
        V.vertex([1, 3])
    ];
    for (const vertex of whiteVertexes1) {
        const playedStones: Stone[] = gameBoard.getCurrentBoard();
        expect(playedStones[blackVertex.index].stoneColor).toBe(StoneColor.Black);
        gameBoard.play(vertex, StoneColor.White);
    }

    const playedStones2: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones2[blackVertex.index].stoneColor).toBe(StoneColor.Empty);

    // Capture the two stones.
    const blackVertexes2 = [
        V.vertex([5, 5]),
        V.vertex([5, 6]),
    ];
    for (const blackVertex2 of blackVertexes2) {
        gameBoard.play(blackVertex2, StoneColor.Black);
        expect(gameBoard.getCurrentBoard()[blackVertex2.index].stoneColor).toBe(StoneColor.Black);
    }

    const whiteVertexes2 = [
        V.vertex([5, 4]),
        V.vertex([6, 5]),
        V.vertex([6, 6]),
        V.vertex([5, 7]),
        V.vertex([4, 6]),
        V.vertex([4, 5])
    ];
    for (const vertex of whiteVertexes2) {
        const playedStones: Stone[] = gameBoard.getCurrentBoard();
        expect(playedStones[blackVertexes2[0].index].stoneColor).toBe(StoneColor.Black);
        expect(playedStones[blackVertexes2[1].index].stoneColor).toBe(StoneColor.Black);
        gameBoard.play(vertex, StoneColor.White);
    }

    const playedStones3: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones3[blackVertexes2[0].index].stoneColor).toBe(StoneColor.Empty);
    expect(playedStones3[blackVertexes2[1].index].stoneColor).toBe(StoneColor.Empty);    
});

test("Play a stone on the non-breath point, but capture the opponent's stones. And Ko", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const blackVertexes = [
        V.vertex([0, 2]),
        V.vertex([1, 1]),
        V.vertex([2, 2])
    ];
    for (const blackVertex of blackVertexes) {
        gameBoard.play(blackVertex, StoneColor.Black);
    }

    const whiteVertexes = [
        V.vertex([0, 3]),
        V.vertex([1, 2]),
        V.vertex([2, 3]),
        V.vertex([1, 4])
    ];
    for (const whiteVertex of whiteVertexes) {
        gameBoard.play(whiteVertex, StoneColor.White);
    }

    const capturedVertex: Vertex = V.vertex([1, 2]);
    const playedStones1: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones1[capturedVertex.index].stoneColor).toBe(StoneColor.White);
    const blackVertex2: Vertex = V.vertex([1, 3]);
    gameBoard.play(blackVertex2, StoneColor.Black);
    const playedStones: Stone[] = gameBoard.getCurrentBoard();
    expect(playedStones[blackVertex2.index].stoneColor).toBe(StoneColor.Black);
    expect(playedStones[capturedVertex.index].stoneColor).toBe(StoneColor.Ko);

    // Ko is not allowed.
    expect(() => gameBoard.play(capturedVertex, StoneColor.White)).toThrow(GameBoard.ERR_KO_STONE);

    // Ko is allowed after playing another stone.
    const whiteVertex2: Vertex = V.vertex([8, 8]);
    gameBoard.play(whiteVertex2, StoneColor.White);
    gameBoard.play(capturedVertex, StoneColor.White);
});