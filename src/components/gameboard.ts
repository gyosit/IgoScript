import { StoneColor, VertexBase, Vertex, GameSize } from "./common";

const V = new VertexBase(9);
const DEFAULT_TERRITORY_SIZE = 2;

/**
 * The board of igo game.
 * 
 * @param {GameSize} gameSize The size of the game board.
 * @param {Group[]} groups The groups of stones on the board.
 * @param {VertexTerritory[]} vertexTerritories The territories of the board.
 * 
 */
export class GameBoard {
    gameSize: GameSize;
    groups: Group[];
    vertexTerritories: VertexTerritory[];

    /**
     * 
     * @param {GameSize} gameSize The size of the game board.
     * 
     */
    constructor(gameSize: GameSize) {
        this.gameSize = gameSize;
        this.groups = [];
        this.vertexTerritories = [];
    }

    /**
    * Play a stone on the board.
    *
    * @param {Vertex} vertex The vertex to play the stone.
    * @param {StoneColor} stoneColor The color of the stone.
    * 
    */
    play(vertex: Vertex, stoneColor: StoneColor) {
        // Check whether the stone is empty.
        if (stoneColor === StoneColor.Empty) {
            throw new Error('Empty stone is not allowed to play.');
        }

        // Check whether the vertex is occupied.
        for (let group of this.groups) {
            for (let vertexStone of group.getVertexStones()) {
                if (vertexStone.vertex.index === vertex.index) {
                    throw new Error('The vertex is occupied.');
                }
            }
        }

        const stone = new Stone(0, stoneColor);
        const vertexStone = new VertexStone(vertex, stone);
        const group = new Group(this.groups.length, stoneColor);
        group.addVertexStone(vertex, stoneColor);

        this.groups.push(group);
    }

    /**
    * Get the current board.
    * 
    * @returns {Stone[]} The current board.
    * 
    */
    getCurrentBoard(): Stone[] {
        // Initialize the current board.
        let currentBoard: Stone[] = [];
        for (let i = 0; i < this.gameSize * this.gameSize; i++) {
            currentBoard.push(new Stone(i, StoneColor.Empty));
        }

        // Search stones from the groups.
        for (let group of this.groups) {
            for (let vertexStone of group.getVertexStones()) {
                currentBoard[vertexStone.vertex.index] = vertexStone.stone;
            }
        }

        return currentBoard;
    }

    /**
     * Get the group of the stone.
     * 
     * @param {Vertex} vertex The vertex of the stone.
     * 
     * @returns {Group} The group of the stone.
     * 
     */
    getGroup(vertex: Vertex): Group {
        for (let group of this.groups) {
            for (let vertexStone of group.getVertexStones()) {
                if (vertexStone.vertex.index === vertex.index) {
                    return group;
                }
            }
        }

        return new Group(-1, StoneColor.Empty);
    }
}

/**
 * The group of stones on the board.
 * 
 * @param {number} id The id of the group.
 * @param {StoneColor} stoneColor The color of the stones in the group.
 * @param {VertexStone[]} vertexStones The stones in the group.
 * @param {Vertex[]} breathPoints The breath points of the group.
 *
 */
export class Group {
    private id: number;
    private stoneColor: StoneColor;
    private vertexStones: VertexStone[];
    private breathPoints: Vertex[];

    /**
     * 
     * @param {number} id The id of the group.
     * @param {StoneColor} stoneColor The color of the stones in the group.
     * 
     */
    constructor(id: number, stoneColor: StoneColor) {
        this.id = id;
        this.stoneColor = stoneColor;
        this.vertexStones = [];
        this.breathPoints = [];
    }

