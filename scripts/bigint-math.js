var bmath = {};

bmath.gcd = function(a, b) {
  // Euclidean algorithm
  while(b != 0n) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
};

bmath.lcm = function(a, b) {
  return (a * b) / bmath.gcd(a, b);
};

bmath.modMultInverse = function(a, m) {
  // Extended Euclidian algorithm
  //   https://en.wikipedia.org/wiki/Modular_multiplicative_inverse#Computation
  //   https://en.wikipedia.org/wiki/Extended_Euclidean_algorithm#Pseudocode
  var oldR = a;
  var r = m;
  var oldS = 1n;
  var s = 0n;
  
  while(r > 0n) {
    // BigInt division truncates, which is what we want.
    var quot = oldR / r;
    
    var tempR = r;
    r = oldR - quot * r; // alternatively, r = oldR % r;
    oldR = tempR;
    
    var tempS = s;
    s = oldS - quot * s;
    oldS = tempS;
  }
  
  if(oldS < 0)
    oldS += m;
  return oldS;
};

bmath.modExp = function(b, e, n) {
  // https://en.wikipedia.org/wiki/Modular_exponentiation#Right-to-left_binary_method
  var res = 1n;
  b = b % n;
  while(e > 0n) {
    if(e % 2n == 1n)
      res = (res * b) % n;
    e = e >> 1n;
    b = (b * b) % n;
  }
  return res;
};

bmath.invPow = function(b, n) {
  // integer component of the nth root of b
  // result ** n <= b < (result + 1) ** n
  // using the Babylonian method (effectively the same as Newton's method)
  if(b < 0n)
    throw new Error("cannot find the root of a negative number");
  if(b == 0n || b == 1n)
    return b;
  
  var x = b / 2n;
  while(!(x ** n <= b && b < (x + 1n) ** n)) {
    x = (x*(n-1n) + b / x**(n-1n)) / n;
  }
  return x;
}
