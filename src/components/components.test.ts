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
});

test("Create a vertex stone.", () => {
    const vertex: Vertex = V.vertex([1, 2]);
    const stone: Stone = new Stone(0, StoneColor.Black);
    const vertexStone: VertexStone = new VertexStone(vertex, stone);
    expect(vertexStone.vertex).toBe(vertex);
    expect(vertexStone.stone).toBe(stone);
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
    expect(() => gameBoard.play(vertex3, StoneColor.Empty)).toThrow('Empty stone is not allowed to play.');
});

test("Attempt to play a stone on the same vertex.", () => {
    const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

    const vertex: Vertex = V.vertex([1, 2]);
    gameBoard.play(vertex, StoneColor.Black);
    expect(() => gameBoard.play(vertex, StoneColor.Black)).toThrow('The vertex is occupied.');
    expect(() => gameBoard.play(vertex, StoneColor.White)).toThrow('The vertex is occupied.');
});

test("Create and update a group.", () => {
    const group: Group = new Group(0, StoneColor.Black);
    expect(group.getStoneColor()).toBe(StoneColor.Black);

    // Put a black stone on the vertex [0, 2].
    group.addVertexStone(V.vertex([0, 2]), StoneColor.Black);
    expect(group.getVertexStones().length).toBe(1);
    expect(group.getVertexStones()[0].vertex.equals(V.vertex([0, 2]))).toBe(true);
    expect(group.getVertexStones()[0].stone.stoneColor).toBe(StoneColor.Black);
    expect(() => group.addVertexStone(V.vertex([0, 2]), StoneColor.Black)).toThrow('The vertex stone already exists.');

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
    expect(group2.getVertexStones().length).toBe(0);
    expect(group2.getBreathPoints().length).toBe(0);

    // Merge the same group.
    expect(() => group1.merge(group1)).toThrow('The group is the same.');

    // Merge the group with the different stone color.
    const group3: Group = new Group(2, StoneColor.White);
    group3.addVertexStone(V.vertex([2, 2]), StoneColor.White);
    expect(() => group1.merge(group3)).toThrow('The stone colors are different.');

    // Merge the far group.
    const group4: Group = new Group(3, StoneColor.Black);
    group4.addVertexStone(V.vertex([0, 4]), StoneColor.Black);
    expect(() => group1.merge(group4)).toThrow('The groups are far.');
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

    group1.collide(group2);
    group2.collide(group1);
    
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
    expect(() => Group.push(groups, group3)).toThrow('The group already exists.');
});

// test("Get breath points.", () => {
//     const gameBoard: GameBoard = new GameBoard(GameSize.Nine);

//     const vertex: Vertex = V.vertex([1, 2]);
//     const expectedBreathPoints: Vertex[] = [
//         V.vertex([0, 2]),
//         V.vertex([2, 2]),
//         V.vertex([1, 1]),
//         V.vertex([1, 3])
//     ];

//     gameBoard.play(vertex, StoneColor.Black);
//     const group = gameBoard.getGroup(vertex);
//     const breathPoints: Vertex[] = group.getBreathPoints();
//     expect(breathPoints.length).toBe(4);
//     for (const breathPoint of breathPoints) {
//         expect(Vertex.includes(expectedBreathPoints, breathPoint)).toEqual(true);
//     }
//     expect(Vertex.includes(breathPoints, V.vertex([1, 2]))).toEqual(false);

//     const vertex2: Vertex = V.vertex([1, 3]);
//     const expectedBreathPoints2: Vertex[] = [
//         V.vertex([0, 2]),
//         V.vertex([2, 2]),
//         V.vertex([1, 1]),
//         V.vertex([0, 3]),
//         V.vertex([2, 3]),
//         V.vertex([1, 4])
//     ];
//     gameBoard.play(vertex2, StoneColor.Black);
//     const group2 = gameBoard.getGroup(vertex2);
//     const breathPoints2: Vertex[] = group2.getBreathPoints();
//     expect(breathPoints2.length).toBe(6);
//     for (const breathPoint of breathPoints2) {
//         expect(Vertex.includes(expectedBreathPoints2, breathPoint)).toEqual(true);
//     }
//     expect(Vertex.includes(breathPoints2, V.vertex([1, 3]))).toEqual(false);
// });

// test("Capture a stone.", () => {
//     const gameBoard = new GameBoard(GameSize.Nine);

//     const playingVertexes: Vertex[] = [
//         V.vertex([1, 1]),
//         V.vertex([2, 2]),
//         V.vertex([3, 1]),
//         V.vertex([2, 0])
//     ];

//     const whiteVertex: Vertex = V.vertex([2, 1]);
//     gameBoard.play(whiteVertex, StoneColor.White);
//     expect(gameBoard.getCurrentBoard()[whiteVertex.index].stoneColor).toBe(StoneColor.White);

//     for (let vertex of playingVertexes) {
//         gameBoard.play(vertex, StoneColor.Black);
//     }

//     const playedStones: Stone[] = gameBoard.getCurrentBoard();
//     expect(playedStones[V.vertex([2, 1]).index].stoneColor).toBe(StoneColor.Empty);
// });