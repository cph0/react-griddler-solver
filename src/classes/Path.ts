export enum Action {
    /** 
     *  1,2,3|-------- -> 0.00.000
     *  Sum of items equals line length 
    */
    FullLine = 1,
    /**
     *  1,4|-------- -> ----00--
     *  Sum of items at least half the line
    */
    OverlapLine = 2,
    /**
     *  2,2,3|--.0---> |--.00--
     *  Solid count is less than the min item
    */
    MinItem = 3,
    /**
     *  1,2,3|-------- -> 0.00.000
     *  Sum of items equals line length
    */
    MaxItem = 4,
    /**
     *  1,2,3|--00---- -> |-.00.----
     *  Solid count equals item
    */
    CompleteItem = 5,
    /**
     *  1,2,3|0.-.00.000 -> |0...00.000
     *  Sum of solids equals items.  Dots in gaps.
    */
    FullLineDots = 6,
    /**
     *  1,2,3|-0-0-----| -> |-0.00.---|
     *  Item pushes the next item forwards
    */
    LineForwardShift = 7,
    /**
     *  1,2,3|.0.-0----0-| -> |.0.-0-.--0-|
     *  Last item and item cannot reach here
    */
    LineBackDots = 8,
    /**
     *  1,2,3|-0--0-0---| -> |-0-00-0---|
     *  Next item pushes the item backwards
    */
    LineBackwardShift = 9,
    /**
     *  1,2,3|0.--.000 -> |0.00.000
     *  Sum of items equals gap length
    */
    GapFull = 10,
    /**
     *  1,2,3|0.------- -> 0.-0--00-
     *  Sum of items at least half of gap length
    */
    GapOverlap = 11,
    /**
     *  1,2,2,3|0---.-.---| -> |0---...---|
     *  All valid items greater than gap size
    */
    GapDots = 12,
    /**
     *  1,1,4,...//|.--.0.0-000- to |.--.0.0.000-
     *  Two solids cannot join
    */
    NoJoin = 13,
    /**
     *  1,9,...//|.---0-0--0--- to |.---0-000000-
     *  Two solids must join
    */
    MustJoin = 14,
    /**
     *  1,9,3// |---0-0------------0 to |---0-0--------..--0
     *  Two isolated items cannot reach here
    */
    IsolatedItemsReach = 15,
    /**
     *  1,2,3|0.-0--.000| to |0.-0-..000|
     *  Item cannot reach gap end and no more items
    */
    ItemForwardReach = 16,
    /**
     *  1,2,3|0.--0-.000| to |0..-0-.000|
     *  Item cannot reach gap start and no more items
    */
    ItemBackwardReach = 17,
    /**
     * 2,2,1,1,1,2,1,1// --0--.0| to --0.0.0|
     * Between solid and end, next item equals length
    */
    HalfGapFullPart = 18,
    /**
     * ...,2,2//.--0----| to .--0--0-|
     * Between solid and end, next item is over half the length     
    */
    HalfGapOverlap = 19,
    /**
     * 1,1,1,4,...//|------0--// to |-----.0--
     * All items before equal solid count and sum fits exactly
    */
    SumDotForward = 20,
    /**
     * ...,3,1,1,3//-0----.000.|// to -0.---.000.|
     * All items after equal solid count and sum fits exactly
    */
    SumDotBackward = 21,
    /**
     *  1,2,3|0.----.000| to |0.0---.000|
     *  Try a point at the first possible position
    */
    TrialAndError = 22,
    /**
     *  Restrict where items of a certain colour can go by looking at
        the perpendicular lines and their appropriate items.
    */
    ColourCrossReference = 23
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