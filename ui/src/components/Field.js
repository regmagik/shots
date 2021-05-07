import { useState } from "react";

export function useFormFields(initialState) {
    const [fields, setValues] = useState(initialState);

    // for radio buttons name is the field
    function getFieldKey(event) {
        const control = event.target;
        if (!control) return '';// hope this never hapens   
        return (control.type === 'radio') ? control.name : control.id;
    }
    return [
        fields,
        function (event) {
            setValues({
                ...fields,
                [getFieldKey(event)]: event.target.value
            });
        }
    ];
}
