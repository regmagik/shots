const url = 'https://alpha.cairnsoftware.com/api/Vaccine/AddQueue';// todo: add environment config

// use a header key/value to authenticate API access:
// apikey
//Value = Bq5UXwkPGxhZWXIXWWYHru0Upe2SiPMY

//function sleep(ms) {
//	return new Promise(resolve => setTimeout(resolve, ms));
//}
export async function getResult(code) {
	console.log("getResult", code);
	const target = `${url}/result/${code}`;
	console.log('get', target);

//	await sleep(1000);

	if (code === "TESTXXX1")
		return { found: true, ready: false };
	if (code === "TESTXXX2")
		return { found: true, ready: true, positive: false };
	if (code === "TESTXXX3")
		return { found: true, ready: true, positive: true };
	if (code === "TESTXXX4")
		return { found: false };
	if (code === "TESTXXX5")
		throw new Error("simulated error message");

	try {
		const response = await fetch(target);
		const result = await response.json();
		console.log('Success:', result);
		return result;
    }
	catch (error)
	{
		console.error('getResult Error:', error);
		throw error;
	}
}
export async function postFile(file, field, id) {
	//	console.log("postFile", field, file.type, id);
	const target = `${url}/${id.toString()}/${field}`;
	console.log('Upload to', target);
	const formData = new FormData();
	formData.append('file', file);
	fetch(target, {
		method: 'POST',
		body: formData
	})
		.then((result) => {
			console.log('Success:', result);
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}
async function post(data = {}) {
	console.log("POST", data);
	const response = await fetch(url, {
	  method: 'POST', // *GET, POST, PUT, DELETE, etc.
	  //mode: 'no-cors', // no-cors, *cors, same-origin
	  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	  //credentials: 'same-origin', // include, *same-origin, omit
	  headers: {
		'Content-Type': 'application/json',
		'apikey': 'Bq5UXwkPGxhZWXIXWWYHru0Upe2SiPMY',
//		'Accept': '*/*'
	  },
	  body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	console.log("res", response);
	if (!response.ok) {
		throw new Error('Failed to connect. Please check your Internet connection or try again later.');
	}
var json = await response.json(); // parses JSON response into native JavaScript objects
	console.log('data', json);
	if (json.StatusCode > 299) {
		throw new Error('Please check your answers: ' + json.Message);
    }
	return json;
}

  async function put(url = '', data = {}) {
	console.log(data);
	// Default options are marked with *
	const response = await fetch(url, {
	  method: 'PUT', // *GET, POST, PUT, DELETE, etc.
	  mode: 'cors', // no-cors, *cors, same-origin
	  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	  credentials: 'same-origin', // include, *same-origin, omit
	  headers: {
		'Content-Type': 'application/json'
		// 'Content-Type': 'application/x-www-form-urlencoded',
	  },
	  redirect: 'follow', // manual, *follow, error
	  referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
	  body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	console.log(response);
	return response.json(); // parses JSON response into native JavaScript objects
  }

export default { post, put };
