function CreateDebounce(func, delay) {
    let timerId
    return function(...args) {
        clearTimeout(timerId)
        timerId = setTimeout(() => {
            func.apply(this, args);
        }, delay)
    }
}

module.exports = CreateDebounce