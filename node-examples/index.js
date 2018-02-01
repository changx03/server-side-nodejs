var rect = {
  perimeter: (x, y) => 2 * (x + y),
  area: (x, y) => x * y,
};

// import rect2 from './reactangle';

// const rect2 = require('./reactangle');
// console.log(rect2.area(2, 2));

// Callback
const rect3 = require('./callback');

function solveRect(l, b) {
  console.log('Solving for rectangle with l = ' + l + ' and b = ' + b);
  rect3(l, b, (err, rectangle) => {
    if (err) {
      console.log('ERROR: ', err.message);
    } else {
      console.log(
        'The area of the rectangle of dimensions l = ' +
          l +
          ' and b = ' +
          b +
          ' is ' +
          rectangle.area()
      );
      console.log(
        'The perimeter of the rectangle of dimensions l = ' +
          l +
          ' and b = ' +
          b +
          ' is ' +
          rectangle.perimeter()
      );
    }
  });
  console.log('This statement after the call to rect()');
}

solveRect(2, 4);
