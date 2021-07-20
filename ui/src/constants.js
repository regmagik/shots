const noInsurance = 'NO HEALTH INSURANCE';
const self = '18';
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
	self: self,
    relToInsured: [
        { code: self, cx: 'I', name: 'Self' },
        { code: '01', cx: 'S', name: 'Spouse' },
        { code: '19', cx: 'C', name: 'Child' },
        { code: '19', cx: 'D', name: 'Daughter' },
        { code: '33', cx: 'F', name: 'Father' },
        { code: 'G8', cx: 'R', name: 'Friend' },
        { code: '04', cx: 'G', name: 'Grandparent' },
        { code: '32', cx: 'M', name: 'Mother' },
        { code: 'G8', cx: 'B', name: 'Sibling' },
        { code: '19', cx: 'N', name: 'Son' },
        { code: 'G8', cx: 'O', name: 'Other' },
    ],
}

export default Constants;