    /**
     * Find the breath points from the vertex stones.
     * 
     * @params {VertexStone} vertexStones The playing vertex stone.
     * 
     * @returns {Vertex[]} The breath points of the group.
     * 
     */
    private findBreathPoints(vertexStone: VertexStone): Vertex[] {
        const gameSize = vertexStone.vertex.gameSize;
        const breathPoints: Vertex[] = [];
        if (vertexStone.vertex.x > 0) {
            breathPoints.push(V.vertex([vertexStone.vertex.x - 1, vertexStone.vertex.y]));
        }
        if (vertexStone.vertex.x < gameSize - 1) {
            breathPoints.push(V.vertex([vertexStone.vertex.x + 1, vertexStone.vertex.y]));
        }
        if (vertexStone.vertex.y > 0) {
            breathPoints.push(V.vertex([vertexStone.vertex.x, vertexStone.vertex.y - 1]));
        }
        if (vertexStone.vertex.y < gameSize - 1) {
            breathPoints.push(V.vertex([vertexStone.vertex.x, vertexStone.vertex.y + 1]));
        }

        return breathPoints;
    }

    /**
     * Recalculate the breath points when two groups with the different colors are collapsed.
     * 
     * @params {Group} group The group to collapse.
     * 
     * @throws {Error} The groups are the same color.
     * 
     * @todo To consider of removing the breath points of both groups simultaneously.
     * 
     */
    collide(enemyGroup: Group) {
        // Check whether the groups are the same color.
        if (this.stoneColor === enemyGroup.stoneColor) {
            throw new Error('The groups are the same color.');
        }

        for (let vertexStone of enemyGroup.getVertexStones()) {
            if (Vertex.includes(this.breathPoints, vertexStone.vertex)) {
                this.removeBreathPoint(vertexStone.vertex);
            }
        }
    }

    /**
     * Get the id of the group.
     * 
     * @returns {number} The id of the group.
     * 
     */
    getId(): number {
        return this.id;
    }

    /**
     * Get the stone color of the group.
     * 
     * @returns {StoneColor} The stone color of the group.
     * 
     */
    getStoneColor(): StoneColor {
        return this.stoneColor;
    }

    /**
     * Get vertex stones of the group.
     * 
     * @returns {VertexStone[]} The vertex stones of the group.
     * 
     */
    getVertexStones(): VertexStone[] {
        return this.vertexStones;
    }

    /**
     * Push a vertex stone to the list of vertex stones.
     * 
     * @param {VertexStone} vertexStone The vertex stone to push.
     * 
     * @throws {Error} The vertex stone already exists.
     * 
     */
    addVertexStone(vertex: Vertex, stoneColor: StoneColor) {
        // Check whether the vertex stone already exists.
        for (let vertexStone of this.vertexStones) {
            if (vertexStone.vertex.index === vertex.index) {
                throw new Error('The vertex stone already exists.');
            }
        }

        this.vertexStones.push(new VertexStone(vertex, new Stone(0, stoneColor)));

        // Update the breath points.
        const breathPoints = this.findBreathPoints(this.vertexStones[0]);
        for (let breathPoint of breathPoints) {
            if (!Vertex.includes(this.breathPoints, breathPoint)) {
                this.breathPoints.push(breathPoint);
            }
        }
    }

    /**
     * Get the breath points of the group.
     * 
     * @returns {Vertex[]} The breath points of the group.
     * 
     */
    getBreathPoints(): Vertex[] {
        return this.breathPoints;
    }

    /**
     * Add a breath point to the group.
     * 
     * @param {Vertex} vertex The vertex to add.
     * 
     * @throws {Error} The breath point already exists.
     * 
     */
    private addBreathPoint(vertex: Vertex) {
        if (Vertex.includes(this.breathPoints, vertex)) {
            throw new Error('The breath point already exists.');
        }

        this.breathPoints.push(vertex);
    }

    /**
     * Remove a breath point from the group.
     * 
     * @param {Vertex} vertex The vertex to remove.
     * 
     * @throws {Error} The breath point does not exist.
     * 
     */
    private removeBreathPoint(vertex: Vertex) {
        if (!Vertex.includes(this.breathPoints, vertex)) {
            throw new Error('The breath point does not exist.');
        }

        this.breathPoints = this.breathPoints.filter(breathPoint => !breathPoint.equals(vertex));
    }

    /**
     * Push a group to the list of groups.
     * 
     * @param {Group[]} groups The list of groups.
     * @param {Group} group The group to push.
     * 
     * @throws {Error} The group already exists.
     * 
     */
    static push(groups: Group[], group: Group) {
        for (let g of groups) {
            if (g.id === group.id) {
                throw new Error('The group already exists.');
            }
        }

        groups.push(group);
    }

