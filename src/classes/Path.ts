export enum Action {
    FullLine = 1,
    OverlapLine = 2,
    MinItem = 3,
    MaxItem = 4,
    CompleteItem = 5,
    FullLineDots = 6,
    LineForwardShift = 7,
    LineBackDots = 8,
    LineBackwardShift = 9,
    GapFull = 10,
    GapOverlap = 11,
    GapDots = 12,
    NoJoin = 13,
    MustJoin = 14,
    IsolatedItemsReach = 15,
    ItemForwardReach = 16,
    ItemBackwardReach = 17,
    TrialAndError = 18,
    ColourCrossReference = 19
}

export default class Path {
    static Action = Action;

    public action: Action;
    public xPos: number;
    public yPos: number;

    constructor(xPos: number, yPos: number, action: Action) {
        this.xPos = xPos;
        this.yPos = yPos;
        this.action = action;
    }
}