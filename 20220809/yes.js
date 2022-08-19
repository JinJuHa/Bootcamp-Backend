const { odd, even } = require('./so.js')

function checkNumberOddOrEven(num){
    if (num % 2){
        return odd
    }
    return even
}

function checkStringOddOrEven(str){
    if (str.length % 2){
        return odd
    }
    return even
}

module.exports = {checkNumberOddOrEven, checkStringOddOrEven}