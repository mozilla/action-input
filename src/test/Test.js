/**
 *	Test holds the functions to run a unit test, including setup, test logic, and teardown functions.
 *
 *	Look in `src/test/index.html` for the test suite for this project
 *
 *	assert*(...) functions return nothing if the assertion is true and throw an Error if the assertion is false.
 */
export default class Test {
	constructor(name, testFunction, setupFunction=null, teardownFunction=null){
		this.name = typeof name === undefined ? "Unnamed test" : name
		this.testFunction = testFunction
		this.setupFunction = setupFunction
		this.teardownFunction = teardownFunction
		this.assertionCount = 0
	}

	static run(testArray){
		let passedTests = []
		let failedTests = []
		let assertionCount = 0
		for(let test of testArray){
			let passed = test.test()
			assertionCount += test.assertionCount
			if(passed){
				passedTests.push(test)
			} else {
				failedTests.push(test)
			}
		}
		return [passedTests, failedTests, assertionCount]
	}

	/**
	* Run and print results to the console
	*/
	static runAndLog(testArray){
		var [passedTests, failedTests, assertionCount] = Test.run(testArray)
		console.log(`assertions: ${assertionCount}  total: ${passedTests.length + failedTests.length}  passed: ${passedTests.length}  failed: ${failedTests.length}`)
	}


	test() {
		if(typeof this.setupFunction == 'function'){
			try {
				this.setupFunction(this)
			} catch (e) {
				console.error("Setup error", e)
				return false
			}
		}
		try {
			this.testFunction(this)
			return true
		} catch (e) {
			console.error("Test error", e)
			return false
		} finally {
			if(typeof this.teardownFunction == 'function'){
				try {
					this.teardownFunction(this)
				} catch (e) {
					console.error("Teardown error", e)
				}
			}
		}
	}

	assertTrue(value){
		this.assertionCount += 1
		if(!value){
			throw new Error(`${value} is not true`)
		}
	}
	assertType(value, typeName){
		this.assertionCount += 1
		if(value == null){
			throw new Error(`${value} is null, so it not of type ${typeName}`)
		}
		if(typeof value !== typeName){
			throw new Error(`${value} is of type ${typeof value}, not ${typeName}`)
		}
	}
	assertInstanceOf(value, clazz){
		this.assertionCount += 1
		if(value instanceof clazz){
			return
		}
		throw new Error(`${value} is not an instance of ${clazz}`)
	}
	assertNull(value){
		this.assertionCount += 1
		if(value !== null){
			throw new Error(`${value} is not null`)
		}
	}
	assertEqual(val1, val2){
		this.assertionCount += 1
		if(val1 === null){
			if(val2 !== null){
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if(val2 === null){
			if(val1 !== null){
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if(val1 == null){
			return
		}
		if(typeof val1 == "undefined"){
			if(typeof val2 !== "undefined"){
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if(typeof val2 == "undefined"){
			if(typeof val1 !== "undefined"){
				throw new Error(`${val1} != ${val2}`)
			}
		}
		if(typeof val1 == "undefined"){
			return
		}
		if(typeof val1.equals == "function"){
			if(val1.equals(val2) == false){
				throw new Error(`${val1} != ${val2}`)
			}
		}
		else if(val1 != val2){
			throw new Error(`${val1} != ${val2}`)
		}
		return
	}
	assertNotEqual(val1, val2){
		this.assertionCount += 1

	}
}