const noInsurance = 'NO HEALTH INSURANCE';
const Constants = 
{
	maxFileSize: 6000000,
	usStates: ['AL', 'AK', 'AS', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE',
		'DC', 'FM', 'FL', 'GA', 'GU', 'HI', 'ID', 'IL', 'IN', 'IA',
		'KS', 'KY', 'LA', 'ME', 'MH', 'MD', 'MA', 'MI', 'MN', 'MS',
		'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
		'MP', 'OH', 'OK', 'OR', 'PW', 'PA', 'PR', 'RI', 'SC', 'SD',
		'TN', 'TX', 'UT', 'VT', 'VI', 'VA', 'WA', 'WV', 'WI', 'WY'],
    insurers: ['AETNA', 'AMBETTER', 'ANTHEM / BCBS', 'BCBS FEDERAL', 'CIGNA',
        'CORE ADMIN SERV', 'GEHA', 'GOLDEN RULE', 'GREAT WEST',
        'HUMANA', 'MEDICARE', 'MERITAIN HEALTH', 'RAILROAD MEDICARE', 'SECURE HEALTH',
        'TRICARE', 'UNITED HEALTHCARE', 'WELLCARE', 'MEDICAID', 'OTHER INSURANCE',
        noInsurance
    ],
    noInsurance: noInsurance,
    races: [
        {code: 'B', name: 'African American'},
        {code: 'A', name: 'Asian'},
        {code: 'C', name: 'Caucasian'},
        {code: 'H', name: 'Hispanic'},
        {code: 'I', name: 'Native American'},
    ],

    relToInsured: [
        { code: 'I', name: 'Self' },
        { code: 'S', name: 'Spouse' },
        { code: 'C', name: 'Child' },
        { code: 'D', name: 'Daughter' },
        { code: 'F', name: 'Father' },
        { code: 'R', name: 'Friend' },
        { code: 'G', name: 'Grandparent' },
        { code: 'M', name: 'Mother' },
        { code: 'B', name: 'Sibling' },
        { code: 'N', name: 'Son' },
        { code: 'O', name: 'Other' },
    ],
}

export default Constants;