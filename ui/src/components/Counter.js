import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { useFormFields } from './Field';
import api, { postFile } from './api';
import Constants from '../constants';
import LoaderButton from './LoaderButton';

function getLocal(type) {
    const savedState = sessionStorage.getItem(type);
    const state = JSON.parse(savedState) || {};
    return state;
}
function setLocal(type, data) {
    sessionStorage.setItem(type, JSON.stringify(data));
}
function getLocalPatient() {
    return getLocal("Patient");
}
function getLocalInsured() {
    return getLocal("Insured");
}
function isValidEmail(email) {
    var re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function isValidAptDate(x) {
    const dateParts = parseISODateParts(x);
    if (!dateParts) return false;
    const [year, month, date] = dateParts;
    console.log(year, month, date);
    return new Date(year, month, date) > Date.now();
}

function isValidDOB(x) {
    const dateParts = parseISODateParts(x);
    if (!dateParts) return false;
    const [year, month, date] = dateParts;
    return year > currentYear - 120 && new Date(year, month, date) < Date.now();
}

function parseISODateParts(x) {
    console.log('parseISODate', x);
    var re = /^\d{4}-\d{2}-\d{2}$/;
    if (!re.test(x)) {
        console.log(`it must be YYYY-MM-DD`);
        return false;
    }
    const parts = x.split('-');
    console.log(parts);
    var year = +parts[0];
    const month = +parts[1];
    var date = +parts[2];
    if (month === 2 && date > 29) {
        console.log(`there's max of 29 days in February`);
        return false;
    }
    if (month === 2 && date > 28 && year % 4) {
        console.log(`there's only 28 days in February on a non-leap year`);
        return false;
    }
    if (month === 4 || month === 6 || month === 9 || month === 11) {
        if (date > 30) {
            console.log(`there's only 30 days in this month`);
            return false;
        }
    }
    return [year, month, date];
}

function isValidSsn(x) {
    var digits = x.replace(/-/g, '');
    console.log('SSN', digits);
    return /^\d{9,10}$/.test(digits);
}

function isValidPhone(x) {
    var digits = x.replace(/[-+() .]/g, '');
    console.log('phone', digits);
    return /^\d{10}$/.test(digits);
}

function validate(data, field, name, type, validator) {
    console.log('validate', field);
    if (validator && !validator(data[field]))
        throw new Error(`Please enter a valid ${name || field}`);

    if (!data[field])
        throw new Error(`Please enter ${name || field}`);

    if (type === 'email') {
        if (!isValidEmail(data[field]))
            throw new Error(`Please enter a valid ${name || field}`);
    }
    if (type === 'phone') {
        if (!isValidPhone(data[field]))
            throw new Error(`Please enter a valid ${name || field}`);
    }
}

export function Edit(props) {
    const type = props.type || "text";
    return (
        <div className="col-md-6 mb-3">
            <label htmlFor={props.id}>{props.name} {props.required &&
                "*"
            }</label>
            <div className="input-group">
                { type === "email" && <div className="input-group-prepend">
                    <span className="input-group-text">@</span>
                </div>
                }
                <input type={ type } className="form-control" id={props.id}
                    placeholder={props.name}
                    value={props.fields[props.id] || ''}
                    onChange={props.setValue} />
            </div>
        </div>
    );
}
export function SelectImage(props) {
    function onChange(event) {
        const files = event.target.files;
        if (!files || !files.length) return;
        console.log("got", files.length, "files");
        const file = files[0];
//        if (!file) setError('No file selected');
        setText(`${props.name}: ${file.name}`);
        props.onChange(props.id, file);
    }
    const [text, setText] = useState(`Select ${props.name} image`);
    const labelId = `${props.id}Label`
    return (<div className="custom-file">
        <input type="file" id={props.id} name={ props.id}
            onChange={onChange}
            accept="image/*" className="custom-file-input"/>
        <label className="custom-file-label"
            htmlFor={props.id} id={labelId}>{text}</label>
    </div>);
}
export function Select(props) {
    return (
        <div className="col-md-6 mb-3">
            <label htmlFor={props.id}>{props.name} {props.required &&
                "*"
            }</label>
            <select className="custom-select d-block w-100"
                id={props.id}
                value={props.fields[props.id] || ''}
                onChange={props.setValue} >
                
                <option value="">Please select...</option>
                {props.children}
            </select>
            
            {props.required &&
                <div className="invalid-feedback">
                    {props.name} is required.
                </div>
            }
        </div>
    );
}

function isAlphaNum(str) {
    var code, i, len;

    for (i = 0, len = str.length; i < len; i++) {
        code = str.charCodeAt(i);
        if (!(code > 47 && code < 58) && // numeric (0-9)
            !(code > 64 && code < 91) && // upper alpha (A-Z)
            !(code > 96 && code < 123)) { // lower alpha (a-z)
            return false;
        }
    }
    return true;
};

export function Complete(props) {
    const confirmation = sessionStorage.getItem("confirmation");
    const history = useHistory();
    if (!confirmation)
        history.push('/');

    return (
        <div>
            <h4>Complete</h4>
            <p>Your confirmation number is: <b>{confirmation}</b>.</p>
			<p>We have emailed it to you.</p>
        </div>
    );
}

export function Insured() {
    let state = getLocalInsured();
	if (!state["insRelationship"] && !state["insAddress1"] 
		&& !state["insAddress2"]
		&& !state["insCity"] && !state["insZip"] && !state["insDob"]) {
		const pat = getLocalPatient();
		state = {
			...state, insRelationship: Constants.self, 
			insFirstName: pat.firstName, insLastName: pat.lastName,
			insAddress1: pat.address1, insAddress2: pat.address2,
			insCity: pat.city, insState: pat.state, insZip: pat.zip, 
			insDob: pat.dob
		};
	}
	const [fields, setValue] = useFormFields(state);
    const history = useHistory();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    var fileInputs = [
        { id: "insuranceFront", name: "Insurance Card Front" },
        { id: "insuranceBack", name: "Insurance Card Back" },
        { id: "license", name: "Driver's License" },
    ];
    var files = {};
    function onFile(id, file) {
        setError('');
        console.log("got", id);
        files[id] = file;
        if (file.size > Constants.maxFileSize)
            setError(`Please pick a file smaller than ${Constants.maxFileSize / 1000000} MB`);
    }
    async function onSave(e) {
        e.preventDefault();
        setError('');
        sessionStorage.setItem("Insured", JSON.stringify(fields));

        // merge into one object
        const data = {...getLocal('location'), ...getLocalPatient(), ...fields};
        try {
            sessionStorage.setItem("confirmation", '');

            // validate form data
//            validate(data, 'location');
//            validate(data, 'firstName');
//            validate(data, 'lastName');
            validate(data, 'insName', 'Insurance Name');
            // if the patient has insurance...
            if (fields['insName'] !== Constants.noInsurance) {
                validate(data, 'insFirstName', 'Insured First Name');
                validate(data, 'insLastName', 'Insured Last Name');
                validate(data, 'insPolicyNumber', 'Policy Number');
//                validate(data, 'insGroupNumber', "Group Number");
                validate(data, 'insRelationship', 'Patient Relationship to Insured');
                validate(data, 'insDob', "Insured Date of Birth" );
                validate(data, 'insGender', "Insured Gender" );
                validate(data, 'insAddress1', "Insured Address" );
                validate(data, 'insCity', "Insured City" );
                validate(data, 'insState', "Insured State" );
                validate(data, 'insZip', "Insured Zip");

                // also require insurance card images
                fileInputs.map(i => ({ ...i, required:true})).forEach(i => validateFile(i));
            }
            fileInputs.forEach(i => validateFile(i));

            setLoading(true);

			// convert questions to int
            questions().filter(q => data[q.id]).forEach(q => { data[q.id] = parseInt(data[q.id]) || 1;})

			// Temporary hardcode dates 
// FirstShotDate": "5/14/2021 9:30 AM",
// SecondShotDate": "6/14/2021 9:30 AM",

var t = new Date();
var date = t.getDate();
var min = t.getMinutes();
min = 15*(Math.ceil(min / 15) + 1);
t.setMinutes(min);
t.setDate(date+1);
data.FirstShotDate = t.toJSON();
t.setDate(date+30);
data.SecondShotDate = t.toJSON();
data.C_ConsentName = "XConsent";
data.C_ConsentDate = "11/22/2000";
data.Vaccine = "MODERNA";

// post data to the server
            const confirmation = await api.post(data);
            if (!confirmation)
                throw new Error('Failed to get confirmation number. ');

            //            console.log(fileInputs);
            // const filesToUpload = fileInputs.filter(i => files[i.id]);
            // if (filesToUpload.some(x => true)) {
            //     console.log('uploading', filesToUpload.length, 'files...')
            //     await Promise.all(
            //         filesToUpload.map(async i => uploadFile(i, confirmation.id)));
            //     console.log('uploaded.');
            // }

            // display confirmation number
            sessionStorage.setItem("confirmation", confirmation.ConfirmationCode);
            history.push("complete");
        }
        catch (e) {
            setLoading(false);
            console.log(e);
            setError(e.message);
        }
        finally {
        }
    }

    return (
        <div>
            <h4>Insurance</h4>
            <form className="needs-validation" >
                <div className="row">
                    <Select id="insName" name="Insurance Name" required="true" fields={fields} setValue={setValue}>
                        { Constants.insurers.map((name, i) =>
                            <option key={i}>{name}</option>
                        )}
                    </Select>
                    <Edit id="insPolicyNumber" name="Policy Number" fields={fields} setValue={setValue} />
                </div>
                <div className="row">
                    <Edit id="insGroupNumber" name="Group Number" fields={fields} setValue={setValue} />
                    <Select id="insRelationship" name="Patient Relationship to Insured" fields={fields} setValue={setValue}>
                        { Constants.relToInsured.map(rel =>
                            <option key={rel.code} value={rel.code}>{ rel.name }</option>
                        )}
                    </Select>
                </div>
                <div className="row">
                    <Edit id="insFirstName" name="Insured First Name" fields={fields} setValue={setValue} />
                    <Edit id="insLastName" name="Insured Last Name" fields={fields} setValue={setValue} />
                </div>
                <div className="row">
                    <Edit id="insAddress1" name="Insured Address" fields={fields} setValue={setValue} />
                    <Edit id="insAddress2" name="Insured Address 2" fields={fields} setValue={setValue} />
                </div>
                <div className="row">
                    <Edit id="insCity" name="Insured City" fields={fields} setValue={setValue} />
                    <Select id="insState" name="Insured State" fields={fields} setValue={setValue}>
                        {stateOptions}
                    </Select>
                </div>
                <div className="row">
                    <Edit id="insZip" name="Insured Zip" fields={fields} setValue={setValue} />
                    <Select id="insGender" name="Insured Gender" fields={fields} setValue={setValue}>
                        {sexOptions}
                    </Select>
                </div>
                <div className="form-group">
                <SelectImage name="Insurance Card Front" id="insuranceFront" onChange={onFile} />
                </div>
                <div className="form-group">
                <SelectImage name="Insurance Card Back" id="insuranceBack" onChange={onFile} />
                </div>
                <div className="form-group">
                <SelectImage name="Driver's License" id="license" onChange={ onFile }/>
                </div>
                <div className="form-group">
                {error && <div className="alert alert-danger" role="alert">
                    {error}
                </div>}
                    <LoaderButton className="btn btn-primary btn-lg btn-block"
                        isLoading={loading}
                        onClick={ onSave }>Submit</LoaderButton>
                </div>
        </form>
        </div>
    );
    async function uploadFile(fileInput, id) {
        console.log('check file', fileInput.id);
        const file = files[fileInput.id];
        if (!file) {
            console.log('no file for', fileInput.id);
            return;
        }
        console.log('upload file', fileInput.id);
        await postFile(file, fileInput.id, id);
    }
    function validateFile(fileInput) {
        console.log(validateFile.name, fileInput.id);

        const file = files[fileInput.id];
        // files are optional
        if (!file)
            return;
        if (file.size > Constants.maxFileSize)
            throw new Error(`Please select a smaller file for ${fileInput.name}.`);
    }
}

export default function Patient (props) {
    const savedState = sessionStorage.getItem("Patient");
	let defaultState = {};
	questions().forEach(q => defaultState[q.id]="1");
    const state = JSON.parse(savedState) || defaultState;
	console.log(state);
    const [fields, setValue] = useFormFields(state);
    const history = useHistory();

    const inputs = [//{ id: "", name: "", required: true, type: "", options: },
        { id: "firstName", name: "Patient First Name", required: true },
        { id: "lastName", name: "Patient Last Name", required: true },
        { id: "email", name: "Email", type: "email", required: true, },
        { id: "cellPhone", name: "Cell Phone", required: true },
        { id: "sex", name: "Gender", options: sexOptions, required: true },
        { id: "dob", name: "Date of Birth", type: "date", required: true },
        { id: "address1", name: "Patient Address", required: true },
        { id: "city", name: "Patient City", required: true },
        { id: "state", name: "State", required: true, options: stateOptions },
        { id: "zip", name: "Zip", required: true },
        { id: "race", name: "Race", required: true, options: raceOptions },
        { id: "dl", name: "Driver's License/Other ID"},
        { id: "ssn", name: "SSN"},
    ];

    function onSave(e) {
		e.preventDefault();
        setError('');
        console.log(fields);

        try {
            inputs.filter(i => i.required).forEach(i => { validate(fields, i.id, i.name); });
            
			if (fields.SSN) {
                if (!isValidSsn(fields.SSN))
                    throw new Error(`Please enter a valid SSN`);
            }
            if (fields.DOB) {
                if (!isValidDOB(fields.DOB))
                    throw new Error(`Please enter a valid patient Date of Birth`);
            }
			
			// save data to the storage
            setLocal('Patient', fields);
            history.push("insured");
        }
        catch (e) {
            console.log(e);
            setError(e.message);
        }
    }
    const [error, setError] = useState('');

    function onRadio(e) {
        setValue(e);
    }
    return (
    <div>
        <h4 className="mb-3">Please tell us about the patient.</h4>
        <form>
            <div className="row">
                {inputs.map((input, i) => 
                    input.options ?
                        <Select key={input.id} id={input.id} name={input.name} required={ input.required } fields={fields} setValue={setValue}>
                            {input.options}
                        </Select>
                        :
                        <Edit key={input.id} id={input.id} name={input.name} required={input.required} type={input.type} fields={fields} setValue={setValue} />
                )}
            </div>
            <h4 className="mb-3">Please answer to the best of your knowledge</h4>
                {questions().map(q => (
                    <div key={q.id}>
                    <label>{q.name || `${q.id}?`} {q.yesInputs}</label>
                    <br />
                    <div className="btn-group btn-group-toggle" data-toggle="buttons">
                        <label className={"btn btn-outline-primary " + (fields[q.id] === "1" ? "active" : "")}>
                            <input type="radio" name={q.id} onChange={onRadio} value="1" checked={fields[q.id] === "1"} id="option1" /> Unknown
                        </label>
                            <label className={"btn btn-outline-primary " + (fields[q.id] === "2" ? "active" : "")}>
                            <input type="radio" name={q.id} onChange={onRadio} value="2" checked={fields[q.id] === "2"} id="option2"/> No
                        </label>
                            <label className={"btn btn-outline-primary " + (fields[q.id] === "3" ? "active" : "")}>
                            <input type="radio" name={q.id} onChange={onRadio} value="3" checked={fields[q.id] === "3"} id="option3"/> Yes
                        </label>
                    </div>
					{ q.yesInput && fields[q.id] === "3" && <Edit id={`${q.id}List`} name="Please, list" fields={fields} setValue={setValue}></Edit>}
					{ q.yesInputs && fields[q.id] === "3" && q.yesInputs.split(',').map(x => 
					<Edit key={x} id={`${q.id}${x}`} name={`${x} date`} fields={fields} setValue={setValue}></Edit>)}
                    <hr/>
                </div>
            ))}
            {error && <div className="alert alert-danger" role="alert">
                {error}
            </div>}
            <button className="btn btn-primary btn-lg btn-block mb-3" onClick={onSave}>Continue</button>
        </form>
    </div>
    );
}

export function Start () {
    const inputs = [//{ id: "", name: "", required: true, type: "", options: },
        { id: "location", name: "Location", required: true },
    ];

	async function onNext(data){
		const options = await api.getLocation(data.location);
		setLocal('options', options);
	}

    return <Form formId='location' title='Please enter the location code.'
		inputs={inputs} save={onNext} next="patient"></Form>
}

export function Form ({formId, title, inputs, save, next}) {
    const savedState = sessionStorage.getItem(formId);
    const state = JSON.parse(savedState) || {};
    const [fields, setValue] = useFormFields(state);
    const history = useHistory();

    async function onSave(e) {
		e.preventDefault();
        setError('');

        try {
            inputs.filter(i => i.required).forEach(i => { validate(fields, i.id, i.name); });
            // save data to the session storage
            sessionStorage.setItem(formId, JSON.stringify(fields));
			await save(fields);
            history.push(next);
        }
        catch (e) {
//            console.log(e);
            setError(e.message);
        }
    }
    const [error, setError] = useState('');

    return (
    <div>
        <h4 className="mb-3">{title}</h4>
		<div className="row">
			{inputs.map((input, i) => 
				input.options ?
					<Select key={input.id} id={input.id} name={input.name} required={ input.required } fields={fields} setValue={setValue}>
						{input.options}
					</Select>
					:
					<Edit key={input.id} id={input.id} name={input.name} required={input.required} type={input.type} fields={fields} setValue={setValue} />
			)}
		</div>
		{error && <div className="alert alert-danger" role="alert">
			{error}
		</div>}
		<button className="btn btn-primary btn-lg btn-block mb-3" onClick={onSave}>Continue</button>
    </div>
    );
}

const raceOptions = Constants.races.map((race, i) =>
    <option key={i} value={race.code}>{race.name}</option>
);

const sex = [{ id: "F", name: "Female" }, { id: "M", name: "Male" }, { id: "U", name: "Unknown" },];
const sexOptions = sex.map((s, i) =>
    <option key={i} value={s.id}>{s.name}</option>
);
const stateOptions = Constants.usStates.map((name, i) =>
    <option key={i}>{name}</option>
);
function questions() {
	const options = getLocal('options');
	return options.QuestionSource ? questions1 : questions0;
}
const questions1 = [//	{ id: "", name: "?" },
	{ id: "Custom_1", name: "Have you ever receive the COVID-19 vaccine?" },
	{ id: "Custom_2", name: "Have you had a positive COVID-19 test in the last 21 days and received convalescent plasma?" },
	{ id: "Custom_3", name: "Are you sick today or currently in isolation period for COVID-19?" },
	{ id: "Custom_4", name: "Have you ever had an allergic reaction to another vaccine (other than COVID-19 vaccine) or an injectible medication?" },
	{ id: "Custom_5", name: "Have you received any vaccinations in the past 14 days?" },
	{ id: "Custom_6", name: "Do you have a history of Guillain-Barré syndrome (progressive paralysis)?" },
	];
const questions0 = [//{ id: "", name: "" },
    { id: "B_Q1", name: "Do you feel sick today?" },
    { id: "B_Q2", name: "Have you been diagnosed with or tested positive for COVID-19 in the last 14 days?" },
    { id: "B_Q3", name: "In the past 14 days have you been identified as a close contact to someone with COVID-19?" },
    { id: "B_Q4", yesInput:true, name: "Do you have a history of allergic reaction or allergies to latex, medications, food or vaccines (examples: polyethylene glycol, polysorbate, eggs, bovine protein, gelatin, gentamicin, polymyxin, neomycin, phenol, yeast or thimerosal)?" },
    { id: "B_Q5", name: "Have you ever had a reaction after receiving a vaccination, including fainting or feeling dizzy? " },
    { id: "B_Q6", name: "Have you ever had a seizure disorder for which you are on seizure medication(s), a brain disorder, Guillain-Barré syndrome (a condition that causes paralysis) or other nervous system problem?" },
    { id: "B_Q7", yesInput:true, name: "Have you received any vaccinations or skin tests in the past eight weeks?" },
    { id: "B_Q8", yesInputs:"Pneumonia,Shingles,Whooping Cough", name: "Have you ever received the following vaccinations?" },
    { id: "B_Q9", yesInput:true, name: "Do you have any chronic health condition such as cancer, chronic kidney disease, immunocompromised, chronic lung disease, obesity, sickle cell disease, diabetes, heart disease?" },
    { id: "B_Q10", name: "For women: Are you pregnant or considering becoming pregnant in the next month?" },
    { id: "B_Q11", name: "For COVID-19 vaccine only: Have you been treated with antibody therapy specifically for COVID-19 (monoclonal antibodies or convalescent plasma)?" },
]


