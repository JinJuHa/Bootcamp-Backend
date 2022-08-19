const mec = {};

mec.sum = function(a,b){
    return a + b;
}
mec.sub = function(a,b){
    return a - b;
}
mec.mul = function(a,b){
    return a*b;
}
mec.div = function(a,b){
    return a/b;
}
mec.rem = function(a,b){
    return a%b
}

module.exports=mec;

