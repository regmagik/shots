const url = 'https://alpha.cairnsoftware.com/api/Vaccine';// todo: add environment config

function getHeaders(){
	return {
		'Content-Type': 'application/json',
		'apikey': 'Bq5UXwkPGxhZWXIXWWYHru0Upe2SiPMY',
	  }
}
//function sleep(ms) {
//	return new Promise(resolve => setTimeout(resolve, ms));
//}
export async function getLocation(code) {
	const target = `${url}/GetLocation/${code}`;
	console.log('get', target);

//	await sleep(1000);

	const response = await fetch(target, { headers: getHeaders() });
	console.log('response:', response);
	const json = await response.json();
	console.log('json:', json);
	if (json.StatusCode > 299) {// this API returns status 200 and uses StatusCode to indicate errors
		throw new Error('Please, check the location: ' + json.Message);
	}
	return json;
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
	const response = await fetch(`${url}/AddQueue`, {
	  method: 'POST', // *GET, POST, PUT, DELETE, etc.
	  //mode: 'no-cors', // no-cors, *cors, same-origin
	  cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
	  //credentials: 'same-origin', // include, *same-origin, omit
	  headers: getHeaders(),
	  body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
	console.log("res", response);
	if (!response.ok) {
		throw new Error('Failed to connect. Please check your Internet connection or try again later.');
	}
var json = await response.json(); // parses JSON response into native JavaScript objects
	console.log('data', json);
	if (json.StatusCode > 299) {// this API returns status 200 and uses StatusCode to indicate errors
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

export default { post, put, getLocation };
