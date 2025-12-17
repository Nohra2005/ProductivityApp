// utils/TimeUtils.js

// Converts total seconds into an {h, m, s} object
export const secondsToHms = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);

    return { h, m, s };
};

// Converts h, m, s into total seconds
export const hmsToSeconds = (h, m, s) => {
    return (h * 3600) + (m * 60) + s;
};