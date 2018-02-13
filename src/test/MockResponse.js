/**
 * MockResponse sort of acts like the Response object returned from fetch
 */
export default class MockResponse {
	constructor(responseData={}, status=200){
		this.responseData = responseData
		this.status = status
	}
	json(){
		return this.responseData
	}
}
