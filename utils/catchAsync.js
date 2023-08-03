module.exports = (func) => {
	return (req, res, next) => {
		func(req, res, next).catch(next);
	};
};

//THIS^ IS THE ARROW FUNCTION VERSION OF THE FUNCTION BELOW, WHICH WE USED A COUPLE LESSONS AGO.
// function catchAsync(fn) {
// 	return function (req, res, next) {
// 		fn(req, res, next).catch((e) => next(e));
// 	}
// }
