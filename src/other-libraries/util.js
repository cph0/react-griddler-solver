
export function print(x) { console.log(JSON.stringify(x)); };
// var assert = function(x) {console.assert(x);}; //Doesn't seem to work, at least in Chrome
export function assert(x) {
    if (!x) {
        console.log((new Error()).stack);
        undefined.x;
    }
};

var _add = function (a, b) { return a + b; };
export function sum(seq) { return seq.reduce(_add, 0); };

// Sort an array of ints. Warning, sorts in place!
export function sort(arr) {
    arr.sort(function (a, b) { return a - b; });
    return arr;
};

// find/has/discard L perform a linear search
// the B versions use binary search and hence are only usable for sorted arrays

// Find index of element, or -1 on failure
export function findL(arr, searchElement) { return arr.indexOf(searchElement); }
export function findB(arr, searchElement) {
    // adapted from http://oli.me.uk/2013/06/08/searching-javascript-arrays-with-a-binary-search/
    var minIndex = 0;
    var maxIndex = arr.length - 1;

    while (minIndex <= maxIndex) {
        var curIndex = (minIndex + maxIndex) / 2 | 0;

        if (arr[curIndex] < searchElement) {
            minIndex = curIndex + 1;
        }
        else if (arr[curIndex] > searchElement) {
            maxIndex = curIndex - 1;
        }
        else {
            return curIndex;
        }
    }

    return -1;
};

// check if element is in array
export function hasL(arr, searchElement) { return findL(arr, searchElement) !== -1; };
export function hasB(arr, searchElement) { return findB(arr, searchElement) !== -1; };


var _discard = function (arr, arr_ind) {
    if (arr_ind !== -1) { arr.splice(arr_ind, 1); }
    return arr_ind !== -1;
};

// discard element if present. return true if element was discarded
export function discardL(arr, x) { return _discard(arr, findL(arr, x)); };
export function discardB(arr, x) { return _discard(arr, findB(arr, x)); };