    /**
     * Merge two groups.
     * 
     * @param {Group} group The group to merge.
     * 
     * @throws {Error} Attempt to merge the same group.
     * @throws {Error} Attempt to merge the group with the different color.
     * @throws {Error} Attempt to merge the group with far stones.
     * 
     */
    merge(group: Group) {
        // Check whether the group is the same.
        if (this.id === group.id) {
            throw new Error('The group is the same.');
        }

        // Check whether the stone colors are the same.
        if (this.stoneColor !== group.stoneColor) {
            throw new Error('The stone colors are different.');
        }

        // Check whether the groups are far.
        let isNear = false;
        for (let vertexStone of this.vertexStones) {
            for (let breathPoint of group.getBreathPoints()) {
                if (vertexStone.vertex.index === breathPoint.index) {
                    // The groups are adjacent.
                    isNear = true;
                    break;
                }
            }
        }
        if (!isNear) {
            throw new Error('The groups are far.');
        }

        for (let vertexStone of group.getVertexStones()) {
            this.addVertexStone(vertexStone.vertex, vertexStone.stone.stoneColor);
        }

        for (let breathPoint of group.getBreathPoints()) {
            if (Vertex.includes(this.breathPoints, breathPoint)) {
                // Skip the breath point if the breath points were shared.
                continue;
            }
            this.addBreathPoint(breathPoint);
        }

        // Remove the breath points of the stones played.
        for (let vertexStone of this.getVertexStones()) {
            if (Vertex.includes(this.breathPoints, vertexStone.vertex)) {
                this.removeBreathPoint(vertexStone.vertex);
            }
        }

        // Disabling the merged group.
        group.id = -1;
        group.stoneColor = StoneColor.Empty;
        group.vertexStones = [];
        group.breathPoints = [];
    }
}

/**
 * The pair of vertex and stone.
 * 
 * @param {Vertex} vertex The vertex of the pair.
 * @param {Stone} stone The stone of the pair.
 * 
 */
export class VertexStone {
    vertex: Vertex;
    stone: Stone;

    /**
     * 
     * @param {Vertex} vertex The vertex of the pair.
     * @param {Stone} stone The stone of the pair.
     * 
     */
    constructor(vertex: Vertex, stone: Stone) {
        this.vertex = vertex;
        this.stone = stone;
    }
}

/**
 * The stone on the board.
 * 
 * @param {number} id The id of the stone.
 * @param {StoneColor} stoneColor The color of the stone.
 * @param {number} territorySize The size of the territory the stone belongs to.
 * @param {number} survivability The survivability of the stone.
 * 
 */
export class Stone {
    private id: number;
    stoneColor: StoneColor;
    territorySize: number;
    survivability: number;

    /**
     * 
     * @param {number} id The id of the stone.
     * @param {StoneColor} stoneColor The color of the stone.
     * 
     */
    constructor(id: number, stoneColor: StoneColor) {
        this.id = id;
        this.stoneColor = stoneColor;
        this.territorySize = DEFAULT_TERRITORY_SIZE;
        this.survivability = 0;
    }
}

/**
 * The territory of the board.
 * 
 * @param {number} vertex The vertex of the territory.
 * @param {Territory} territory The territory of the vertex.
 * 
 */
class VertexTerritory {
    vertex: Vertex;
    territory: Territory;

    /**
     * 
     * @param {Vertex} vertex The vertex of the territory.
     * @param {Territory} territory The territory of the vertex.
     * 
     */
    constructor(vertex: Vertex, territory: Territory) {
        this.vertex = vertex;
        this.territory = territory;
    }
}

/**
 * The territory of the board.
 * 
 * @param {StoneColor} stoneColor The color of the stones in the territory.
 * @param {number} propability The propability of the territory.
 * 
 */
class Territory {
    stoneColor: StoneColor;
    propability: number;

    /**
     * 
     * @param {StoneColor} stoneColor The color of the stones in the territory.
     * 
     */
    constructor(stoneColor: StoneColor) {
        this.stoneColor = stoneColor;
        this.propability = 0;
    }
}