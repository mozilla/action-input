
/**
* Utility methods that perform common tasks without allocation
*/

const split = function(input, separator, results){
	results.splice(0, results.length)
	_workingString.splice(0, _workingString.length)
	for(let i=0; i < input.length; i++){
		if(input[i] === separator){
			results.push(_workingString.join(''))
			_workingString.splice(0, _workingString.length)
		} else {
			_workingString.push(input[i])
		}
	}
	if(_workingString.length > 0){
		results.push(_workingString.join(''))
	}
	return results
}

let _workingString = []

export { split }