import React, { useState } from 'react';
import { useHistory } from "react-router-dom";
import { useFormFields } from './Field';
import api, { postFile, getResult } from './api';
import Constants from '../constants';
import LoaderButton from './LoaderButton';

function getLocal(type) {
    const savedState = sessionStorage.getItem(type);
    const state = JSON.parse(savedState) || {};
    return state;
}
function getLocalPatient() {
    return getLocal("Patient");
}
function getLocalInsured() {
    return getLocal("Insured");
}

export function Edit(props) {
    return (
        <div className="col-md-6 mb-3">
            <label htmlFor={props.id}>{props.name} {props.required &&
                "*"
            }</label>
            <input type="text" className="form-control" id={props.id}
                placeholder={props.name}
                value={props.fields[props.id] || ''}
                onChange={props.setValue} />
            {props.required &&
                <div className="invalid-feedback">
                    {props.name} is required.
                </div>
            }
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

export function Prompt(props) {
//    const confirmation = localStorage.getItem("confirmation");
    const [fields, setValue] = useFormFields({});
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    async function onSave(event) {
        event.preventDefault();
        const code = fields["confirmationCode"];
        if (!code) {
            setError("Confirmation Code is required.");
            return;
        }

        if (code.length > 8 || !isAlphaNum(code)) {
            setError("Confirmation Code is 8 letters or numbers");
            return;
        }

        try {
            setLoading(true);
            setResult(null);
            setError('');
            const response = await getResult(code);
            console.log("setResult", response);
            setResult(response);
        }
        catch (e) {
            console.log(e);
            setError("Error getting result for your confirmation code. Please try again later.");
        }
        finally {
            setLoading(false);
        }
    }
    return (
        <div>
            <h4>Please, enter your confirmation code</h4>
            <Edit id="confirmationCode" name="Confirmation Code"
                required="true" fields={fields} setValue={setValue} />
            <LoaderButton className="btn btn-primary btn-lg mb-3 btn-block" isLoading={loading}
                onClick={onSave}>View Test Results</LoaderButton>
            {error && <div className="alert alert-danger" role="alert">
                {error}
            </div>}
            {result && !result.found && <div className="alert alert-warning" role="alert">
                Your confirmation code is not valid.
                <hr />
                Please enter a valid confirmation code.
            </div>}
            {result && result.found && !result.ready && <div className="alert alert-primary" role="alert">
                Your confirmation code is valid, but your COVID-19 test result is not ready yet. 
                <hr />
                 Please try again later.
            </div>}
            {result && result.found && result.ready && <div className="alert alert-primary" role="alert">
                We are {result.positive ? "sorry" : "happy"} to inform you that
                your COVID-19 test
                result is {result.positive ? "POSITIVE" : "NEGATIVE"}.
            </div>}
            {result && result.date && <div className="alert alert-primary" role="alert">
                {result.ready ? "Tested" : "Registered"} on {result.date}.
            </div>}
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
    const confirmationSent = sessionStorage.getItem("confirmationSent");
    const history = useHistory();
    if (!confirmation)
        history.push('/');

    return (
        <div>
            <h4>Complete</h4>
            Your confirmation number is: {confirmation}.
            {confirmationSent &&
                <p>We have emailed it to you.</p>
            }
        </div>
    );
}

export function Insured(props) {
    let state = getLocalInsured();
    //TODO: default ins address to patient address
    if (!state["insAddress1"] && !state["insAddress2"]
        && !state["insCity"] && !state["insZip"]) {
        const pat = getLocalPatient();
        state = {
            ...state, insAddress1: pat.address1, insAddress2: pat.address2,
            insCity: pat.city, insState: pat.state, insZip: pat.zip
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
        const data = {...getLocalPatient(), ...fields};
        try {
            sessionStorage.setItem("confirmation", '');
            sessionStorage.setItem("confirmationSent", '');

            // validate form data
            validate(data, 'firstName');
            validate(data, 'lastName');
            fileInputs.forEach(i => validateFile(i));

            setLoading(true);
            // convert questions to int
            questions.filter(q => data[q.id]).forEach(q => { data[q.id] = parseInt(data[q.id]);})

			// Temporary hardcode dates and location
// FirstShotDate": "5/14/2021 9:30 AM",
// SecondShotDate": "6/14/2021 9:30 AM",

var t = Date.now();
var date = t.getDate();
t.setDate(date+1);
data.FirstShotDate = t.toJSON();
t.setDate(date+30);
data.SecondShotDate = t.toJSON();

data.Location = "TEST";
            // post data to the server
            const confirmation = await api.post(data);
            if (!confirmation)
                return;

            //            console.log(fileInputs);
            const filesToUpload = fileInputs.filter(i => files[i.id]);
            if (filesToUpload.some(x => true)) {
                console.log('uploading', filesToUpload.length, 'files...')
                await Promise.all(
                    filesToUpload.map(async i => uploadFile(i, confirmation.id)));
                console.log('uploaded.');
            }

            // display confirmation number
            sessionStorage.setItem("confirmation", confirmation.confirmationCode);
            sessionStorage.setItem("confirmationSent", confirmation.confirmationSent);
            history.push("complete");
        }
        catch (e) {
            console.log(e);
            setError(e.message);
        }
        finally {
            setLoading(false);
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
                    <Edit id="groupNumber" name="Group Number" fields={fields} setValue={setValue} />
                    <Select id="insRelation" name="Patient Relationship to Insured" required="true" fields={fields} setValue={setValue}>
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
    function validate(data, field) {
        console.log('validate', field);
        if (!data[field])
            throw new Error(`Please enter a valid ${field}`);
    }
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
    const state = JSON.parse(savedState) || {};
    //console.log(state);
    const [fields, setValue] = useFormFields(state);
    const history = useHistory();

    function onSave() {
        setError('');
        console.log(fields);

        // save data to the session storage
        sessionStorage.setItem("Patient", JSON.stringify(fields));
        history.push("insured");
    }
//    const [toggles, setToggle] = useState({});
    const [error, setError] = useState('');

    function onRadio(e) {
        setValue(e);
    }
    return (
    <div>
        <h4 className="mb-3">Please tell us about the patient.</h4>
        <form className="needs-validation">
            <div className="row">
                <Edit id="firstName" name="Patient First Name" required="true" fields={fields} setValue={setValue} />
                <Edit id="lastName" name="Patient Last Name" required="true" fields={fields} setValue={setValue} />
            </div>
            <div className="row">
                <div className="col-md-6 mb-3">
                    <label htmlFor="email">Email</label>
                    <div className="input-group">
                        <div className="input-group-prepend">
                            <span className="input-group-text">@</span>
                        </div>
                        <input type="text" className="form-control" id="email" required=""
                            value={fields["email"] || ''} onChange={ setValue } />
                        <div className="invalid-feedback">
                            Your email is required.
                        </div>
                    </div>
                </div>
                <Edit id="cellPhone" name="Cell Phone" fields={fields} setValue={setValue} />
            </div>
            <div className="row">
                <Edit id="dl" name="Driver's License" fields={fields} setValue={setValue}/>

                <div className="col-md-6 mb-3">
                    <label htmlFor="dob">Date of Birth</label>
                    <input type="date" className="form-control" id="dob"
                        value={fields["dob"] || ''} onChange={setValue} />
                </div>
            </div>

            <div className="row">
                <Edit id="address1" name="Patient Address" required="true" fields={fields} setValue={setValue} />
                <Edit id="address2" name="Patient Address 2" fields={fields} setValue={setValue}/>
            </div>

            <div className="row">
                <Edit id="city" name="Patient City" fields={fields} setValue={setValue} />
                <Select id="state" name="State" required="true" fields={fields} setValue={setValue}>
                    {stateOptions}
                </Select>
            </div>

                <div className="row">
                    <Edit id="zip" name="Zip" fields={fields} setValue={setValue} />
                    <Select id="race" name="Race" fields={fields} setValue={setValue}>
                        {raceOptions}
                    </Select>
                </div>
                <div className="row">
                    <Select id="sex" name="Gender" fields={fields} setValue={setValue}>
                        {sexOptions}
                    </Select>
                </div>
            <h4 className="mb-3">Please answer to the best of your knowledge</h4>
                {questions.map(q => (
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
            <button className="btn btn-primary btn-lg btn-block mb-3" onClick={(e) => { e.preventDefault(); onSave(); }}>Continue</button>
        </form>
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
const questions = [//{ id: "", name: "" },
    { id: "B_Q1", name: "Do you feel sick today?" },
    { id: "B_Q2", name: "Have you been diagnosed with or tested positive for COVID-19 in the last 14 days?" },
    { id: "B_Q3", name: "In the past 14 days have you been identified as a close contact to someone with COVID-19?" },
    { id: "B_Q4", yesInput:true, name: "Do you have a history of allergic reaction or allergies to latex, medications, food or vaccines (examples: polyethylene glycol, polysorbate, eggs, bovine protein, gelatin, gentamicin, polymyxin, neomycin, phenol, yeast or thimerosal)?" },
    { id: "B_Q5", name: "Have you ever had a reaction after receiving a vaccination, including fainting or feeling dizzy? " },
    { id: "B_Q6", name: "Have you ever had a seizure disorder for which you are on seizure medication(s), a brain disorder, Guillain-Barré syndrome (a condition that causes paralysis) or other nervous system problem?" },
    { id: "B_Q7", yesInput:true, name: "Have you received any vaccinations or skin tests in the past eight weeks?" },
    { id: "B_Q8", yesInputs:"Pneumonia,Shingles,Whooping Cough", name: "Have you ever received the following vaccinations?" },
    { id: "B_Q9", yesInput:true, name: "Do you have any chronic health condition such as cancer, chronic kidney disease, immunocompromised, chronic lung disease, obesity, sickle cell disease, diabetes, heart disease?" },
    { id: "B_QA", name: "For women: Are you pregnant or considering becoming pregnant in the next month?" },
    { id: "B_QB", name: "For COVID-19 vaccine only: Have you been treated with antibody therapy specifically for COVID-19 (monoclonal antibodies or convalescent plasma)?" },
]


