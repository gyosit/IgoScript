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
     * Remove empty groups from the board.
     * 
     */
    private cleanup() {
        this.groups = this.groups.filter(group => group.getStoneColor() !== StoneColor.Empty);
    }

    private cleanupKo() {
        this.groups = this.groups.filter(group => group.getStoneColor() !== StoneColor.Ko);
    }

    /**
    * Play a stone on the board.
    *
    * @param {Vertex} vertex The vertex to play the stone.
    * @param {StoneColor} stoneColor The color of the stone.
    * 
    */
    play(vertex: Vertex, stoneColor: StoneColor) {
        /* Whether the stone is introducing ko...
        * <<The conditions of introducing ko>>
        * 1. The play is not merged with the other groups.
        * 2. The play captures only one stone.
        * 3. The play leaves only one breath point.
        */
        let isIntroducingKo = true;

        // Check whether the stone is empty.
        if (stoneColor === StoneColor.Empty) {
            throw new Error('Empty stone is not allowed to play.');
        }

        // Check whether the vertex is occupied.
        for (let group of this.groups) {
            for (let vertexStone of group.getVertexStones()) {
                if (vertexStone.vertex.index === vertex.index) {
                    if (vertexStone.stone.stoneColor === StoneColor.Ko) {
                        throw new Error('Ko is not allowed to play.');
                    }
                    throw new Error('The vertex is occupied.');
                }
            }
        }

        const buckupGroups = this.groups.slice();

        const group = new Group(this.groups.length, stoneColor);
        group.addVertexStone(vertex, stoneColor);

        this.groups.push(group);

        // Merge the groups if the stones are adjacent.
        const allyGroups = this.groups.filter(g => g.getStoneColor() === stoneColor);
        const stones = group.getVertexStones();
        const mergingGroups: Group[] = [group]; // The group to merge including the played group.
        for (const stone of stones) {
            const adjacentGroups: Group[] = allyGroups.filter(g => 
                Vertex.includes(g.getBreathPoints(), stone.vertex) &&
                mergingGroups.indexOf(g) === -1
            );
            for (const adjacentGroup of adjacentGroups) {
                mergingGroups.push(adjacentGroup);
            }
        }
        //// Ko rule: 1. The play is not merged with the other groups.
        if (mergingGroups.length > 1) {
            isIntroducingKo = false;
        }
        //// Compare the ids of the group and the oldest group using reduce.
        const parentGroup = mergingGroups.reduce((oldestGroup, _group) => {
            return (oldestGroup.getStoneColor() === StoneColor.Empty || _group.getId() < oldestGroup.getId()) ? _group : oldestGroup;
        }, new Group(-1, StoneColor.Empty));
        if (parentGroup.getStoneColor() !== StoneColor.Empty) {
            for (const merginggroup of mergingGroups) {
                if (merginggroup.getId() !== parentGroup.getId()) {
                    parentGroup.merge(merginggroup);
                }
            }
        }

        // Check whether the oponent's stones are captured.
        const enemyGroups = this.groups.filter(g => g.getStoneColor() !== stoneColor && g.getStoneColor() !== StoneColor.Empty && g.getStoneColor() !== StoneColor.Ko);
        const capturedVertex: Vertex[] = [];
        for (const enemyGroup of enemyGroups) {
            const mayCaptured = enemyGroup.getVertexStones().map(vertexStone => vertexStone.vertex);
            const isCaptured = enemyGroup.collapsed(parentGroup);
            if (isCaptured) {
                capturedVertex.push(...mayCaptured);
                continue;
            }
            if (parentGroup.collapsed(enemyGroup)) {
                this.groups = buckupGroups;
                throw new Error('The vertex has no breath point.');
            }
        }
        //// Ko rule: 2. The play captures only one stone.
        if (capturedVertex.length !== 1) {
            isIntroducingKo = false;
        }

        // Ko rule: 3. The play leaves only one breath point.
        if (parentGroup.getBreathPoints().length !== 1) {
            isIntroducingKo = false;
        }

        // Change the captured vertex to the ko stone to forbid to play here next turn.
        this.cleanupKo(); // Remove the previous ko stone because it is banished by this new play.
        if (isIntroducingKo && capturedVertex.length === 1) {
            const koGroup = new Group(this.groups.length, StoneColor.Ko);
            koGroup.addVertexStone(capturedVertex[0], StoneColor.Ko);
            this.groups.push(koGroup);
        }

        this.cleanup();
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
            if (group.getStoneColor() === StoneColor.Empty) continue;
            if (group.getStoneColor() === StoneColor.Ko) {
                const koStone = group.getVertexStones()[0];
            }
            for (let vertexStone of group.getVertexStones()) {
                currentBoard[vertexStone.vertex.index] = vertexStone.stone;
            }
        }

        return currentBoard;
    }

    get(vertex: Vertex): StoneColor {
        if (vertex.index < 0 || vertex.index >= this.gameSize * this.gameSize) {
            throw new Error('The vertex is out of the board.');
        }
        const currentBoard = this.getCurrentBoard();
        return currentBoard[vertex.index].stoneColor;
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
     * Throw an error if the group is empty or ko.
     * 
     * @throws {Error} The operation is not allowed for the special group.
     * 
     */
    private errEmptyOrKo() {
        if (this.stoneColor === StoneColor.Empty || this.stoneColor === StoneColor.Ko) {
            throw new Error('The operation is not allowed for the special group.');
        }
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
        this.errEmptyOrKo();
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
     * @returns {boolean} Whether the group is captured.
     * 
     * @throws {Error} The groups are the same color.
     * 
     * @todo To consider of removing the breath points of both groups simultaneously.
     * 
     */
    collapsed(enemyGroup: Group): boolean {
        this.errEmptyOrKo();
        enemyGroup.errEmptyOrKo();
        // Check whether the groups are the same color.
        if (this.stoneColor === enemyGroup.stoneColor) {
            throw new Error('The groups are the same color.');
        }
        if (this.stoneColor === StoneColor.Empty || enemyGroup.stoneColor === StoneColor.Empty) {
            throw new Error('Empty groups are not allowed to collide.');
        }

        for (let vertexStone of enemyGroup.getVertexStones()) {
            if (Vertex.includes(this.breathPoints, vertexStone.vertex)) {
                this.removeBreathPoint(vertexStone.vertex);
            }
        }

        // If all the breath points are removed, the group is captured.
        if (this.breathPoints.length === 0) {
            this.id = -1;
            this.stoneColor = StoneColor.Empty;
            this.vertexStones = [];
            this.breathPoints = [];
            return true;
        }
        
        return false;
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
        if (this.vertexStones.length < 1) throw new Error('The group has no vertex stone.');
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
    addVertexStone(vertex: Vertex, stoneColor: StoneColor) {3
        // Check whether the vertex stone already exists.
        for (let vertexStone of this.vertexStones) {
            if (vertexStone.vertex.index === vertex.index) {
                throw new Error('The vertex stone already exists.');
            }
        }

        this.vertexStones.push(new VertexStone(vertex, new Stone(0, stoneColor)));

        // Update the breath points.
        if (this.stoneColor === StoneColor.Empty || this.stoneColor === StoneColor.Ko) return;
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
        this.errEmptyOrKo();
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
        this.errEmptyOrKo();
        group.errEmptyOrKo();
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