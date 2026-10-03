const formattedPassengers = passengers.map((p, index) => ({
      id: `pas_${index + 1}`,
      given_name: p.given_name,
      family_name: p.family_name,
      gender: p.gender,
      born_on: p.born_on,
      title: p.gender === 'm' ? 'mr' : 'ms',
      email: p.email,
      phone_number: p.phone_number,
      identity_documents: [
        {
          type: 'passport',
          number: p.passport_number,
          unique_identifier: p.passport_number, // Yeh error solve karega
          expires_on: p.passport_expiry_date,     // Yeh bhi error solve karega
          issuing_country_code: p.nationality || 'GB',
        }
      ]
    }));
