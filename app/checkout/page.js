'use client';

import {
  Suspense,
  useEffect,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

/* =========================================================
   COUNTRIES
========================================================= */

const COUNTRIES = [
  ['AF', 'Afghanistan', '+93'],
  ['AL', 'Albania', '+355'],
  ['DZ', 'Algeria', '+213'],
  ['AD', 'Andorra', '+376'],
  ['AO', 'Angola', '+244'],
  ['AG', 'Antigua and Barbuda', '+1'],
  ['AR', 'Argentina', '+54'],
  ['AM', 'Armenia', '+374'],
  ['AU', 'Australia', '+61'],
  ['AT', 'Austria', '+43'],
  ['AZ', 'Azerbaijan', '+994'],
  ['BS', 'Bahamas', '+1'],
  ['BH', 'Bahrain', '+973'],
  ['BD', 'Bangladesh', '+880'],
  ['BB', 'Barbados', '+1'],
  ['BY', 'Belarus', '+375'],
  ['BE', 'Belgium', '+32'],
  ['BZ', 'Belize', '+501'],
  ['BJ', 'Benin', '+229'],
  ['BT', 'Bhutan', '+975'],
  ['BO', 'Bolivia', '+591'],
  ['BA', 'Bosnia and Herzegovina', '+387'],
  ['BW', 'Botswana', '+267'],
  ['BR', 'Brazil', '+55'],
  ['BN', 'Brunei', '+673'],
  ['BG', 'Bulgaria', '+359'],
  ['BF', 'Burkina Faso', '+226'],
  ['BI', 'Burundi', '+257'],
  ['CV', 'Cabo Verde', '+238'],
  ['KH', 'Cambodia', '+855'],
  ['CM', 'Cameroon', '+237'],
  ['CA', 'Canada', '+1'],
  ['CF', 'Central African Republic', '+236'],
  ['TD', 'Chad', '+235'],
  ['CL', 'Chile', '+56'],
  ['CN', 'China', '+86'],
  ['CO', 'Colombia', '+57'],
  ['KM', 'Comoros', '+269'],
  ['CG', 'Congo', '+242'],
  ['CD', 'Congo, Democratic Republic', '+243'],
  ['CR', 'Costa Rica', '+506'],
  ['CI', 'Cote d’Ivoire', '+225'],
  ['HR', 'Croatia', '+385'],
  ['CU', 'Cuba', '+53'],
  ['CY', 'Cyprus', '+357'],
  ['CZ', 'Czechia', '+420'],
  ['DK', 'Denmark', '+45'],
  ['DJ', 'Djibouti', '+253'],
  ['DM', 'Dominica', '+1'],
  ['DO', 'Dominican Republic', '+1'],
  ['EC', 'Ecuador', '+593'],
  ['EG', 'Egypt', '+20'],
  ['SV', 'El Salvador', '+503'],
  ['GQ', 'Equatorial Guinea', '+240'],
  ['ER', 'Eritrea', '+291'],
  ['EE', 'Estonia', '+372'],
  ['SZ', 'Eswatini', '+268'],
  ['ET', 'Ethiopia', '+251'],
  ['FJ', 'Fiji', '+679'],
  ['FI', 'Finland', '+358'],
  ['FR', 'France', '+33'],
  ['GA', 'Gabon', '+241'],
  ['GM', 'Gambia', '+220'],
  ['GE', 'Georgia', '+995'],
  ['DE', 'Germany', '+49'],
  ['GH', 'Ghana', '+233'],
  ['GR', 'Greece', '+30'],
  ['GD', 'Grenada', '+1'],
  ['GT', 'Guatemala', '+502'],
  ['GN', 'Guinea', '+224'],
  ['GW', 'Guinea-Bissau', '+245'],
  ['GY', 'Guyana', '+592'],
  ['HT', 'Haiti', '+509'],
  ['HN', 'Honduras', '+504'],
  ['HU', 'Hungary', '+36'],
  ['IS', 'Iceland', '+354'],
  ['IN', 'India', '+91'],
  ['ID', 'Indonesia', '+62'],
  ['IR', 'Iran', '+98'],
  ['IQ', 'Iraq', '+964'],
  ['IE', 'Ireland', '+353'],
  ['IL', 'Israel', '+972'],
  ['IT', 'Italy', '+39'],
  ['JM', 'Jamaica', '+1'],
  ['JP', 'Japan', '+81'],
  ['JO', 'Jordan', '+962'],
  ['KZ', 'Kazakhstan', '+7'],
  ['KE', 'Kenya', '+254'],
  ['KI', 'Kiribati', '+686'],
  ['KP', 'North Korea', '+850'],
  ['KR', 'South Korea', '+82'],
  ['KW', 'Kuwait', '+965'],
  ['KG', 'Kyrgyzstan', '+996'],
  ['LA', 'Laos', '+856'],
  ['LV', 'Latvia', '+371'],
  ['LB', 'Lebanon', '+961'],
  ['LS', 'Lesotho', '+266'],
  ['LR', 'Liberia', '+231'],
  ['LY', 'Libya', '+218'],
  ['LI', 'Liechtenstein', '+423'],
  ['LT', 'Lithuania', '+370'],
  ['LU', 'Luxembourg', '+352'],
  ['MG', 'Madagascar', '+261'],
  ['MW', 'Malawi', '+265'],
  ['MY', 'Malaysia', '+60'],
  ['MV', 'Maldives', '+960'],
  ['ML', 'Mali', '+223'],
  ['MT', 'Malta', '+356'],
  ['MH', 'Marshall Islands', '+692'],
  ['MR', 'Mauritania', '+222'],
  ['MU', 'Mauritius', '+230'],
  ['MX', 'Mexico', '+52'],
  ['FM', 'Micronesia', '+691'],
  ['MD', 'Moldova', '+373'],
  ['MC', 'Monaco', '+377'],
  ['MN', 'Mongolia', '+976'],
  ['ME', 'Montenegro', '+382'],
  ['MA', 'Morocco', '+212'],
  ['MZ', 'Mozambique', '+258'],
  ['MM', 'Myanmar', '+95'],
  ['NA', 'Namibia', '+264'],
  ['NR', 'Nauru', '+674'],
  ['NP', 'Nepal', '+977'],
  ['NL', 'Netherlands', '+31'],
  ['NZ', 'New Zealand', '+64'],
  ['NI', 'Nicaragua', '+505'],
  ['NE', 'Niger', '+227'],
  ['NG', 'Nigeria', '+234'],
  ['MK', 'North Macedonia', '+389'],
  ['NO', 'Norway', '+47'],
  ['OM', 'Oman', '+968'],
  ['PK', 'Pakistan', '+92'],
  ['PW', 'Palau', '+680'],
  ['PA', 'Panama', '+507'],
  ['PG', 'Papua New Guinea', '+675'],
  ['PY', 'Paraguay', '+595'],
  ['PE', 'Peru', '+51'],
  ['PH', 'Philippines', '+63'],
  ['PL', 'Poland', '+48'],
  ['PT', 'Portugal', '+351'],
  ['QA', 'Qatar', '+974'],
  ['RO', 'Romania', '+40'],
  ['RU', 'Russia', '+7'],
  ['RW', 'Rwanda', '+250'],
  ['KN', 'Saint Kitts and Nevis', '+1'],
  ['LC', 'Saint Lucia', '+1'],
  ['VC', 'Saint Vincent and the Grenadines', '+1'],
  ['WS', 'Samoa', '+685'],
  ['SM', 'San Marino', '+378'],
  ['ST', 'Sao Tome and Principe', '+239'],
  ['SA', 'Saudi Arabia', '+966'],
  ['SN', 'Senegal', '+221'],
  ['RS', 'Serbia', '+381'],
  ['SC', 'Seychelles', '+248'],
  ['SL', 'Sierra Leone', '+232'],
  ['SG', 'Singapore', '+65'],
  ['SK', 'Slovakia', '+421'],
  ['SI', 'Slovenia', '+386'],
  ['SB', 'Solomon Islands', '+677'],
  ['SO', 'Somalia', '+252'],
  ['ZA', 'South Africa', '+27'],
  ['SS', 'South Sudan', '+211'],
  ['ES', 'Spain', '+34'],
  ['LK', 'Sri Lanka', '+94'],
  ['SD', 'Sudan', '+249'],
  ['SR', 'Suriname', '+597'],
  ['SE', 'Sweden', '+46'],
  ['CH', 'Switzerland', '+41'],
  ['SY', 'Syria', '+963'],
  ['TW', 'Taiwan', '+886'],
  ['TJ', 'Tajikistan', '+992'],
  ['TZ', 'Tanzania', '+255'],
  ['TH', 'Thailand', '+66'],
  ['TL', 'Timor-Leste', '+670'],
  ['TG', 'Togo', '+228'],
  ['TO', 'Tonga', '+676'],
  ['TT', 'Trinidad and Tobago', '+1'],
  ['TN', 'Tunisia', '+216'],
  ['TR', 'Turkey', '+90'],
  ['TM', 'Turkmenistan', '+993'],
  ['TV', 'Tuvalu', '+688'],
  ['UG', 'Uganda', '+256'],
  ['UA', 'Ukraine', '+380'],
  ['AE', 'United Arab Emirates', '+971'],
  ['GB', 'United Kingdom', '+44'],
  ['US', 'United States', '+1'],
  ['UY', 'Uruguay', '+598'],
  ['UZ', 'Uzbekistan', '+998'],
  ['VU', 'Vanuatu', '+678'],
  ['VA', 'Vatican City', '+39'],
  ['VE', 'Venezuela', '+58'],
  ['VN', 'Vietnam', '+84'],
  ['YE', 'Yemen', '+967'],
  ['ZM', 'Zambia', '+260'],
  ['ZW', 'Zimbabwe', '+263'],
];

/* =========================================================
   FLAG
========================================================= */

function flag(code) {
  if (!code || code.length !== 2) {
    return '🌍';
  }

  return code
    .toUpperCase()
    .split('')
    .map(
      (char) =>
        String.fromCodePoint(
          127397 +
            char.charCodeAt(0)
        )
    )
    .join('');
}

/* =========================================================
   HELPERS
========================================================= */

function money(amount, currency) {
  try {
    return new Intl.NumberFormat(
      'en-GB',
      {
        style: 'currency',
        currency:
          currency || 'GBP',
      }
    ).format(Number(amount));
  } catch {
    return `${
      currency || 'GBP'
    } ${amount}`;
  }
}

function time(value) {
  if (!value) return '—';

  return new Date(
    value
  ).toLocaleTimeString(
    'en-GB',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  );
}

function parseDate(value) {
  if (!value) return null;

  const parts =
    value.split('-').map(Number);

  if (parts.length !== 3) {
    return null;
  }

  const [
    year,
    month,
    day,
  ] = parts;

  const date = new Date(
    year,
    month - 1,
    day
  );

  if (
    date.getFullYear() !==
      year ||
    date.getMonth() !==
      month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function formatDateInput(date) {
  if (!date) return '';

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');

  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addYears(
  date,
  years
) {
  const result =
    new Date(date);

  result.setFullYear(
    result.getFullYear() +
      years
  );

  return result;
}

function addMonths(
  date,
  months
) {
  const result =
    new Date(date);

  result.setMonth(
    result.getMonth() +
      months
  );

  return result;
}

function addDays(
  date,
  days
) {
  const result =
    new Date(date);

  result.setDate(
    result.getDate() +
      days
  );

  return result;
}

function calculateAgeOnDate(
  dob,
  travelDate
) {
  const birth =
    parseDate(dob);

  const travel =
    parseDate(travelDate);

  if (!birth || !travel) {
    return null;
  }

  let age =
    travel.getFullYear() -
    birth.getFullYear();

  const month =
    travel.getMonth() -
    birth.getMonth();

  if (
    month < 0 ||
    (
      month === 0 &&
      travel.getDate() <
        birth.getDate()
    )
  ) {
    age--;
  }

  return age;
}

function getDobLimits(
  passenger,
  departureDate
) {
  const departure =
    parseDate(
      departureDate
    );

  if (!departure) {
    return {
      min: '',
      max: '',
    };
  }

  if (
    passenger.type ===
    'adult'
  ) {
    const max =
      addYears(
        departure,
        -18
      );

    const min =
      addYears(
        departure,
        -100
      );

    return {
      min:
        formatDateInput(min),
      max:
        formatDateInput(max),
    };
  }

  const age =
    Number(
      passenger.age
    );

  const max =
    addYears(
      departure,
      -age
    );

  const min =
    addDays(
      addYears(
        departure,
        -(age + 1)
      ),
      1
    );

  return {
    min:
      formatDateInput(min),
    max:
      formatDateInput(max),
  };
}

function getPassportExpiryMin(
  departureDate
) {
  const departure =
    parseDate(
      departureDate
    );

  if (!departure) {
    return '';
  }

  return formatDateInput(
    addMonths(
      departure,
      6
    )
  );
}

/* =========================================================
   PHONE HELPERS
========================================================= */

function getCountryByCode(
  code
) {
  return (
    COUNTRIES.find(
      (country) =>
        country[0] === code
    ) || COUNTRIES.find(
      (country) =>
        country[0] === 'GB'
    )
  );
}

function cleanPhoneNumber(
  value
) {
  return value.replace(
    /[^\d]/g,
    ''
  );
}

function buildInternationalPhone(
  countryCode,
  value
) {
  const country =
    getCountryByCode(
      countryCode
    );

  if (!country) {
    return '';
  }

  let number =
    cleanPhoneNumber(value);

  const callingCode =
    country[2].replace(
      '+',
      ''
    );

  /*
    If user enters:
    07123456789

    with UK selected:

    +44 7123456789
  */

  if (
    number.startsWith('00')
  ) {
    number =
      number.slice(2);
  }

  /*
    If number already starts
    with country calling code,
    don't add it twice.
  */

  if (
    number.startsWith(
      callingCode
    )
  ) {
    return `+${number}`;
  }

  /*
    Remove leading zero
    for local numbers.
  */

  if (
    number.startsWith('0')
  ) {
    number =
      number.slice(1);
  }

  return `+${callingCode}${number}`;
}

/* =========================================================
   CHECKOUT CONTENT
========================================================= */

function CheckoutContent() {
  const router =
    useRouter();

  const sp =
    useSearchParams();

  const [offer, setOffer] =
    useState(null);

  const [
    passengers,
    setPassengers,
  ] = useState([]);

  const [contact, setContact] =
    useState({
      email: '',
      phone_country: 'GB',
      phone_number: '',
    });

  const [error, setError] =
    useState('');

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const adults =
      Math.max(
        1,
        Number(
          sp.get('adults') || 1
        )
      );

    const childAges =
      sp.getAll(
        'childAge'
      );

    const infantAges =
      sp.getAll(
        'infantAge'
      );

    const passengerList =
      [];

    /* ADULTS */

    for (
      let i = 0;
      i < adults;
      i++
    ) {
      passengerList.push({
        type: 'adult',
        age: null,

        title: 'mr',

        given_name: '',
        family_name: '',
        born_on: '',

        gender: 'm',

        nationality: 'GB',

        passport_number: '',
        passport_expiry_date:
          '',
      });
    }

    /* CHILDREN */

    childAges.forEach(
      (age) => {
        if (age === '') {
          return;
        }

        passengerList.push({
          type: 'child',
          age: Number(age),

          title: 'mr',

          given_name: '',
          family_name: '',
          born_on: '',

          gender: 'm',

          nationality: 'GB',

          passport_number: '',
          passport_expiry_date:
            '',
        });
      }
    );

    /* INFANTS */

    infantAges.forEach(
      (age) => {
        if (age === '') {
          return;
        }

        passengerList.push({
          type: 'infant',
          age: Number(age),

          title: 'mr',

          given_name: '',
          family_name: '',
          born_on: '',

          gender: 'm',

          nationality: 'GB',

          passport_number: '',
          passport_expiry_date:
            '',
        });
      }
    );

    setPassengers(
      passengerList
    );

    /* LOAD OFFER */

    if (offerId) {
      fetch(
        `/api/orders?offerId=${encodeURIComponent(
          offerId
        )}`
      )
        .then(
          (response) =>
            response.json()
        )
        .then((data) => {
          if (data.offer) {
            setOffer(
              data.offer
            );
          } else {
            setError(
              data.error ||
                'Unable to load flight.'
            );
          }
        })
        .catch(() => {
          setError(
            'Unable to load flight.'
          );
        });
    }
  }, [sp]);

  /* =======================================================
     UPDATE PASSENGER
  ======================================================= */

  function updatePassenger(
    index,
    field,
    value
  ) {
    setPassengers(
      (current) =>
        current.map(
          (
            passenger,
            i
          ) =>
            i === index
              ? {
                  ...passenger,
                  [field]:
                    value,
                }
              : passenger
        )
    );
  }

  /* =======================================================
     PHONE
  ======================================================= */

  function updatePhoneCountry(
    countryCode
  ) {
    setContact(
      (current) => ({
        ...current,
        phone_country:
          countryCode,
        phone_number:
          '',
      })
    );
  }

  function updatePhoneNumber(
    value
  ) {
    const formatted =
      buildInternationalPhone(
        contact.phone_country,
        value
      );

    setContact(
      (current) => ({
        ...current,
        phone_number:
          formatted,
      })
    );
  }

  /* =======================================================
     CONTACT
  ======================================================= */

  function updateContact(
    field,
    value
  ) {
    setContact(
      (current) => ({
        ...current,
        [field]: value,
      })
    );
  }

  /* =======================================================
     VALIDATE PASSENGER
  ======================================================= */

  function validatePassenger(
    passenger,
    index
  ) {
    const number =
      index + 1;

    if (!passenger.title) {
      return `Please select a title for Passenger ${number}.`;
    }

    if (
      !passenger.given_name ||
      !passenger.family_name
    ) {
      return `Please complete Passenger ${number} name.`;
    }

    if (!passenger.born_on) {
      return `Please enter the date of birth for Passenger ${number}.`;
    }

    const departureDate =
      sp.get(
        'departureDate'
      );

    const age =
      calculateAgeOnDate(
        passenger.born_on,
        departureDate
      );

    if (age === null) {
      return `Invalid date of birth for Passenger ${number}.`;
    }

    /* ADULT */

    if (
      passenger.type ===
        'adult' &&
      age < 18
    ) {
      return `Passenger ${number} must be at least 18 years old on the departure date.`;
    }

    /* CHILD */

    if (
      passenger.type ===
      'child'
    ) {
      if (
        age !==
        Number(
          passenger.age
        )
      ) {
        return `Passenger ${number} must be exactly ${passenger.age} years old on the departure date.`;
      }
    }

    /* INFANT */

    if (
      passenger.type ===
      'infant'
    ) {
      if (
        age !==
        Number(
          passenger.age
        )
      ) {
        return `Passenger ${number} must be exactly ${passenger.age} years old on the departure date.`;
      }

      if (
        Number(
          passenger.age
        ) > 1
      ) {
        return `Passenger ${number} is marked as an infant but the selected age is over 1 year.`;
      }
    }

    /* NATIONALITY */

    if (
      !passenger.nationality
    ) {
      return `Please select nationality for Passenger ${number}.`;
    }

    /* PASSPORT */

    if (
      passenger.passport_number &&
      !passenger.passport_expiry_date
    ) {
      return `Please enter the passport expiry date for Passenger ${number}.`;
    }

    if (
      passenger.passport_expiry_date
    ) {
      const expiry =
        parseDate(
          passenger.passport_expiry_date
        );

      const dob =
        parseDate(
          passenger.born_on
        );

      const departure =
        parseDate(
          departureDate
        );

      if (!expiry) {
        return `Invalid passport expiry date for Passenger ${number}.`;
      }

      if (
        dob &&
        expiry <= dob
      ) {
        return `Passport expiry date must be after the date of birth for Passenger ${number}.`;
      }

      if (departure) {
        const minimumExpiry =
          addMonths(
            departure,
            6
          );

        if (
          expiry <
          minimumExpiry
        ) {
          return `Passport for Passenger ${number} must be valid for at least 6 months after the departure date.`;
        }
      }
    }

    return '';
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  function submit(event) {
    event.preventDefault();

    setError('');

    const departureDate =
      sp.get(
        'departureDate'
      );

    if (!departureDate) {
      setError(
        'Departure date is missing.'
      );

      return;
    }

    /* PASSENGERS */

    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const validationError =
        validatePassenger(
          passengers[i],
          i
        );

      if (validationError) {
        setError(
          validationError
        );

        return;
      }
    }

    /* EMAIL */

    if (
      !contact.email.trim()
    ) {
      setError(
        'Please enter the contact email address.'
      );

      return;
    }

    /* PHONE */

    if (
      !contact.phone_number
    ) {
      setError(
        'Please enter a valid phone number.'
      );

      return;
    }

    if (
      !contact.phone_number.startsWith(
        '+'
      )
    ) {
      setError(
        'Please enter a valid international phone number.'
      );

      return;
    }

    /*
      Save passenger data
    */

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    /*
      Save contact.

      phone_number is already
      in international format.
    */

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify(
        {
          email:
            contact.email.trim(),
          phone_number:
            contact.phone_number,
        }
      )
    );

    /*
      Save offer
    */

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get(
        'offerId'
      ) || ''
    );

    /*
      Payment
    */

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get(
          'offerId'
        ) || ''
      )}`
    );
  }

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments ||
        []
    ) || [];

  const departureDate =
    sp.get(
      'departureDate'
    );

  return (
    <main className="checkout-shell">

      {/* HEADER */}

      <header className="site-header">

        <div className="brand">
          ✈ Trip Scanner{' '}
          <b>Hub</b>
        </div>

        <span>
          Passenger details
        </span>

      </header>

      <div className="checkout-grid">

        {/* =================================================
            LEFT
        ================================================== */}

        <section>

          <div className="stepbar">

            <b>
              1 Passenger
            </b>

            <span>
              2 Payment
            </span>

            <span>
              3 Confirmation
            </span>

          </div>

          <form
            className="passenger-card"
            onSubmit={submit}
          >

            <h1>
              Passenger details
            </h1>

            <p>
              Enter passenger details
              exactly as shown on the
              passport or travel document.
            </p>

            {error && (
              <div className="error">
                ⚠ {error}
              </div>
            )}

            {/* =================================================
                PASSENGERS
            ================================================== */}

            {passengers.map(
              (
                passenger,
                index
              ) => {

                const dobLimits =
                  getDobLimits(
                    passenger,
                    departureDate
                  );

                const passportMin =
                  getPassportExpiryMin(
                    departureDate
                  );

                return (
                  <div
                    key={index}
                    className="passenger-section"
                    style={{
                      marginBottom:
                        '28px',
                      paddingBottom:
                        '24px',
                      borderBottom:
                        '1px solid #e5e7eb',
                    }}
                  >

                    <h2>

                      Passenger{' '}
                      {index + 1}

                      <span
                        style={{
                          fontSize:
                            '14px',
                          fontWeight:
                            '500',
                          color:
                            '#64748b',
                          marginLeft:
                            '6px',
                        }}
                      >

                        (
                        {passenger.type ===
                        'child'
                          ? `Child · age ${passenger.age}`
                          : passenger.type ===
                            'infant'
                          ? `Infant · age ${passenger.age}`
                          : 'Adult'}
                        )

                      </span>

                    </h2>

                    <div className="form-grid">

                      {/* TITLE */}

                      <label>

                        Title *

                        <select
                          value={
                            passenger.title
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'title',
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select title
                          </option>

                          <option value="mr">
                            Mr
                          </option>

                          <option value="mrs">
                            Mrs
                          </option>

                          <option value="ms">
                            Ms
                          </option>

                          <option value="miss">
                            Miss
                          </option>

                        </select>

                      </label>

                      {/* FIRST NAME */}

                      <label>

                        First name *

                        <input
                          type="text"
                          value={
                            passenger.given_name
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'given_name',
                              e.target.value
                            )
                          }
                          required
                        />

                      </label>

                      {/* LAST NAME */}

                      <label>

                        Last name *

                        <input
                          type="text"
                          value={
                            passenger.family_name
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'family_name',
                              e.target.value
                            )
                          }
                          required
                        />

                      </label>

                      {/* DOB */}

                      <label>

                        Date of birth *

                        <input
                          type="date"
                          value={
                            passenger.born_on
                          }
                          min={
                            dobLimits.min
                          }
                          max={
                            dobLimits.max
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'born_on',
                              e.target.value
                            )
                          }
                          required
                        />

                        <small
                          style={{
                            display:
                              'block',
                            marginTop:
                              '6px',
                            color:
                              '#64748b',
                          }}
                        >

                          {passenger.type ===
                          'adult'
                            ? 'Adult must be 18+ on departure.'
                            : passenger.type ===
                              'child'
                            ? `Child must be age ${passenger.age} on departure.`
                            : `Infant must be age ${passenger.age} on departure.`}

                        </small>

                      </label>

                      {/* GENDER */}

                      <label>

                        Gender

                        <select
                          value={
                            passenger.gender
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'gender',
                              e.target.value
                            )
                          }
                        >

                          <option value="m">
                            Male
                          </option>

                          <option value="f">
                            Female
                          </option>

                        </select>

                      </label>

                      {/* NATIONALITY */}

                      <label>

                        Nationality *

                        <select
                          value={
                            passenger.nationality
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'nationality',
                              e.target.value
                            )
                          }
                          required
                        >

                          <option value="">
                            Select nationality
                          </option>

                          {COUNTRIES.map(
                            (
                              country
                            ) => (

                              <option
                                key={
                                  country[0]
                                }
                                value={
                                  country[0]
                                }
                              >

                                {flag(
                                  country[0]
                                )}{' '}

                                {
                                  country[1]
                                }{' '}

                                (
                                {
                                  country[0]
                                }
                                )

                              </option>

                            )
                          )}

                        </select>

                      </label>

                      {/* PASSPORT */}

                      <label>

                        Passport number

                        <input
                          type="text"
                          value={
                            passenger.passport_number
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'passport_number',
                              e.target.value
                                .toUpperCase()
                            )
                          }
                        />

                      </label>

                      {/* PASSPORT EXPIRY */}

                      <label>

                        Passport expiry

                        <input
                          type="date"
                          value={
                            passenger.passport_expiry_date
                          }
                          min={
                            passportMin
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'passport_expiry_date',
                              e.target.value
                            )
                          }
                        />

                        <small
                          style={{
                            display:
                              'block',
                            marginTop:
                              '6px',
                            color:
                              '#64748b',
                          }}
                        >

                          Minimum 6 months
                          after departure
                          date.

                        </small>

                      </label>

                    </div>

                  </div>
                );
              }
            )}

            {/* =================================================
                CONTACT
            ================================================== */}

            <div
              className="contact-section"
              style={{
                marginTop:
                  '32px',
                padding:
                  '24px',
                borderRadius:
                  '16px',
                background:
                  '#f8fafc',
                border:
                  '1px solid #e2e8f0',
              }}
            >

              <h2>
                Contact information
              </h2>

              <p>
                We'll send your booking
                confirmation and important
                flight updates to these
                details.
              </p>

              <div className="form-grid">

                {/* EMAIL */}

                <label>

                  Email address *

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={
                      contact.email
                    }
                    onChange={(e) =>
                      updateContact(
                        'email',
                        e.target.value
                      )
                    }
                    required
                  />

                </label>

                {/* PHONE COUNTRY */}

                <label>

                  Phone country *

                  <select
                    value={
                      contact.phone_country
                    }
                    onChange={(e) =>
                      updatePhoneCountry(
                        e.target.value
                      )
                    }
                    required
                  >

                    {COUNTRIES.map(
                      (
                        country
                      ) => (

                        <option
                          key={
                            country[0]
                          }
                          value={
                            country[0]
                          }
                        >

                          {flag(
                            country[0]
                          )}{' '}

                          {
                            country[1]
                          }

                          {' '}

                          (
                          {
                            country[2]
                          }
                          )

                        </option>

                      )
                    )}

                  </select>

                </label>

                {/* PHONE NUMBER */}

                <label>

                  Phone number *

                  <input
                    type="tel"
                    inputMode="tel"
                    placeholder="Enter phone number"
                    value={
                      contact.phone_number
                        ? contact.phone_number.replace(
                            /^\+\d+/,
                            ''
                          )
                        : ''
                    }
                    onChange={(e) =>
                      updatePhoneNumber(
                        e.target.value
                      )
                    }
                    required
                  />

                  <small
                    style={{
                      display:
                        'block',
                      marginTop:
                        '6px',
                      color:
                        '#64748b',
                    }}
                  >

                    Your number will be
                    saved in international
                    format.

                  </small>

                </label>

              </div>

            </div>

            {/* CONTINUE */}

            <button
              type="submit"
              className="primary wide"
              style={{
                marginTop:
                  '24px',
              }}
            >
              Continue to payment →
            </button>

          </form>

        </section>

        {/* =================================================
            SUMMARY
        ================================================== */}

        <aside className="summary">

          <h3>
            Booking summary
          </h3>

          {segments.map(
            (
              segment,
              index
            ) => (

              <div
                className="summary-leg"
                key={index}
              >

                <b>

                  {time(
                    segment.departing_at
                  )}{' '}

                  {
                    segment.origin
                      ?.iata_code
                  }

                  {' → '}

                  {time(
                    segment.arriving_at
                  )}{' '}

                  {
                    segment.destination
                      ?.iata_code
                  }

                </b>

                <small>

                  {
                    segment
                      .marketing_carrier
                      ?.name
                  }

                  {' · '}

                  {
                    segment
                      .marketing_carrier_flight_number
                  }

                </small>

              </div>

            )
          )}

          <div className="total">

            <span>
              Total
            </span>

            <strong>

              {offer &&
                money(
                  offer.total_amount,
                  offer.total_currency
                )}

            </strong>

          </div>

        </aside>

      </div>

    </main>
  );
}

/* =========================================================
   SUSPENSE
========================================================= */

export default function Checkout() {
  return (
    <Suspense
      fallback={
        <main className="loading-box">
          Loading Trip Scanner Hub…
        </main>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
