'use client';

import {
  Suspense,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  useRouter,
  useSearchParams,
} from 'next/navigation';

/* =========================================================
   COUNTRY LIST
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
  ['CI', "Côte d'Ivoire", '+225'],
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
  ['PS', 'Palestine', '+970'],
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
   HELPERS
========================================================= */

function money(amount, currency) {
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency || 'GBP',
    }).format(Number(amount));
  } catch {
    return `${currency || 'GBP'} ${amount}`;
  }
}

function time(value) {
  if (!value) return '—';

  return new Date(value).toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function flag(code) {
  if (!code || code.length !== 2) return '🌐';

  return code
    .toUpperCase()
    .split('')
    .map(
      (char) =>
        String.fromCodePoint(127397 + char.charCodeAt(0))
    )
    .join('');
}

function parseDate(value) {
  if (!value) return null;

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function formatDateForInput(date) {
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addYears(date, years) {
  const result = new Date(date);
  result.setFullYear(
    result.getFullYear() + years
  );
  return result;
}

function addMonths(date, months) {
  const result = new Date(date);

  const originalDay = result.getDate();

  result.setMonth(
    result.getMonth() + months
  );

  if (result.getDate() !== originalDay) {
    result.setDate(0);
  }

  return result;
}

function calculateAgeOnDate(
  dobString,
  targetDateString
) {
  const dob = parseDate(dobString);
  const target = parseDate(targetDateString);

  if (!dob || !target) {
    return null;
  }

  let age =
    target.getFullYear() -
    dob.getFullYear();

  const monthDifference =
    target.getMonth() -
    dob.getMonth();

  const dayDifference =
    target.getDate() -
    dob.getDate();

  if (
    monthDifference < 0 ||
    (monthDifference === 0 &&
      dayDifference < 0)
  ) {
    age--;
  }

  return age;
}

function getCountryByCode(code) {
  return (
    COUNTRIES.find(
      (country) => country[0] === code
    ) ||
    COUNTRIES.find(
      (country) => country[0] === 'GB'
    )
  );
}

function cleanPhoneNumber(value) {
  return String(value || '').replace(
    /[^\d]/g,
    ''
  );
}

function buildInternationalPhone(
  countryCode,
  value
) {
  const country =
    getCountryByCode(countryCode);

  if (!country) return '';

  let number = cleanPhoneNumber(value);

  if (!number) return '';

  const callingCode =
    country[2].replace('+', '');

  if (number.startsWith('00')) {
    number = number.slice(2);
  }

  if (number.startsWith(callingCode)) {
    return `+${number}`;
  }

  if (number.startsWith('0')) {
    number = number.slice(1);
  }

  return `+${callingCode}${number}`;
}

function getPhoneError(contact) {
  if (!contact.phone_local) {
    return '';
  }

  const formatted =
    buildInternationalPhone(
      contact.phone_country,
      contact.phone_local
    );

  const digits =
    formatted.replace(/[^\d]/g, '');

  if (digits.length < 8) {
    return 'Phone number is too short.';
  }

  if (digits.length > 15) {
    return 'Phone number is too long.';
  }

  return '';
}

/* =========================================================
   CHECKOUT CONTENT
========================================================= */

function CheckoutContent() {
  const router = useRouter();
  const sp = useSearchParams();

  const [offer, setOffer] = useState(null);
  const [passengers, setPassengers] =
    useState([]);

  const [contact, setContact] =
    useState({
      email: '',
      phone_country: 'GB',
      phone_local: '',
    });

  const [error, setError] =
    useState('');

  /* -------------------------------------------------------
     LOAD SEARCH DATA
  ------------------------------------------------------- */

  useEffect(() => {
    const offerId =
      sp.get('offerId');

    const adults = Math.max(
      1,
      Number(
        sp.get('adults') || 1
      )
    );

    const childAges =
      sp.getAll('childAge');

    const infantAges =
      sp.getAll('infantAge');

    const passengerList = [];

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
        passport_expiry_date: '',
      });
    }

    /* CHILDREN */

    childAges.forEach((age) => {
      if (age === '') return;

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
        passport_expiry_date: '',
      });
    });

    /* INFANTS */

    infantAges.forEach((age) => {
      if (age === '') return;

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
        passport_expiry_date: '',
      });
    });

    setPassengers(passengerList);

    /* LOAD OFFER */

    if (offerId) {
      fetch(
        `/api/orders?offerId=${encodeURIComponent(
          offerId
        )}`
      )
        .then((response) =>
          response.json()
        )
        .then((data) => {
          if (data.offer) {
            setOffer(data.offer);
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

  /* -------------------------------------------------------
     DEPARTURE DATE
     First use URL, otherwise derive from Duffel offer.
  ------------------------------------------------------- */

  const departureDate =
    sp.get('departureDate') ||
    offer?.slices?.[0]?.segments?.[0]
      ?.departing_at
      ?.slice(0, 10) ||
    '';

  /* -------------------------------------------------------
     PASSENGER UPDATE
  ------------------------------------------------------- */

  function updatePassenger(
    index,
    field,
    value
  ) {
    setPassengers((current) =>
      current.map(
        (passenger, i) =>
          i === index
            ? {
                ...passenger,
                [field]: value,
              }
            : passenger
      )
    );

    setError('');
  }

  /* -------------------------------------------------------
     CONTACT UPDATE
  ------------------------------------------------------- */

  function updateContact(
    field,
    value
  ) {
    setContact((current) => ({
      ...current,
      [field]: value,
    }));

    setError('');
  }

  function updatePhoneCountry(
    countryCode
  ) {
    setContact((current) => ({
      ...current,
      phone_country: countryCode,
      phone_local: '',
    }));

    setError('');
  }

  function updatePhoneNumber(
    value
  ) {
    const clean =
      String(value || '').replace(
        /[^\d]/g,
        ''
      );

    setContact((current) => ({
      ...current,
      phone_local: clean,
    }));

    setError('');
  }

  /* =======================================================
     DOB VALIDATION
  ======================================================= */

  function getDobError(
    passenger,
    index
  ) {
    if (!passenger.born_on) {
      return '';
    }

    if (!departureDate) {
      return '';
    }

    const dob =
      parseDate(
        passenger.born_on
      );

    const departure =
      parseDate(
        departureDate
      );

    if (!dob || !departure) {
      return `Invalid date of birth for Passenger ${
        index + 1
      }.`;
    }

    if (dob >= departure) {
      return `Passenger ${
        index + 1
      }'s date of birth must be before the departure date.`;
    }

    const age =
      calculateAgeOnDate(
        passenger.born_on,
        departureDate
      );

    if (
      passenger.type ===
        'adult' &&
      age < 18
    ) {
      return `Passenger ${
        index + 1
      } must be at least 18 years old on the departure date.`;
    }

    if (
      passenger.type ===
        'child' &&
      age !== Number(passenger.age)
    ) {
      return `Passenger ${
        index + 1
      } must be exactly ${
        passenger.age
      } years old on the departure date.`;
    }

    if (
      passenger.type ===
        'infant' &&
      age !== Number(passenger.age)
    ) {
      return `Passenger ${
        index + 1
      } must be exactly ${
        passenger.age
      } years old on the departure date.`;
    }

    return '';
  }

  /* =======================================================
     PASSPORT VALIDATION
  ======================================================= */

  function getPassportError(
    passenger,
    index
  ) {
    if (
      !passenger.passport_expiry_date
    ) {
      return '';
    }

    const expiry =
      parseDate(
        passenger.passport_expiry_date
      );

    if (!expiry) {
      return `Invalid passport expiry date for Passenger ${
        index + 1
      }.`;
    }

    if (passenger.born_on) {
      const dob =
        parseDate(
          passenger.born_on
        );

      if (
        dob &&
        expiry <= dob
      ) {
        return `Passport expiry date for Passenger ${
          index + 1
        } must be after the date of birth.`;
      }
    }

    if (departureDate) {
      const departure =
        parseDate(
          departureDate
        );

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
          return `Passport expiry for Passenger ${
            index + 1
          } must be at least 6 months after departure (${formatDateForInput(
            minimumExpiry
          )} or later).`;
        }
      }
    }

    return '';
  }

  /* =======================================================
     PASSENGER VALIDATION
  ======================================================= */

  function validatePassengers() {
    for (
      let i = 0;
      i < passengers.length;
      i++
    ) {
      const passenger =
        passengers[i];

      if (
        !passenger.title
      ) {
        return `Please select a title for Passenger ${
          i + 1
        }.`;
      }

      if (
        !passenger.given_name.trim()
      ) {
        return `Please enter first name for Passenger ${
          i + 1
        }.`;
      }

      if (
        !passenger.family_name.trim()
      ) {
        return `Please enter last name for Passenger ${
          i + 1
        }.`;
      }

      if (!passenger.born_on) {
        return `Please enter date of birth for Passenger ${
          i + 1
        }.`;
      }

      const dobError =
        getDobError(
          passenger,
          i
        );

      if (dobError) {
        return dobError;
      }

      const passportError =
        getPassportError(
          passenger,
          i
        );

      if (passportError) {
        return passportError;
      }

      if (
        !passenger.nationality
      ) {
        return `Please select nationality for Passenger ${
          i + 1
        }.`;
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

    /* Passenger validation */

    const passengerError =
      validatePassengers();

    if (passengerError) {
      setError(
        passengerError
      );
      return;
    }

    /* Email */

    if (
      !contact.email.trim()
    ) {
      setError(
        'Please enter the contact email address.'
      );
      return;
    }

    /* Phone */

    if (!contact.phone_local) {
      setError(
        'Please enter the contact phone number.'
      );
      return;
    }

    const phoneNumber =
      buildInternationalPhone(
        contact.phone_country,
        contact.phone_local
      );

    const phoneError =
      getPhoneError(contact);

    if (
      phoneError
    ) {
      setError(
        phoneError
      );
      return;
    }

    if (!phoneNumber) {
      setError(
        'Please enter a valid phone number.'
      );
      return;
    }

    /* Save passenger details */

    sessionStorage.setItem(
      'tripScannerPassengers',
      JSON.stringify(
        passengers
      )
    );

    /* Save contact details in E.164 */

    sessionStorage.setItem(
      'tripScannerContact',
      JSON.stringify({
        email:
          contact.email.trim(),
        phone_number:
          phoneNumber,
      })
    );

    /* Save offer ID */

    sessionStorage.setItem(
      'tripScannerOfferId',
      sp.get('offerId') || ''
    );

    /* Continue */

    router.push(
      `/payment?offerId=${encodeURIComponent(
        sp.get('offerId') || ''
      )}`
    );
  }

  /* =======================================================
     SUMMARY
  ======================================================= */

  const segments =
    offer?.slices?.flatMap(
      (slice) =>
        slice.segments || []
    ) || [];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="checkout-shell">

      <header className="site-header">
        <div className="brand">
          ✈ Trip Scanner <b>Hub</b>
        </div>

        <span>
          Passenger details
        </span>
      </header>

      <div className="checkout-grid">

        <section>

          <div className="stepbar">
            <b>1 Passenger</b>
            <span>2 Payment</span>
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
              passport or travel
              document.
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

                const dobError =
                  getDobError(
                    passenger,
                    index
                  );

                const passportError =
                  getPassportError(
                    passenger,
                    index
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
                      {index + 1}{' '}

                      <span
                        style={{
                          fontSize:
                            '14px',
                          fontWeight:
                            '500',
                          color:
                            '#64748b',
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
                          max={
                            departureDate ||
                            undefined
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

                        {dobError && (
                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '6px',
                              color:
                                '#dc2626',
                              fontWeight:
                                '600',
                            }}
                          >
                            ⚠ {dobError}
                          </small>
                        )}
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
                            (country) => (
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
                                } (
                                {
                                  country[0]
                                }
                                )
                              </option>
                            )
                          )}
                        </select>
                      </label>

                      {/* PASSPORT NUMBER */}

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
                              e.target.value.toUpperCase()
                            )
                          }
                          placeholder="Passport number"
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
                            departureDate
                              ? formatDateForInput(
                                  addMonths(
                                    parseDate(
                                      departureDate
                                    ),
                                    6
                                  )
                                )
                              : undefined
                          }
                          onChange={(e) =>
                            updatePassenger(
                              index,
                              'passport_expiry_date',
                              e.target.value
                            )
                          }
                        />

                        {passportError && (
                          <small
                            style={{
                              display:
                                'block',
                              marginTop:
                                '6px',
                              color:
                                '#dc2626',
                              fontWeight:
                                '600',
                            }}
                          >
                            ⚠{' '}
                            {
                              passportError
                            }
                          </small>
                        )}
                      </label>

                    </div>
                  </div>
                );
              }
            )}

            {/* =================================================
                CONTACT INFORMATION
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
                We'll send your
                booking confirmation
                and important flight
                updates to these
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

                {/* PHONE */}

                <label
                  style={{
                    gridColumn:
                      '1 / -1',
                  }}
                >
                  Phone number *

                  <div
                    style={{
                      display:
                        'grid',
                      gridTemplateColumns:
                        'minmax(220px, 0.8fr) minmax(180px, 1fr)',
                      gap: '10px',
                      marginTop:
                        '6px',
                    }}
                  >

                    {/* COUNTRY */}

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
                        (country) => (
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
                            {
                              country[2]
                            }
                          </option>
                        )
                      )}
                    </select>

                    {/* LOCAL PHONE */}

                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="Enter phone number"
                      value={
                        contact.phone_local
                      }
                      onChange={(e) =>
                        updatePhoneNumber(
                          e.target.value
                        )
                      }
                      required
                    />

                  </div>

                  {contact.phone_local &&
                    getPhoneError(
                      contact
                    ) && (
                      <small
                        style={{
                          display:
                            'block',
                          marginTop:
                            '6px',
                          color:
                            '#dc2626',
                          fontWeight:
                            '600',
                        }}
                      >
                        ⚠{' '}
                        {
                          getPhoneError(
                            contact
                          )
                        }
                      </small>
                    )}

                  {contact.phone_local &&
                    !getPhoneError(
                      contact
                    ) && (
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
                        Saved as international
                        format:{' '}
                        {buildInternationalPhone(
                          contact.phone_country,
                          contact.phone_local
                        )}
                      </small>
                    )}
                </label>

              </div>
            </div>

            {/* =================================================
                CONTINUE
            ================================================== */}

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

        {/* ===================================================
            BOOKING SUMMARY
        ==================================================== */}

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
                    segment.marketing_carrier_flight_number
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
   EXPORT
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
